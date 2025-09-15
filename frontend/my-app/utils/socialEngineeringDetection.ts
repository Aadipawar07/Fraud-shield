/**
 * Advanced Social Engineering Detection System
 * Specifically designed to detect sophisticated manipulation tactics
 */

export interface SocialEngineeringTactic {
  name: string;
  description: string;
  indicators: RegExp[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  weight: number;
  examples: string[];
}

export interface SocialEngineeringAnalysis {
  isManipulative: boolean;
  detectedTactics: SocialEngineeringTactic[];
  manipulationScore: number;
  psychologicalProfile: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
  countermeasures: string[];
}

/**
 * Comprehensive social engineering tactics database
 */
export const SOCIAL_ENGINEERING_TACTICS: Record<string, SocialEngineeringTactic> = {
  
  AUTHORITY_EXPLOITATION: {
    name: "Authority Exploitation",
    description: "Impersonates authority figures to command compliance",
    severity: "HIGH",
    weight: 45,
    indicators: [
      /bank.*manager.*speaking/i,
      /government.*official/i,
      /police.*department/i,
      /income.*tax.*officer/i,
      /rbi.*representative/i,
      /authorized.*by.*(bank|government|rbi)/i,
      /official.*notice.*from/i,
      /legal.*action.*will.*be.*taken/i,
      /court.*case.*will.*be.*filed/i,
      /warrant.*issued.*against/i,
      /you.*are.*under.*investigation/i,
      /central.*bureau.*investigation/i,
      /enforcement.*directorate/i
    ],
    examples: [
      "This is Officer Kumar from Income Tax Department. Your account will be frozen.",
      "RBI authorized representative calling about your account verification."
    ]
  },

  URGENCY_MANIPULATION: {
    name: "Urgency Manipulation",
    description: "Creates artificial time pressure to prevent rational thinking",
    severity: "HIGH",
    weight: 40,
    indicators: [
      /urgent.*action.*required.*within.*\d+.*(hour|minute|day)/i,
      /expires.*in.*\d+.*(hour|minute|day)/i,
      /last.*\d+.*(hour|minute|day)/i,
      /act.*now.*or.*lose/i,
      /deadline.*today/i,
      /immediate.*response.*required/i,
      /will.*expire.*midnight/i,
      /only.*\d+.*hours.*left/i,
      /time.*running.*out/i,
      /before.*it's.*too.*late/i,
      /final.*warning/i,
      /last.*chance/i
    ],
    examples: [
      "URGENT: Your account will be closed in 2 hours if not verified immediately.",
      "Final notice: Respond within 30 minutes or face legal action."
    ]
  },

  TRUST_BUILDING: {
    name: "Trust Building",
    description: "Establishes false rapport and credibility",
    severity: "MEDIUM",
    weight: 30,
    indicators: [
      /we.*understand.*your.*concern/i,
      /for.*your.*safety.*and.*security/i,
      /we.*are.*here.*to.*help/i,
      /trusted.*by.*millions/i,
      /award.*winning.*service/i,
      /your.*satisfaction.*is.*our.*priority/i,
      /we.*value.*your.*business/i,
      /as.*a.*valued.*customer/i,
      /our.*commitment.*to.*you/i,
      /secure.*and.*confidential/i,
      /iso.*certified/i,
      /verified.*by.*(rbi|sebi|government)/i
    ],
    examples: [
      "As a valued HDFC customer, we want to ensure your account security.",
      "Our RBI-verified team is here to help protect your savings."
    ]
  },

  FEAR_INTIMIDATION: {
    name: "Fear & Intimidation",
    description: "Uses threats and fear to coerce compliance",
    severity: "CRITICAL",
    weight: 50,
    indicators: [
      /legal.*action.*will.*be.*taken/i,
      /arrest.*warrant.*issued/i,
      /police.*will.*come.*to.*your.*address/i,
      /criminal.*case.*filed/i,
      /jail.*term/i,
      /heavy.*penalty/i,
      /court.*summons/i,
      /your.*assets.*will.*be.*seized/i,
      /account.*will.*be.*frozen/i,
      /credit.*score.*will.*be.*affected/i,
      /black.*listed/i,
      /consequences.*will.*be.*severe/i,
      /face.*imprisonment/i
    ],
    examples: [
      "Police will arrest you in 24 hours if tax not paid immediately.",
      "Your property will be seized if you don't respond to this notice."
    ]
  },

  RECIPROCITY_EXPLOITATION: {
    name: "Reciprocity Exploitation",
    description: "Creates sense of obligation through fake favors",
    severity: "MEDIUM",
    weight: 25,
    indicators: [
      /congratulations.*you.*have.*been.*selected/i,
      /you.*have.*won/i,
      /exclusive.*offer.*just.*for.*you/i,
      /special.*privilege/i,
      /chosen.*from.*thousands/i,
      /lucky.*winner/i,
      /pre.*approved.*loan/i,
      /instant.*approval/i,
      /no.*documents.*required/i,
      /guaranteed.*approval/i,
      /limited.*seats.*available/i,
      /invitation.*only/i
    ],
    examples: [
      "Congratulations! You've been pre-selected for instant loan approval.",
      "Exclusive investment opportunity - limited to 50 people only."
    ]
  },

  SOCIAL_PROOF_MANIPULATION: {
    name: "Social Proof Manipulation",
    description: "Uses fake testimonials and success stories",
    severity: "MEDIUM",
    weight: 35,
    indicators: [
      /thousands.*of.*satisfied.*customers/i,
      /join.*\d+.*successful.*investors/i,
      /\d+.*people.*have.*already.*benefited/i,
      /success.*stories.*from.*people.*like.*you/i,
      /see.*what.*others.*are.*saying/i,
      /testimonials.*from.*real.*customers/i,
      /highly.*rated.*by.*users/i,
      /\d+.*star.*rating/i,
      /recommended.*by.*experts/i,
      /featured.*in.*(news|media)/i,
      /celebrities.*endorse/i,
      /popular.*choice/i
    ],
    examples: [
      "Join 50,000+ investors who earned ₹10 lakhs in 30 days.",
      "See how Ramesh from Mumbai made ₹5 lakhs using our system."
    ]
  },

  SCARCITY_TACTICS: {
    name: "Scarcity Tactics",
    description: "Creates false sense of limited availability",
    severity: "MEDIUM",
    weight: 30,
    indicators: [
      /limited.*time.*offer/i,
      /only.*\d+.*spots.*left/i,
      /first.*\d+.*customers.*only/i,
      /while.*stocks.*last/i,
      /limited.*quantity/i,
      /exclusive.*membership/i,
      /invitation.*expires.*soon/i,
      /last.*few.*remaining/i,
      /almost.*sold.*out/i,
      /final.*stock/i,
      /don't.*miss.*out/i,
      /once.*in.*a.*lifetime/i
    ],
    examples: [
      "Only 5 investment slots remaining - register now!",
      "Limited time: First 100 customers get guaranteed returns."
    ]
  },

  INFORMATION_HARVESTING: {
    name: "Information Harvesting",
    description: "Tricks users into revealing personal information",
    severity: "HIGH",
    weight: 45,
    indicators: [
      /verify.*your.*identity/i,
      /confirm.*your.*details/i,
      /update.*your.*information/i,
      /kyc.*verification.*required/i,
      /share.*your.*otp/i,
      /provide.*your.*pin/i,
      /send.*copy.*of.*aadhar/i,
      /upload.*documents/i,
      /complete.*verification.*process/i,
      /secure.*your.*account.*by.*sharing/i,
      /for.*security.*purposes.*provide/i,
      /re.*confirm.*your.*password/i
    ],
    examples: [
      "For KYC verification, please share your Aadhar and bank details.",
      "Confirm your identity by sharing OTP and PIN for security."
    ]
  },

  EMOTIONAL_MANIPULATION: {
    name: "Emotional Manipulation",
    description: "Exploits emotions like greed, fear, or sympathy",
    severity: "HIGH",
    weight: 40,
    indicators: [
      /change.*your.*life.*forever/i,
      /financial.*freedom/i,
      /become.*rich.*overnight/i,
      /escape.*poverty/i,
      /secure.*your.*family's.*future/i,
      /don't.*let.*this.*opportunity.*slip/i,
      /imagine.*earning.*\d+.*lakhs/i,
      /retire.*early/i,
      /no.*more.*money.*worries/i,
      /life.*changing.*opportunity/i,
      /desperate.*for.*help/i,
      /medical.*emergency/i
    ],
    examples: [
      "Change your life forever - earn ₹10 lakhs monthly from home!",
      "Secure your family's future with this guaranteed investment."
    ]
  },

  COMPLIANCE_TECHNIQUES: {
    name: "Compliance Techniques",
    description: "Uses psychological principles to ensure compliance",
    severity: "MEDIUM",
    weight: 25,
    indicators: [
      /simply.*follow.*these.*steps/i,
      /easy.*3.*step.*process/i,
      /just.*click.*and.*confirm/i,
      /no.*questions.*asked/i,
      /automatic.*approval/i,
      /hassle.*free/i,
      /instant.*process/i,
      /no.*paperwork/i,
      /one.*click.*solution/i,
      /effortless/i,
      /seamless.*experience/i,
      /user.*friendly/i
    ],
    examples: [
      "Just follow these 3 simple steps to claim your prize.",
      "One-click solution for instant loan approval - no documents needed."
    ]
  }
};

/**
 * Analyze message for social engineering tactics
 */
export function analyzeSocialEngineering(message: string): SocialEngineeringAnalysis {
  const detectedTactics: SocialEngineeringTactic[] = [];
  let totalScore = 0;
  
  // Check each tactic
  for (const tactic of Object.values(SOCIAL_ENGINEERING_TACTICS)) {
    let tacticMatched = false;
    
    for (const indicator of tactic.indicators) {
      if (indicator.test(message)) {
        tacticMatched = true;
        break;
      }
    }
    
    if (tacticMatched) {
      detectedTactics.push(tactic);
      totalScore += tactic.weight;
    }
  }
  
  // Calculate manipulation score (0-100)
  const manipulationScore = Math.min(100, totalScore);
  
  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (manipulationScore >= 80) {
    riskLevel = 'CRITICAL';
  } else if (manipulationScore >= 60) {
    riskLevel = 'HIGH';
  } else if (manipulationScore >= 40) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }
  
