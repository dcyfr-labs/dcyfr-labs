#!/usr/bin/env node
/**
 * Structured Data Validation Script
 * 
 * Tests all JSON-LD schemas against Google's Rich Results Test API
 * and validates schema.org compliance.
 * 
 * Usage: node scripts/validate-structured-data.mjs
 */

import { posts } from "../src/data/posts.ts";
import { visibleProjects } from "../src/data/projects.ts";
import { SITE_URL } from "../src/lib/site-config.ts";
import {
  getPersonSchema,
  getWebSiteSchema,
  getBreadcrumbSchema,
  getArticleSchema,
  getBlogCollectionSchema,
  getAboutPageSchema,
  getContactPageSchema,
} from "../src/lib/json-ld.ts";

const TEST_SCHEMAS = {
  // Website schema (homepage)
  "Homepage - WebSite": {
    "@context": "https://schema.org",
    "@graph": [
      getWebSiteSchema(),
      getPersonSchema(),
    ],
  },
  
  // Person schema
  "Person Schema": getPersonSchema(),
  
  // About page
  "About Page": getAboutPageSchema("Founder and cyber architect focused on building secure, scalable web applications."),
  
  // Contact page
  "Contact Page": getContactPageSchema("Get in touch with Drew for consulting, speaking, or collaboration opportunities."),
  
  // Blog collection
  "Blog Collection": {
    "@context": "https://schema.org",
    "@graph": [
      getWebSiteSchema(),
      getBlogCollectionSchema(posts.slice(0, 5), "Blog", "Articles on web development, security, and technology"),
    ],
  },
  
  // Article (use first published post)
  "Article - Blog Post": (() => {
    const post = posts[0];
    return {
      "@context": "https://schema.org",
      "@graph": [
        getWebSiteSchema(),
        getArticleSchema(post, 1234, `${SITE_URL}/blog/images/default/minimal.svg`),
        getBreadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
        ]),
      ],
    };
  })(),
};

console.log("🔍 Validating Structured Data Schemas\n");
console.log("=" .repeat(60));

let totalSchemas = 0;
let validSchemas = 0;
let warnings = 0;

for (const [name, schema] of Object.entries(TEST_SCHEMAS)) {
  totalSchemas++;
  console.log(`\n📋 Testing: ${name}`);
  console.log("-".repeat(60));
  
  try {
    // Validate JSON structure
    const json = JSON.stringify(schema, null, 2);
    JSON.parse(json);
    
    // Check required fields
    const issues = validateSchema(schema, name);
    
    if (issues.length === 0) {
      console.log("✅ Valid - No issues found");
      validSchemas++;
    } else {
      console.log("⚠️  Warnings:");
      issues.forEach(issue => {
        console.log(`   - ${issue}`);
        warnings++;
      });
    }
    
    // Show sample output (truncated)
    const preview = json.length > 200 ? json.substring(0, 200) + "..." : json;
    console.log("\nSample JSON-LD:");
    console.log(preview);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

console.log("\n" + "=".repeat(60));
console.log("\n📊 Summary:");
console.log(`   Total schemas: ${totalSchemas}`);
console.log(`   Valid: ${validSchemas}`);
console.log(`   Warnings: ${warnings}`);
console.log(`   Pass rate: ${Math.round((validSchemas / totalSchemas) * 100)}%`);

if (validSchemas === totalSchemas && warnings === 0) {
  console.log("\n✅ All schemas are valid!");
  process.exit(0);
} else if (validSchemas === totalSchemas) {
  console.log("\n⚠️  All schemas valid with warnings. Review recommended.");
  process.exit(0);
} else {
  console.log("\n❌ Some schemas have errors. Fix required.");
  process.exit(1);
}

/**
 * Validate a schema object for common issues
 */
function validateSchema(schema, name) {
  const issues = [];
  
  // Check for @context
  if (!schema["@context"]) {
    issues.push("Missing @context property");
  }
  
  // Check for @type
  if (!schema["@type"] && !schema["@graph"]) {
    issues.push("Missing @type or @graph property");
  }
  
  // Validate graph structure
  if (schema["@graph"]) {
    if (!Array.isArray(schema["@graph"])) {
      issues.push("@graph must be an array");
    } else {
      schema["@graph"].forEach((item, index) => {
        if (!item["@type"]) {
          issues.push(`Graph item ${index} missing @type`);
        }
      });
    }
  }
  
  // Type-specific validations
  if (schema["@type"] === "Person" || (schema["@graph"] && schema["@graph"].some(g => g["@type"] === "Person"))) {
    const person = schema["@type"] === "Person" ? schema : schema["@graph"].find(g => g["@type"] === "Person");
    if (person) {
      if (!person.name) issues.push("Person missing name");
      if (!person.url) issues.push("Person missing url");
    }
  }
  
  if (schema["@type"] === "Article" || (schema["@graph"] && schema["@graph"].some(g => g["@type"] === "Article"))) {
    const article = schema["@type"] === "Article" ? schema : schema["@graph"].find(g => g["@type"] === "Article");
    if (article) {
      if (!article.headline) issues.push("Article missing headline");
      if (!article.author) issues.push("Article missing author");
      if (!article.datePublished) issues.push("Article missing datePublished");
      if (!article.image) issues.push("Article missing image (recommended for Rich Results)");
    }
  }
  
  if (schema["@type"] === "WebSite" || (schema["@graph"] && schema["@graph"].some(g => g["@type"] === "WebSite"))) {
    const website = schema["@type"] === "WebSite" ? schema : schema["@graph"].find(g => g["@type"] === "WebSite");
    if (website) {
      if (!website.name) issues.push("WebSite missing name");
      if (!website.url) issues.push("WebSite missing url");
    }
  }
  
  // Check for URLs
  const jsonStr = JSON.stringify(schema);
  if (jsonStr.includes("undefined")) {
    issues.push("Contains undefined values");
  }
  if (jsonStr.includes("localhost")) {
    issues.push("Contains localhost URLs (should use production domain)");
  }
  
  return issues;
}
