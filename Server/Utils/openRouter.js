import axios from 'axios';

export const askAI = async (messages) => {
    try {
        if(!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error('Messages array is empty!');
        }

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions', 
            {
                model: 'deepseek/deepseek-chat',
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000,
                response_format: {
                    type: 'json_object'
                }
            },
            { 
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'X-OpenRouter-Title': 'VirtualUI',
                    'Content-Type': 'application/json',
                }
            }
        );

        const content = response?.data?.choices?.[0]?.message?.content;
        if(!content || !content.trim()) {
            throw new Error('AI return empty response!');
        }

        return content;

    } catch (error) {
        console.error(`OpenRouter API Error: ${error}`);
        throw new Error('Failed to get response from AI');
    }
};