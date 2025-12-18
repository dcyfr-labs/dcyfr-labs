#!/usr/bin/env node

/**
 * Link Verification Script
 * 
 * Validates that links in documentation are working correctly after cleanup.
 * Tests both file existence and URL accessibility for internal links.
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

class LinkVerifier {
  constructor() {
    this.stats = {
      linksChecked: 0,
      validLinks: 0,
      invalidLinks: 0,
      externalLinks: 0,
    };
    this.issues = [];
  }

  async verify() {
    console.log('🔍 Verifying documentation links...\n');
    
    // Read the broken links report if it exists
    const reportPath = path.join(projectRoot, 'reports', 'broken-links-report.json');
    let report = null;
    
    try {
      if (existsSync(reportPath)) {
        const reportData = await fs.readFile(reportPath, 'utf-8');
        report = JSON.parse(reportData);
        console.log(`📊 Previous scan found ${report.stats.brokenLinks} broken links\n`);
      }
    } catch (error) {
      console.log('📊 No previous report found\n');
    }
    
    // Sample key documentation files to verify
    const keyFiles = [
      'docs/README.md',
      'docs/quick-start.md',
      'docs/ai/quick-reference.md',
      'docs/operations/todo.md',
      'CLAUDE.md',
      'AGENTS.md',
    ];
    
    for (const file of keyFiles) {
      const filePath = path.join(projectRoot, file);
      if (existsSync(filePath)) {
        await this.verifyFile(filePath);
      }
    }
    
    console.log('\n📊 Verification Results');
    console.log('═'.repeat(30));
    console.log(`🔗 Links checked: ${this.stats.linksChecked}`);
    console.log(`✅ Valid links: ${this.stats.validLinks}`);
    console.log(`❌ Invalid links: ${this.stats.invalidLinks}`);
    console.log(`🌐 External links: ${this.stats.externalLinks}`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 Issues Found:');
      for (const issue of this.issues) {
        console.log(`❌ ${issue.file}: ${issue.link} - ${issue.reason}`);
      }
    } else {
      console.log('\n🎉 All checked links are valid!');
    }
    
    return this.stats.invalidLinks === 0;
  }
  
  async verifyFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const links = this.extractLinks(content);
    
    console.log(`📄 Checking: ${path.relative(projectRoot, filePath)} (${links.length} links)`);
    
    for (const link of links) {
      this.stats.linksChecked++;
      
      if (this.isExternalLink(link.url)) {
        this.stats.externalLinks++;
        continue;
      }
      
      const isValid = await this.validateLink(filePath, link.url);
      
      if (isValid) {
        this.stats.validLinks++;
      } else {
        this.stats.invalidLinks++;
        this.issues.push({
          file: path.relative(projectRoot, filePath),
          link: link.url,
          text: link.text,
          reason: 'File not found',
        });
      }
    }
  }
  
  extractLinks(content) {
    const links = [];
    const patterns = [
      /\[([^\]]+)\]\(([^)]+)\)/g, // Markdown links
      /<a[^>]+href=["']([^"']+)["'][^>]*>/g, // HTML links
    ];
    
    for (const pattern of patterns) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(content)) !== null) {
        if (pattern.source.includes('\\[')) {
          links.push({ text: match[1], url: match[2] });
        } else {
          links.push({ text: 'HTML anchor', url: match[1] });
        }
      }
    }
    
    return links;
  }
  
  isExternalLink(url) {
    return url.startsWith('http://') || 
           url.startsWith('https://') || 
           url.startsWith('mailto:') || 
           url.startsWith('tel:') ||
           url.startsWith('#');
  }
  
  async validateLink(filePath, url) {
    try {
      if (url.startsWith('./') || url.startsWith('../')) {
        const resolvedPath = path.resolve(path.dirname(filePath), url);
        return existsSync(resolvedPath) || 
               existsSync(resolvedPath + '.md') || 
               existsSync(resolvedPath + '.mdx');
      }
      
      if (url.startsWith('/')) {
        const absolutePath = path.join(projectRoot, url.slice(1));
        return existsSync(absolutePath) || 
               existsSync(absolutePath + '.md') || 
               existsSync(absolutePath + '.mdx');
      }
      
      // Check docs-relative path
      const docsPath = path.join(projectRoot, 'docs', url);
      return existsSync(docsPath) || 
             existsSync(docsPath + '.md') || 
             existsSync(docsPath + '.mdx');
      
    } catch {
      return false;
    }
  }
}

async function main() {
  const verifier = new LinkVerifier();
  const isValid = await verifier.verify();
  process.exit(isValid ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { LinkVerifier };