import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;  // Default to 5000 if PORT is not defined

app.use(cors());
app.use(express.json());

const hf = new InferenceClient(process.env.HF_API_KEY);

// Utilities and enhanced rule-based fraud detection
function normalizeText(input) {
  // Basic normalization: lowercase, remove accents, replace common leetspeak
  const lower = input.toLowerCase();
  const noAccents = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return noAccents
    .replace(/[@]/g, "a")
    .replace(/[$]/g, "s")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t");
}

function simpleSpamDetection(message) {
  const text = normalizeText(message);
  const fraudKeywords = [
    // Prize/lottery scams
    "won",
    "winner",
    "congratulations",
    "claim",
    "prize",
    "lottery",
    "jackpot",
    "reward",
    // Urgency tactics
    "urgent",
    "immediately",
    "expires",
    "limited time",
    "act now",
    "deadline",
    "last chance",
    "hurry",
    "asap",
    "quick",
    // Verification/security scams
    "verify",
    "confirm",
    "update",
    "suspended",
    "blocked",
    "security alert",
    "account locked",
    "kyc",
    "otp",
    // Financial scams
    "free money",
    "cash",
    "refund",
    "tax refund",
    "stimulus",
    "inheritance",
    "investment",
    "loan approved",
    "credit approved",
    // Banking and id terms (regional)
    "bank",
    "upi",
    "ifsc",
    "aadhaar",
    "pan",
    "gst",
    // Suspicious links/actions
    "click here",
    "click link",
    "download",
    "install app",
    "visit website",
    "open link",
    "http",
    "https",
    "www.",
    "bit.ly",
    "tinyurl",
  ];

  const detectedKeywords = fraudKeywords.filter((k) => text.includes(k));

  let suspicionScore = 0;
  // Weighted high-risk signals
  const hasUrl = /(https?:\/\/|www\.|bit\.ly|tinyurl|t\.co|shorturl)/i.test(
    message,
  );
  const hasMoney =
    /(?:\$|₹|rs\.?|inr\s?)?[0-9][0-9,]*(?:\.[0-9]{1,2})?/.test(message) ||
    /(prize|cash|money)/i.test(message);
  const hasUrgency = /(urgent|immediately|act now|expires|last chance)/i.test(
    message,
  );
  const asksCreds = /(otp|password|pin|ssn|social security|cvv)/i.test(text);
  const verifyAccount = text.includes("verify") && text.includes("account");
  const hasWinWords =
    /(congratulations|you\s*(have)?\s*won|winner|prize|lottery)/i.test(text);

  if (hasUrl) suspicionScore += 0.25;
  if (hasMoney) suspicionScore += 0.25;
  if (hasUrgency) suspicionScore += 0.25;
  if (asksCreds) suspicionScore += 0.25;
  if (verifyAccount) suspicionScore += 0.25;
  if (hasUrl && hasWinWords) suspicionScore += 0.35; // strong combo: link + lottery/winner wording
  if (hasMoney && hasWinWords) suspicionScore += 0.3; // amount + winnings wording

  // Keyword density contributes moderately
  suspicionScore += Math.min(0.4, (detectedKeywords.length / 10) * 0.4);

  // Cap between 0..1
  suspicionScore = Math.max(0, Math.min(1, suspicionScore));

  const isSpam = suspicionScore >= 0.5;

  return {
    isSpam,
    confidence: Math.min(0.98, suspicionScore * 0.9 + 0.2),
    detectedKeywords,
    score: suspicionScore,
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
      const modelResponse = await hf.textClassification({
        model: "mrm8488/bert-tiny-finetuned-sms-spam-detection",
        inputs: message,
      });

      // Normalize output shape to a flat array of {label, score}
      const predictions = Array.isArray(modelResponse)
        ? Array.isArray(modelResponse[0])
          ? modelResponse[0]
          : modelResponse
        : [];

      // Determine spam probability robustly
      const findByLabel = (labels) =>
        predictions.find((p) => labels.includes(String(p.label).toUpperCase()));
      const spamEntry =
        findByLabel(["SPAM", "LABEL_1"]) || findByLabel(["LABEL1", "TOXIC"]); // fallbacks
      const hamEntry =
        findByLabel(["HAM", "LABEL_0"]) || findByLabel(["LABEL0"]);

      let spamProb = 0;
      if (spamEntry && typeof spamEntry.score === "number")
        spamProb = spamEntry.score;
      else if (hamEntry && typeof hamEntry.score === "number")
        spamProb = 1 - hamEntry.score;
      else if (predictions.length > 0) {
        // fallback: take highest score and map by label name
        const top = predictions.reduce((a, b) => (a.score > b.score ? a : b));
        spamProb = String(top.label).toUpperCase().includes("SPAM")
          ? top.score
          : 1 - top.score;
      }

      const threshold = 0.6; // slightly lower threshold to reduce false negatives
      method = "AI";
      confidence = spamProb;
      isFraud = spamProb >= threshold;
      reason = isFraud
        ? `AI detected SPAM (confidence: ${(spamProb * 100).toFixed(1)}%)`
        : "AI analysis indicates message is likely safe";

      // Combine with rules: if rules are strongly suspicious, override safe
      const rules = simpleSpamDetection(message);
      if (!isFraud && rules.score >= 0.5) {
        isFraud = true;
        method = "AI+rules";
        confidence = Math.max(confidence, Math.max(0.9, rules.confidence));
        reason = `Rule-based override: high-risk patterns detected (keywords: ${rules.detectedKeywords.join(", ")})`;
      }
    } catch (apiError) {
      console.log(
        "HuggingFace API unavailable, using fallback detection:",
        apiError.message,
      );

      // Use simple rule-based detection as fallback
      const fallbackResult = simpleSpamDetection(message);
      isFraud = fallbackResult.isSpam;
      confidence = fallbackResult.confidence;
      method = "rules";

      if (isFraud) {
        reason = `Potential fraud detected using rule-based analysis (keywords: ${fallbackResult.detectedKeywords.join(", ")})`;
      } else {
        reason = "Rule-based analysis indicates message is safe";
      }
    }

    res.json({
      fraud: isFraud,
      confidence: confidence,
      reason: reason,
      method: method,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fraud check error:", error);
    res.status(500).json({ error: "Fraud check failed" });
  }
});
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Normalize phone number to digits only (keep last 15 digits max)
function normalizePhoneNumber(input) {
  if (!input) return "";
  const digits = String(input).replace(/[^0-9]/g, "");
  // Keep up to 15 digits (E.164 max), prefer last digits to allow for country code variance
  return digits.slice(-15);
}

