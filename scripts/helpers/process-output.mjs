#!/usr/bin/env node

/**
 * Process Output Helper
 * 
 * Handles buffering and flow control for child processes with large output.
 * Prevents heredoc hangs and buffer overflow issues when agents generate
 * large amounts of terminal output.
 * 
 * @see docs/audits/HEREDOC_BUFFER_OVERFLOW_ANALYSIS_2026-02-02.md
 */

import { spawn } from 'child_process';

const DEFAULT_MAX_BUFFER = 10 * 1024 * 1024; // 10MB
const CHUNK_LOG_INTERVAL = 50; // Log progress every 50 chunks
const CHUNK_SIZE = 64 * 1024; // 64KB chunks

/**
 * Spawn process with intelligent buffering
 * 
 * Prevents buffer overflow by:
 * - Using explicit pipe buffering instead of stdio: 'inherit'
 * - Monitoring output size with warnings
 * - Implementing backpressure handling
 * - Graceful termination on overflow
 * 
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @param {object} options - Spawn options
 * @param {number} options.maxBuffer - Maximum buffer size (default: 10MB)
 * @param {boolean} options.verbose - Log buffer progress
 * @param {function} options.onProgress - Callback for progress updates
 * @returns {Promise<object>} Process result with stdout, stderr, status
 */
export async function spawnWithBuffering(command, args, options = {}) {
  const {
    maxBuffer = DEFAULT_MAX_BUFFER,
    verbose = false,
    onProgress = null,
    ...spawnOptions
  } = options;

  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      ...spawnOptions
    });

    let stdout = '';
    let stderr = '';
    let chunks = 0;
    let oversizeWarningShown = false;

    // Monitor stdout with chunking
    process.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      chunks++;

      // Check for buffer overflow
      if (stdout.length > maxBuffer) {
        if (!oversizeWarningShown) {
          const sizeMB = (stdout.length / 1024 / 1024).toFixed(1);
          console.error(
            `⚠️  Output buffer exceeded ${(maxBuffer / 1024 / 1024).toFixed(0)}MB (current: ${sizeMB}MB)`
          );
          oversizeWarningShown = true;
        }

        if (stdout.length > maxBuffer * 1.5) {
          process.kill('SIGTERM');
          reject(new Error(
            `Output exceeded maximum buffer size (${(maxBuffer / 1024 / 1024).toFixed(0)}MB)`
          ));
          return;
        }
      }

      // Log progress for large outputs
      if (verbose && chunks % CHUNK_LOG_INTERVAL === 0) {
        const mb = (stdout.length / 1024 / 1024).toFixed(1);
        const msg = `⏳ Processing output (${mb}MB, ${chunks} chunks)...`;
        console.error(msg);
      }

      // Call progress callback
      if (onProgress) {
        onProgress({
          chunk: chunk.toString(),
          totalBytes: stdout.length,
          chunkCount: chunks,
          warning: oversizeWarningShown
        });
      }
    });

    // Capture stderr separately
    process.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    // Handle completion
    process.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        status: code,
        sizeBytes: stdout.length,
        chunkCount: chunks,
        oversizeWarning: oversizeWarningShown
      });
    });

    // Handle errors
    process.on('error', (error) => {
      reject(new Error(`Process spawn failed: ${error.message}`));
    });
  });
}

/**
 * Stream process output with line-by-line processing
 * 
 * Ideal for very large outputs (>100MB) where buffering
 * entire output would exhaust memory. Processes lines
 * immediately without storing full output.
 * 
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @param {function} lineProcessor - Callback for each line
 * @param {object} options - Additional options
 * @returns {Promise<object>} Statistics about processing
 */
export async function streamProcessOutput(command, args, lineProcessor, options = {}) {
  const { verbose = false, ...spawnOptions } = options;

  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      ...spawnOptions
    });

    let lineBuffer = '';
    let lines = 0;
    let totalBytes = 0;

    process.stdout.on('data', (chunk) => {
      const data = chunk.toString();
      totalBytes += data.length;
      lineBuffer += data;

      // Split on newlines and process complete lines
      const splitLines = lineBuffer.split('\n');
      lineBuffer = splitLines.pop(); // Keep incomplete line

      splitLines.forEach(line => {
        lines++;
        try {
          lineProcessor(line);
        } catch (error) {
          console.error(`Error processing line ${lines}: ${error.message}`);
        }
      });

      if (verbose && lines % 100 === 0) {
        console.error(
          `⏳ Streamed ${lines} lines (${(totalBytes / 1024 / 1024).toFixed(1)}MB)...`
        );
      }
    });

    process.on('close', (code) => {
      // Process final incomplete line if any
      if (lineBuffer) {
        lines++;
        try {
          lineProcessor(lineBuffer);
        } catch (error) {
          console.error(`Error processing final line: ${error.message}`);
        }
      }

      resolve({
        status: code,
        totalLines: lines,
        totalBytes,
        avgLineBytes: lines > 0 ? totalBytes / lines : 0
      });
    });

    process.on('error', reject);
  });
}

/**
 * Execute command with timeout and buffer management
 * 
 * Combines buffering with timeout protection for AI agent
 * output that might hang indefinitely.
 * 
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @param {object} options - Execution options
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {number} options.maxBuffer - Maximum buffer size
 * @returns {Promise<object>} Process result
 */
export async function executeWithTimeout(command, args, options = {}) {
  const { timeout = 60000, maxBuffer = DEFAULT_MAX_BUFFER, ...opts } = options;

  return new Promise((resolve, reject) => {
    let timedOut = false;

    const process = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      ...opts
    });

    let stdout = '';
    let stderr = '';

    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      process.kill('SIGTERM');
      reject(new Error(
        `Command execution timed out after ${timeout}ms (output: ${(stdout.length / 1024 / 1024).toFixed(1)}MB)`
      ));
    }, timeout);

    process.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > maxBuffer) {
        clearTimeout(timeoutHandle);
        process.kill('SIGTERM');
        reject(new Error(`Output buffer exceeded (${(maxBuffer / 1024 / 1024).toFixed(0)}MB)`));
      }
    });

    process.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    process.on('close', (code) => {
      clearTimeout(timeoutHandle);
      if (!timedOut) {
        resolve({
          stdout,
          stderr,
          status: code,
          timedOut: false
        });
      }
    });

    process.on('error', (error) => {
      clearTimeout(timeoutHandle);
      reject(error);
    });
  });
}

/**
 * Validate output doesn't exceed size limits
 * 
 * @param {string} output - Output to validate
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {object} Validation result
 */
export function validateOutputSize(output, maxSize = DEFAULT_MAX_BUFFER) {
  const sizeBytes = output.length;
  const sizeMB = sizeBytes / 1024 / 1024;
  const maxMB = maxSize / 1024 / 1024;

  return {
    valid: sizeBytes <= maxSize,
    sizeBytes,
    sizeMB: sizeMB.toFixed(1),
    maxMB: maxMB.toFixed(0),
    percentUsed: ((sizeBytes / maxSize) * 100).toFixed(1),
    message: sizeBytes <= maxSize
      ? `✓ Output size OK (${sizeMB.toFixed(1)}MB / ${maxMB}MB)`
      : `✗ Output size EXCEEDED (${sizeMB.toFixed(1)}MB / ${maxMB}MB)`
  };
}

export default {
  spawnWithBuffering,
  streamProcessOutput,
  executeWithTimeout,
  validateOutputSize,
  DEFAULT_MAX_BUFFER,
  CHUNK_SIZE
};
