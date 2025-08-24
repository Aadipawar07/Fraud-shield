const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeMessageWithGPT(message) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a fraud detection system. Analyze messages for signs of scams, phishing, or fraud. Provide a structured response with confidence score and explanation."
                },
                {
                    role: "user",
                    content: `Analyze this message for fraud: "${message}"`
                }
            ],
            temperature: 0.7,
            max_tokens: 200,
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(response.choices[0].message.content);
        return {
            success: true,
            ...analysis
        };
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return {
            success: false,
            error: 'Failed to analyze message',
            details: error.message
        };
    }
}

module.exports = { analyzeMessageWithGPT };
