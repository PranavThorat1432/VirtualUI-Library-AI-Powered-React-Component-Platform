import Component from "../Models/componentModel.js";
import User from "../Models/userModel.js";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export const savedComponent = async (req, res) => {
    try {
        const {name, code, props} = req.body;
        if(!name || !code) {
            return res.status(400).json({
                message: 'Name and Code are required!'
            });
        }

        const user = await User.findById(req.userId);
        if(!user) {
            return res.status(404).json({
                message: 'User not found!'
            });
        }

        if(user.role === 'admin') {
            const existingComponent = await Component.findOne({name, visibility: 'public'});
            if(existingComponent) {
                return res.status(400).json({
                    message: 'Admin cannot create duplicate public component name.'
                });
            }
        }

        if(user.role !== 'admin') {
            const existingComponent = await Component.findOne({name, owner: req.userId});
            if(existingComponent) {
                return res.status(400).json({
                    message: 'You already have a component with this name.'
                });
            }
        }

        const component = await Component.create({
            name,
            code,
            props: props || [],
            owner: req.userId
        });
        
        return res.status(200).json(component);
        
    } catch (error) {
        return res.status(500).json({
            message: `Error during saving the component: ${error}`
        });
    }
};


export const publishComponent = async (req, res) => { 
    try {
        const user = await User.findById(req.userId);
        if(!user || user.role !== 'admin') {
            return res.status(404).json({
                message: 'Only admin can publish!'
            });
        }

        const {componentId} = req.body;
        const component = await  Component.findById(componentId);
        if(!component) {
            return res.status(404).json({
                message: 'Component not found!'
            });
        }

        if(component.owner.toString() !== req.userId.toString()) {
            return res.status(403).json({
                message: 'You can only publish your own components.'
            });
        }

        const libPath = path.join(process.cwd(), "../Library");

        const componentDir = path.join(
            libPath,
            "src/components",
            component.name
        );

        const componentFile = path.join(
            componentDir,
            `${component.name}.jsx`
        );

        const indexFile = path.join(libPath, 'src/index.js');

        // create component folder
        if(!fs.existsSync(componentDir)) {
            fs.mkdirSync(componentDir, {
                recursive: true
            });
        }

        // Write component code
        fs.writeFileSync(componentFile, component.code);

        // Read index file
        let indexContent = fs.readFileSync(indexFile, 'utf8');

        const exportLine = `export { ${component.name} } from "./components/${component.name}/${component.name}.jsx";`;

        // Prevent Duplicate Export
        if(!indexContent.includes(exportLine)) {
            fs.appendFileSync(indexFile, `\n${exportLine}\n`);
        }

        // Clean OLD build
        console.log('Cleaning old build...');

        const distPath = path.join(libPath, 'dist');
        if(fs.existsSync(distPath)) {
            fs.rmSync(distPath, { 
                recursive: true, force: true
            });
        }

        // Run build command
        console.log('Builing Library...');
        
        execSync('npm run build', {
            cwd: libPath,
            stdio: 'inherit'
        });

        // Update Version
        console.log('Updating Version...');

        execSync('npm version patch --no-git-tag-version', {
            cwd: libPath,
            stdio: 'inherit'
        });

        // Publish to NPM
        console.log('Publishing to npm...');

        execSync('npm publish --access public', {
            cwd: libPath,
            stdio: 'inherit'
        });

        component.visibility = 'public';
        component.npmPackage = 'virtual-ui-react-library';

        await component.save();

        return res.status(200).json({
            message: 'Component Published Successfully!'
        });

    } catch (error) {
        return res.status(500).json({
            message: `Error during publishing the Component: ${error}`
        });
    }
};


export const getAllComponents = async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : null;
        const limit = req.query.limit ? parseInt(req.query.limit) : 12;

        if (page) {
            const skip = (page - 1) * limit;
            const totalComponents = await Component.countDocuments();
            const totalPages = Math.ceil(totalComponents / limit);
            const components = await Component.find()
                .populate('owner', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            return res.status(200).json({
                components,
                totalPages,
                currentPage: page,
                totalComponents
            });
        }

        const components = await Component.find().populate('owner', 'name email').sort({createdAt: -1});
        if(!components) {
            return res.status(404).json({
                message: 'Components not found!'
            });
        }

        return res.status(200).json(components);

    } catch (error) {
        return res.status(500).json({
            message: `Failed to get all components: ${error}`
        });
    }
}; 