"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MDX } from "@/components/common/mdx";
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";

interface CodeDemoProps {
  language?: string;
  children: string;
  input?: string;
  output?: string;
  embedUrl?: string;
  title?: string;
}

export function CodeDemo({
  language = "typescript",
  children,
  input,
  output,
  embedUrl,
  title = "Demo",
}: CodeDemoProps) {
  const [activeTab, setActiveTab] = useState("code");

  return (
    <div className={SPACING.content}>
      {title && <h3 className={`${TYPOGRAPHY.h3.standard} mb-3`}>{title}</h3>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="code">Code</TabsTrigger>
          {input && <TabsTrigger value="input">Input</TabsTrigger>}
          {output && <TabsTrigger value="output">Output</TabsTrigger>}
          {embedUrl && <TabsTrigger value="live">Live</TabsTrigger>}
        </TabsList>

        <TabsContent value="code">
          <MDX source={`\`\`\`${language}\n${children}\n\`\`\``} />
        </TabsContent>

        {input && (
          <TabsContent value="input">
            <pre className="bg-muted/50 p-3 rounded-md">
              <code>{input}</code>
            </pre>
          </TabsContent>
        )}

        {output && (
          <TabsContent value="output">
            <pre className="bg-muted/50 p-3 rounded-md">
              <code>{output}</code>
            </pre>
          </TabsContent>
        )}

        {embedUrl && (
          <TabsContent value="live">
            <iframe
              src={embedUrl}
              className="w-full h-[500px] border rounded-lg"
              title={`Live demo: ${title}`}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
