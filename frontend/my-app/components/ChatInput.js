import { checkMessageSafety } from "../services/api";

async function handleSendMessage(text) {
  const result = await checkMessageSafety(text);
  console.log("Safety check:", result);

  if (result.safe) {
    alert("✅ Safe message");
  } else {
    alert(`⚠️ Fraud detected: ${result.reason}`);
  }
}
