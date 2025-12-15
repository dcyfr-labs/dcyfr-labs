/**
 * TypeScript types for GreyNoise API integration
 * 
 * Based on GreyNoise API v3 documentation:
 * https://docs.greynoise.io/reference/v3ip
 */

export interface GreyNoiseIPContext {
  ip: string;
  seen: boolean;
  classification: "benign" | "malicious" | "unknown";
  first_seen?: string;
  last_seen?: string;
  actor?: string;
  tags?: string[];
  cve?: string[];
  metadata?: {
    asn?: string;
    city?: string;
    country?: string;
    country_code?: string;
    organization?: string;
    category?: string;
    tor?: boolean;
    rdns?: string;
    os?: string;
    source_country?: string;
    source_country_code?: string;
    destination_countries?: string[];
  };
  raw_data?: {
    scan?: Array<{
      port: number;
      protocol: "TCP" | "UDP";
    }>;
    web?: {
      paths?: string[];
      useragents?: string[];
    };
    ja3?: string[];
  };
  vpn?: boolean;
  vpn_service?: string;
  bot?: boolean;
}

export interface GreyNoiseQuickCheck {
  ip: string;
  noise: boolean;
  riot: boolean;
  code: string;
  code_value: string;
}

export interface GreyNoiseBulkLookup {
  [ip: string]: GreyNoiseIPContext | { error: string };
}

export interface GreyNoiseRiotData {
  ip: string;
  riot: boolean;
  category?: string;
  name?: string;
  description?: string;
  explanation?: string;
  last_updated?: string;
  reference?: string;
  logo?: string;
  trust_level?: number;
}

// Application-specific types for IP reputation management

export interface IPReputationEntry {
  ip: string;
  classification: "benign" | "malicious" | "unknown" | "suspicious";
  first_seen: string;
  last_seen: string;
  last_updated: string;
  source: "greynoise" | "manual" | "honeypot";
  greynoise_data?: GreyNoiseIPContext;
  riot_data?: GreyNoiseRiotData;
  block_reason?: string;
  confidence_score: number; // 0-100
  tags: string[];
  metadata?: {
    country?: string;
    asn?: string;
    organization?: string;
    vpn?: boolean;
    tor?: boolean;
    bot?: boolean;
  };
}

export interface IPReputationCheck {
  ip: string;
  is_malicious: boolean;
  is_suspicious: boolean;
  is_benign: boolean;
  should_block: boolean;
  should_rate_limit: boolean;
  confidence: number;
  sources: string[];
  details: IPReputationEntry | null;
  cache_hit: boolean;
  checked_at: string;
}

export interface IPReputationBulkResult {
  total_checked: number;
  malicious_count: number;
  suspicious_count: number;
  benign_count: number;
  unknown_count: number;
  results: IPReputationCheck[];
  processing_time_ms: number;
}

// Rate limiting configuration based on IP reputation
export interface ReputationBasedRateLimit {
  malicious: {
    limit: number;
    window_seconds: number;
    block_immediately: boolean;
  };
  suspicious: {
    limit: number;
    window_seconds: number;
    block_immediately: boolean;
  };
  unknown: {
    limit: number;
    window_seconds: number;
    block_immediately: boolean;
  };
  benign: {
    limit: number;
    window_seconds: number;
    block_immediately: boolean;
  };
}

// Configuration for automated IP reputation checking
export interface IPReputationConfig {
  greynoise_api_key?: string;
  check_interval_minutes: number;
  axiom_dataset: string;
  axiom_query: string;
  min_request_threshold: number; // Only check IPs with more than N requests
  cache_ttl_hours: number;
  auto_block_malicious: boolean;
  auto_rate_limit_suspicious: boolean;
  rate_limits: ReputationBasedRateLimit;
  alert_thresholds: {
    new_malicious_ips_per_hour: number;
    total_malicious_requests_per_hour: number;
  };
}

// Event types for Inngest functions
export interface IPReputationCheckTriggered {
  name: "security/ip-reputation.check-triggered";
  data: {
    trigger_source: "scheduled" | "manual" | "threshold-alert";
    ip_list?: string[];
    check_config: Partial<IPReputationConfig>;
  };
}

export interface IPReputationCheckCompleted {
  name: "security/ip-reputation.check-completed";
  data: {
    result: IPReputationBulkResult;
    blocked_ips: string[];
    rate_limited_ips: string[];
    alerts_generated: string[];
    execution_time_ms: number;
  };
}

export interface MaliciousIPDetected {
  name: "security/malicious-ip.detected";
  data: {
    ip: string;
    reputation: IPReputationEntry;
    request_count_24h: number;
    detected_at: string;
    auto_blocked: boolean;
  };
}

export type IPReputationEvents = 
  | IPReputationCheckTriggered 
  | IPReputationCheckCompleted 
  | MaliciousIPDetected;