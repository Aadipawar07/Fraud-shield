/**
 * Multi-language Fraud Detection System
 * Supports detection of phishing and social engineering in multiple languages
 */

// Language-specific fraud patterns for Indian context
export const MULTILINGUAL_FRAUD_PATTERNS = {
  // English patterns (enhanced)
  en: {
    URGENT_ACTION: [
      /urgent(ly)?.*action.*require/i,
      /immediate(ly)?.*respond/i,
      /act.*now.*expire/i,
      /last.*chance/i,
      /deadline.*today/i
    ],
    FINANCIAL_SCAMS: [
      /account.*suspend/i,
      /verify.*payment/i,
      /update.*banking/i,
      /transaction.*fail/i,
      /refund.*pending/i,
      /block.*card/i
    ],
    PRIZE_LOTTERY: [
      /congratulations.*won/i,
      /lottery.*winner/i,
      /prize.*claim/i,
      /lucky.*draw/i,
      /jackpot.*won/i
    ],
    PERSONAL_INFO: [
      /share.*otp/i,
      /confirm.*pin/i,
      /verify.*identity/i,
      /update.*kyc/i,
      /submit.*documents/i
    ]
  },

  // Hindi patterns (Devanagari script)
  hi: {
    URGENT_ACTION: [
      /तुरंत.*कार्रवाई/,
      /जल्दी.*करें/,
      /आज.*ही/,
      /अंतिम.*मौका/,
      /समय.*समाप्त/,
      /urgent.*action/i
    ],
    FINANCIAL_SCAMS: [
      /खाता.*बंद/,
      /अकाउंट.*सस्पेंड/,
      /पेमेंट.*फेल/,
      /रिफंड.*मिलेगा/,
      /कार्ड.*ब्लॉक/,
      /बैंक.*वेरिफाई/,
      /ट्रांजैक्शन.*रुक/
    ],
    PRIZE_LOTTERY: [
      /बधाई.*जीता/,
      /लॉटरी.*विनर/,
      /इनाम.*मिला/,
      /भाग्यशाली.*ड्रॉ/,
      /पुरस्कार.*जीत/,
      /करोड़.*रुपए.*मिले/
    ],
    PERSONAL_INFO: [
      /otp.*भेजें/,
      /पिन.*कन्फर्म/,
      /पहचान.*सत्यापन/,
      /kyc.*अपडेट/,
      /दस्तावेज.*जमा/,
      /व्यक्तिगत.*जानकारी/
    ]
  },

  // Hinglish patterns (Roman script Hindi)
  hinglish: {
    URGENT_ACTION: [
      /turant.*action/i,
      /jaldi.*karo/i,
      /aaj.*hi.*karo/i,
      /last.*chance.*hai/i,
      /time.*khatam/i
    ],
    FINANCIAL_SCAMS: [
      /account.*band.*hoga/i,
      /payment.*fail.*hua/i,
      /refund.*milega/i,
      /card.*block.*hoga/i,
      /bank.*verify.*karo/i
    ],
    PRIZE_LOTTERY: [
      /badhai.*jeeta.*hai/i,
      /lottery.*winner.*hai/i,
      /inaam.*mila.*hai/i,
      /lucky.*draw.*winner/i
    ],
    PERSONAL_INFO: [
      /otp.*bhejo/i,
      /pin.*confirm.*karo/i,
      /kyc.*update.*karo/i,
      /documents.*submit.*karo/i
    ]
  },

  // Marathi patterns
  mr: {
    URGENT_ACTION: [
      /तातडीने.*कार्य/,
      /लगेच.*करा/,
      /आजच.*करावे/,
      /शेवटची.*संधी/
    ],
    FINANCIAL_SCAMS: [
      /खाते.*बंद/,
      /पेमेंट.*अयशस्वी/,
      /कार्ड.*ब्लॉक/,
      /बँक.*सत्यापन/
    ],
    PRIZE_LOTTERY: [
      /अभिनंदन.*जिंकले/,
      /लॉटरी.*विजेता/,
      /बक्षीस.*मिळाले/
    ]
  },

  // Gujarati patterns
  gu: {
    URGENT_ACTION: [
      /તુરંત.*કાર્ય/,
      /જલ્દી.*કરો/,
      /આજે.*જ/,
      /છેલ્લી.*તક/
    ],
    FINANCIAL_SCAMS: [
      /ખાતું.*બંધ/,
      /પેમેન્ટ.*નિષ્ફળ/,
      /કાર્ડ.*બ્લોક/,
      /બેંક.*ચકાસણી/
    ]
  },

  // Tamil patterns
  ta: {
    URGENT_ACTION: [
      /உடனடியாக.*நடவடிக்கை/,
      /விரைவாக.*செய்யுங்கள்/,
      /இன்றே.*செய்ய/,
      /கடைசி.*வாய்ப்பு/
    ],
    FINANCIAL_SCAMS: [
      /கணக்கு.*நிறுத்தம்/,
      /பணம்.*தோல்வி/,
      /கார்டு.*தடை/,
      /வங்கி.*சரிபார்ப்பு/
    ]
  }
};

