import { describe, test, expect } from 'vitest';
import robots from '@/app/robots';

describe('robots.txt Route', () => {
  test('returns robots.txt with correct structure', () => {
    const result = robots();

    expect(result).toHaveProperty('rules');
    expect(result).toHaveProperty('sitemap');
    expect(result).toHaveProperty('host');
    expect(Array.isArray(result.rules)).toBe(true);
    expect(result.rules.length).toBeGreaterThan(0);
  });

  test('includes proper sitemap URL', () => {
    const result = robots();
    
    expect(result.sitemap).toBeTruthy();
    expect(result.sitemap).toMatch(/sitemap$/);
  });

  test('blocks private and API paths', () => {
    const result = robots();
    
    // Find the default rule for all user agents
    const defaultRule = result.rules.find(rule => rule.userAgent === '*');
    expect(defaultRule).toBeTruthy();
    expect(defaultRule?.disallow).toContain('/api/');
    expect(defaultRule?.disallow).toContain('/private/');
  });

  test('allows root access for default user agent', () => {
    const result = robots();
    
    const defaultRule = result.rules.find(rule => rule.userAgent === '*');
    expect(defaultRule?.allow).toBe('/');
  });

  test('includes specific AI crawler rules', () => {
    const result = robots();
    
    // Check for GPTBot rules
    const gptBotRule = result.rules.find(rule => 
      Array.isArray(rule.userAgent) && 
      rule.userAgent.includes('GPTBot')
    );
    expect(gptBotRule).toBeTruthy();
    
    // Check for Googlebot rules
    const googlebotRule = result.rules.find(rule => rule.userAgent === 'Googlebot');
    expect(googlebotRule).toBeTruthy();
  });

  test('returns consistent format', () => {
    const result1 = robots();
    const result2 = robots();
    
    expect(result1.rules).toEqual(result2.rules);
    expect(result1.sitemap).toBe(result2.sitemap);
    expect(result1.host).toBe(result2.host);
  });
});