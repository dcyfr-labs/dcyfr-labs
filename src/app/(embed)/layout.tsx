import type { Metadata } from "next";
import { EmbedThemeHandler } from "./embed-theme-handler";

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ margin: 0, padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <EmbedThemeHandler />
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}

