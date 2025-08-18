import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";
import fs from "fs";
import path from "path";
dotenv.config({path: './token.env'});
const app = express();
app.use(cors());
app.use(express.json());

const hf = new InferenceClient(process.env.HF_API_KEY);

// Simple rule-based fraud detection as fallback
function simpleSpamDetection(message) {
    const fraudKeywords = [
        // Prize/lottery scams
        'won', 'winner', 'congratulations', 'claim', 'prize', 'lottery',
        'selected', 'chosen', 'lucky', 'jackpot', 'reward',
        
        // Urgency tactics
        'urgent', 'immediately', 'expires', 'limited time', 'act now',
        'deadline', 'last chance', 'hurry', 'quick', 'asap',
        
        // Verification/security scams
        'verify', 'confirm', 'update', 'suspended', 'blocked',
        'security alert', 'account locked', 'verify now', 'click here',
        
        // Financial scams
        'free money', 'cash', 'refund', 'tax refund', 'stimulus',
        'inheritance', 'investment', 'loan approved', 'credit approved',
        
        // Personal info requests
        'social security', 'ssn', 'credit card', 'bank account',
        'personal information', 'pin', 'password', 'otp',
        
        // Suspicious links/actions
        'click here', 'click link', 'download', 'install app',
        'visit website', 'go to', 'open link'
    ];
    
    const lowerMessage = message.toLowerCase();
    const detectedKeywords = fraudKeywords.filter(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
    );
    
    // More sophisticated scoring
    let spamScore = 0;
    
    // High-risk patterns
    if (lowerMessage.includes('click') && lowerMessage.includes('link')) spamScore += 0.3;
    if (lowerMessage.includes('verify') && lowerMessage.includes('account')) spamScore += 0.3;
    if (lowerMessage.includes('won') && lowerMessage.includes('prize')) spamScore += 0.4;
    if (lowerMessage.includes('urgent') && lowerMessage.includes('act')) spamScore += 0.3;
    
    // Keyword density
    const keywordDensity = detectedKeywords.length / fraudKeywords.length;
    spamScore += keywordDensity * 0.6;
    
    // Money mentions with urgency
    const moneyPattern = /\$[0-9,]+|money|cash|prize/i;
    if (moneyPattern.test(message) && (lowerMessage.includes('urgent') || lowerMessage.includes('claim'))) {
        spamScore += 0.4;
    }
    
    // URL patterns
    const urlPattern = /(https?:\/\/|www\.|bit\.ly|\.com|\.org)/i;
    if (urlPattern.test(message)) {
        spamScore += 0.2;
    }
    
    const isSpam = spamScore > 0.25; // Threshold for fraud detection
    
    return {
        isSpam,
        confidence: Math.min(0.95, spamScore * 1.2 + 0.1),
        detectedKeywords,
        score: spamScore
    };
}

// Fraud detection with ML and fallback
app.post("/fraud-check", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        let isFraud = false;
        let confidence = 0;
        let method = "fallback";
        let reason = "Message seems safe";

        try {
            // Try HuggingFace model first
            const result = await hf.textClassification({
                model: "mrm8488/bert-tiny-finetuned-sms-spam-detection",
                inputs: message,
            });
            
            console.log("Model result:", result);
            const prediction = result[0];
            const label = prediction.label;
            const score = prediction.score;
            const threshold = 0.7;
            
            isFraud = label === "LABEL_1" && score > threshold;
            confidence = score;
            method = "AI";
            reason = isFraud
                ? `AI detected SPAM (confidence: ${(score * 100).toFixed(1)}%)`
                : "AI analysis indicates message is safe";
                
        } catch (apiError) {
            console.log("HuggingFace API unavailable, using fallback detection:", apiError.message);
            
            // Use simple rule-based detection as fallback
            const fallbackResult = simpleSpamDetection(message);
            isFraud = fallbackResult.isSpam;
            confidence = fallbackResult.confidence;
            method = "rules";
            
            if (isFraud) {
                reason = `Potential fraud detected using rule-based analysis (keywords: ${fallbackResult.detectedKeywords.join(', ')})`;
            } else {
                reason = "Rule-based analysis indicates message is safe";
            }
        }

        res.json({
            fraud: isFraud,
            confidence: confidence,
            reason: reason,
            method: method,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error("Fraud check error:", error);
        res.status(500).json({ error: "Fraud check failed" });
    }
});
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});
app.listen(5000, () => {
    console.log("✅ Backend running on http://localhost:5000");

});

// app.listen(PORT, 'localhost', () => {
//     console.log(`✅ Backend running on http://localhost:${PORT}`);
// });
