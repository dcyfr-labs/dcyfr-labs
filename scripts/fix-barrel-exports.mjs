#!/usr/bin/env node
/**
 * Automated Barrel Export Fixer
 * 
 * Scans all TypeScript files for imports from barrel files (@/lib/*, @/components/*),
 * extracts what's being imported, checks if those exports exist in the barrel,
 * and reports or fixes missing exports.
 * 
 * Usage:
 *   npm run fix:barrels           # Check only
 *   npm run fix:barrels --fix     # Auto-fix missing exports
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const AUTO_FIX = process.argv.includes("--fix");

// Barrel directories to scan
const BARREL_DIRS = [
  "src/lib/activity",
  "src/lib/search",
  "src/lib/engagement",
  "src/lib/dashboard",
  "src/lib/sponsors",
  "src/components/activity",
  "src/components/blog",
  "src/components/common",
  "src/components/home",
  "src/components/layouts",
  "src/components/navigation",
  "src/components/ui",
];

/**
 * Extract imports from a TypeScript file
 */
function extractImports(content, filePath) {
  const imports = [];
  
  // Match: import { X, Y, type Z } from "@/lib/activity"
  // Also match: import type { X, Y } from "@/lib/activity"
  const importRegex = /import\s+(?:type\s+)?{([^}]+)}\s+from\s+["'](@\/[^"']+)["']/gm;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const [, importList, modulePath] = match;
    
    // Split imports and clean them
    const items = importList
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        // Remove "type" prefix and "as" aliases
        const cleaned = item
          .replace(/^type\s+/, "")
          .replace(/\s+as\s+\w+$/, "")
          .trim();
        
        // Track if it's a type import
        const isType = item.includes("type ");
        
        return { name: cleaned, isType, source: modulePath };
      });
    
    imports.push(...items);
  }
  
  return imports;
}

/**
 * Find all exports in a directory (excluding index.ts)
 */
function findExportsInDir(dirPath) {
  const exports = new Map(); // filename -> [export names]
  
  try {
    const files = readdirSync(join(ROOT, dirPath))
      .filter((f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && f !== "index.ts");
    
    for (const file of files) {
      const filePath = join(ROOT, dirPath, file);
      const content = readFileSync(filePath, "utf-8");
      
      // Match: export function|const|class|interface|type NAME
      // Also match: export async function NAME
      const exportRegex = /export\s+(?:async\s+)?(?:function|const|class|interface|type)\s+(\w+)/gm;
      
      const fileExports = [];
      let match;
      while ((match = exportRegex.exec(content)) !== null) {
        fileExports.push(match[1]);
      }
      
      if (fileExports.length > 0) {
        exports.set(file, fileExports);
      }
    }
  } catch (err) {
    // Directory might not exist
  }
  
  return exports;
}

/**
 * Get current exports from barrel file
 */
function getBarrelExports(barrelPath) {
  const exports = new Set();
  
  try {
    const content = readFileSync(join(ROOT, barrelPath, "index.ts"), "utf-8");
    
    // Match: export { X, Y, type Z } from "./file"
    const exportRegex = /export\s+{([^}]+)}\s+from/gm;
    
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const items = match[1]
        .split(",")
        .map((item) => item.trim().replace(/^type\s+/, "").trim())
        .filter(Boolean);
      
      items.forEach((item) => exports.add(item));
    }
    
    // Match: export * from "./file"
    const exportAllRegex = /export\s+\*\s+from\s+["']\.\/([^"']+)["']/gm;
    while ((match = exportAllRegex.exec(content)) !== null) {
      exports.add(`*:${match[1]}`); // Track wildcard exports
    }
  } catch (err) {
    // Barrel might not exist
  }
  
  return exports;
}

/**
 * Find which file exports a given name
 */
function findExportSource(exportName, dirExports) {
  for (const [file, exports] of dirExports.entries()) {
    if (exports.includes(exportName)) {
      // Remove .ts or .tsx extension
      return file.replace(/\.tsx?$/, "");
    }
  }
  return null;
}

/**
 * Add missing export to barrel file
 */
