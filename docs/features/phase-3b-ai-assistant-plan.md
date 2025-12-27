# Phase 3B: AI Content Assistant - Implementation Plan

**Date:** December 26, 2025
**Status:** Planning
**Priority:** HIGH (Selected for Phase 3B implementation)
**Estimated Time:** 6-8 hours

---

## 🎯 Objectives

Build an AI-powered chat interface that helps users explore blog content through natural conversation, using RAG (Retrieval Augmented Generation) to provide accurate, contextual answers with citations.

**Core Value Proposition:**
- **Conversational learning:** Ask questions naturally instead of browsing
- **Content discovery:** Find relevant posts buried in archives
- **Personalized paths:** AI suggests related content based on context
- **Code generation:** Get code examples from explanations
- **Always current:** Answers grounded in actual blog content (no hallucinations)

---

## 🏗️ Architecture Overview

### **High-Level Flow**

```
User Question → Embedding → Vector Search → Retrieve Posts → LLM + Context → Answer + Citations
```

### **Tech Stack Decision Matrix**

| Component | Option A | Option B (CHOSEN) | Reason |
|-----------|----------|-------------------|--------|
| **Vector DB** | Pinecone (cloud) | Vercel Postgres + pgvector | Self-hosted, zero API costs, same infra as Redis |
| **Embeddings** | OpenAI text-embedding-3-small | OpenAI text-embedding-3-small | Best quality/cost ratio ($0.02/1M tokens) |
| **LLM** | GPT-4 Turbo | GPT-4o-mini | 60x cheaper, faster, sufficient for RAG |
| **Framework** | LangChain | Vercel AI SDK | Simpler, Next.js native, better DX |

### **Why Vercel AI SDK over LangChain?**

✅ **Simpler:** No complex chains, just `streamText()` with context
✅ **Next.js native:** Works seamlessly with App Router
✅ **Streaming support:** Real-time responses (like ChatGPT)
✅ **Type-safe:** Full TypeScript support
✅ **Smaller bundle:** ~10KB vs LangChain's ~200KB

---

## 📦 Implementation Components

### **1. Vector Database Setup** (`src/lib/ai/vector-store.ts`)

**Vercel Postgres + pgvector Extension**

```typescript
// Database schema
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE blog_embeddings (
  id SERIAL PRIMARY KEY,
  post_id VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  series VARCHAR(255),
  url TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON blog_embeddings USING ivfflat (embedding vector_cosine_ops);
```

**Embedding Generation:**