// Common fraud indicators across languages
export const UNIVERSAL_FRAUD_INDICATORS = {
  PHONE_NUMBERS: [
    /\+91.*[6-9]\d{9}/,  // Indian mobile numbers
    /[6-9]\d{9}/,        // 10-digit Indian numbers
    /\b\d{5,6}\b/        // Short codes
  ],
  URLS: [
    /https?:\/\/[^\s]+/i,
    /www\.[^\s]+/i,
    /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/
  ],
  CURRENCY: [
    /₹\s*\d+/,
    /rs\.?\s*\d+/i,
    /rupees?\s*\d+/i,
    /\$\s*\d+/,
    /usd\s*\d+/i
  ],
  BANKING_TERMS: [
    /sbi|hdfc|icici|axis|kotak|pnb|bob|canara|union|uco/i,
    /paytm|phonepe|gpay|amazon.*pay|mobikwik/i,
    /upi|imps|neft|rtgs/i
  ]
};

// Multi-language AI prompts
export const MULTILINGUAL_AI_PROMPTS = {
  en: `
You are a fraud detection AI specializing in analyzing text messages with extremely high accuracy (95%+) for the Indian market.
Classify any given message into one of three categories:
1. FRAUD - scams like stock tips, fake loans, lottery winnings, phishing links, deposit requests, unrealistic profit promises
2. LEGITIMATE - real financial/business updates, genuine bank alerts, market news
3. NORMAL_SMS - casual/personal/service messages (friends, family, delivery, OTPs)

Consider Indian context:
- Common Indian bank names (SBI, HDFC, ICICI, etc.)
- Indian payment apps (Paytm, PhonePe, GPay)
- Currency in Rupees (₹)
- Indian phone number patterns
- Hinglish language mixing

Output strictly in JSON format:
{
  "classification": "FRAUD" or "LEGITIMATE" or "NORMAL_SMS",
  "confidence_score": number between 0-1,
  "reason": "short explanation",
  "language_detected": "en/hi/hinglish/mixed"
}`,

  hi: `
आप एक धोखाधड़ी पहचान AI हैं जो भारतीय बाज़ार के लिए टेक्स्ट संदेशों का विश्लेषण करता है।
किसी भी संदेश को इन तीन श्रेणियों में वर्गीकृत करें:
1. FRAUD - घोटाले जैसे फर्जी लोन, लॉटरी, फिशिंग लिंक, पैसे की मांग
2. LEGITIMATE - वास्तविक बैंक अलर्ट, व्यापारिक अपडेट
3. NORMAL_SMS - व्यक्तिगत/सेवा संदेश (दोस्त, परिवार, डिलीवरी, OTP)

भारतीय संदर्भ का ध्यान रखें:
- भारतीय बैंक (SBI, HDFC, ICICI आदि)
- पेमेंट ऐप्स (Paytm, PhonePe, GPay)
- रुपये की करेंसी (₹)
- हिंग्लिश भाषा

JSON फॉर्मेट में आउटपुट:
{
  "classification": "FRAUD" या "LEGITIMATE" या "NORMAL_SMS",
  "confidence_score": 0-1 के बीच संख्या,
  "reason": "संक्षिप्त व्याख्या",
  "language_detected": "hi/en/hinglish/mixed"
}`,

  auto: `
You are a multilingual fraud detection AI for the Indian market. Detect the language(s) used in the message and analyze for fraud patterns in:
- English
- Hindi (Devanagari)
- Hinglish (Hindi in Roman script)
- Regional languages (Marathi, Gujarati, Tamil, etc.)

Consider code-mixing and language switching common in Indian SMS communications.

Classify into: FRAUD, LEGITIMATE, or NORMAL_SMS

Output in JSON:
{
  "classification": "FRAUD/LEGITIMATE/NORMAL_SMS",
  "confidence_score": 0-1,
  "reason": "explanation",
  "language_detected": "detected language(s)",
  "multilingual_indicators": ["list of language-specific fraud indicators found"]
}`
};

interface MultilingualAnalysisResult {
  classification: 'FRAUD' | 'LEGITIMATE' | 'NORMAL_SMS';
  confidence_score: number;
  reason: string;
  language_detected: string;
  multilingual_indicators?: string[];
  pattern_matches: {
    language: string;
    category: string;
    patterns: string[];
  }[];
  translation_needed: boolean;
  localized_explanation: string;
}

