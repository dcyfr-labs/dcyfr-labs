import fs from "fs";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

const DOCS_DIR = path.join(process.cwd(), "docs");

export interface DocMeta {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  lastModified?: string;
  order?: number;
}

export interface DocFile {
  id: string;
  slug: string;
  filePath: string;
  relativePath: string;
  meta: DocMeta;
  content: string;
  category: string;
  subcategory?: string;
  lastModified: Date;
}

export interface DocCategory {
  name: string;
  path: string;
  files: DocFile[];
  subcategories: DocCategory[];
}

/**
 * Get all documentation files from the docs directory
 */
export function getAllDocs(): DocFile[] {
  const docs: DocFile[] = [];
  
  function readDocsRecursive(dir: string, basePath: string = ""): void {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isFile() && entry.name.endsWith(".md")) {
        // Skip private content - files in any private/ subdirectory
        if (relativePath.includes("/private/") || relativePath.startsWith("private/")) {
          return;
        }
        
        try {
          const fileContent = fs.readFileSync(fullPath, "utf8");
          const { data: frontmatter, content } = matter(fileContent, {
            engines: {
              yaml: (s: string) => yaml.load(s, { schema: yaml.DEFAULT_SCHEMA }) as object
            }
          });
          const stats = fs.statSync(fullPath);
          
          // Extract category from path
          const pathParts = relativePath.split(path.sep);
          const category = pathParts[0] || "general";
          const subcategory = pathParts.length > 2 ? pathParts[1] : undefined;
          
          // Create slug from file path
          const slug = relativePath
            .replace(/\.md$/, "")
            .replace(/\\/g, "/") // Normalize path separators
            .replace(/^\/+|\/+$/g, ""); // Remove leading/trailing slashes
          
          const doc: DocFile = {
            id: slug,
            slug,
            filePath: fullPath,
            relativePath,
            meta: {
              title: frontmatter.title || entry.name.replace(/\.md$/, ""),
              description: frontmatter.description,
              category: frontmatter.category || category,
              tags: frontmatter.tags || [],
              order: frontmatter.order || 999,
              ...frontmatter,
            },
            content,
            category,
            subcategory,
            lastModified: stats.mtime,
          };
          
          docs.push(doc);
        } catch (error) {
          console.warn(`Failed to process doc file ${fullPath}:`, error);
        }
      } else if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "private") {
        // Skip private directories entirely
        readDocsRecursive(fullPath, relativePath);
      }
    }
  }
  
  readDocsRecursive(DOCS_DIR);
  
  // Sort by category, then by order, then by title
  return docs.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    if (a.meta.order !== b.meta.order) {
      return (a.meta.order || 999) - (b.meta.order || 999);
    }
    return (a.meta.title || "").localeCompare(b.meta.title || "");
  });
}

/**
 * Get a specific doc by slug, or check for folder-level documents
 */
export function getDocBySlug(slug: string): DocFile | null {
  const docs = getAllDocs();
  const doc = docs.find(doc => doc.slug === slug);
  
  if (doc) {
    return doc;
  }
  
  // If no exact match, try folder-level documents in priority order
  // 1. Try INDEX.md (or index.md) in the folder
  const indexDoc = docs.find(doc => doc.slug === `${slug}/index` || doc.slug === `${slug}/INDEX`);
  if (indexDoc) {
    return indexDoc;
  }
  
  // 2. Try README.md (or readme.md) in the folder  
  const readmeDoc = docs.find(doc => doc.slug === `${slug}/README` || doc.slug === `${slug}/readme`);
  if (readmeDoc) {
    return readmeDoc;
  }
  
  return null;
}

/**
 * Get folder contents for navigation
 */
export function getFolderContents(folderPath: string): {
  indexDoc: DocFile | null;
  readmeDoc: DocFile | null;
  files: DocFile[];
  subfolders: string[];
} {
  const docs = getAllDocs();
  
  // Find all documents in this folder
  const folderDocs = docs.filter(doc => {
    if (folderPath === "") {
      // Root level - only docs with no path separator
      return !doc.slug.includes("/");
    }
    return doc.slug.startsWith(`${folderPath}/`) && 
           doc.slug.split("/").length === folderPath.split("/").length + 1;
  });
  
  // Find INDEX and README documents
  const indexDoc = docs.find(doc => 
    doc.slug === `${folderPath}/index` || doc.slug === `${folderPath}/INDEX`
  ) || null;
  
  const readmeDoc = docs.find(doc => 
    doc.slug === `${folderPath}/README` || doc.slug === `${folderPath}/readme`
  ) || null;
  
  // Filter out INDEX and README from regular files
  const files = folderDocs.filter(doc => 
    !doc.slug.endsWith("/index") && 
    !doc.slug.endsWith("/INDEX") && 
    !doc.slug.endsWith("/README") && 
    !doc.slug.endsWith("/readme")
  );
  
  // Find subfolders
  const subfolders = [...new Set(
    docs
      .filter(doc => doc.slug.startsWith(`${folderPath}/`) && 
                    doc.slug.split("/").length > folderPath.split("/").length + 1)
      .map(doc => {
        const parts = doc.slug.split("/");
        const folderParts = folderPath ? folderPath.split("/") : [];
        return parts[folderParts.length];
      })
  )];
  
  return { indexDoc, readmeDoc, files, subfolders };
}

/**
 * Get docs organized by category
 */
export function getDocsByCategory(): Record<string, DocFile[]> {
  const docs = getAllDocs();
  const byCategory: Record<string, DocFile[]> = {};
  
  for (const doc of docs) {
    if (!byCategory[doc.category]) {
      byCategory[doc.category] = [];
    }
    byCategory[doc.category].push(doc);
  }
  
  return byCategory;
}

/**
 * Search docs by title, description, or content
 */
export function searchDocs(query: string): DocFile[] {
  const docs = getAllDocs();
  const searchTerm = query.toLowerCase();
  
  return docs.filter(doc => {
    const title = (doc.meta.title || "").toLowerCase();
    const description = (doc.meta.description || "").toLowerCase();
    const content = doc.content.toLowerCase();
    const tags = doc.meta.tags?.join(" ").toLowerCase() || "";
    
    return title.includes(searchTerm) ||
           description.includes(searchTerm) ||
           content.includes(searchTerm) ||
           tags.includes(searchTerm);
  });
}

/**
 * Get table of contents from markdown content
 */
export function extractTableOfContents(content: string): Array<{
  id: string;
  title: string;
  level: number;
}> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ id: string; title: string; level: number }> = [];
  const usedIds = new Set<string>();
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    let baseId = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")  // Replace multiple dashes with single dash
      .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
    
    // Ensure ID is not empty
    if (!baseId) {
      baseId = "heading";
    }
    
    // Make ID unique by adding suffix if needed
    let id = baseId;
    let counter = 1;
    while (usedIds.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    
    usedIds.add(id);
    headings.push({ id, title, level });
  }
  
  return headings;
}