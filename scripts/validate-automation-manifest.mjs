#!/usr/bin/env node
// Validate .well-known/automation.yaml against schemas/automation-manifest.schema.json.
// Uses js-yaml (already a workspace dependency) + a small draft-2020-12 schema subset.
//
// Usage:  node scripts/validate-automation-manifest.mjs
// Exit:   0 on success, 1 on any validation error.
//
// used-by: .github/workflows/repo-budget-guardrails.yml
// used-by: human

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { load as parseYaml } from 'js-yaml';

const REPO = process.cwd();
const MANIFEST = join(REPO, '.well-known', 'automation.yaml');
const SCHEMA = join(REPO, 'schemas', 'automation-manifest.schema.json');
const GLOSSARY = join(REPO, 'docs', 'automation-glossary.md');

// ---------- small JSON Schema validator (draft 2020-12 subset) ----------

function validate(data, schema, path, rootSchema) {
  const errors = [];

  if (schema.$ref) {
    const ref = schema.$ref;
    if (!ref.startsWith('#/$defs/')) {
      errors.push(`${path}: unsupported $ref ${ref}`);
      return errors;
    }
    const name = ref.slice('#/$defs/'.length);
    const resolved = rootSchema.$defs?.[name];
    if (!resolved) {
      errors.push(`${path}: $ref target ${ref} not found`);
      return errors;
    }
    return validate(data, resolved, path, rootSchema);
  }

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = data === null ? 'null' : Array.isArray(data) ? 'array' : typeof data;
    const ok = types.some((t) => {
      if (t === 'integer') return actual === 'number' && Number.isInteger(data);
      if (t === 'number') return actual === 'number';
      return actual === t;
    });
    if (!ok) {
      errors.push(
        `${path}: expected ${types.join('|')}, got ${actual} (${JSON.stringify(data).slice(0, 60)})`
      );
      return errors;
    }
  }

  if (
    (schema.type === 'object' || schema.properties) &&
    data !== null &&
    typeof data === 'object' &&
    !Array.isArray(data)
  ) {
    if (schema.required) {
      for (const r of schema.required) {
        if (!(r in data)) errors.push(`${path}: missing required key "${r}"`);
      }
    }
    if (schema.additionalProperties === false && schema.properties) {
      for (const k of Object.keys(data)) {
        if (!(k in schema.properties)) errors.push(`${path}: unexpected key "${k}"`);
      }
    }
    if (schema.properties) {
      for (const [k, child] of Object.entries(schema.properties)) {
        if (k in data) {
          errors.push(...validate(data[k], child, `${path}.${k}`, rootSchema));
        }
      }
    }
  }

  if (schema.type === 'array' && Array.isArray(data)) {
    if (schema.minItems && data.length < schema.minItems) {
      errors.push(`${path}: array has ${data.length} items, minItems ${schema.minItems}`);
    }
    if (schema.items) {
      data.forEach((item, idx) => {
        errors.push(...validate(item, schema.items, `${path}[${idx}]`, rootSchema));
      });
    }
  }

  if (schema.type === 'string' && typeof data === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
      errors.push(`${path}: "${data}" does not match pattern ${schema.pattern}`);
    }
    if (schema.minLength && data.length < schema.minLength) {
      errors.push(`${path}: string shorter than minLength ${schema.minLength}`);
    }
    if (schema.maxLength && data.length > schema.maxLength) {
      errors.push(`${path}: "${data.slice(0, 30)}..." exceeds maxLength ${schema.maxLength}`);
    }
  }

  if ((schema.type === 'integer' || schema.type === 'number') && typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push(`${path}: ${data} < minimum ${schema.minimum}`);
    }
  }

  return errors;
}

// ---------- run ----------

function main() {
  if (!existsSync(MANIFEST)) {
    console.error(`manifest not found at ${MANIFEST}`);
    process.exit(1);
  }
  if (!existsSync(SCHEMA)) {
    console.error(`schema not found at ${SCHEMA}`);
    process.exit(1);
  }

  const manifestText = readFileSync(MANIFEST, 'utf8');
  const schemaText = readFileSync(SCHEMA, 'utf8');
  const schema = JSON.parse(schemaText);

  let parsed;
  try {
    parsed = parseYaml(manifestText);
  } catch (e) {
    console.error(`YAML parse error: ${e.message}`);
    process.exit(1);
  }

  const errors = validate(parsed, schema, '$', schema);
  if (errors.length) {
    console.error(`manifest failed schema validation (${errors.length} errors):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  // Cross-check: glossary version must match the version declared in docs/automation-glossary.md frontmatter.
  if (existsSync(GLOSSARY)) {
    const glossText = readFileSync(GLOSSARY, 'utf8');
    const vm = glossText.match(/^version:\s*["']?([\d.]+)["']?\s*$/m);
    if (vm) {
      const glossVersion = vm[1];
      if (parsed.glossary_version !== glossVersion) {
        console.error(
          `glossary version drift: manifest glossary_version=${parsed.glossary_version} but docs/automation-glossary.md version=${glossVersion}`
        );
        console.error('Update both in lockstep.');
        process.exit(1);
      }
    }
  }

  const actorKeys = Object.keys(parsed.actors || {});
  const capCount = (parsed.capabilities || []).length;
  console.log('manifest valid');
  console.log(`  schema_version   ${parsed.schema_version}`);
  console.log(`  glossary_version ${parsed.glossary_version}`);
  console.log(`  actors           ${actorKeys.join(', ')}`);
  console.log(`  capabilities     ${capCount}`);
  console.log(`  forbid paths     ${(parsed.mutation_policy?.forbid || []).length}`);
}

main();
