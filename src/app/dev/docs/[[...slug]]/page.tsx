import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Dev Docs",
  description: "Developer documentation",
  path: "/dev/docs",
});

export default function DevDocsPage() {
  return (
    <div className="text-center py-24">
      <h1 className="text-3xl font-bold mb-4">Developer Documentation</h1>
      <p className="text-muted-foreground">Documentation page coming soon.</p>
    </div>
  );
}
