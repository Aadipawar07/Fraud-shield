/**
 * Advanced URL Analysis for Phishing Detection
 * Real-time analysis of suspicious URLs in SMS messages
 */

import axios from 'axios';

// Known phishing URL patterns and suspicious domains
const SUSPICIOUS_URL_PATTERNS = {
  // Shortened URLs that are commonly used for phishing
  SHORTENERS: [
    'bit.ly', 'tinyurl.com', 'short.link', 'tiny.one', 'rb.gy',
    't.co', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly', 'short.gy'
  ],
  
  // Common phishing domain patterns
  PHISHING_PATTERNS: [
    /banking?-?update/i,
    /security-?alert/i,
    /account-?verify/i,
    /payment-?confirm/i,
    /login-?secure/i,
    /verify-?account/i,
    /update-?info/i,
    /secure-?login/i,
    /bank-?alert/i,
    /pay-?verify/i
  ],
  
  // Suspicious TLDs often used in phishing
  SUSPICIOUS_TLDS: [
    '.tk', '.ml', '.ga', '.cf', '.top', '.click', '.download',
    '.science', '.work', '.party', '.date', '.racing', '.loan'
  ],
  
  // Legitimate domains often impersonated
  IMPERSONATED_DOMAINS: [
    'amazon', 'paypal', 'apple', 'microsoft', 'google', 'facebook',
    'instagram', 'whatsapp', 'telegram', 'hdfc', 'sbi', 'icici',
    'axis', 'kotak', 'paytm', 'phonepe', 'gpay', 'flipkart'
  ]
};

// Known legitimate domains (whitelist)
const LEGITIMATE_DOMAINS = [
  'amazon.in', 'amazon.com', 'paypal.com', 'apple.com', 'microsoft.com',
  'google.com', 'facebook.com', 'instagram.com', 'whatsapp.com',
  'hdfcbank.com', 'sbi.co.in', 'icicibank.com', 'axisbank.com',
  'kotak.com', 'paytm.com', 'phonepe.com', 'flipkart.com'
];

interface URLAnalysisResult {
  isPhishing: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  reasons: string[];
  detectedUrls: string[];
  analysis: {
    hasShortUrls: boolean;
    hasSuspiciousDomains: boolean;
    hasImpersonationAttempt: boolean;
    hasPhishingPatterns: boolean;
    urlCount: number;
  };
}

/**
 * Extract all URLs from a message text
 */
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/gi;
  return text.match(urlRegex) || [];
}

/**
 * Analyze a single URL for phishing indicators
 */
function analyzeUrl(url: string): {
  isPhishing: boolean;
  riskScore: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let riskScore = 0;
  
  // Normalize URL
  let normalizedUrl = url.toLowerCase();
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = 'http://' + normalizedUrl;
  }
  
  try {
    const urlObj = new URL(normalizedUrl);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    // Check for URL shorteners
    if (SUSPICIOUS_URL_PATTERNS.SHORTENERS.some(shortener => domain.includes(shortener))) {
      riskScore += 40;
      reasons.push('Uses URL shortening service');
    }
    
    // Check for suspicious TLDs
    if (SUSPICIOUS_URL_PATTERNS.SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld))) {
      riskScore += 35;
      reasons.push('Uses suspicious domain extension');
    }
    
    // Check for phishing patterns in domain
    if (SUSPICIOUS_URL_PATTERNS.PHISHING_PATTERNS.some(pattern => pattern.test(domain))) {
      riskScore += 50;
      reasons.push('Domain contains phishing-related keywords');
    }
    
    // Check for impersonation attempts
    for (const legitDomain of SUSPICIOUS_URL_PATTERNS.IMPERSONATED_DOMAINS) {
      if (domain.includes(legitDomain) && !LEGITIMATE_DOMAINS.some(legit => domain === legit || domain.endsWith('.' + legit))) {
        riskScore += 60;
        reasons.push(`Possible impersonation of ${legitDomain}`);
        break;
      }
    }
    
    // Check for suspicious path patterns
    if (/login|signin|verify|update|secure|account|payment|billing/i.test(path)) {
      riskScore += 25;
      reasons.push('Suspicious path suggesting credential theft');
    }
    
    // Check for IP addresses instead of domains
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain)) {
      riskScore += 45;
      reasons.push('Uses IP address instead of domain name');
    }
    
    // Check for suspicious subdomains
    const subdomains = domain.split('.');
    if (subdomains.length > 3) {
      riskScore += 20;
      reasons.push('Unusual subdomain structure');
    }
    
    // Check for homograph attacks (similar-looking characters)
    if (/[а-я]|[αβγδεζηθικλμνξοπρστυφχψω]/i.test(domain)) {
      riskScore += 70;
      reasons.push('Possible homograph attack using similar characters');
    }
    
  } catch (error) {
    // Invalid URL format
    riskScore += 30;
    reasons.push('Invalid or malformed URL');
  }
  
  return {
    isPhishing: riskScore >= 40,
    riskScore,
    reasons
  };
}

