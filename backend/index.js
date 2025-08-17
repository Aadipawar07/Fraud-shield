import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";
dotenv.config({path: './token.env'});
const app = express();
app.use(cors());
app.use(express.json());

const hf = new InferenceClient(process.env.HF_API_KEY);
// Fraud detection with ML
app.post("/fraud-check", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
            // Call HuggingFace model
            const result = await hf.textClassification({
                model: "mrm8488/bert-tiny-finetuned-sms-spam-detection",
                inputs: message,
            });
            // Log the full model result for debugging
            console.log("Model result:", result);
            // Model returns array of labels with scores
            const prediction = result[0];
            const label = prediction.label; // "spam" or "ham"
            const score = prediction.score;
            // Use a confidence threshold for spam detection
            const threshold = 0.7;
            const isFraud = label === "LABEL_1" && score > threshold;
            res.json({
                fraud: isFraud,
                label: label === "LABEL_1" ? "spam" : "ham",
                confidence: score,
                reason:
                    isFraud
                        ? `Message classified as SPAM (confidence: ${score})`
                        : "Message seems safe",
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
