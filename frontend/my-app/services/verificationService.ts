// services/verificationService.ts
// Define data directly in the service to avoid import issues with Metro bundler

// Registered intermediaries data
const registeredIntermediaries = [
  {
    "name": "ABC Securities Pvt Ltd",
    "registration_number": "INZ000123456",
    "category": "Stock Broker",
    "status": "Active",
    "valid_till": "2027-12-31",
    "contact": "022-12345678",
    "address": "Mumbai, Maharashtra"
  },
  {
    "name": "XYZ Investment Advisors",
    "registration_number": "INA000987654",
    "category": "Investment Advisor",
    "status": "Active",
    "valid_till": "2026-09-30",
    "contact": "080-98765432",
    "address": "Bangalore, Karnataka"
  },
  {
    "name": "PQR Mutual Fund",
    "registration_number": "INM000654321",
    "category": "Mutual Fund",
    "status": "Active",
    "valid_till": "2026-03-31",
    "contact": "011-45678901",
    "address": "New Delhi, Delhi"
  },
  {
    "name": "MNO Portfolio Managers",
    "registration_number": "INP000789012",
    "category": "Portfolio Manager",
    "status": "Inactive",
    "valid_till": "2023-12-31",
    "contact": "033-56789012",
    "address": "Kolkata, West Bengal"
  },
  {
    "name": "RST Capital Markets",
    "registration_number": "INB000345678",
    "category": "Investment Banker",
    "status": "Active",
    "valid_till": "2027-06-30",
    "contact": "044-34567890",
    "address": "Chennai, Tamil Nadu"
  }
];

// Debarred entities data
const debarredEntities = [
  {
    "name": "Fake Investments Pvt Ltd",
    "entity_type": "Company",
    "date_of_debarment": "2023-06-20",
    "duration": "Permanent",
    "reason": "Collecting funds without SEBI approval",
    "status": "Debarred"
  },
  {
    "name": "John Smith",
    "entity_type": "Individual",
    "date_of_debarment": "2024-03-15",
    "duration": "5 Years",
    "reason": "Market manipulation",
    "status": "Debarred"
  },
  {
    "name": "QuickRich Securities",
    "entity_type": "Company",
    "date_of_debarment": "2025-01-10",
    "duration": "3 Years",
    "reason": "Misleading investors with false information",
    "status": "Debarred"
  },
  {
    "name": "Jane Doe",
    "entity_type": "Individual",
    "date_of_debarment": "2022-09-05",
    "duration": "2 Years",
    "reason": "Insider trading",
    "status": "Debarred"
  },
  {
    "name": "GoldMine Investments Ltd",
    "entity_type": "Company",
    "date_of_debarment": "2024-11-30",
    "duration": "Permanent",
    "reason": "Ponzi scheme operation",
    "status": "Debarred"
  }
];

// Circulars data
const circulars = [
  {
    "title": "Guidelines on Stock Broker Cyber Security Framework",
    "date": "2025-07-01",
    "category": "Stock Broker",
    "description": "SEBI issues revised cyber security and resilience framework for stock brokers and depository participants.",
    "link": "https://www.sebi.gov.in/circulars/2025/cyber-security-framework.html"
  },
  {
    "title": "Mutual Fund Risk-o-meter Guidelines",
    "date": "2025-06-15",
    "category": "Mutual Funds",
    "description": "Updated guidelines for risk evaluation and disclosure in mutual fund schemes with new risk-o-meter parameters.",
    "link": "https://www.sebi.gov.in/circulars/2025/risk-o-meter-guidelines.html"
  },
  {
    "title": "Advisory on Prevention of Unauthorized Trading",
    "date": "2025-05-22",
    "category": "Trading",
    "description": "Measures to prevent unauthorized transactions and strengthen two-factor authentication for trading platforms.",
    "link": "https://www.sebi.gov.in/circulars/2025/unauthorized-trading-prevention.html"
  },
  {
    "title": "Framework for Regulatory Sandbox",
    "date": "2025-04-10",
    "category": "FinTech",
    "description": "Updated framework for regulatory sandbox allowing testing of new fintech solutions in a controlled environment.",
    "link": "https://www.sebi.gov.in/circulars/2025/regulatory-sandbox-framework.html"
  },
  {
    "title": "Standardization of Ratings for ESG-Focused Mutual Fund Schemes",
    "date": "2025-03-05",
    "category": "Mutual Funds",
    "description": "Guidelines for standardized rating methodology for Environmental, Social, and Governance (ESG) focused mutual fund schemes.",
    "link": "https://www.sebi.gov.in/circulars/2025/esg-ratings-standardization.html"
  }
];

