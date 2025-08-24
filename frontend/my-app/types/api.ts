// API Response Types
export interface ApiResponse {
  error?: string;
}

export interface FraudCheckResponse extends ApiResponse {
  safe: boolean;
  reason: string;
}

export interface VerifyAdvisorResponse extends ApiResponse {
  verified: boolean;
  reason: string;
  reportCount?: number;
}

// API Request Types
export interface FraudCheckRequest {
  message: string;
}

export interface VerifyAdvisorRequest {
  id: string;
}