```typescript
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  return response.data[0].embedding;
}

export async function embedBlogPost(post: Post) {
  // Combine title, summary, and content excerpt for embedding
  const textToEmbed = `${post.title}\n\n${post.summary}\n\n${post.body.slice(0, 1500)}`;

  const embedding = await generateEmbedding(textToEmbed);

  await db.query(`
    INSERT INTO blog_embeddings (post_id, title, summary, content, tags, series, url, embedding, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (post_id) DO UPDATE SET
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      content = EXCLUDED.content,
      tags = EXCLUDED.tags,
      embedding = EXCLUDED.embedding,
      metadata = EXCLUDED.metadata
  `, [
    post.id,
    post.title,
    post.summary,
    post.body.slice(0, 1500),
    post.tags,
    post.series?.name || null,
    `/blog/${post.id}`,
    `[${embedding.join(",")}]`, // pgvector format
    JSON.stringify({ readingTime: post.readingTime.minutes })
  ]);
}
```

**Similarity Search:**

```typescript
export async function searchSimilarPosts(
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query);

  const results = await db.query(`
    SELECT
      post_id,
      title,
      summary,
      content,
      tags,
      series,
      url,
      metadata,
      1 - (embedding <=> $1::vector) AS similarity
    FROM blog_embeddings
    WHERE 1 - (embedding <=> $1::vector) > 0.7  -- Similarity threshold
    ORDER BY embedding <=> $1::vector
    LIMIT $2
  `, [`[${queryEmbedding.join(",")}]`, limit]);

  return results.rows.map(row => ({
    postId: row.post_id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    tags: row.tags,
    series: row.series,
    url: row.url,
    similarity: row.similarity,
    metadata: row.metadata,
  }));
}
```

---

### **2. AI Chat API Route** (`src/app/api/ai/chat/route.ts`)

**Streaming Response with Vercel AI SDK:**

```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { searchSimilarPosts } from "@/lib/ai/vector-store";

export const runtime = "edge"; // Edge runtime for low latency

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    // 1. Retrieve relevant blog posts via vector search
    const relevantPosts = await searchSimilarPosts(latestMessage, 5);

    if (relevantPosts.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No relevant content found. Try a different question."
        }),
        { status: 404 }
      );
    }

    // 2. Build context from retrieved posts
    const context = relevantPosts
      .map((post, idx) => `
[${idx + 1}] ${post.title}
URL: ${post.url}
Summary: ${post.summary}
Content: ${post.content}
Tags: ${post.tags.join(", ")}
${post.series ? `Series: ${post.series}` : ""}
      `)
      .join("\n\n---\n\n");

    // 3. Create system prompt with context
    const systemPrompt = `You are a helpful AI assistant for the DCYFR Labs blog, specializing in web development, security, React, Next.js, and TypeScript.

Your role:
- Answer questions based ONLY on the blog content provided below
- Provide accurate, concise answers with code examples when relevant
- Always cite sources using [1], [2] notation
- If the answer isn't in the content, say "I don't have information about that in the blog"
- Suggest related topics the user might find interesting
- Use a friendly, technical tone

Blog Content Context:
${context}

Guidelines:
1. Use citations like [1] or [2] to reference specific posts
2. Provide code examples in TypeScript when applicable
3. Link to relevant blog posts for deeper reading
4. If multiple posts are relevant, summarize key points from each
5. Be concise but thorough (2-3 paragraphs max unless code examples needed)`;

    // 4. Stream response with Vercel AI SDK
    const result = await streamText({
      model: openai("gpt-4o-mini"), // Fast, cheap, good quality
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error("[AI Chat] Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500 }
    );
  }
}
```

---

### **3. Chat UI Component** (`src/components/ai/ai-chat.tsx`)

**Modern ChatGPT-style Interface:**

```typescript
"use client";

import { useChat } from "ai/react";
import { useState } from "react";
import { Send, Sparkles, XCircle, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GLASS, INTERACTIVE, SPACING } from "@/lib/design-tokens";

export function AIChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/ai/chat",
  });

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
            INTERACTIVE.scalePress
          )}
          size="icon"
        >
          <Sparkles className="h-6 w-6" />
          <span className="sr-only">Open AI Assistant</span>
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card
          className={cn(
            "fixed bottom-6 right-6 z-50 w-full max-w-md h-[600px] flex flex-col",
            GLASS.card,
            "shadow-2xl border"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Ask me anything about the blog!</p>
                <div className="mt-4 space-y-2">
                  <SuggestedQuestion onClick={(q) => handleInputChange({ target: { value: q } })}>
                    How do I prevent XSS attacks?
                  </SuggestedQuestion>
                  <SuggestedQuestion onClick={(q) => handleInputChange({ target: { value: q } })}>
                    What's the difference between SSR and SSG?
                  </SuggestedQuestion>
                  <SuggestedQuestion onClick={(q) => handleInputChange({ target: { value: q } })}>
                    Show me React security best practices
                  </SuggestedQuestion>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <Message
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-pulse">●</div>
                <div className="animate-pulse animation-delay-200">●</div>
                <div className="animate-pulse animation-delay-400">●</div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                {error.message}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Ask a question..."
                className="resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </form>
        </Card>
      )}
    </>
  );
}

function Message({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? "U" : <Sparkles className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "flex-1 rounded-lg px-4 py-2 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <MessageContent content={content} />
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Parse citations [1], [2] and convert to links
  const parts = content.split(/(\[\d+\])/g);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {parts.map((part, idx) => {
        const citationMatch = part.match(/\[(\d+)\]/);
        if (citationMatch) {
          return (
            <sup key={idx} className="text-primary hover:underline cursor-pointer">
              {part}
            </sup>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </div>
  );
}

function SuggestedQuestion({
  children,
  onClick
}: {
  children: string;
  onClick: (question: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(children)}
      className={cn(
        "w-full text-left px-3 py-2 text-sm rounded-lg",
        "bg-muted hover:bg-muted/80",
        INTERACTIVE.press
      )}
    >
      {children}
    </button>
  );
}
```

---

### **4. Embedding Generation Script** (`scripts/generate-embeddings.ts`)

**One-time + incremental embedding generation:**

```typescript
import { posts } from "@/data/posts";
import { embedBlogPost } from "@/lib/ai/vector-store";

async function generateAllEmbeddings() {
  console.log(`[Embeddings] Generating embeddings for ${posts.length} posts...`);

  let processed = 0;
  let errors = 0;

  for (const post of posts) {
    if (post.archived) {
      console.log(`[Embeddings] Skipping archived post: ${post.id}`);
      continue;
    }

    try {
      await embedBlogPost(post);
      processed++;
      console.log(`[Embeddings] ✅ ${post.id} (${processed}/${posts.length})`);

      // Rate limit: 3000 RPM for OpenAI
      await new Promise(resolve => setTimeout(resolve, 20));

    } catch (error) {
      errors++;
      console.error(`[Embeddings] ❌ ${post.id}:`, error);
    }
  }

  console.log(`\n[Embeddings] Complete!`);
  console.log(`  - Processed: ${processed}`);
  console.log(`  - Errors: ${errors}`);
  console.log(`  - Total cost: ~$${(processed * 0.00002).toFixed(4)} USD`);
}

generateAllEmbeddings();
```

**Add to package.json:**

```json
{
  "scripts": {
    "ai:embeddings": "tsx scripts/generate-embeddings.ts",
    "build": "npm run ai:embeddings && npm run build:search && next build"
  }
}
```

---

## 🎨 User Experience Flows

### **Flow 1: First-Time User**

```
1. User lands on homepage
2. Sees floating AI Assistant button (bottom-right)
3. Clicks → Chat panel opens
4. Sees suggested questions:
   - "How do I prevent XSS attacks?"
   - "What's the difference between SSR and SSG?"
   - "Show me React security best practices"
5. Clicks suggestion → AI streams response
6. Response includes:
   - Concise answer (2-3 paragraphs)
   - Code examples in TypeScript
   - Citations: [1], [2], [3]
   - Links to full blog posts
7. User clicks citation → opens blog post in new tab
8. User asks follow-up → AI maintains context
```

### **Flow 2: Learning Path Discovery**

```
User: "I want to learn about web security"

AI: Based on the blog content, here's a recommended learning path:

1. [1] Start with "Understanding XSS Attacks" - Learn the basics of cross-site scripting vulnerabilities and how they work.

2. [2] Then read "CSRF Protection in Next.js" - Understand cross-site request forgery and token-based protection.

3. [3] Dive into "Content Security Policy Guide" - Set up CSP headers to prevent injection attacks.

4. [4] Advanced: "Security Headers Checklist" - Comprehensive guide to all security headers.

Would you like me to explain any of these topics in more detail?

[Citations]
[1] /blog/xss-basics
[2] /blog/csrf-nextjs
[3] /blog/csp-guide
[4] /blog/security-headers
```

### **Flow 3: Code Example Request**

```
User: "Show me how to validate user input in Next.js"

AI: Here's a secure input validation pattern using Zod in Next.js:

```typescript
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().min(18).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();

  // Validate input
  const result = userSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: result.error.flatten() },
      { status: 400 }
    );
  }

  // Safe to use validated data
  const { email, name, age } = result.data;
  // ... process
}
```

This pattern is covered in detail in [1] "Form Validation Best Practices".

Key points:
- Always validate on the server (not just client)
- Use type-safe schemas (Zod, Yup, etc.)
- Return structured error messages
- Sanitize output before rendering

[1] /blog/form-validation-nextjs
```