  // Generate psychological profile
  const psychologicalProfile = generatePsychologicalProfile(detectedTactics);
  
  // Generate explanation
  const explanation = generateSocialEngineeringExplanation(detectedTactics, manipulationScore);
  
  // Generate countermeasures
  const countermeasures = generateCountermeasures(detectedTactics);
  
  return {
    isManipulative: manipulationScore >= 40,
    detectedTactics,
    manipulationScore,
    psychologicalProfile,
    riskLevel,
    explanation,
    countermeasures
  };
}

/**
 * Generate psychological profile of the attack
 */
function generatePsychologicalProfile(tactics: SocialEngineeringTactic[]): string {
  if (tactics.length === 0) {
    return "No manipulative tactics detected.";
  }
  
  const tacticTypes = tactics.map(t => t.name);
  
  if (tacticTypes.includes("Authority Exploitation") && tacticTypes.includes("Fear & Intimidation")) {
    return "Authoritarian Intimidation: Uses fake authority and fear to coerce immediate compliance.";
  }
  
  if (tacticTypes.includes("Urgency Manipulation") && tacticTypes.includes("Scarcity Tactics")) {
    return "Pressure Campaign: Creates artificial time pressure and scarcity to prevent rational thinking.";
  }
  
  if (tacticTypes.includes("Trust Building") && tacticTypes.includes("Social Proof Manipulation")) {
    return "Confidence Building: Establishes false credibility through fake testimonials and trust signals.";
  }
  
  if (tacticTypes.includes("Emotional Manipulation") && tacticTypes.includes("Reciprocity Exploitation")) {
    return "Emotional Exploitation: Manipulates emotions and creates false sense of obligation.";
  }
  
  if (tacticTypes.includes("Information Harvesting")) {
    return "Data Theft Operation: Designed to steal personal and financial information.";
  }
  
  return `Multi-vector Attack: Uses ${tactics.length} different manipulation techniques for maximum effectiveness.`;
}

