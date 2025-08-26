// Simple script to test the fraud detection API
// Using built-in fetch API available in Node.js v18+

async function testFraudDetection() {
  const testCases = [
    {
      name: "Obvious Fraud",
      message: "CONGRATULATIONS! You've won $5,000 in our lottery. To claim your prize, send $100 processing fee to account 12345."
    },
    {
      name: "Legitimate Message",
      message: "Your Chase bank account monthly statement is ready to view. Please log in to your account at chase.com."
    },
    {
      name: "Normal Message",
      message: "Hey, can you pick up milk on your way home? Thanks!"
    }
  ];

  console.log("Testing Fraud Detection API at http://localhost:3002/detect");
  console.log("-----------------------------------------------------");

  for (const test of testCases) {
    console.log(`Testing: ${test.name}`);
    console.log(`Message: "${test.message}"`);
    
    try {
      const response = await fetch("http://localhost:3002/detect", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: test.message }),
      });

      const result = await response.json();
      console.log("Result:", JSON.stringify(result, null, 2));
      console.log("-----------------------------------------------------");
    } catch (error) {
      console.error(`Error testing "${test.name}":`, error.message);
      console.log("-----------------------------------------------------");
    }
  }
}

testFraudDetection();