---

## 📊 Analytics & Monitoring

### **Track Chat Interactions in Redis**

```typescript
// src/lib/ai/analytics.ts

export async function trackChatInteraction(data: {
  question: string;
  resultsCount: number;
  responseTime: number;
  satisfied: boolean | null; // Thumbs up/down
}) {
  const key = `ai:chat:${new Date().toISOString().split("T")[0]}`;

  await redis.rpush(key, JSON.stringify({
    ...data,
    timestamp: Date.now(),
  }));

  await redis.expire(key, 60 * 60 * 24 * 90); // 90 days

  // Track popular questions
  await redis.zincrby("ai:popular-questions", 1, data.question.toLowerCase());
}
```

### **Success Metrics**

| Metric | Target | Tracking Method |
|--------|--------|-----------------|
| Average response time | <3s | Log stream duration |
| Citation click-through rate | ≥30% | Track link clicks |
| Follow-up question rate | ≥40% | Count messages per session |
| Satisfaction (thumbs up) | ≥80% | User feedback buttons |
| Zero-result queries | <5% | Log no relevant posts found |
| Cost per 1000 queries | <$0.50 | OpenAI API usage |

---

## 💰 Cost Analysis

### **Estimated Costs (per 1000 queries)**

| Component | Usage | Cost |
|-----------|-------|------|
| **Embeddings (one-time)** | 11 posts × 500 tokens × $0.00002/1K | $0.0001 |
| **Query Embeddings** | 1000 queries × 10 tokens × $0.00002/1K | $0.0002 |
| **LLM Responses (GPT-4o-mini)** | 1000 queries × 500 tokens × $0.15/1M | $0.075 |
| **Total per 1000 queries** | | **$0.08** |

