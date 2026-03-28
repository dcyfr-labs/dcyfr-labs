/**
 * Prompt security scan types for UI consumption.
 * Mirrors the dcyfr-ai-api response schema.
 */

export type ScanState = 'queued' | 'running' | 'complete' | 'failed';
export type ScanSeverity = 'critical' | 'high' | 'medium' | 'low' | 'safe';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';
export type FindingSource = 'iopc' | 'taxonomy' | 'pattern';

export interface ScanFinding {
  id: string;
  pattern: string;
  category: string;
  severity: FindingSeverity;
  confidence: number;
  source: FindingSource;
  details?: string | null;
}

export interface ScanResult {
  id: string;
  state: ScanState;
  queuedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  attempts: number;
  // Present when state === 'complete'
  safe?: boolean;
  riskScore?: number;
  severity?: ScanSeverity;
  remediationSummary?: string;
  findings?: ScanFinding[];
  // Present when state === 'failed'
  error?: string;
}

export type FindingSeverityFilter = FindingSeverity | 'all';
export type FindingSortKey = 'severity' | 'confidence' | 'category';
export type SortDirection = 'asc' | 'desc';
