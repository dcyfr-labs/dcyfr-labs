/**
 * LanguageTool API Client
 *
 * @fileoverview Client for LanguageTool Pro API with support for prose checking,
 * custom dictionaries, and MDX markup handling.
 *
 * @see https://languagetool.org/http-api/
 */

const API_BASE = 'https://api.languagetoolplus.com/v2';

/**
 * Check text for grammar, spelling, and style issues
 *
 * @param {string} text - Plain text or JSON markup data
 * @param {Object} options - Check options
 * @param {string} options.language - Language code (e.g., 'en-US')
 * @param {'default'|'picky'} [options.level='default'] - Checking level
 * @param {string} [options.enabledRules] - Comma-separated rule IDs
 * @param {string} [options.disabledRules] - Comma-separated rule IDs
 * @param {string} [options.disabledCategories] - Comma-separated category IDs
 * @param {boolean} [options.isMarkupData=false] - Whether text is JSON markup
 * @returns {Promise<{software: Object, language: Object, matches: Array}>}
 */
export async function checkText(text, options = {}) {
  const {
    language = 'en-US',
    level = 'default',
    enabledRules,
    disabledRules,
    disabledCategories,
    isMarkupData = false,
  } = options;

  const username = process.env.LANGUAGETOOL_USERNAME;
  const apiKey = process.env.LANGUAGETOOL_API_KEY;

  if (!username || !apiKey) {
    throw new Error(
      'Missing LanguageTool credentials. Set LANGUAGETOOL_USERNAME and LANGUAGETOOL_API_KEY environment variables.'
    );
  }

  const formData = new URLSearchParams();

  // Add text or markup data
  if (isMarkupData) {
    formData.append('data', text);
  } else {
    formData.append('text', text);
  }

  // Required parameters
  formData.append('language', language);
  formData.append('username', username);
  formData.append('apiKey', apiKey);

  // Optional parameters
  if (level) formData.append('level', level);
  if (enabledRules) formData.append('enabledRules', enabledRules);
  if (disabledRules) formData.append('disabledRules', disabledRules);
  if (disabledCategories) formData.append('disabledCategories', disabledCategories);

  const response = await fetch(`${API_BASE}/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LanguageTool API error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Add word to custom dictionary
 *
 * @param {string} word - Word to add (no whitespace)
 * @param {string} [dict] - Dictionary name (uses default if unset)
 * @returns {Promise<{added: boolean}>}
 */
export async function addWord(word, dict) {
  const username = process.env.LANGUAGETOOL_USERNAME;
  const apiKey = process.env.LANGUAGETOOL_API_KEY;

  if (!username || !apiKey) {
    throw new Error('Missing LanguageTool credentials');
  }

  const formData = new URLSearchParams();
  formData.append('word', word);
  formData.append('username', username);
  formData.append('apiKey', apiKey);
  if (dict) formData.append('dict', dict);

  const response = await fetch(`${API_BASE}/words/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LanguageTool API error: ${error}`);
  }

  return response.json();
}

/**
 * List words in custom dictionaries
 *
 * @param {Object} options - List options
 * @param {number} [options.offset=0] - Offset
 * @param {number} [options.limit=500] - Limit (max words to return)
 * @param {string} [options.dicts] - Comma-separated dictionary names
 * @returns {Promise<{words: string[]}>}
 */
export async function listWords(options = {}) {
  const { offset = 0, limit = 500, dicts } = options;
  const username = process.env.LANGUAGETOOL_USERNAME;
  const apiKey = process.env.LANGUAGETOOL_API_KEY;

  if (!username || !apiKey) {
    throw new Error('Missing LanguageTool credentials');
  }

  const params = new URLSearchParams();
  params.append('username', username);
  params.append('apiKey', apiKey);
  params.append('offset', offset.toString());
  params.append('limit', limit.toString());
  if (dicts) params.append('dicts', dicts);

  const response = await fetch(`${API_BASE}/words?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LanguageTool API error: ${error}`);
  }

  return response.json();
}

/**
 * Format match results for console output
 *
 * @param {Array} matches - Matches from LanguageTool API
 * @param {string} filePath - File path for context
 * @returns {string} Formatted output
 */
export function formatMatches(matches, filePath) {
  if (matches.length === 0) {
    return `✅ ${filePath}: No issues found`;
  }

  const lines = [`\n❌ ${filePath}: ${matches.length} issue${matches.length === 1 ? '' : 's'}\n`];

  for (const match of matches) {
    const { message, context, replacements, rule } = match;
    const suggestion = replacements.length > 0 ? ` → Suggestion: "${replacements[0].value}"` : '';

    lines.push(`  ${rule.category.name} (${rule.id}): ${message}`);
    lines.push(`    Context: "${context.text}"`);
    if (suggestion) {
      lines.push(`    ${suggestion}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