**Monthly estimate (5000 queries):** ~$0.40/month

**Comparison:**
- GPT-4 Turbo: $3.00/1000 queries (40x more expensive)
- Claude 3.5 Sonnet: $1.50/1000 queries (20x more expensive)
- **GPT-4o-mini: $0.08/1000 queries** ✅ **BEST VALUE**

---

## 🚀 Implementation Checklist

### **Phase 1: Infrastructure (2 hours)**

- [ ] Set up Vercel Postgres database
- [ ] Install pgvector extension
- [ ] Create blog_embeddings table
- [ ] Write vector store utilities (embedding, search)
- [ ] Generate embeddings for existing posts
- [ ] Test similarity search accuracy

### **Phase 2: API & Integration (2 hours)**

- [ ] Install Vercel AI SDK (`npm install ai @ai-sdk/openai`)
- [ ] Create `/api/ai/chat` route
- [ ] Implement streaming response
- [ ] Test with curl/Postman
- [ ] Add error handling
- [ ] Add rate limiting (optional)

### **Phase 3: UI Components (3 hours)**

- [ ] Build AIChat component
- [ ] Add floating action button
- [ ] Implement chat panel (messages, input)
- [ ] Add suggested questions
- [ ] Style with design tokens
- [ ] Add loading states
- [ ] Test on mobile

### **Phase 4: Polish & Testing (1 hour)**

- [ ] Add chat analytics tracking
- [ ] Add thumbs up/down feedback
- [ ] Test edge cases (no results, errors)
- [ ] Write unit tests for vector search
- [ ] Document AI assistant usage
- [ ] Deploy to preview

---

## 🔒 Privacy & Security

### **Privacy Considerations**

✅ **Self-hosted embeddings:** No third-party vector DB
✅ **Query logging:** Optional, anonymized, 90-day retention
✅ **GDPR compliance:** No PII stored in embeddings
✅ **Opt-out:** Users can disable chat analytics

### **Security Considerations**

✅ **Rate limiting:** 20 queries/minute per IP
✅ **Input sanitization:** Validate query length (<500 chars)
✅ **Output validation:** Sanitize LLM responses
✅ **API key rotation:** Environment variables only
✅ **Cost protection:** Monthly budget alerts

---

## 📝 Next Steps

**Ready to implement?**

1. **Approve tech stack** (Vercel AI SDK + pgvector)
2. **Set up OpenAI API key** (add to `.env.local`)
3. **Enable Vercel Postgres** (if not already)
4. **Begin Phase 1** (infrastructure setup)

**Estimated total time:** 6-8 hours
**Estimated monthly cost:** $0.40-$2.00 (depending on traffic)

---

**Questions or concerns about this approach?** Let me know if you'd like to explore alternative architectures or adjust the scope!
