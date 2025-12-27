/**
 * Playground Templates Registry
 * Central location for all interactive code examples
 */

import { reactCounterTemplate } from "./react-counter";
import { typescriptTodoTemplate } from "./typescript-todo";
import { reactHookTemplate } from "./react-hook";

export interface PlaygroundTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  files: Record<string, string>;
}

// Registry of all available templates
export const PLAYGROUND_TEMPLATES: Record<string, PlaygroundTemplate> = {
  [reactCounterTemplate.id]: reactCounterTemplate,
  [typescriptTodoTemplate.id]: typescriptTodoTemplate,
  [reactHookTemplate.id]: reactHookTemplate,
};

/**
 * Get a template by ID
 */
export function getTemplate(id: string): PlaygroundTemplate | null {
  return PLAYGROUND_TEMPLATES[id] || null;
}

/**
 * List all available templates
 */
export function listTemplates(): PlaygroundTemplate[] {
  return Object.values(PLAYGROUND_TEMPLATES);
}

/**
 * Convert template to StackBlitz format
 */
export function templateToStackBlitzProject(template: PlaygroundTemplate) {
  return {
    files: template.files,
    title: template.name,
    description: template.description,
    template: template.language === "jsx" ? "node" : template.language,
  };
}