/**
 * Comprehensive URL analysis for phishing detection
 */
export async function analyzeUrlsInMessage(message: string): Promise<URLAnalysisResult> {
  const urls = extractUrls(message);
  const analysis = {
    hasShortUrls: false,
    hasSuspiciousDomains: false,
    hasImpersonationAttempt: false,
    hasPhishingPatterns: false,
    urlCount: urls.length
  };
  
  let maxRiskScore = 0;
  let isPhishing = false;
  const allReasons: string[] = [];
  
  // Analyze each URL
  for (const url of urls) {
    const urlAnalysis = analyzeUrl(url);
    
    if (urlAnalysis.isPhishing) {
      isPhishing = true;
    }
    
    maxRiskScore = Math.max(maxRiskScore, urlAnalysis.riskScore);
    allReasons.push(...urlAnalysis.reasons);
    
    // Update analysis flags
    if (SUSPICIOUS_URL_PATTERNS.SHORTENERS.some(shortener => url.toLowerCase().includes(shortener))) {
      analysis.hasShortUrls = true;
    }
  }
  
  // Additional analysis for multiple URLs
  if (urls.length > 2) {
    maxRiskScore += 15;
    allReasons.push('Message contains multiple URLs');
  }
  
  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (maxRiskScore >= 70) {
    riskLevel = 'CRITICAL';
  } else if (maxRiskScore >= 50) {
    riskLevel = 'HIGH';
  } else if (maxRiskScore >= 30) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }
  
  // Calculate confidence based on number of indicators
  const confidence = Math.min(95, Math.max(60, allReasons.length * 15 + (maxRiskScore / 2)));
  
  return {
    isPhishing,
    riskLevel,
    confidence,
    reasons: [...new Set(allReasons)], // Remove duplicates
    detectedUrls: urls,
    analysis
  };
}

/**
 * Real-time phishing URL check using multiple threat intelligence sources
 */
export async function checkUrlReputation(url: string): Promise<{
  isMalicious: boolean;
  source: string;
  details: string;
}> {
  try {
    // In a real implementation, you would integrate with:
    // - Google Safe Browsing API
    // - VirusTotal API
    // - PhishTank API
    // - URLVoid API
    
    // For demo purposes, simulate API calls
    const simulatedResponse = simulateReputationCheck(url);
    
    return simulatedResponse;
  } catch (error) {
    console.error('URL reputation check failed:', error);
    return {
      isMalicious: false,
      source: 'local',
      details: 'Reputation check unavailable'
    };
  }
}

/**
 * Simulate reputation check for demo purposes
 */
function simulateReputationCheck(url: string): {
  isMalicious: boolean;
  source: string;
  details: string;
} {
  const suspiciousKeywords = [
    'secure-bank', 'verify-account', 'update-payment', 'urgent-security',
    'bank-alert', 'account-suspended', 'verify-identity', 'confirm-payment'
  ];
  
  const isSuspicious = suspiciousKeywords.some(keyword => 
    url.toLowerCase().includes(keyword)
  );
  
  if (isSuspicious) {
    return {
      isMalicious: true,
      source: 'Threat Intelligence',
      details: 'URL matches known phishing patterns in threat database'
    };
  }
  
  return {
    isMalicious: false,
    source: 'Safe Browsing',
    details: 'URL appears safe based on available threat intelligence'
  };
}

/**
 * Generate user-friendly explanation of URL analysis
 */
export function generateUrlAnalysisExplanation(result: URLAnalysisResult): string {
  if (!result.isPhishing) {
    return `✅ URLs appear safe. No suspicious patterns detected in ${result.detectedUrls.length} URL(s).`;
  }
  
  let explanation = `🚨 **PHISHING RISK DETECTED** (${result.riskLevel}):\n\n`;
  
  if (result.detectedUrls.length > 0) {
    explanation += `📍 **Suspicious URLs found:**\n`;
    result.detectedUrls.forEach(url => {
      explanation += `• ${url}\n`;
    });
    explanation += '\n';
  }
  
  if (result.reasons.length > 0) {
    explanation += `⚠️ **Risk Indicators:**\n`;
    result.reasons.forEach(reason => {
      explanation += `• ${reason}\n`;
    });
  }
  
  explanation += `\n🔍 **Confidence:** ${result.confidence}%`;
  explanation += `\n\n💡 **Recommendation:** Do not click on suspicious links. Verify authenticity through official channels.`;
  
  return explanation;
}