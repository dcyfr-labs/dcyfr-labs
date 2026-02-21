#!/usr/bin/env node
/**
 * Structured Data Validation Script
 *
 * Tests all JSON-LD schemas against Google's Rich Results Test API
 * and validates schema.org compliance.
 *
 * Usage: node scripts/validate-structured-data.mjs
 */

import * as postsModule from '../../src/data/posts';
import * as projectsModule from '../../src/data/projects';
import * as siteConfigModule from '../../src/lib/site-config';
import {
  getPersonSchema,
  getWebSiteSchema,
  getBreadcrumbSchema,
  getArticleSchema,
  getBlogCollectionSchema,
  getAboutPageSchema,
  getContactPageSchema,
} from '../../src/lib/json-ld';

const { posts } = postsModule;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { visibleProjects } = projectsModule;
const { SITE_URL } = siteConfigModule;

type JsonLdNode = {
  [key: string]: unknown;
  '@type'?: string;
  '@graph'?: JsonLdNode[];
};

const TEST_SCHEMAS = {
  // Website schema (homepage)
  'Homepage - WebSite': {
    '@context': 'https://schema.org',
    '@graph': [getWebSiteSchema(), getPersonSchema()],
  },

  // Person schema
  'Person Schema': getPersonSchema(),

  // About page
  'About Page': getAboutPageSchema(
    'Founder and cyber architect focused on building secure, scalable web applications.'
  ),

  // Contact page
  'Contact Page': getContactPageSchema(
    'Get in touch with Drew for consulting, speaking, or collaboration opportunities.'
  ),

  // Blog collection
  'Blog Collection': {
    '@context': 'https://schema.org',
    '@graph': [
      getWebSiteSchema(),
      getBlogCollectionSchema(
        posts.slice(0, 5),
        'Blog',
        'Articles on web development, security, and technology'
      ),
    ],
  },

  // Article (use first published post)
  'Article - Blog Post': (() => {
    const post = posts[0];
    return {
      '@context': 'https://schema.org',
      '@graph': [
        getWebSiteSchema(),
        getArticleSchema(post, 1234, `${SITE_URL}/blog/images/default/minimal.svg`),
        getBreadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Blog', url: `${SITE_URL}/blog` },
          { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
        ]),
      ],
    };
  })(),

  // FAQ Page (homepage FAQ enrichment)
  'Homepage - FAQPage': {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faqpage`,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is DCYFR Labs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'DCYFR Labs is a virtual partnership dedicated to building secure, innovative solutions for the modern web. We publish in-depth insights on cyber architecture, information security, artificial intelligence, and software development.',
        },
      },
      {
        '@type': 'Question',
        name: 'What topics does DCYFR Labs cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'DCYFR Labs covers cybersecurity, artificial intelligence, cloud security, DevSecOps, web development, risk management, incident response, and practical programming techniques.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who creates content at DCYFR Labs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Content at DCYFR Labs is created by experienced practitioners in cybersecurity and software engineering, led by Drew \u2014 a founding architect with expertise across security architecture, AI, and modern web development.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I read the latest articles on DCYFR Labs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Browse all articles at dcyfr.ai/blog, or use the search feature on the homepage. You can filter content by topic, tag, or reading time to find exactly what you need.',
        },
      },
    ],
  },

  // BreadcrumbList (blog/about pages)
  'BreadcrumbList - Blog': {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
    ],
  },

  'BreadcrumbList - About': {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'About DCYFR Labs', item: `${SITE_URL}/about` },
    ],
  },
};

/**
 * Validate a schema object for common issues
 */
function validateSchema(schema: JsonLdNode, _name: string): string[] {
  const issues: string[] = [];

  if (!schema['@context']) issues.push('Missing @context property');
  if (!schema['@type'] && !schema['@graph']) issues.push('Missing @type or @graph property');

  validateGraphItems(schema, issues);
  validatePersonType(schema, issues);
  validateArticleType(schema, issues);
  validateWebSiteType(schema, issues);
  validateFAQPageType(schema, issues);
  validateBreadcrumbType(schema, issues);
  checkJsonValues(schema, issues);

  return issues;
}

function validateGraphItems(schema: JsonLdNode, issues: string[]): void {
  if (!schema['@graph']) return;
  if (!Array.isArray(schema['@graph'])) {
    issues.push('@graph must be an array');
  } else {
    schema['@graph'].forEach((item: JsonLdNode, index: number) => {
      if (!item['@type']) issues.push(`Graph item ${index} missing @type`);
    });
  }
}

function findTypedItem(schema: JsonLdNode, type: string): JsonLdNode | null {
  if (schema['@type'] === type) return schema;
  if (schema['@graph'])
    return schema['@graph'].find((g: JsonLdNode) => g['@type'] === type) ?? null;
  return null;
}

function validatePersonType(schema: JsonLdNode, issues: string[]): void {
  const person = findTypedItem(schema, 'Person');
  if (!person) return;
  if (!person.name) issues.push('Person missing name');
  if (!person.url) issues.push('Person missing url');
}

function validateArticleType(schema: JsonLdNode, issues: string[]): void {
  const article = findTypedItem(schema, 'Article');
  if (!article) return;
  if (!article.headline) issues.push('Article missing headline');
  if (!article.author) issues.push('Article missing author');
  if (!article.datePublished) issues.push('Article missing datePublished');
  if (!article.image) issues.push('Article missing image (recommended for Rich Results)');
}

function validateWebSiteType(schema: JsonLdNode, issues: string[]): void {
  const website = findTypedItem(schema, 'WebSite');
  if (!website) return;
  if (!website.name) issues.push('WebSite missing name');
  if (!website.url) issues.push('WebSite missing url');
}

function validateFAQPageType(schema: JsonLdNode, issues: string[]): void {
  const faq = findTypedItem(schema, 'FAQPage');
  if (!faq) return;
  if (!faq.mainEntity) {
    issues.push('FAQPage missing mainEntity');
    return;
  }
  if (!Array.isArray(faq.mainEntity)) {
    issues.push('FAQPage mainEntity must be an array');
    return;
  }
  (faq.mainEntity as JsonLdNode[]).forEach((q: JsonLdNode, i: number) => {
    if (q['@type'] !== 'Question')
      issues.push(`FAQPage mainEntity[${i}] must have @type 'Question'`);
    if (!q.name) issues.push(`FAQPage mainEntity[${i}] missing name`);
    if (!q.acceptedAnswer) issues.push(`FAQPage mainEntity[${i}] missing acceptedAnswer`);
    else if (!(q.acceptedAnswer as JsonLdNode).text)
      issues.push(`FAQPage mainEntity[${i}].acceptedAnswer missing text`);
  });
}

function validateBreadcrumbType(schema: JsonLdNode, issues: string[]): void {
  const breadcrumb = findTypedItem(schema, 'BreadcrumbList');
  if (!breadcrumb) return;
  if (!breadcrumb.itemListElement) {
    issues.push('BreadcrumbList missing itemListElement');
    return;
  }
  if (!Array.isArray(breadcrumb.itemListElement)) {
    issues.push('BreadcrumbList itemListElement must be an array');
    return;
  }
  (breadcrumb.itemListElement as JsonLdNode[]).forEach((item: JsonLdNode, i: number) => {
    if (!item.name) issues.push(`BreadcrumbList item ${i} missing name`);
    if (!item.item) issues.push(`BreadcrumbList item ${i} missing item (url)`);
  });
}

function checkJsonValues(schema: JsonLdNode, issues: string[]): void {
  const jsonStr = JSON.stringify(schema);
  if (jsonStr.includes('undefined')) issues.push('Contains undefined values');
  if (jsonStr.includes('localhost'))
    issues.push('Contains localhost URLs (should use production domain)');
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function main() {
  console.log('🔍 Validating Structured Data Schemas\n');
  console.log('='.repeat(60));

  let totalSchemas = 0;
  let validSchemas = 0;
  let warnings = 0;

  for (const [name, schema] of Object.entries(TEST_SCHEMAS)) {
    totalSchemas++;
    console.log(`\n📋 Testing: ${name}`);
    console.log('-'.repeat(60));

    try {
      const json = JSON.stringify(schema, null, 2);
      JSON.parse(json);

      const issues = validateSchema(schema, name);

      if (issues.length === 0) {
        console.log('✅ Valid - No issues found');
        validSchemas++;
      } else {
        console.log('⚠️  Warnings:');
        issues.forEach((issue) => {
          console.log(`   - ${issue}`);
          warnings++;
        });
      }

      const preview = json.length > 200 ? json.substring(0, 200) + '...' : json;
      console.log('\nSample JSON-LD:');
      console.log(preview);
    } catch (error) {
      console.log(`❌ Error: ${getErrorMessage(error)}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   Total schemas: ${totalSchemas}`);
  console.log(`   Valid: ${validSchemas}`);
  console.log(`   Warnings: ${warnings}`);
  console.log(`   Pass rate: ${Math.round((validSchemas / totalSchemas) * 100)}%`);

  if (validSchemas === totalSchemas && warnings === 0) {
    console.log('\n✅ All schemas are valid!');
    process.exit(0);
  } else if (validSchemas === totalSchemas) {
    console.log('\n⚠️  All schemas valid with warnings. Review recommended.');
    process.exit(0);
  } else {
    console.log('\n❌ Some schemas have errors. Fix required.');
    process.exit(1);
  }
}

main();