/**
 * Generate detailed explanation of social engineering attempt
 */
function generateSocialEngineeringExplanation(tactics: SocialEngineeringTactic[], score: number): string {
  if (tactics.length === 0) {
    return "✅ No social engineering tactics detected in this message.";
  }
  
  let explanation = `🎭 **SOCIAL ENGINEERING ATTACK DETECTED** (Score: ${score}/100)\n\n`;
  
  explanation += `**Manipulation Tactics Used:**\n`;
  tactics.forEach(tactic => {
    explanation += `• **${tactic.name}** (${tactic.severity}): ${tactic.description}\n`;
  });
  
  explanation += `\n**How This Attack Works:**\n`;
  explanation += `This message uses ${tactics.length} psychological manipulation technique(s) to:\n`;
  explanation += `• Bypass your natural skepticism\n`;
  explanation += `• Create emotional pressure for quick action\n`;
  explanation += `• Establish false credibility and trust\n`;
  explanation += `• Prevent you from verifying information\n`;
  
  explanation += `\n**Why It's Dangerous:**\n`;
  explanation += `• Sophisticated attackers study human psychology\n`;
  explanation += `• Multiple tactics increase success rate\n`;
  explanation += `• Designed to exploit natural human tendencies\n`;
  explanation += `• Can fool even cautious individuals\n`;
  
  return explanation;
}

