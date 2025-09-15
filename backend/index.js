import express from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import multer from "multer";
// Load environment variables from .env file
dotenv.config();

// Debug: Log environment variables (without showing the full API key)
console.log("Environment variables loaded:");
console.log(`- PORT: ${process.env.PORT || 3002}`);
console.log(`- OPENAI_API_KEY set: ${process.env.OPENAI_API_KEY ? 'Yes (key found)' : 'No (missing)'}`);
if (process.env.OPENAI_API_KEY) {
  const apiKeyStart = process.env.OPENAI_API_KEY.substring(0, 7);
  const apiKeyEnd = process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4);
  console.log(`- API Key: ${apiKeyStart}...${apiKeyEnd}`);
}

const app = express();
app.use(express.json());

// Enable CORS for React Native app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Add a test route
app.get('/', (req, res) => {
  res.json({ message: 'Fraud Shield API is running!' });
});

// Define port for the server
const PORT = process.env.PORT || 3002; // Using port from .env or 3002 as default

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
  console.error('⚠️ OpenAI API key is not configured! Please update the OPENAI_API_KEY in your .env file');
  console.error('You can get your API key from https://platform.openai.com/account/api-keys');
}

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
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

// Image analysis endpoint for chat screenshots
app.post("/analyze-image", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image file provided',
        classification: 'ERROR',
        confidence_score: 0,
        reason: 'Missing image file'
      });
    }

    // Check if OpenAI API key is properly configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
      console.warn("⚠️ OpenAI API key not configured for image analysis");
      return res.status(500).json({
        classification: "ERROR",
        confidence_score: 0,
        reason: "Image analysis requires OpenAI API key configuration"
      });
    }

    // Convert image buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    console.log(`Analyzing image of size: ${req.file.size} bytes, type: ${mimeType}`);

    // Call OpenAI Vision API
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a fraud detection AI specializing in analyzing chat screenshots for potential scams and fraudulent activities.

Analyze the provided chat screenshot and determine if it contains:
1. Phishing attempts
2. Romance scams
3. Investment scams
4. Fake job offers
5. Lottery/prize scams
6. Tech support scams
7. Social engineering attempts
8. Identity theft attempts
9. Financial fraud
10. Any other suspicious or fraudulent content

Respond in JSON format with:
{
  "classification": "FRAUD" | "LEGITIMATE" | "SUSPICIOUS" | "UNCLEAR",
  "confidence_score": 0.0-1.0,
  "reason": "Brief explanation of the classification",
  "detailed_analysis": "Detailed analysis of the chat content",
  "fraud_indicators": ["list", "of", "specific", "red", "flags"],
  "recommendations": ["list", "of", "safety", "recommendations"],
  "phone_number": "extracted phone number if any, null otherwise"
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this chat screenshot for potential fraud or scam indicators."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error("No response from OpenAI Vision model");
    }
    
    // Parse and validate the result
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
      console.log("Image analysis result:", parsedResult.classification, "confidence:", parsedResult.confidence_score);
      
      // Return the result to client
      res.json(parsedResult);
      
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      
      // Try to extract basic classification from the raw text if JSON parsing fails
      if (result.toLowerCase().includes("fraud") || result.toLowerCase().includes("scam")) {
        res.json({
          classification: "FRAUD",
          confidence_score: 0.8,
          reason: "Image contains potential fraud indicators (fallback parsing)",
          detailed_analysis: "Analysis failed to parse properly, but fraud indicators were detected.",
          fraud_indicators: ["Suspicious content detected"],
          recommendations: ["Be cautious", "Do not share personal information", "Report if suspicious"]
        });
      } else {
        res.status(500).json({
          classification: "ERROR",
          confidence_score: 0,
          reason: "Invalid JSON output from AI model",
          detailed_analysis: "Failed to analyze the image properly."
        });
      }
    }
  } catch (error) {
    console.error("OpenAI Vision API error:", error);
    
    // Handle specific API errors
    if (error.message && error.message.includes('API key')) {
      console.error('⚠️ OpenAI API key error for image analysis. Please check your .env file');
      return res.status(401).json({ 
        classification: "ERROR",
        confidence_score: 0,
        reason: "API key error - please check server configuration"
      });
    }
    
    // Return error to client
    res.status(500).json({
      classification: "ERROR",
      confidence_score: 0,
      reason: `Image analysis failed: ${error.message}`,
      detailed_analysis: "Unable to analyze the image at this time. Please try again later."
    });
  }
});

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