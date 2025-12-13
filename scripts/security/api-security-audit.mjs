#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Find all API route files
function findApiRoutes(dir, routes = []) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      findApiRoutes(fullPath, routes);
    } else if (file === 'route.ts') {
      routes.push(fullPath);
    }
  }
  
  return routes;
}

// Analyze API route security
function analyzeRoute(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const routePath = filePath.replace(/.*\/src\/app\/api/, '').replace('/route.ts', '');
  
  const analysis = {
    path: routePath || '/',
    file: filePath,
    hasBlockExternalAccess: content.includes('blockExternalAccess'),
    hasAdminAuth: content.includes('ADMIN_API_KEY') && content.includes('validateApiKey'),
    hasAdminAuthCheck: content.includes('isAuthenticated') || content.includes('validateApiKey'),
    isInternalOnly: content.includes('internal') || content.includes('maintenance') || content.includes('dev'),
    hasRateLimit: content.includes('rateLimit'),
    httpMethods: [],
    description: '',
    costExposure: false,
    publicAccess: true
  };
  
  // Find HTTP methods
  const methodRegex = /export async function (GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)/g;
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    analysis.httpMethods.push(match[1]);
  }
  
  // Extract description from comments
  const descMatch = content.match(/\/\*\*\s*\n\s*\*\s*([^\n]+)/);
  if (descMatch) {
    analysis.description = descMatch[1].trim();
  }
  
  // Check for cost exposure
  analysis.costExposure = content.includes('perplexity') || content.includes('openai') || 
                         content.includes('anthropic') || content.includes('research');
  
  // Determine access level
  if (analysis.hasBlockExternalAccess) {
    analysis.publicAccess = false;
  } else if (analysis.hasAdminAuthCheck) {
    analysis.publicAccess = false;
  } else if (routePath.includes('/admin/') || routePath.includes('/maintenance/') || routePath.includes('/dev/')) {
    analysis.publicAccess = 'partially'; // May have some protection
  }
  
  return analysis;
}

// Main execution
const apiDir = join(process.cwd(), 'src', 'app', 'api');
const routes = findApiRoutes(apiDir);

console.log('# 📊 API ENDPOINT SECURITY INVENTORY\\n');
console.log('**Total Endpoints Found:** ' + routes.length + '\\n');

const analyses = routes.map(analyzeRoute).sort((a, b) => a.path.localeCompare(b.path));

// Summary counts
const secured = analyses.filter(a => !a.publicAccess).length;
const vulnerable = analyses.filter(a => a.publicAccess === true).length;
const partial = analyses.filter(a => a.publicAccess === 'partially').length;
const costExposed = analyses.filter(a => a.costExposure).length;

console.log('## 🔒 **Security Summary**\\n');
console.log(`- ✅ **Secured**: ${secured} endpoints`);
console.log(`- ⚠️ **Partially Protected**: ${partial} endpoints`);
console.log(`- ❌ **Vulnerable**: ${vulnerable} endpoints`);
console.log(`- 💰 **Cost Exposure**: ${costExposed} endpoints\\n`);

// Detailed breakdown
console.log('## 📋 **Detailed Inventory**\\n');

for (const analysis of analyses) {
  const statusIcon = analysis.publicAccess === false ? '✅' : 
                    analysis.publicAccess === 'partially' ? '⚠️' : '❌';
  const costIcon = analysis.costExposure ? '💰' : '';
  
  console.log(`### ${statusIcon} \`${analysis.path}\` ${costIcon}`);
  console.log(`**Methods:** ${analysis.httpMethods.join(', ')}`);
  if (analysis.description) console.log(`**Purpose:** ${analysis.description}`);
  
  console.log('**Security:**');
  if (analysis.hasBlockExternalAccess) console.log('- ✅ External access blocked');
  if (analysis.hasAdminAuthCheck) console.log('- ✅ Admin authentication required');
  if (analysis.hasRateLimit) console.log('- ✅ Rate limiting enabled');
  if (analysis.costExposure) console.log('- ⚠️ **COST EXPOSURE** - External API calls');
  if (analysis.publicAccess === true) console.log('- ❌ **PUBLIC ACCESS** - No protection detected');
  
  console.log('');
}

// High priority issues
const highPriority = analyses.filter(a => a.publicAccess === true && (a.costExposure || a.path.includes('admin')));
if (highPriority.length > 0) {
  console.log('## 🚨 **HIGH PRIORITY SECURITY ISSUES**\\n');
  highPriority.forEach(a => {
    console.log(`- \`${a.path}\`: ${a.costExposure ? 'Cost exposure' : 'Admin endpoint'} publicly accessible`);
  });
}