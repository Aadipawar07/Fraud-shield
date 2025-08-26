// /**
//  * Utility functions to detect fraudulent SMS messages
//  */

// // Common fraud keywords and patterns
// const FRAUD_KEYWORDS = [
//   'account suspended', 'urgent action', 'verify immediately',
//   'unusual activity', 'suspicious transaction', 'account locked',
//   'confirm your identity', 'click link', 'security alert',
//   'prize', 'winner', 'won', 'lottery', 'inheritance',
//   'investment opportunity', 'high return', 'limited time offer',
//   'free gift', 'exclusive deal', 'offer expires',
//   'password expired', 'update your information',
//   'activate your card', 'credit card verification',
//   'verify your account', 'confirm payment',
//   'wire transfer', 'online banking verification'
// ];

// // Common financial institutions and services that are often impersonated
// const IMPERSONATED_ENTITIES = [
//   'bank', 'credit union', 'paypal', 'apple', 'amazon',
//   'netflix', 'google', 'microsoft', 'facebook', 'instagram',
//   'twitter', 'irs', 'government', 'social security',
//   'visa', 'mastercard', 'american express', 'discover'
// ];

// // Suspicious link patterns
// const SUSPICIOUS_URL_PATTERNS = [
//   /bit\.ly/i, /tinyurl/i, /goo\.gl/i, /t\.co/i, /ow\.ly/i,
//   /rb\.gy/i, /shorturl/i, /tiny\.cc/i, /is\.gd/i,
//   /suspicious/i, /verify/i, /login/i, /account/i, /secure/i,
//   /update/i, /click/i, /access/i, /confirm/i, /banking/i
// ];

// /**
//  * Simple fraud detection algorithm for SMS messages
//  * @param {string} message The SMS message to check
//  * @param {string} sender The SMS sender address
//  * @returns {{
//  *   isFraudulent: boolean,
//  *   score: number,
//  *   reasons: string[],
//  *   analysis: Object
//  * }}
//  */
// export const analyzeMessage = (message, sender) => {
//   const lowerMessage = message.toLowerCase();
//   const reasons = [];
//   const analysis = {
//     containsFraudKeywords: false,
//     containsImpersonation: false,
//     containsSuspiciousLinks: false,
//     containsUrgencyLanguage: false,
//     containsUnusualSender: false
//   };
  
//   let score = 0;
  
//   // Check for fraud keywords
//   const foundKeywords = FRAUD_KEYWORDS.filter(keyword => 
//     lowerMessage.includes(keyword.toLowerCase())
//   );
  
//   if (foundKeywords.length > 0) {
//     score += foundKeywords.length * 10;
//     reasons.push(`Contains ${foundKeywords.length} suspicious phrases`);
//     analysis.containsFraudKeywords = true;
//     analysis.foundKeywords = foundKeywords;
//   }
  
//   // Check for impersonated entities
//   const foundEntities = IMPERSONATED_ENTITIES.filter(entity => 
//     lowerMessage.includes(entity.toLowerCase())
//   );
  
//   if (foundEntities.length > 0) {
//     score += foundEntities.length * 5;
//     reasons.push(`References ${foundEntities.join(', ')}`);
//     analysis.containsImpersonation = true;
//     analysis.impersonatedEntities = foundEntities;
//   }
  
//   // Check for suspicious URLs
//   const hasURL = /https?:\/\//i.test(message) || /www\./i.test(message);
//   let suspiciousUrlFound = false;
  
//   if (hasURL) {
//     for (const pattern of SUSPICIOUS_URL_PATTERNS) {
//       if (pattern.test(lowerMessage)) {
//         suspiciousUrlFound = true;
//         break;
//       }
//     }
    
//     if (suspiciousUrlFound) {
//       score += 25;
//       reasons.push('Contains suspicious URL');
//       analysis.containsSuspiciousLinks = true;
//     }
//   }
  
//   // Check for urgency language
//   const urgencyPatterns = [
//     /urgent/i, /immediately/i, /now/i, /today/i, /asap/i,
//     /quickly/i, /hurry/i, /limited time/i, /expires/i, /deadline/i
//   ];
  
//   const hasUrgency = urgencyPatterns.some(pattern => pattern.test(message));
  
//   if (hasUrgency) {
//     score += 15;
//     reasons.push('Uses urgency tactics');
//     analysis.containsUrgencyLanguage = true;
//   }
  
//   // Check for unusual sender
//   if (sender && (/^\+[0-9]{10,15}$/.test(sender) || /^[0-9]{5,6}$/.test(sender))) {
//     // Short codes or international numbers often used for fraud
//     score += 5;
//     reasons.push('Sent from unusual number');
//     analysis.containsUnusualSender = true;
//   }
  
//   // Calculate final fraud probability
//   const isFraudulent = score >= 30;
  
//   return {
//     isFraudulent,
//     score,
//     reasons,
//     analysis
//   };
// };

// /**
//  * Format fraud analysis for display
//  * @param {Object} analysis The analysis result from analyzeMessage
//  * @returns {string} A human-readable explanation
//  */
// export const getReadableAnalysis = (analysis) => {
//   if (!analysis || !analysis.reasons || analysis.reasons.length === 0) {
//     return 'No fraud indicators found in this message.';
//   }
  
//   let result = `Fraud probability score: ${analysis.score}/100\n\n`;
  
//   if (analysis.isFraudulent) {
//     result += '⚠️ This message appears to be FRAUDULENT ⚠️\n\n';
//   } else {
//     result += 'This message appears to be legitimate, but use caution.\n\n';
//   }
  
//   result += 'Reasons:\n';
//   analysis.reasons.forEach((reason, index) => {
//     result += `${index + 1}. ${reason}\n`;
//   });
  
//   if (analysis.analysis?.foundKeywords?.length > 0) {
//     result += `\nSuspicious phrases detected: ${analysis.analysis.foundKeywords.join(', ')}\n`;
//   }
  
//   return result;
// };
