import { describe, it, expect } from "vitest";
import { getAllDocs, getDocBySlug, searchDocs, extractTableOfContents } from "@/lib/docs";

describe("Documentation System", () => {
  describe("getAllDocs", () => {
    it("should return an array of documentation files", () => {
      const docs = getAllDocs();
      expect(Array.isArray(docs)).toBe(true);
      
      if (docs.length > 0) {
        const firstDoc = docs[0];
        expect(firstDoc).toHaveProperty("id");
        expect(firstDoc).toHaveProperty("slug");
        expect(firstDoc).toHaveProperty("filePath");
        expect(firstDoc).toHaveProperty("content");
        expect(firstDoc).toHaveProperty("category");
        expect(firstDoc).toHaveProperty("meta");
        expect(firstDoc.meta).toHaveProperty("title");
      }
    });
    
    it("should sort docs by category, order, and title", () => {
      const docs = getAllDocs();
      
      // Check if sorting is working
      for (let i = 1; i < docs.length; i++) {
        const prev = docs[i - 1];
        const curr = docs[i];
        
        // Category comparison
        if (prev.category !== curr.category) {
          expect(prev.category.localeCompare(curr.category)).toBeLessThanOrEqual(0);
        } else {
          // Within same category, check order
          const prevOrder = prev.meta.order || 999;
          const currOrder = curr.meta.order || 999;
          
          if (prevOrder !== currOrder) {
            expect(prevOrder).toBeLessThanOrEqual(currOrder);
          }
        }
      }
    });

    it("should exclude private content from documentation", () => {
      const docs = getAllDocs();
      
      // Verify no docs contain private paths
      docs.forEach(doc => {
        expect(doc.relativePath).not.toMatch(/\/private\//);
        expect(doc.relativePath).not.toMatch(/^private\//);
        expect(doc.slug).not.toMatch(/\/private\//);
        expect(doc.slug).not.toMatch(/^private\//);
      });
      
      // Verify private content is not accessible
      const privateDoc = getDocBySlug("security/private/api-security-audit-2025-12-11");
      expect(privateDoc).toBeNull();
    });
  });

  describe("getDocBySlug", () => {
    it("should return null for non-existent slug", () => {
      const doc = getDocBySlug("non-existent-doc");
      expect(doc).toBeNull();
    });
    
    it("should return doc for existing slug", () => {
      const allDocs = getAllDocs();
      
      if (allDocs.length > 0) {
        const firstDoc = allDocs[0];
        const foundDoc = getDocBySlug(firstDoc.slug);
        expect(foundDoc).not.toBeNull();
        expect(foundDoc?.slug).toBe(firstDoc.slug);
      }
    });
  });

  describe("searchDocs", () => {
    it("should return empty array for non-matching query", () => {
      const results = searchDocs("xyznonexistentquery123");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
    
    it("should return results for matching query", () => {
      // Search for common terms that should exist in documentation
      const results = searchDocs("the");
      expect(Array.isArray(results)).toBe(true);
      
      // Each result should be a valid doc
      results.forEach(doc => {
        expect(doc).toHaveProperty("slug");
        expect(doc).toHaveProperty("meta");
        expect(doc).toHaveProperty("content");
      });
    });
    
    it("should be case insensitive", () => {
      const allDocs = getAllDocs();
      
      if (allDocs.length > 0) {
        const firstDoc = allDocs[0];
        const title = firstDoc.meta.title;
        
        if (title && title.length > 3) {
          const searchTerm = title.substring(0, 3);
          const lowerResults = searchDocs(searchTerm.toLowerCase());
          const upperResults = searchDocs(searchTerm.toUpperCase());
          
          expect(lowerResults.length).toBe(upperResults.length);
        }
      }
    });
  });

  describe("extractTableOfContents", () => {
    it("should extract headings from markdown content", () => {
      const markdown = `
# Main Heading
Some content here.

## Sub Heading
More content.

### Deep Heading
Even more content.

## Another Sub Heading
Final content.
      `;
      
      const toc = extractTableOfContents(markdown);
      expect(Array.isArray(toc)).toBe(true);
      expect(toc.length).toBe(4);
      
      expect(toc[0]).toEqual({
        id: "main-heading",
        title: "Main Heading",
        level: 1
      });
      
      expect(toc[1]).toEqual({
        id: "sub-heading",
        title: "Sub Heading",
        level: 2
      });
      
      expect(toc[2]).toEqual({
        id: "deep-heading",
        title: "Deep Heading",
        level: 3
      });
      
      expect(toc[3]).toEqual({
        id: "another-sub-heading",
        title: "Another Sub Heading",
        level: 2
      });
    });
    
    it("should return empty array for content without headings", () => {
      const markdown = "Just some plain text without any headings.";
      const toc = extractTableOfContents(markdown);
      expect(Array.isArray(toc)).toBe(true);
      expect(toc.length).toBe(0);
    });
    
    it("should handle special characters in headings", () => {
      const markdown = "## Heading with (special) chars & symbols!";
      const toc = extractTableOfContents(markdown);
      expect(toc.length).toBe(1);
      expect(toc[0].id).toBe("heading-with-special-chars-symbols");
      expect(toc[0].title).toBe("Heading with (special) chars & symbols!");
    });
    
    it("should generate unique IDs for duplicate headings", () => {
      const markdown = `
## Current Status
Some content.

## Current Status
More content.

## Current Status
Even more content.
      `;
      
      const toc = extractTableOfContents(markdown);
      expect(toc.length).toBe(3);
      expect(toc[0].id).toBe("current-status");
      expect(toc[1].id).toBe("current-status-1");
      expect(toc[2].id).toBe("current-status-2");
    });
    
    it("should handle headings that produce empty IDs", () => {
      const markdown = `
## !!!
Some content.

### &&&
More content.
      `;
      
      const toc = extractTableOfContents(markdown);
      expect(toc.length).toBe(2);
      
      // Headings with only special chars become "heading" and "heading-1"
      expect(toc[0].id).toBe("heading");
      expect(toc[0].title).toBe("!!!");
      
      expect(toc[1].id).toBe("heading-1");
      expect(toc[1].title).toBe("&&&");
    });
  });
});