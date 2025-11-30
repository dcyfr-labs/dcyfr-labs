"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { cn } from "@/lib/utils";

/**
 * Mermaid Diagram Component
 * 
 * Renders Mermaid diagrams with theme-aware styling and modern aesthetics.
 * Features rounded nodes, softer edges, and smooth animations.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.chart - Mermaid diagram syntax
 * @param {string} [props.id] - Optional unique ID for the diagram
 * @param {string} [props.className] - Optional additional CSS classes
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
 * - Modern styling: Rounded nodes, soft shadows, smooth transitions
 * - Responsive: Diagrams scale to container width
 * - Accessible: Proper ARIA labels and semantic HTML
 * - Error handling: Graceful fallback for invalid syntax
 * - Dynamic updates: Re-renders when theme changes
 * 
 * @see https://mermaid.js.org/intro/ for Mermaid syntax
 */
export function Mermaid({ 
  chart, 
  id,
  className 
}: { 
  chart: string; 
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);
  const [themeKey, setThemeKey] = useState(0);

  useEffect(() => {
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme') {
          setThemeKey(prev => prev + 1);
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

    // Initialize Mermaid with enhanced theme configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: useDarkTheme ? "dark" : "neutral",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      fontSize: 14,
      // Modern styling options
      flowchart: {
        curve: 'basis', // Smoother curves
        padding: 20,
        nodeSpacing: 50,
        rankSpacing: 50,
        htmlLabels: true,
        useMaxWidth: true,
      },
      sequence: {
        actorMargin: 50,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        useMaxWidth: true,
      },
      themeVariables: useDarkTheme ? {
        // Dark theme variables for softer look
        primaryColor: '#3b4252',
        primaryTextColor: '#eceff4',
        primaryBorderColor: '#4c566a',
        lineColor: '#81a1c1',
        secondaryColor: '#434c5e',
        tertiaryColor: '#2e3440',
        background: '#242933',
        mainBkg: '#2e3440',
        nodeBorder: '#4c566a',
        clusterBkg: '#3b4252',
        clusterBorder: '#4c566a',
        titleColor: '#eceff4',
        edgeLabelBackground: '#2e3440',
      } : {
        // Light theme variables for clean look
        primaryColor: '#f8fafc',
        primaryTextColor: '#1e293b',
        primaryBorderColor: '#cbd5e1',
        lineColor: '#64748b',
        secondaryColor: '#f1f5f9',
        tertiaryColor: '#e2e8f0',
        background: '#ffffff',
        mainBkg: '#f8fafc',
        nodeBorder: '#cbd5e1',
        clusterBkg: '#f1f5f9',
        clusterBorder: '#e2e8f0',
        titleColor: '#1e293b',
        edgeLabelBackground: '#ffffff',
      },
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
  }, [chart, id, themeKey]);

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
      className={cn(
        "mermaid-container",
        !rendered && "min-h-[200px] animate-pulse",
        className
      )}
    >
      <div 
        ref={ref} 
        className="flex justify-center items-center"
        role="img"
        aria-label="Mermaid diagram"
      />
    </div>
  );
}
