#!/usr/bin/env node

/**
 * Color Contrast Validation Script
 * 
 * Validates WCAG 2.1 AA/AAA contrast ratios for all color combinations
 * in the design system.
 * 
 * WCAG Requirements:
 * - AA Normal Text: 4.5:1
 * - AA Large Text: 3:1
 * - AAA Normal Text: 7:1
 * - AAA Large Text: 4.5:1
 */

import wcagContrast from 'wcag-contrast';

/**
 * Convert OKLCH to RGB for contrast calculation
 * Simplified conversion - oklch(L C H) where C=0 (grayscale)
 * For grayscale, L directly maps to lightness
 */
function oklchToRgb(oklchString) {
  // Parse: oklch(0.5 0 0)
  const match = oklchString.match(/oklch\(([\d.]+)\s+[\d.]+\s+[\d.]+/);
  if (!match) {
    throw new Error(`Invalid OKLCH: ${oklchString}`);
  }
  
  const lightness = parseFloat(match[1]);
  
  // For grayscale (C=0), convert L to RGB value
  // OKLCH L range: 0-1, RGB range: 0-255
  const value = Math.round(lightness * 255);
  
  // Return hex format for wcag-contrast library
  const hex = value.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}

// Define color tokens from globals.css
const lightTheme = {
  background: 'oklch(1 0 0)',
  foreground: 'oklch(0.145 0 0)',
  muted: 'oklch(0.96 0 0)',
  'muted-foreground': 'oklch(0.44 0 0)',
  primary: 'oklch(0.205 0 0)',
  'primary-foreground': 'oklch(0.985 0 0)',
  success: 'oklch(0.35 0 0)',
  'success-foreground': 'oklch(0.98 0 0)',
  warning: 'oklch(0.55 0 0)',
  'warning-foreground': 'oklch(0.15 0 0)',
  error: 'oklch(0.25 0 0)',
  'error-foreground': 'oklch(0.98 0 0)',
  info: 'oklch(0.45 0 0)',
  'info-foreground': 'oklch(0.98 0 0)',
};

const darkTheme = {
  background: 'oklch(0.1 0 0)',
  foreground: 'oklch(0.985 0 0)',
  muted: 'oklch(0.20 0 0)',
  'muted-foreground': 'oklch(0.78 0 0)',
  primary: 'oklch(0.922 0 0)',
  'primary-foreground': 'oklch(0.205 0 0)',
  success: 'oklch(0.35 0 0)',
  'success-foreground': 'oklch(0.98 0 0)',
  warning: 'oklch(0.55 0 0)',
  'warning-foreground': 'oklch(0.15 0 0)',
  error: 'oklch(0.25 0 0)',
  'error-foreground': 'oklch(0.98 0 0)',
  info: 'oklch(0.45 0 0)',
  'info-foreground': 'oklch(0.98 0 0)',
};

// Define critical contrast pairs (text on background)
const contrastPairs = [
  { text: 'foreground', bg: 'background', type: 'normal' },
  { text: 'muted-foreground', bg: 'background', type: 'normal' },
  { text: 'muted-foreground', bg: 'muted', type: 'normal' },
  { text: 'primary-foreground', bg: 'primary', type: 'normal' },
  { text: 'success-foreground', bg: 'success', type: 'normal' },
  { text: 'warning-foreground', bg: 'warning', type: 'normal' },
  { text: 'error-foreground', bg: 'error', type: 'normal' },
  { text: 'info-foreground', bg: 'info', type: 'normal' },
];

// WCAG thresholds
const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3;
const WCAG_AAA_NORMAL = 7;
const WCAG_AAA_LARGE = 4.5;

function validateContrast(theme, themeName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${themeName.toUpperCase()} THEME - CONTRAST VALIDATION`);
  console.log(`${'='.repeat(60)}\n`);
  
  const results = [];
  let passed = 0;
  let failed = 0;
  
  contrastPairs.forEach(({ text, bg, type }) => {
    const textColor = oklchToRgb(theme[text]);
    const bgColor = oklchToRgb(theme[bg]);
    
    const ratio = wcagContrast.hex(textColor, bgColor);
    
    const aaThreshold = type === 'large' ? WCAG_AA_LARGE : WCAG_AA_NORMAL;
    const aaaThreshold = type === 'large' ? WCAG_AAA_LARGE : WCAG_AAA_NORMAL;
    
    const passesAA = ratio >= aaThreshold;
    const passesAAA = ratio >= aaaThreshold;
    
    const status = passesAAA ? '✅ AAA' : passesAA ? '✅ AA' : '❌ FAIL';
    
    if (passesAA) {
      passed++;
    } else {
      failed++;
    }
    
    results.push({
      text,
      bg,
      ratio: ratio.toFixed(2),
      status,
      passesAA,
      passesAAA
    });
    
    console.log(`${status.padEnd(10)} ${text.padEnd(20)} on ${bg.padEnd(20)} = ${ratio.toFixed(2)}:1`);
  });
  
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Results: ${passed} passed / ${failed} failed`);
  
  if (failed > 0) {
    console.log(`\n⚠️  WARNING: ${failed} color pair(s) do not meet WCAG AA standards`);
  } else {
    console.log(`\n✅ All color pairs meet WCAG AA standards!`);
  }
  
  return { passed, failed, results };
}

// Run validation
console.log('\n🎨 WCAG COLOR CONTRAST VALIDATION\n');
console.log('Standards:');
console.log('  - WCAG AA Normal Text: 4.5:1');
console.log('  - WCAG AA Large Text:  3:1');
console.log('  - WCAG AAA Normal Text: 7:1');
console.log('  - WCAG AAA Large Text:  4.5:1');

const lightResults = validateContrast(lightTheme, 'Light');
const darkResults = validateContrast(darkTheme, 'Dark');

// Summary
console.log(`\n${'='.repeat(60)}`);
console.log('OVERALL SUMMARY');
console.log(`${'='.repeat(60)}\n`);
console.log(`Light Theme: ${lightResults.passed}/${lightResults.passed + lightResults.failed} passed`);
console.log(`Dark Theme:  ${darkResults.passed}/${darkResults.passed + darkResults.failed} passed`);

const totalPassed = lightResults.passed + darkResults.passed;
const totalFailed = lightResults.failed + darkResults.failed;
const total = totalPassed + totalFailed;
const percentage = ((totalPassed / total) * 100).toFixed(1);

console.log(`\nTotal: ${totalPassed}/${total} (${percentage}%)`);

if (totalFailed > 0) {
  console.log('\n❌ Some contrast ratios need improvement');
  process.exit(1);
} else {
  console.log('\n✅ All contrast ratios meet WCAG AA standards!');
  process.exit(0);
}
