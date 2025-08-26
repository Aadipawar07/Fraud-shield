// OpenAI API routes for secure AI analysis
import express from 'express';
import { OpenAI } from 'openai';
import { createAuditLog } from '../middleware/audit.js';

const router = express.Router();

// Initialize OpenAI client on the backend (API key is secure here)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Endpoint for analyzing SMS messages using OpenAI
 * Keeps the API key secure on the backend
 */
router.post('/analyze-sms', async (req, res) => {
  try {
    const { message, system_prompt } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Message content is required',
        classification: 'ERROR',
        confidence_score: 0,
        reason: 'Missing message content'
      });
    }
    
    // Set a default system prompt if none provided
    const prompt = system_prompt || `
      You are a fraud detection AI specializing in analyzing text messages.
      Classify the message into one of these categories:
      1. FRAUD
      2. LEGITIMATE
      3. NORMAL_SMS
    `;
    
    // Create audit log entry for tracking
    try {
      await createAuditLog({
        action: 'sms_analysis_request',
        resourceType: 'sms',
        resourceId: null,
        userId: req.user?.id || null,
        metadata: {
          messageLength: message.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.warn('Could not create audit log:', logError.message);
      // Continue with the API call even if logging fails
    }

    // Call OpenAI API securely from backend
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message },
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error("No response from OpenAI model");
    }
    
    // Parse and validate the result
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
      
      // Create audit log for successful analysis
      try {
        await createAuditLog({
          action: 'sms_analysis_complete',
          resourceType: 'sms',
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
      if (result.includes("FRAUD")) {
        res.json({
          classification: "FRAUD",
          confidence_score: 0.8,
          reason: "Message contains fraud indicators (fallback parsing)",
        });
      } else {
        res.status(500).json({
          classification: "ERROR",
          confidence_score: 0,
          reason: "Invalid JSON output from AI model",
        });
      }
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Log the error
    try {
      await createAuditLog({
        action: 'sms_analysis_error',
        resourceType: 'sms',
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
      reason: `OpenAI API error: ${error.message}`,
    });
  }
});

export default router;
