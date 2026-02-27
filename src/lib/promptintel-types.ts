/**
 * @deprecated PromptIntel MCP server has been removed
 * This file is a temporary stub to maintain compilation.
 * Migrate to @dcyfr/ai threat intelligence or remove usage.
 */

export interface PromptIntelIoPC {
  id: string;
  pattern: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
}

export interface PromptIntelTaxonomy {
  category: string;
  subcategories: string[];
  patterns: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface PromptIntelScanResult {
  isPolicy: boolean;
  matches: PromptIntelIoPC[];
  riskScore: number;
  confidence: number;
}
