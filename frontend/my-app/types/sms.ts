/**
 * Types for SMS monitoring functionality
 */

/**
 * SMS Message with fraud detection details
 */
export interface SMSMessage {
  id: string;
  sender: string;
  body: string;
  timestamp: string;
  isFraud: boolean;
  fraudReason?: string;
  fraudConfidence?: "Low" | "Medium" | "High";
  fraudScore?: number;
}

/**
 * State of the SMS monitor
 */
export interface SMSMonitorState {
  isMonitoring: boolean;
  permissionsGranted: boolean;
  processedCount: number;
  fraudCount: number;
}

/**
 * Result of attempting to start monitoring
 */
export interface MonitoringResult {
  success: boolean;
  error?: string;
}

/**
 * SMS Monitor listener function type
 */
export type SMSMonitorListener = (state: SMSMonitorState, message?: SMSMessage) => void;