/**
 * Generate specific countermeasures for detected tactics
 */
function generateCountermeasures(tactics: SocialEngineeringTactic[]): string[] {
  const countermeasures: string[] = [];
  const tacticNames = tactics.map(t => t.name);
  
  // Universal countermeasures
  countermeasures.push("🔍 Verify through independent official channels");
  countermeasures.push("⏰ Take time to think - don't rush into decisions");
  countermeasures.push("👥 Consult with trusted friends or family");
  
  // Specific countermeasures based on detected tactics
  if (tacticNames.includes("Authority Exploitation")) {
    countermeasures.push("📞 Call official customer service to verify claims");
    countermeasures.push("🆔 Ask for official ID and verify credentials");
  }
  
  if (tacticNames.includes("Urgency Manipulation")) {
    countermeasures.push("🛑 Legitimate organizations don't create artificial urgency");
    countermeasures.push("📅 Real deadlines are communicated through official channels");
  }
  
  if (tacticNames.includes("Fear & Intimidation")) {
    countermeasures.push("⚖️ Legal notices come through official postal mail");
    countermeasures.push("🚔 Police don't threaten arrests via SMS");
  }
  
  if (tacticNames.includes("Information Harvesting")) {
    countermeasures.push("🔐 Never share OTP, PIN, or passwords");
    countermeasures.push("📋 Banks don't ask for complete details via SMS");
  }
  
  if (tacticNames.includes("Emotional Manipulation")) {
    countermeasures.push("💭 Question emotional appeals and 'too good to be true' offers");
    countermeasures.push("💰 Legitimate investments always involve risk disclosure");
  }
  
  if (tacticNames.includes("Social Proof Manipulation")) {
    countermeasures.push("🔎 Verify testimonials and success stories independently");
    countermeasures.push("⭐ Check reviews on multiple independent platforms");
  }
  
  return [...new Set(countermeasures)]; // Remove duplicates
}