function addExportToBarrel(barrelPath, exportName, sourceFile) {
  const indexPath = join(ROOT, barrelPath, "index.ts");
  let content = readFileSync(indexPath, "utf-8");
  
  // Check if there's already an export from this source file
  const sourcePattern = new RegExp(`export\\s+{[^}]*}\\s+from\\s+["']\\.\\/${sourceFile}["']`, 'm');
  const match = content.match(sourcePattern);
  
  if (match) {
    // Add to existing export
    const oldExport = match[0];
    const exportList = oldExport.match(/{([^}]+)}/)[1];
    const newExport = oldExport.replace(
      exportList,
      `${exportList.trim()}, ${exportName}`
    );
    content = content.replace(oldExport, newExport);
  } else {
    // Add new export line at the end
    content += `\nexport { ${exportName} } from "./${sourceFile}";\n`;
  }
  
  writeFileSync(indexPath, content, "utf-8");
}

/**
 * Scan all TypeScript files in a directory
 */
function scanFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    const items = readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
        walk(fullPath);
      } else if (item.endsWith(".ts") || item.endsWith(".tsx")) {
        files.push(fullPath);
      }
    }
  }
  
  walk(join(ROOT, dir));
  return files;
}

/**
 * Main execution
 */
function main() {
  console.log("🔍 Scanning for missing barrel exports...\n");
  
  const missingExports = new Map(); // barrelPath -> [{ name, source, files }]
  
  // Scan source files
  const filesToScan = [
    ...scanFiles("src/components"),
    ...scanFiles("src/hooks"),
    ...scanFiles("src/app"),
    ...scanFiles("src/lib"),
    ...scanFiles("src/inngest"),
    ...scanFiles("src/__tests__"),
  ];
  
  for (const filePath of filesToScan) {
    const content = readFileSync(filePath, "utf-8");
    const imports = extractImports(content, filePath);
    
    for (const { name, source } of imports) {
      // Convert @/lib/activity -> src/lib/activity
      const barrelPath = source.replace("@/", "src/");
      
      // Only check barrel directories we're managing
      if (!BARREL_DIRS.includes(barrelPath)) continue;
      
      // Check if export exists in barrel
      const barrelExports = getBarrelExports(barrelPath);
      
      if (!barrelExports.has(name)) {
        // Check for wildcard exports
        const hasWildcard = Array.from(barrelExports).some((exp) =>
          exp.startsWith("*:")
        );
        
        if (hasWildcard) {
          // Can't determine if it's missing with wildcard exports
          continue;
        }
        
        // Find which file has this export
        const dirExports = findExportsInDir(barrelPath);
        const sourceFile = findExportSource(name, dirExports);
        
        if (sourceFile) {
          if (!missingExports.has(barrelPath)) {
            missingExports.set(barrelPath, []);
          }
          
          const existing = missingExports
            .get(barrelPath)
            .find((e) => e.name === name);
          
          if (existing) {
            existing.files.push(filePath.replace(ROOT + "/", ""));
          } else {
            missingExports.get(barrelPath).push({
              name,
              source: sourceFile,
              files: [filePath.replace(ROOT + "/", "")],
            });
          }
        }
      }
    }
  }
  
  // Report results
  if (missingExports.size === 0) {
    console.log("✅ No missing barrel exports found!\n");
    return;
  }
  
  console.log(`❌ Found missing exports in ${missingExports.size} barrel(s):\n`);
  
  let totalMissing = 0;
  
  for (const [barrelPath, exports] of missingExports.entries()) {
    console.log(`\n📦 ${barrelPath}/index.ts`);
    console.log("─".repeat(60));
    
    // Group by source file
    const bySource = new Map();
    for (const exp of exports) {
      if (!bySource.has(exp.source)) {
        bySource.set(exp.source, []);
      }
      bySource.get(exp.source).push(exp);
    }
    
    for (const [sourceFile, exps] of bySource.entries()) {
      console.log(`\n  From ${sourceFile}.ts:`);
      for (const exp of exps) {
        console.log(`    - ${exp.name}`);
        console.log(`      Used in: ${exp.files[0]}${exp.files.length > 1 ? ` (+${exp.files.length - 1} more)` : ""}`);
        totalMissing++;
      }
      
      if (AUTO_FIX) {
        // Add exports
        for (const exp of exps) {
          addExportToBarrel(barrelPath, exp.name, sourceFile);
        }
        console.log(`      ✅ Added to barrel`);
      }
    }
  }
  
  console.log("\n" + "─".repeat(60));
  console.log(`\nTotal missing exports: ${totalMissing}`);
  
  if (AUTO_FIX) {
    console.log("\n✅ All missing exports have been added to barrel files!");
    console.log("   Run the build again to verify.\n");
  } else {
    console.log("\n💡 Run with --fix to automatically add these exports:\n");
    console.log("   npm run fix:barrels --fix\n");
  }
}

main();
