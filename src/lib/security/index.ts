/**
 * Security module barrel exports
 * Provides centralized access to security utilities
 */

export { getPromptScanner } from './prompt-scanner';
export type {
  ThreatMatch,
  ScanResult,
  ScanOptions,
} from './prompt-scanner';
