// Mock data for quizzes in the ScamQuest feature
const mockQuizData = {
  l1: {
    title: "Fake Advisor Quiz",
    questions: [
      {
        id: "q1",
        question: "Which of the following is a red flag for identifying a fake financial advisor?",
        options: [
          "They have proper credentials that can be verified",
          "They guarantee unusually high returns with no risk",
          "They provide detailed documentation of their recommendations",
          "They are registered with regulatory authorities"
        ],
        correctAnswer: 1
      },
      {
        id: "q2",
        question: "What should you do before hiring a financial advisor?",
        options: [
          "Accept their first offer immediately",
          "Transfer funds to show your commitment",
          "Verify their credentials and check for complaints",
          "Share your personal identification documents"
        ],
        correctAnswer: 2
      },
      {
        id: "q3",
        question: "A legitimate financial advisor would typically:",
        options: [
          "Pressure you to make immediate decisions",
          "Discourage you from reading the fine print",
          "Explain the risks associated with investments",
          "Ask for cash payments only"
        ],
        correctAnswer: 2
      }
    ],
    points: 100,
    badge: "Fraud Hunter 🕵️",
    color: "#FF6B6B"
  },
  l2: {
    title: "SMS Scam Detection Quiz",
    questions: [
      {
        id: "q1",
        question: "Which of these SMS messages is most likely a scam?",
        options: [
          "Your appointment is confirmed for tomorrow at 2 PM. Reply Y to confirm or N to reschedule.",
          "URGENT: Your account has been compromised. Click this link immediately to secure your funds: bit.ly/12xyz",
          "Your prescription is ready for pickup at Walgreens. Store hours: 8am-10pm",
          "This is a reminder that your bill payment is due on 06/15. Login to your account to make a payment."
        ],
        correctAnswer: 1
      },
      {
        id: "q2",
        question: "What should you do if you receive a suspicious SMS asking for personal information?",
        options: [
          "Reply with the information requested to verify your identity",
          "Call the number back to confirm it's legitimate",
          "Click any links to see where they lead",
          "Contact the company directly through their official channels"
        ],
        correctAnswer: 3
      },
      {
        id: "q3",
        question: "Which element is commonly found in SMS phishing attempts?",
        options: [
          "Company logo and official signature",
          "A sense of urgency or threat",
          "Proper grammar and spelling",
          "Clear sender identification"
        ],
        correctAnswer: 1
      },
      {
        id: "q4",
        question: "If you accidentally clicked a link in a suspicious SMS, what should you do first?",
        options: [
          "Ignore it and hope nothing happens",
          "Enter your login details to check if the site is legitimate",
          "Disconnect from the internet and scan your device for malware",
          "Share the link with friends to see if they think it's a scam"
        ],
        correctAnswer: 2
      }
    ],
    points: 150,
    badge: "SMS Guardian 📱",
    color: "#4ECDC4"
  },
  l3: {
    title: "Online Purchase Safety Quiz",
    questions: [
      {
        id: "q1",
        question: "Which of these is a sign of a trustworthy online store?",
        options: [
          "The prices are significantly lower than all competitors",
          "They only accept cryptocurrency or wire transfers",
          "They have a secure website (https://) and clear return policy",
          "They require you to make a decision within a limited timeframe"
        ],
        correctAnswer: 2
      },
      {
        id: "q2",
        question: "When making an online purchase, which payment method generally offers the best fraud protection?",
        options: [
          "Wire transfer",
          "Cryptocurrency",
          "Credit card",
          "Direct bank transfer"
        ],
        correctAnswer: 2
      },
      {
        id: "q3",
        question: "What should you check before entering payment details on an online store?",
        options: [
          "That the website has lots of pop-up advertisements",
          "That the URL begins with \"https://\" and has a padlock icon",
          "That the store offers the lowest price anywhere online",
          "That the website was created very recently"
        ],
        correctAnswer: 1
      },
      {
        id: "q4",
        question: "If an online deal seems too good to be true, what should you do?",
        options: [
          "Purchase immediately before it sells out",
          "Research the seller, read reviews, and verify their legitimacy",
          "Send the link to friends so they can also benefit",
          "Provide your personal details to hold the item"
        ],
        correctAnswer: 1
      },
      {
        id: "q5",
        question: "Which of these is a warning sign of an online shopping scam?",
        options: [
          "The store has a professional-looking website with clear contact information",
          "The seller has many detailed positive reviews from verified buyers",
          "The seller only communicates through the platform's official messaging system",
          "The seller asks you to complete the transaction outside the original platform"
        ],
        correctAnswer: 3
      }
    ],
    points: 200,
    badge: "Safe Shopper 🛒",
    color: "#9D8DF1"
  },
  l4: {
    title: "Identity Protection Quiz",
    questions: [
      {
        id: "q1",
        question: "Which of the following is NOT a good practice for protecting your identity online?",
        options: [
          "Using a different password for each important account",
          "Installing software from advertisements that offer to speed up your computer",
          "Checking your credit report regularly",
          "Setting up two-factor authentication for your accounts"
        ],
        correctAnswer: 1
      },
      {
        id: "q2",
        question: "What should you do if you suspect your identity has been stolen?",
        options: [
          "Wait and see if any unauthorized charges appear",
          "Post about it on social media to warn others",
          "Contact your financial institutions and place a fraud alert on your credit reports",
          "Change only the passwords you can remember"
        ],
        correctAnswer: 2
      },
      {
        id: "q3",
        question: "Which of these is a sign that your identity might have been stolen?",
        options: [
          "You receive a notification from your bank about a new login from your regular device",
          "You get regular marketing emails from companies you shop with",
          "You receive bills for accounts you didn't open",
          "Your credit card company calls to verify a large purchase you recently made"
        ],
        correctAnswer: 2
      },
      {
        id: "q4",
        question: "What is a secure way to dispose of documents containing personal information?",
        options: [
          "Tear them in half and recycle",
          "Shred them with a cross-cut shredder",
          "Black out your name with a marker",
          "Throw them in the regular trash"
        ],
        correctAnswer: 1
      }
    ],
    points: 250,
    badge: "Identity Protector 🔒",
    color: "#FF9A8B"
  }
};

export default mockQuizData;