// Verify phone number against blacklist and simple heuristics
app.post("/verify-number", (req, res) => {
  try {
    const { phoneNumber } = req.body || {};
    if (!phoneNumber || String(phoneNumber).trim().length === 0) {
      return res.status(400).json({ error: "phoneNumber is required" });
    }

    const normalized = normalizePhoneNumber(phoneNumber);

    // Load blacklist data
    // Resolve relative to this file to avoid CWD issues
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dataPath = path.resolve(__dirname, "data", "fraudNumbers.json");
    let blacklisted = [];
    try {
      const file = fs.readFileSync(dataPath, "utf8");
      const json = JSON.parse(file);
      blacklisted = Array.isArray(json.blacklistedNumbers)
        ? json.blacklistedNumbers
        : [];
    } catch (e) {
      console.warn("Could not read fraudNumbers.json:", e.message);
    }

    // Match logic: compare digits, allow suffix match for formatting differences
    const phoneEntries = blacklisted.filter(
      (e) => e && e.type === "phone" && e.id,
    );
    const matches = phoneEntries.filter((entry) => {
      const entryDigits = normalizePhoneNumber(entry.id);
      return (
        normalized === entryDigits ||
        normalized.endsWith(entryDigits) ||
        entryDigits.endsWith(normalized)
      );
    });

    let isVerified = true;
    let riskLevel = "low";
    let status = "No fraud reports found";
    let reportCount = 0;

    if (matches.length > 0) {
      isVerified = false;
      riskLevel = "high";
      status = matches[0].reason || "Known fraud number";
      reportCount = matches[0].reportCount || matches.length;
    } else {
      // Heuristics for suspicious numbers
      const tooShort = normalized.length < 8;
      const manyRepeats = /(\d)\1{5,}/.test(normalized); // 6+ same digits in a row
      const alternating = /(12){3,}|(21){3,}/.test(normalized);
      if (tooShort || manyRepeats || alternating) {
        isVerified = false;
        riskLevel = "medium";
        status = tooShort
          ? "Number appears invalid or too short"
          : manyRepeats
            ? "Suspicious pattern: repeated digits"
            : "Suspicious pattern: alternating digits";
      }
    }

    return res.json({
      phoneNumber,
      normalized,
      isVerified,
      riskLevel,
      status,
      reportCount,
      matches,
    });
  } catch (error) {
    console.error("verify-number error:", error);
    return res.status(500).json({ error: "Verification failed" });
  }
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("✅ Backend running on http://localhost:5000");
});

// app.listen(PORT, 'localhost', () => {
//     console.log(`✅ Backend running on http://localhost:${PORT}`);
// });
