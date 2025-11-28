"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

/**
 * Mermaid Diagram Component
 * 
 * Renders Mermaid diagrams with theme-aware styling.
 * Supports all Mermaid diagram types: flowcharts, sequence diagrams,
 * class diagrams, state diagrams, entity relationship diagrams, etc.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.chart - Mermaid diagram syntax
 * @param {string} [props.id] - Optional unique ID for the diagram
 * 
 * @example
 * ```tsx
 * <Mermaid chart={`
 *   graph LR
 *     A[Client] --> B[Server]
 *     B --> C[Database]
 * `} />
 * ```
 * 
 * @features
 * - Theme-aware: Automatically detects and uses light/dark theme
 * - Responsive: Diagrams scale to container width
 * - Accessible: Proper ARIA labels and semantic HTML
 * - Error handling: Graceful fallback for invalid syntax
 * - Dynamic updates: Re-renders when theme changes
 * 
 * @notes
 * - Uses Mermaid's built-in "default" and "dark" themes
 * - Monitors theme changes via MutationObserver
 * - Renders client-side only (requires browser environment)
 * 
 * @see https://mermaid.js.org/intro/ for Mermaid syntax
 */
export function Mermaid({ chart, id }: { chart: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);
  const [themeKey, setThemeKey] = useState(0); // Force re-render on theme change

  useEffect(() => {
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme') {
          setThemeKey(prev => prev + 1); // Force re-render
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Detect theme preference
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const htmlElement = document.documentElement;
    const dataTheme = htmlElement.getAttribute('data-theme') || htmlElement.classList.contains('dark');
    const useDarkTheme = dataTheme === 'dark' || (dataTheme !== 'light' && isDark);

    // Initialize Mermaid with theme configuration
    // Use neutral theme for light mode, dark theme for dark mode
    mermaid.initialize({
      startOnLoad: false,
      theme: useDarkTheme ? "dark" : "neutral",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      fontSize: 14,
    });

    async function renderDiagram() {
      if (!ref.current) return;

      try {
        setError(null);
        const { svg } = await mermaid.render(
          id || `mermaid-${Math.random().toString(36).substr(2, 9)}`,
          chart
        );
        ref.current.innerHTML = svg;
        setRendered(true);
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(err instanceof Error ? err.message : "Failed to render diagram");
      }
    }

    renderDiagram();
  }, [chart, id, themeKey]); // Re-render when theme changes

  if (error) {
    return (
      <div 
        className="my-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10"
        role="alert"
        aria-live="polite"
      >
        {/* eslint-disable-next-line no-restricted-syntax */}
        <p className="text-sm font-semibold text-destructive mb-2">
          Mermaid Diagram Error
        </p>
        <pre className="text-xs text-muted-foreground overflow-x-auto">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <div 
      ref={ref} 
      className={`my-6 flex justify-center items-center overflow-x-auto ${
        !rendered ? "min-h-[200px] animate-pulse bg-muted/50 rounded-lg" : ""
      }`}
      role="img"
      aria-label="Mermaid diagram"
    />
  );
}
