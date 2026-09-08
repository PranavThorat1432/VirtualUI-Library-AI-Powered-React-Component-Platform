import express from 'express';
import isAuth from '../Middlewares/isAuth.js';
import { generateComponent } from '../Controllers/aiComponentController.js';
import { getAllComponents, publishComponent, savedComponent } from '../Controllers/componentController.js';

const componentRouter = express.Router();

componentRouter.post('/generate', isAuth, generateComponent);
componentRouter.post('/save', isAuth, savedComponent);
componentRouter.post('/publish', isAuth, publishComponent);
componentRouter.get('/all-components', isAuth, getAllComponents);

export default componentRouter;