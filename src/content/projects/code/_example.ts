/**
 * Example Code Project Content
 * 
 * This is a template for code project content files.
 * Copy this file and customize for your specific project.
 * 
 * File naming: src/content/projects/code/{project-slug}.ts
 */

import type { CodeProjectContent } from "@/data/projects";

const content: CodeProjectContent = {
  // Interactive demo (optional - choose one or more)
  codeDemo: {
    language: "typescript",
    // Option 1: Show code with syntax highlighting
    code: `// Example code snippet
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
    
    // Option 2: Show input/output panels
    input: "World",
    output: "Hello, World!",
    
    // Option 3: Embed from CodeSandbox/StackBlitz
    // embedUrl: "https://codesandbox.io/embed/...",
  },
  
  // Multiple code examples (optional)
  codeblocks: [
    {
      title: "Installation",
      language: "bash",
      code: `npm install my-package`,
    },
    {
      title: "Basic Usage",
      language: "typescript",
      code: `import { myFunction } from 'my-package';

const result = myFunction();
console.log(result);`,
    },
  ],
  
  // Reference links (optional)
  references: [
    { label: "Documentation", href: "https://docs.example.com" },
    { label: "GitHub Repository", href: "https://github.com/example/repo" },
    { label: "Related Blog Post", href: "/blog/my-post" },
  ],
};

export default content;
