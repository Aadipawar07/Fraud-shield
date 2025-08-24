import smsMonitorService from "../services/smsMonitor";
import { SMSMessage } from "../services/smsMonitor";

// Test SMS messages for development
export const testMessages = {
  fraudulent: [
    {
      sender: "+1234567890",
      message:
        "Congratulations! You have won $10,000 in our lottery! Click here to claim your prize: http://suspicious-link.com/claim",
    },
    {
      sender: "BANK-ALERT",
      message:
        "URGENT: Your account has been suspended due to suspicious activity. Verify your identity immediately by clicking: www.fake-bank.com/verify",
    },
    {
      sender: "+9876543210",
      message:
        "You have been selected for a special offer! Get free money now! Limited time only. Act fast: bit.ly/freemoney123",
    },
    {
      sender: "TAX-REFUND",
      message:
        "You are eligible for a tax refund of $2,500. Confirm your social security number and bank details: www.fake-irs.com",
    },
  ],
  safe: [
    {
      sender: "+1111111111",
      message: "Hey! Are we still meeting for lunch today at 12 PM?",
    },
    {
      sender: "DELIVERY",
      message:
        "Your package will be delivered today between 2-4 PM. Track your order at www.legitimate-courier.com",
    },
    {
      sender: "+2222222222",
      message:
        "Thanks for the documents. I will review them and get back to you by tomorrow.",
    },
    {
      sender: "BANK",
      message:
        "Your monthly statement is now available. Login to your account using the official mobile app to view details.",
    },
  ],
};

/**
 * Simulates receiving an SMS message for testing purposes
 * @param message - The test message object with sender and message content
 */
export const simulateIncomingSMS = async (message: {
  sender: string;
  message: string;
}) => {
  try {
    console.log("Simulating incoming SMS:", message);

    // Create a mock SMS object similar to what the real listener would provide
    const mockSMS = {
      originatingAddress: message.sender,
      body: message.message,
      messageBody: message.message,
      address: message.sender,
    };

    // Manually trigger the SMS processing logic
    const result = await smsMonitorService.scanMessage(
      message.message,
      message.sender,
    );

    console.log("Simulated SMS processing result:", result);
    return result;
  } catch (error) {
    console.error("Error simulating SMS:", error);
    throw error;
  }
};

/**
 * Tests fraud detection with all predefined test messages
 */
// Define test result types
interface SMSTestMessage {
  sender: string;
  message: string;
}

interface SMSTestResult extends SMSTestMessage {
  result: SMSMessage;
}

interface SMSTestError extends SMSTestMessage {
  error: unknown;
}

export const runFullSMSTest = async () => {
  console.log("Starting comprehensive SMS fraud detection test...");

  const results: {
    fraudulent: SMSTestResult[];
    safe: SMSTestResult[];
    errors: SMSTestError[];
  } = {
    fraudulent: [],
    safe: [],
    errors: [],
  };

  // Test fraudulent messages
  for (const testMsg of testMessages.fraudulent) {
    try {
      const result = await simulateIncomingSMS(testMsg);
      results.fraudulent.push({ ...testMsg, result });
      console.log(
        `✅ Fraudulent test passed: ${testMsg.message.substring(0, 50)}...`,
      );
    } catch (error) {
      console.error(
        `❌ Fraudulent test failed: ${testMsg.message.substring(0, 50)}...`,
        error,
      );
      results.errors.push({ ...testMsg, error });
    }
  }

  // Test safe messages
  for (const testMsg of testMessages.safe) {
    try {
      const result = await simulateIncomingSMS(testMsg);
      results.safe.push({ ...testMsg, result });
      console.log(
        `✅ Safe test passed: ${testMsg.message.substring(0, 50)}...`,
      );
    } catch (error) {
      console.error(
        `❌ Safe test failed: ${testMsg.message.substring(0, 50)}...`,
        error,
      );
      results.errors.push({ ...testMsg, error });
    }
  }

  console.log("SMS fraud detection test completed:", results);
  return results;
};

/**
 * Utility to quickly test a custom message
 * @param message - The message content to test
 * @param sender - The sender (optional, defaults to 'TEST')
 */
export const quickTest = async (message: string, sender: string = "TEST") => {
  return await simulateIncomingSMS({ sender, message });
};

// Export for easy testing in development
export default {
  testMessages,
  simulateIncomingSMS,
  runFullSMSTest,
  quickTest,
};