/**
 * Detect language of the message
 */
export function detectLanguage(message: string): string[] {
  const languages: string[] = [];
  
  // Check for Devanagari script (Hindi, Marathi, Sanskrit)
  if (/[\u0900-\u097F]/.test(message)) {
    languages.push('hi');
  }
  
  // Check for Gujarati script
  if (/[\u0A80-\u0AFF]/.test(message)) {
    languages.push('gu');
  }
  
  // Check for Tamil script
  if (/[\u0B80-\u0BFF]/.test(message)) {
    languages.push('ta');
  }
  
  // Check for English/Roman script
  if (/[a-zA-Z]/.test(message)) {
    languages.push('en');
  }
  
  // Check for Hinglish patterns
  const hinglishPatterns = [
    /\b(karo|karna|hai|hoga|mila|bhejo|send|kar|de)\b/i,
    /\b(aap|apka|mera|tera|uska)\b/i,
    /\b(paisa|rupees?|rs\.?)\b/i
  ];
  
  if (hinglishPatterns.some(pattern => pattern.test(message))) {
    if (!languages.includes('hinglish')) {
      languages.push('hinglish');
    }
  }
  
  return languages.length > 0 ? languages : ['en']; // Default to English
}

/**
 * Analyze message using language-specific patterns
 */
export function analyzeMultilingualPatterns(message: string): {
  score: number;
  matchedPatterns: Array<{language: string, category: string, pattern: string}>;
} {
  const detectedLanguages = detectLanguage(message);
  let totalScore = 0;
  const matchedPatterns: Array<{language: string, category: string, pattern: string}> = [];
  
  // Check patterns for each detected language
  for (const lang of detectedLanguages) {
    const patterns = MULTILINGUAL_FRAUD_PATTERNS[lang as keyof typeof MULTILINGUAL_FRAUD_PATTERNS];
    if (!patterns) continue;
    
    for (const [category, regexList] of Object.entries(patterns)) {
      for (const regex of regexList) {
        if (regex.test(message)) {
          let score = 0;
          
          // Assign scores based on category severity
          switch (category) {
            case 'URGENT_ACTION':
              score = 35;
              break;
            case 'FINANCIAL_SCAMS':
              score = 40;
              break;
            case 'PRIZE_LOTTERY':
              score = 45;
              break;
            case 'PERSONAL_INFO':
              score = 30;
              break;
            default:
              score = 25;
          }
          
          totalScore += score;
          matchedPatterns.push({
            language: lang,
            category,
            pattern: regex.source
          });
        }
      }
    }
  }
  
  // Check universal indicators
  for (const [category, regexList] of Object.entries(UNIVERSAL_FRAUD_INDICATORS)) {
    for (const regex of regexList) {
      if (regex.test(message)) {
        totalScore += 15;
        matchedPatterns.push({
          language: 'universal',
          category,
          pattern: regex.source
        });
      }
    }
  }
  
  return {
    score: Math.min(100, totalScore),
    matchedPatterns
  };
}

/**
 * Generate localized explanation based on detected language
 */
export function generateLocalizedExplanation(
  result: MultilingualAnalysisResult
): string {
  const primaryLang = result.language_detected.split(',')[0] || 'en';
  
  const explanations = {
    en: {
      fraud: "⚠️ **FRAUD DETECTED**: This message contains suspicious patterns commonly used in scams.",
      legitimate: "✅ **APPEARS SAFE**: This message seems to be from a legitimate source.",
      normal: "ℹ️ **NORMAL MESSAGE**: This appears to be a regular personal or service message."
    },
    hi: {
      fraud: "⚠️ **धोखाधड़ी की पहचान**: इस संदेश में घोटाले के सामान्य पैटर्न हैं।",
      legitimate: "✅ **सुरक्षित लगता है**: यह संदेश वैध स्रोत से आया लगता है।",
      normal: "ℹ️ **सामान्य संदेश**: यह एक नियमित व्यक्तिगत या सेवा संदेश लगता है।"
    },
    hinglish: {
      fraud: "⚠️ **FRAUD HAI**: Ye message mein scam ke patterns hain.",
      legitimate: "✅ **SAFE LAGTA HAI**: Ye message legitimate source se aaya hai.",
      normal: "ℹ️ **NORMAL MESSAGE HAI**: Ye regular personal ya service message hai."
    }
  };
  
  const langExplanations = explanations[primaryLang as keyof typeof explanations] || explanations.en;
  
  let explanation = "";
  
  switch (result.classification) {
    case 'FRAUD':
      explanation = langExplanations.fraud;
      break;
    case 'LEGITIMATE':
      explanation = langExplanations.legitimate;
      break;
    case 'NORMAL_SMS':
      explanation = langExplanations.normal;
      break;
  }
  
  // Add confidence and reason
  if (primaryLang === 'hi') {
    explanation += `\n\n**विश्वसनीयता**: ${Math.round(result.confidence_score * 100)}%`;
    explanation += `\n**कारण**: ${result.reason}`;
  } else if (primaryLang === 'hinglish') {
    explanation += `\n\n**Confidence**: ${Math.round(result.confidence_score * 100)}%`;
    explanation += `\n**Reason**: ${result.reason}`;
  } else {
    explanation += `\n\n**Confidence**: ${Math.round(result.confidence_score * 100)}%`;
    explanation += `\n**Reason**: ${result.reason}`;
  }
  
  return explanation;
}

