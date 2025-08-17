// backend/index.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/fraud-check", (req, res) => {
  const { message } = req.body;
  // Dummy logic
  if (message && (message.includes("OTP") || message.includes("Lottery"))) {
    res.json({ fraud: true, reason: "Suspicious keywords found" });
  } else {
    res.json({ fraud: false });
  }
});

// GET support for /fraud-check for browser testing
app.get("/fraud-check", (req, res) => {
  const message = req.query.message || "";
  if (message.includes("OTP") || message.includes("Lottery")) {
    res.json({ fraud: true, reason: "Suspicious keywords found" });
  } else {
    res.json({ fraud: false });
  }
});

app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
