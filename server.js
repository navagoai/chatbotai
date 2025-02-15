require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Initialize Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Initialize chat history
let chat = model.startChat({
    history: [
        {
            role: "user",
            parts: [{ text: "You are NAVAGO, a travel related chatbot. Only answer travel related questions. You can plan the trip for your users." }]
        },
        {
            role: "model",
            parts: [{ text: "Okay, I will only answer travel-related questions and help users plan their trips." }]
        }
    ],
    generationConfig: {
        maxOutputTokens: 2048,
    },
});

app.post('/send-message', async (req, res) => {
    const userInput = req.body.prompt;
    console.log('\n--- New Message ---');
    console.log('User Input:', userInput);

    try {
        console.log('Sending API request to Gemini...');

        const result = await chat.sendMessage(userInput);
        const responseText = result.response.text();

        console.log('API Response:', responseText);

        res.json({ response: responseText });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: "Error connecting to AI service" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});