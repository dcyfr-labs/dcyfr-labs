#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Update an API route file
function updateApiRoute(filePath) {
  let content = readFileSync(filePath, 'utf8');
  
  // Skip if already has security import
  if (content.includes('blockExternalAccess')) {
    console.log(`⏭️  Skipping ${filePath} (already secured)`);
    return;
  }
  
  // Skip catch-all route
  if (filePath.includes('[...catchall]')) {
    console.log(`⏭️  Skipping ${filePath} (catch-all route)`);
    return;
  }
  
  let modified = false;
  
  // Add import if NextRequest is already imported
  if (content.includes('NextRequest')) {
    if (!content.includes('blockExternalAccess')) {
      // Add the security import
      const importMatch = content.match(/import.*NextRequest.*from ['"]next\/server['"];?/);
      if (importMatch) {
        const newImport = `${importMatch[0]}\nimport { blockExternalAccess } from '@/lib/api-security';`;
        content = content.replace(importMatch[0], newImport);
        modified = true;
      }
    }
  }
  
  // Find export functions and add security check
  const functionRegex = /export async function (GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s*\([^)]*\)\s*{/g;
  content = content.replace(functionRegex, (match, method) => {
    if (match.includes('NextRequest')) {
      // Already has NextRequest, add security check
      const paramMatch = match.match(/\(([^)]+)\)/);
      if (paramMatch) {
        const params = paramMatch[1];
        const requestParam = params.split(',')[0].trim();
        return `${match}
  // Block external access for security
  const blockResponse = blockExternalAccess(${requestParam});
  if (blockResponse) return blockResponse;

`;
      }
    }
    return match;
  });
  
  if (modified) {
    writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
  } else {
    console.log(`⚠️  Could not update ${filePath} (manual review needed)`);
  }
}

// Main execution
const apiDir = join(__dirname, '..', 'src', 'app', 'api');
const routes = findApiRoutes(apiDir);

console.log(`Found ${routes.length} API routes to secure:`);
routes.forEach(route => {
  console.log(`  ${route}`);
});
console.log('');

routes.forEach(updateApiRoute);

console.log('\\n✨ Security update complete!');