// Fraud numbers data
const fraudNumbers = [
  {
    "number": "+919876543210",
    "status": "Fraud",
    "reported_by": 25,
    "last_reported": "2025-08-20"
  },
  {
    "number": "+911234567890",
    "status": "Safe",
    "reported_by": 0,
    "last_reported": null
  },
  {
    "number": "+917777788888",
    "status": "Fraud",
    "reported_by": 12,
    "last_reported": "2025-07-15"
  },
  {
    "number": "+918888877777",
    "status": "Safe",
    "reported_by": 0,
    "last_reported": null
  },
  {
    "number": "+919999900000",
    "status": "Unknown",
    "reported_by": 2,
    "last_reported": "2025-08-01"
  }
];

// Types
export interface RegisteredIntermediary {
  name: string;
  registration_number: string;
  category: string;
  status: string; // Actually "Active" or "Inactive" but using string for type compatibility
  valid_till: string;
  contact: string;
  address: string;
}

export interface DebarredEntity {
  name: string;
  entity_type: string;
  date_of_debarment: string;
  duration: string;
  reason: string;
  status: string;
}

export interface Circular {
  title: string;
  date: string;
  category: string;
  description: string;
  link: string;
}

export interface FraudNumber {
  number: string;
  status: string; // Actually "Fraud", "Safe", or "Unknown" but using string for type compatibility
  reported_by: number;
  last_reported: string | null;
}

// Search functions

/**
 * Search for a registered intermediary by name or registration number
 */
export function searchRegisteredIntermediary(searchTerm: string): RegisteredIntermediary | null {
  if (!searchTerm.trim()) return null;
  
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  
  const result = registeredIntermediaries.find(
    (item: RegisteredIntermediary) => 
      item.name.toLowerCase().includes(normalizedSearchTerm) ||
      item.registration_number.toLowerCase().includes(normalizedSearchTerm)
  ) || null;
  
  console.log(`Searched for intermediary with term "${searchTerm}", found:`, result);
  return result;
}

/**
 * Search for a debarred entity by name
 */
export function searchDebarredEntity(searchTerm: string): DebarredEntity | null {
  if (!searchTerm.trim()) return null;
  
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  
  const result = debarredEntities.find(
    (item: DebarredEntity) => item.name.toLowerCase().includes(normalizedSearchTerm)
  ) || null;
  
  console.log(`Searched for debarred entity with term "${searchTerm}", found:`, result);
  return result;
}

/**
 * Get circulars with optional filtering
 */
export function getCirculars(category?: string, year?: number): Circular[] {
  let filteredCirculars = [...circulars] as Circular[];
  
  if (category) {
    filteredCirculars = filteredCirculars.filter(
      (item: Circular) => item.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  if (year) {
    filteredCirculars = filteredCirculars.filter(
      (item: Circular) => new Date(item.date).getFullYear() === year
    );
  }
  
  // Sort by date (newest first)
  return filteredCirculars.sort(
    (a: Circular, b: Circular) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get unique circular categories
 */
export function getCircularCategories(): string[] {
  const categories = new Set<string>();
  circulars.forEach((item: Circular) => categories.add(item.category));
  return Array.from(categories);
}

/**
 * Get unique circular years
 */
export function getCircularYears(): number[] {
  const years = new Set<number>();
  circulars.forEach((item: Circular) => years.add(new Date(item.date).getFullYear()));
  return Array.from(years).sort((a, b) => b - a); // Sort descending
}

/**
 * Search for a phone number in fraud database
 */
export function searchPhoneNumber(phoneNumber: string): FraudNumber | null {
  if (!phoneNumber.trim()) return null;
  
  // Normalize the phone number (remove non-digit characters except +)
  const normalizedNumber = phoneNumber.replace(/[^\d+]/g, "");
  
  const result = fraudNumbers.find(
    (item: FraudNumber) => item.number === normalizedNumber
  ) || null;
  
  console.log(`Searched for phone number "${phoneNumber}" (normalized: "${normalizedNumber}"), found:`, result);
  return result;
}
