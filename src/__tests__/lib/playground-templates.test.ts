import { describe, it, expect } from "vitest";
import {
  getTemplate,
  listTemplates,
  templateToStackBlitzProject,
  PLAYGROUND_TEMPLATES,
} from "@/lib/playground-templates";

describe("Playground Templates", () => {
  describe("template registry", () => {
    it("contains react-counter template", () => {
      expect(PLAYGROUND_TEMPLATES["react-counter"]).toBeDefined();
    });

    it("contains typescript-todo template", () => {
      expect(PLAYGROUND_TEMPLATES["typescript-todo"]).toBeDefined();
    });

    it("contains react-hook template", () => {
      expect(PLAYGROUND_TEMPLATES["react-hook-localstorage"]).toBeDefined();
    });

    it("all templates have required properties", () => {
      Object.values(PLAYGROUND_TEMPLATES).forEach((template) => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.language).toBeDefined();
        expect(template.files).toBeDefined();
      });
    });
  });

  describe("getTemplate function", () => {
    it("retrieves template by ID", () => {
      const template = getTemplate("react-counter");
      expect(template).toBeDefined();
      expect(template?.id).toBe("react-counter");
    });

    it("returns null for non-existent template", () => {
      const template = getTemplate("non-existent");
      expect(template).toBeNull();
    });

    it("template contains index.html", () => {
      const template = getTemplate("react-counter");
      expect(template?.files["index.html"]).toBeDefined();
    });

    it("template contains main/app files", () => {
      const template = getTemplate("react-counter");
      const hasMainFile = 
        template?.files["src/main.jsx"] ||
        template?.files["src/main.tsx"];
      expect(hasMainFile).toBeDefined();
    });
  });

  describe("listTemplates function", () => {
    it("returns array of templates", () => {
      const templates = listTemplates();
      expect(Array.isArray(templates)).toBe(true);
    });

    it("returns all templates", () => {
      const templates = listTemplates();
      expect(templates.length).toBe(Object.keys(PLAYGROUND_TEMPLATES).length);
    });

    it("templates have consistent structure", () => {
      const templates = listTemplates();
      templates.forEach((template) => {
        expect(template.id).toBeDefined();
        expect(template.files).toBeDefined();
      });
    });
  });

  describe("templateToStackBlitzProject function", () => {
    it("converts template to StackBlitz format", () => {
      const template = getTemplate("react-counter");
      if (!template) throw new Error("Template not found");

      const project = templateToStackBlitzProject(template);
      expect(project.files).toBeDefined();
      expect(project.title).toBe(template.name);
      expect(project.description).toBe(template.description);
    });

    it("includes all template files", () => {
      const template = getTemplate("react-counter");
      if (!template) throw new Error("Template not found");

      const project = templateToStackBlitzProject(template);
      expect(project.files).toEqual(template.files);
    });

    it("sets template type for JSX files", () => {
      const template = getTemplate("react-counter");
      if (!template) throw new Error("Template not found");

      const project = templateToStackBlitzProject(template);
      expect(project.template).toBeDefined();
    });
  });

  describe("React Counter template", () => {
    it("has App and main components", () => {
      const template = getTemplate("react-counter");
      expect(template?.files["src/App.jsx"]).toBeDefined();
      expect(template?.files["src/main.jsx"]).toBeDefined();
    });

    it("includes state management", () => {
      const template = getTemplate("react-counter");
      const appContent = template?.files["src/App.jsx"] || "";
      expect(appContent).toContain("useState");
    });

    it("has increment and decrement buttons", () => {
      const template = getTemplate("react-counter");
      const appContent = template?.files["src/App.jsx"] || "";
      expect(appContent).toContain("Increment");
      expect(appContent).toContain("Decrement");
    });
  });

  describe("TypeScript Todo template", () => {
    it("uses TypeScript file extensions", () => {
      const template = getTemplate("typescript-todo");
      const files = template?.files || {};
      const hasTypeScriptFile = Object.keys(files).some((name) =>
        name.endsWith(".tsx") || name.endsWith(".ts")
      );
      expect(hasTypeScriptFile).toBe(true);
    });

    it("defines Todo interface", () => {
      const template = getTemplate("typescript-todo");
      const appContent = template?.files["src/App.tsx"] || "";
      expect(appContent).toContain("interface Todo");
    });

    it("has todo CRUD operations", () => {
      const template = getTemplate("typescript-todo");
      const appContent = template?.files["src/App.tsx"] || "";
      expect(appContent).toContain("addTodo");
      expect(appContent).toContain("toggleTodo");
      expect(appContent).toContain("deleteTodo");
    });
  });

  describe("React Hook template", () => {
    it("defines custom hook", () => {
      const template = getTemplate("react-hook-localstorage");
      const hookContent = template?.files["src/hooks/useLocalStorage.js"] || "";
      expect(hookContent).toContain("useLocalStorage");
    });

    it("uses localStorage API", () => {
      const template = getTemplate("react-hook-localstorage");
      const hookContent = template?.files["src/hooks/useLocalStorage.js"] || "";
      expect(hookContent).toContain("localStorage");
    });

    it("demonstrates localStorage persistence", () => {
      const template = getTemplate("react-hook-localstorage");
      const appContent = template?.files["src/App.jsx"] || "";
      expect(appContent).toContain("useLocalStorage");
      expect(appContent).toContain("userName");
    });
  });

  describe("template file structure", () => {
    it("all templates have index.html", () => {
      listTemplates().forEach((template) => {
        expect(template.files["index.html"]).toBeDefined();
        expect(template.files["index.html"]).toContain("<!doctype html");
      });
    });

    it("all templates have a main entry point", () => {
      listTemplates().forEach((template) => {
        const hasMainFile =
          template.files["src/main.jsx"] ||
          template.files["src/main.tsx"] ||
          template.files["src/index.js"];
        expect(hasMainFile).toBeDefined();
      });
    });

    it("template files are non-empty", () => {
      listTemplates().forEach((template) => {
        Object.entries(template.files).forEach(([filename, content]) => {
          expect(content.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
