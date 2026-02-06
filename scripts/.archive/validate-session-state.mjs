#!/usr/bin/env node
/**
 * Session State Validation Script
 *
 * Validates session state JSON during agent handoffs to ensure
 * 100% context preservation as required by Phase 2 success criteria.
 *
 * Usage:
 *   node scripts/validate-session-state.mjs --file=<path-to-session-state.json> [--schema=<path>]
 *   node scripts/validate-session-state.mjs --json (JSON output mode)
 *
 * @see docs/ai/agent-compliance-remediation-plan.md Phase 2 Week 3
 * @see .claude/.session-state.json
 * @see .opencode/.session-state.json
 */

import fs from 'fs';
import path from 'path';

// Parse CLI args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, val] = arg.replace(/^--/, '').split('=');
  acc[key] = val || true;
  return acc;
}, {});

const sessionFile = args.file || '.claude/.session-state.json';
const schemaFile = args.schema || null; // Optional custom schema
const jsonOutput = args.json === 'true' || args.json === true;

// Session State Schema v2.0 (from remediation plan)
const SESSION_STATE_SCHEMA = {
  version: { type: 'string', required: true, pattern: /^\d+\.\d+\.\d+$/ },
  timestamp: { type: 'string', required: true, pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/ },
  agent: {
    type: 'object',
    required: true,
    fields: {
      name: {
        type: 'string',
        required: true,
        enum: [
          'DCYFR',
          'Quick Fix',
          'Test Specialist',
          'Frontend Developer',
          'TypeScript Pro',
          'Accessibility Specialist',
        ],
      },
      mode: {
        type: 'string',
        required: true,
        enum: ['production', 'quick-fix', 'testing', 'research'],
      },
      model: { type: 'string', required: false },
    },
  },
  context: {
    type: 'object',
    required: true,
    fields: {
      branch: { type: 'string', required: true },
      workingDirectory: { type: 'string', required: true },
      openFiles: { type: 'array', required: false },
      recentCommits: { type: 'array', required: false },
    },
  },
  task: {
    type: 'object',
    required: true,
    fields: {
      description: { type: 'string', required: true, minLength: 10 },
      priority: { type: 'string', required: true, enum: ['P0', 'P1', 'P2', 'P3'] },
      estimatedTime: { type: 'string', required: false },
      linkedIssues: { type: 'array', required: false },
    },
  },
  progress: {
    type: 'object',
    required: true,
    fields: {
      completedSteps: { type: 'array', required: true },
      nextSteps: { type: 'array', required: true },
      blockers: { type: 'array', required: false },
      filesModified: { type: 'array', required: false },
    },
  },
  validation: {
    type: 'object',
    required: false,
    fields: {
      designTokens: { type: 'boolean', required: false },
      tests: { type: 'boolean', required: false },
      linting: { type: 'boolean', required: false },
    },
  },
};

// Validation errors collection
const errors = [];
const warnings = [];

// Validate value against schema field
function validateField(value, schema, path = '') {
  if (schema.required && (value === undefined || value === null)) {
    errors.push(`Missing required field: ${path}`);
    return false;
  }

  if (value === undefined || value === null) {
    return true; // Optional field not provided
  }

  // Type validation
  const actualType = Array.isArray(value) ? 'array' : typeof value;
  if (schema.type && actualType !== schema.type) {
    errors.push(`Type mismatch at ${path}: expected ${schema.type}, got ${actualType}`);
    return false;
  }

  // Pattern validation (strings)
  if (schema.pattern && typeof value === 'string' && !schema.pattern.test(value)) {
    errors.push(`Pattern mismatch at ${path}: "${value}" does not match ${schema.pattern}`);
    return false;
  }

  // Enum validation
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`Invalid value at ${path}: "${value}" not in [${schema.enum.join(', ')}]`);
    return false;
  }

  // Min length validation (strings)
  if (schema.minLength && typeof value === 'string' && value.length < schema.minLength) {
    errors.push(
      `Value too short at ${path}: "${value}" must be at least ${schema.minLength} characters`
    );
    return false;
  }

  // Nested object validation
  if (schema.fields && typeof value === 'object' && !Array.isArray(value)) {
    for (const [fieldKey, fieldSchema] of Object.entries(schema.fields)) {
      validateField(value[fieldKey], fieldSchema, `${path}.${fieldKey}`);
    }
  }

  // Array item validation (basic)
  if (schema.type === 'array' && Array.isArray(value)) {
    if (value.length === 0 && schema.required) {
      warnings.push(`Empty array at ${path} (required field)`);
    }
  }

  return true;
}

// Validate session state
function validateSessionState(data, schema) {
  for (const [key, fieldSchema] of Object.entries(schema)) {
    validateField(data[key], fieldSchema, key);
  }
}

// Calculate completeness score
function calculateCompleteness(data) {
  let total = 0;
  let present = 0;

  function countFields(obj, schema) {
    for (const [key, fieldSchema] of Object.entries(schema)) {
      total++;
      if (obj && obj[key] !== undefined && obj[key] !== null) {
        present++;

        if (fieldSchema.fields && typeof obj[key] === 'object') {
          countFields(obj[key], fieldSchema.fields);
        }
      }
    }
  }

  countFields(data, SESSION_STATE_SCHEMA);
  return Math.round((present / total) * 100);
}

// Main execution
try {
  // Read session state file
  if (!fs.existsSync(sessionFile)) {
    console.error(`❌ Session state file not found: ${sessionFile}`);
    process.exit(1);
  }

  const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));

  // Load custom schema if provided
  const schema =
    schemaFile && fs.existsSync(schemaFile)
      ? JSON.parse(fs.readFileSync(schemaFile, 'utf-8'))
      : SESSION_STATE_SCHEMA;

  // Validate against schema
  validateSessionState(sessionData, schema);

  // Calculate completeness
  const completeness = calculateCompleteness(sessionData);

  // Output results
  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          file: sessionFile,
          valid: errors.length === 0,
          completeness,
          errors,
          warnings,
          schema: 'v2.0',
        },
        null,
        2
      )
    );
  } else {
    console.log(`🔍 Session State Validation`);
    console.log(`   File: ${sessionFile}`);
    console.log(`   Schema: v2.0`);
    console.log(`   Completeness: ${completeness}%`);
    console.log('');

    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ Session state is valid');
      console.log(`   All required fields present`);
      console.log(`   Context preservation: ${completeness >= 100 ? '100%' : `${completeness}%`}`);
    } else {
      if (errors.length > 0) {
        console.log(`❌ Validation Errors (${errors.length}):\n`);
        errors.forEach((err, idx) => {
          console.log(`   ${idx + 1}. ${err}`);
        });
        console.log('');
      }

      if (warnings.length > 0) {
        console.log(`⚠️  Warnings (${warnings.length}):\n`);
        warnings.forEach((warn, idx) => {
          console.log(`   ${idx + 1}. ${warn}`);
        });
        console.log('');
      }

      if (completeness < 100) {
        console.log(`⚠️  Context Preservation: ${completeness}% (target: 100%)`);
        console.log(`   Missing ${100 - completeness}% of recommended fields`);
      }
    }
  }

  // Exit code: 0 = valid, 1 = invalid
  process.exit(errors.length > 0 ? 1 : 0);
} catch (err) {
  console.error(`❌ Validation failed: ${err.message}`);
  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          file: sessionFile,
          valid: false,
          error: err.message,
        },
        null,
        2
      )
    );
  }
  process.exit(1);
}