/**
 * Main multilingual fraud detection function
 */
export async function analyzeMessageMultilingual(
  message: string,
  preferredLanguage: string = 'auto'
): Promise<MultilingualAnalysisResult> {
  
  // Detect languages in the message
  const detectedLanguages = detectLanguage(message);
  
  // Analyze using pattern matching
  const patternAnalysis = analyzeMultilingualPatterns(message);
  
  // Determine if AI analysis is needed
  const needsAIAnalysis = patternAnalysis.score < 60 || detectedLanguages.includes('mixed');
  
  let result: MultilingualAnalysisResult = {
    classification: patternAnalysis.score >= 60 ? 'FRAUD' : 'NORMAL_SMS',
    confidence_score: patternAnalysis.score / 100,
    reason: `Pattern-based analysis in ${detectedLanguages.join(', ')}`,
    language_detected: detectedLanguages.join(', '),
    pattern_matches: patternAnalysis.matchedPatterns.map(p => ({
      language: p.language,
      category: p.category,
      patterns: [p.pattern]
    })),
    translation_needed: !detectedLanguages.includes('en'),
    localized_explanation: ""
  };
  
  // Use appropriate AI prompt based on detected language
  if (needsAIAnalysis) {
    try {
      // Here you would integrate with OpenAI using the appropriate multilingual prompt
      // For now, we'll enhance the pattern-based result
      
      if (patternAnalysis.score >= 40) {
        result.classification = 'FRAUD';
        result.confidence_score = Math.min(0.95, patternAnalysis.score / 100 + 0.2);
      } else if (patternAnalysis.score >= 20) {
        result.classification = 'LEGITIMATE';
        result.confidence_score = 0.7;
      }
      
      result.reason = `Multilingual analysis detected ${patternAnalysis.matchedPatterns.length} suspicious patterns`;
    } catch (error) {
      console.log('AI analysis failed, using pattern-based result');
    }
  }
  
  // Generate localized explanation
  result.localized_explanation = generateLocalizedExplanation(result);
  
  return result;
}

/**
 * Get user-friendly language name
 */
export function getLanguageName(code: string): string {
  const languageNames: Record<string, string> = {
    'en': 'English',
    'hi': 'हिंदी (Hindi)',
    'hinglish': 'Hinglish',
    'mr': 'मराठी (Marathi)',
    'gu': 'ગુજરાતી (Gujarati)',
    'ta': 'தமிழ் (Tamil)',
    'mixed': 'Mixed Languages',
    'universal': 'Universal Patterns'
  };
  
  return languageNames[code] || code;
}

/**
 * Get fraud prevention tips in user's language
 */
export function getLocalizedTips(language: string): string[] {
  const tips = {
    en: [
      "🔐 Never share OTP, PIN, or passwords via SMS",
      "🏦 Banks never ask for confidential info through SMS",
      "🔗 Don't click suspicious links in messages",
      "📞 Verify by calling official customer care",
      "⏰ Don't rush - scammers create false urgency"
    ],
    hi: [
      "🔐 OTP, PIN या पासवर्ड SMS से कभी शेयर न करें",
      "🏦 बैंक कभी भी SMS से गुप्त जानकारी नहीं मांगते",
      "🔗 संदिग्ध लिंक पर क्लिक न करें",
      "📞 आधिकारिक कस्टमर केयर से सत्यापित करें",
      "⏰ जल्दबाजी न करें - ठग झूठी अर्जेंसी बनाते हैं"
    ],
    hinglish: [
      "🔐 OTP, PIN ya password SMS se kabhi share mat karo",
      "🏦 Bank kabhi SMS se confidential info nahi mangta",
      "🔗 Suspicious links pe click mat karo",
      "📞 Official customer care se verify karo",
      "⏰ Jaldi mat karo - scammers false urgency create karte hain"
    ]
  };
  
  return tips[language as keyof typeof tips] || tips.en;
}