/**
 * Security module barrel exports
 * Provides centralized access to security utilities
 */

export { getPromptScanner } from './prompt-scanner';
export type { ThreatMatch, ScanResult, ScanOptions } from './prompt-scanner';

export { timingSafeEqual } from './timing-safe';
export { maskIp, extractOriginLikeValue } from './ip-masking';
export { validateOrigin } from './origin-validation';
export type { OriginValidationResult } from './origin-validation';
export { validatePayloadSize } from './payload-validation';
export type { PayloadValidationResult } from './payload-validation';

export {
  buildSecurityAuditIssue,
  reportSecurityAuditIssue,
  shouldOpenSecurityIssue,
  SECURITY_AUDIT_LABEL,
  SECURITY_AUDIT_LABELS,
} from './dependency-audit-issue';
export type {
  VulnerabilityCounts,
  SecurityAuditContext,
  SecurityIssueClient,
  SecurityIssueAction,
  SecurityIssueResult,
} from './dependency-audit-issue';
