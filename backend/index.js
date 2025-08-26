import express from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// Define port for the server
const PORT = 3002; // Using port 3002 since 3001 is already in use

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
  console.error('⚠️ OpenAI API key is not configured! Please update the OPENAI_API_KEY in your .env file');
  console.error('You can get your API key from https://platform.openai.com/account/api-keys');
}

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const fraudDetectionPrompt = `
You are a fraud detection AI specializing in analyzing text messages with extremely high accuracy (95%+).  
Classify any given message into one of three categories:  
1. FRAUD  
2. LEGITIMATE  
3. NORMAL_SMS  

Definitions:  
- FRAUD: scams like stock tips, fake loans, lottery winnings, phishing links, deposit requests, unrealistic profit promises.  
- LEGITIMATE: real financial/business updates, genuine bank alerts, market news.  
- NORMAL_SMS: casual/personal/service messages (friends, family, delivery, OTPs).  

Output strictly in JSON format:
{
  "classification": "FRAUD" or "LEGITIMATE" or "NORMAL_SMS",
  "confidence_score": number,
  "reason": "short explanation"
}
`;

// Simple rule-based fallback for fraud detection
function simpleFraudCheck(message) {
  const fraudKeywords = [
    'won', 'winner', 'lottery', 'prize', 'claim', 'cash', 'money', 'bank details',
    'account number', 'password', 'verify', 'urgent', 'limited time', 'offer',
    'investment', 'bitcoin', 'crypto', 'deposit', 'fee', 'processing fee'
  ];
  
  const lowercaseMsg = message.toLowerCase();
  const matchedKeywords = fraudKeywords.filter(keyword => 
    lowercaseMsg.includes(keyword.toLowerCase())
  );
  
  if (matchedKeywords.length >= 3) {
    return {
      classification: "FRAUD",
      confidence_score: 0.85,
      reason: `Rule-based detection found suspicious keywords: ${matchedKeywords.slice(0, 3).join(', ')}`,
      note: "Using fallback detection system"
    };
  }
  
  return {
    classification: "NORMAL_SMS",
    confidence_score: 0.6,
    reason: "No significant fraud indicators detected by rule-based system",
    note: "Using fallback detection system"
  };
}

app.post("/detect", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // Check if OpenAI API key is properly configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
      console.warn("⚠️ OpenAI API key not configured, using rule-based fallback");
      return res.json(simpleFraudCheck(message));
    }

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini", // use "gpt-4o-mini" for cheaper testing
      messages: [
        { role: "system", content: fraudDetectionPrompt },
        { role: "user", content: message },
      ],
      temperature: 0,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      return res.status(500).json({ error: "No response from model" });
    }

    // Try parsing JSON
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      parsed = { raw: result };
    }

    res.json(parsed);
  } catch (error) {
    console.error(error);
    
    // Handle API key errors with a more helpful message
    if (error.message && error.message.includes('API key')) {
      console.error('⚠️ OpenAI API key error. Please check your .env file and update the OPENAI_API_KEY');
      return res.status(401).json({ 
        error: "API key error - please check server logs",
        details: "The OpenAI API key is invalid or missing. Contact the administrator to update the API key."
      });
    }
    
    res.status(500).json({ error: (error).message });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});