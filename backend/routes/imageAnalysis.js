// Image analysis routes for chat screenshot fraud detection
import express from 'express';
import { OpenAI } from 'openai';
import multer from 'multer';
import { createAuditLog } from '../middleware/audit.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
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

/**
 * Endpoint for analyzing chat screenshots using OpenAI Vision API
 */
router.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image file provided',
        classification: 'ERROR',
        confidence_score: 0,
        reason: 'Missing image file'
      });
    }

    // Create audit log entry for tracking
    try {
      await createAuditLog({
        action: 'image_analysis_request',
        resourceType: 'image',
        resourceId: null,
        userId: req.user?.id || null,
        metadata: {
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.warn('Could not create audit log:', logError.message);
    }

    // Convert image buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Call OpenAI Vision API
    const completion = await openai.chat.completions.create({
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
      
      // Create audit log for successful analysis
      try {
        await createAuditLog({
          action: 'image_analysis_complete',
          resourceType: 'image',
          resourceId: null,
          userId: req.user?.id || null,
          metadata: {
            classification: parsedResult.classification,
            confidence: parsedResult.confidence_score,
            timestamp: new Date().toISOString()
          }
        });
      } catch (logError) {
        console.warn('Could not create completion audit log:', logError.message);
      }
      
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
    
    // Log the error
    try {
      await createAuditLog({
        action: 'image_analysis_error',
        resourceType: 'image',
        resourceId: null,
        userId: req.user?.id || null,
        metadata: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error("Error logging failed:", logError.message);
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

export default router;