/**
 * Enhanced fraud detection prompt with social engineering awareness
 */
export const SOCIAL_ENGINEERING_AWARE_PROMPT = `
You are an advanced fraud detection AI with specialized training in social engineering tactics. Analyze the given message for:

1. Traditional fraud indicators (financial scams, phishing, etc.)
2. Social engineering tactics (authority exploitation, urgency manipulation, fear tactics, etc.)
3. Psychological manipulation techniques
4. Information harvesting attempts

Consider these sophisticated social engineering methods:
- Authority Exploitation: Impersonating officials, banks, government
- Urgency Manipulation: Creating artificial time pressure
- Fear & Intimidation: Using threats and consequences
- Trust Building: Establishing false credibility
- Emotional Manipulation: Exploiting greed, fear, sympathy
- Social Proof: Fake testimonials and success stories
- Information Harvesting: Tricking users into sharing data
- Compliance Techniques: Making actions seem simple and automatic

Classify the message as:
1. FRAUD - Contains fraud indicators or social engineering tactics
2. LEGITIMATE - Genuine communication from verified source
3. NORMAL_SMS - Regular personal/service message

Output in JSON format:
{
  "classification": "FRAUD/LEGITIMATE/NORMAL_SMS",
  "confidence_score": 0-1,
  "reason": "Brief explanation",
  "social_engineering_detected": boolean,
  "manipulation_tactics": ["list of detected tactics"],
  "psychological_profile": "Brief description of attack strategy",
  "severity": "LOW/MEDIUM/HIGH/CRITICAL"
}
`;

/**
 * Advanced analysis combining traditional fraud detection with social engineering detection
 */
export async function comprehensiveSecurityAnalysis(
  message: string,
  sender?: string
): Promise<{
  traditionalFraud: any;
  socialEngineering: SocialEngineeringAnalysis;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  combinedScore: number;
  recommendation: string;
}> {
  
  // Analyze social engineering tactics
  const socialEngineering = analyzeSocialEngineering(message);
  
  // Simulate traditional fraud analysis (you'd integrate with your existing system)
  const traditionalFraud = {
    isFraud: false,
    score: 30,
    confidence: 'Medium',
    reasons: ['Pattern matching analysis']
  };
  
  // Combine scores
  const combinedScore = Math.max(
    traditionalFraud.score,
    socialEngineering.manipulationScore
  );
  
  // Determine overall risk
  let overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (combinedScore >= 70 || socialEngineering.riskLevel === 'CRITICAL') {
    overallRisk = 'CRITICAL';
  } else if (combinedScore >= 50 || socialEngineering.riskLevel === 'HIGH') {
    overallRisk = 'HIGH';
  } else if (combinedScore >= 30 || socialEngineering.riskLevel === 'MEDIUM') {
    overallRisk = 'MEDIUM';
  } else {
    overallRisk = 'LOW';
  }
  
  // Generate recommendation
  let recommendation = "";
  if (overallRisk === 'CRITICAL') {
    recommendation = "🚨 IMMEDIATE THREAT: This message shows advanced social engineering tactics. Do not respond or click any links. Block the sender and report to authorities.";
  } else if (overallRisk === 'HIGH') {
    recommendation = "⚠️ HIGH RISK: Multiple manipulation tactics detected. Verify through official channels before taking any action.";
  } else if (overallRisk === 'MEDIUM') {
    recommendation = "⚡ CAUTION: Some suspicious elements detected. Double-check before proceeding.";
  } else {
    recommendation = "✅ APPEARS SAFE: No significant threats detected, but always remain vigilant.";
  }
  
  return {
    traditionalFraud,
    socialEngineering,
    overallRisk,
    combinedScore,
    recommendation
  };
}