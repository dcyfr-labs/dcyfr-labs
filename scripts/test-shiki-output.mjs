/**
 * Test script to verify Shiki HTML output
 *
 * This script tests what HTML rehype-pretty-code + Shiki generate
 * for code blocks to verify our CSS selectors will match.
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const markdown = `
\`\`\`typescript
const message = "Hello, World!";
function greet(name: string): void {
  console.log(message + " " + name);
}
\`\`\`
`;

const rehypePrettyCodeOptions = {
  theme: {
    dark: "github-dark",
    light: "github-light",
  },
  defaultLang: "plaintext",
  keepBackground: false,
};

async function testShikiOutput() {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, rehypePrettyCodeOptions)
    .use(rehypeStringify)
    .process(markdown);

  console.log("Generated HTML:");
  console.log("=".repeat(80));
  console.log(String(file));
  console.log("=".repeat(80));
}

testShikiOutput().catch(console.error);
