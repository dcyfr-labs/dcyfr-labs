<!-- TLP:CLEAR -->

# AI Chatbot Modal Feature

**Status:** Backlog
**Priority:** P2 (High Value)
**Created:** February 1, 2026
**Research:** [FOSS AI Chat Alternatives Comparison](../research/foss-ai-chat-alternatives-comparison.md)

---

## Overview

Add an AI-powered chatbot modal to dcyfr-labs portfolio using **Vercel AI SDK + assistant-ui** for interactive visitor assistance. Provides context-aware help about projects, experience, and portfolio content.

---

## Background

### Research Findings

After evaluating FOSS alternatives (assistant-ui, Vercel AI Chatbot, shadcn-Chatbot-Kit, etc.), **Solution #1: Vercel AI SDK + assistant-ui** was selected:

- ✅ **Perfect stack match** - Next.js 16, React 19, TypeScript, Tailwind v4
- ✅ **Production-ready** - WCAG 2.1 AA compliant, actively maintained
- ✅ **Provider-agnostic** - Works with OpenAI, Anthropic, Groq, etc.
- ✅ **Streaming support** - Built-in real-time response streaming
- ✅ **MIT License** - Fully open source, no vendor lock-in

**Alternative considered:** assistant-ui.com (Y Combinator backed) - Has commercial features but core is FOSS

---

## Use Cases

### Primary Use Cases

1. **Portfolio Guide** - "Tell me about Drew's experience with Next.js"
2. **Project Exploration** - "What projects use React 19?"
3. **Skill Discovery** - "What design systems has Drew worked with?"
4. **Contact Assistance** - "How can I get in touch?"
5. **Content Navigation** - "Show me blog posts about AI"

### User Stories

- As a **recruiter**, I want to quickly find relevant experience without browsing the entire portfolio
- As a **potential client**, I want to ask questions about capabilities and availability
- As a **visitor**, I want contextual help understanding the portfolio structure
- As a **developer**, I want to learn about technical decisions in dcyfr-labs

---

## Solution Architecture

### Technology Stack

```json
{
  "dependencies": {
    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.x",
    "@assistant-ui/react": "^0.5.x",
    "zod": "^3.22.4"
  }
}
```

### File Structure

```
src/
├── app/api/chat/route.ts              # AI chat API endpoint
├── components/ai-chat/
│   ├── index.ts                       # Barrel export
│   ├── ai-chat-modal.tsx              # Modal wrapper
│   └── ai-chat-button.tsx             # Floating trigger button
├── lib/ai-config.ts                   # AI model configuration
└── tests/components/ai-chat/
    └── ai-chat-modal.test.tsx         # Component tests
```

### Component Breakdown

| Component                | Purpose                                   | Lines of Code |
| ------------------------ | ----------------------------------------- | ------------- |
| `route.ts`               | API endpoint (Validate → Queue → Respond) | ~60           |
| `ai-chat-modal.tsx`      | Modal UI with streaming chat              | ~150          |
| `ai-chat-button.tsx`     | Floating trigger button                   | ~30           |
| `ai-chat-modal.test.tsx` | Unit + accessibility tests                | ~100          |
| **Total**                |                                           | **~360**      |

---

## Technical Requirements

### DCYFR Pattern Compliance

- ✅ **Design Tokens** - Use `SPACING`, `TYPOGRAPHY`, `SEMANTIC_COLORS` (mandatory)
- ✅ **Barrel Exports** - `import { AIChatModal } from '@/components/ai-chat'`
- ✅ **API Pattern** - Validate → Queue → Respond (with Zod validation)
- ✅ **Accessibility** - ARIA labels, keyboard navigation (Escape to close)
- ✅ **Testing** - ≥99% pass rate target, accessibility tests included
- ✅ **Mobile-first** - Responsive design with Tailwind breakpoints
- ✅ **Dark Mode** - Support light/dark themes
- ✅ **No Emojis** - Use `lucide-react` icons (MessageCircle, X)

### API Implementation

```typescript
// API Route Pattern (Validate → Queue → Respond)
export async function POST(request: NextRequest) {
  // VALIDATE - Input validation with Zod
  const validatedData = chatRequestSchema.parse(body);

  // RESPOND - Stream text response
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: validatedData.messages,
    system: 'You are a helpful AI assistant for dcyfr-labs portfolio.',
  });

  return result.toDataStreamResponse();
}
```

### Design Token Usage

```typescript
// Mandatory design token usage
import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS } from '@/lib/design-tokens';

// ✅ CORRECT
<div className={`p-${SPACING.content} gap-${SPACING.compact}`}>
  <h2 className={TYPOGRAPHY.h3.standard}>AI Assistant</h2>
  <button className={`bg-${SEMANTIC_COLORS.primary}`}>Send</button>
</div>

// ❌ WRONG (hardcoded values)
<div className="p-4 gap-3">
  <h2 className="text-lg font-semibold">AI Assistant</h2>
  <button className="bg-blue-600">Send</button>
</div>
```

---

## Implementation Plan

### Phase 1: Foundation (1.5 hours)

1. **Install dependencies**

   ```bash
   npm install ai @ai-sdk/openai @assistant-ui/react zod
   ```

2. **Create API route** (`src/app/api/chat/route.ts`)
   - Zod validation schema
   - Streaming text implementation
   - Error handling

3. **Environment setup**
   ```bash
   # .env.local
   OPENAI_API_KEY=sk-...
   ```

### Phase 2: UI Components (1.5 hours)

1. **Modal component** (`ai-chat-modal.tsx`)
   - Chat message display
   - Input form with streaming
   - Backdrop + close handlers
   - Design token integration

2. **Trigger button** (`ai-chat-button.tsx`)
   - Floating action button (bottom-right)
   - Icon: `MessageCircle` from lucide-react
   - State management (open/close)

3. **Barrel export** (`index.ts`)

### Phase 3: Testing (45 minutes)

1. **Unit tests**
   - Modal open/close behavior
   - Form submission
   - Message rendering
   - Keyboard navigation (Escape)

2. **Accessibility tests**
   - ARIA attributes
   - Focus management
   - Screen reader compatibility

3. **Integration tests**
   - API endpoint validation
   - Streaming response handling
   - Error states

### Phase 4: Integration (30 minutes)

1. Add to layout (floating button globally available)
2. Test on all pages
3. Mobile responsiveness verification
4. Dark mode testing

---

## Acceptance Criteria

### Functional Requirements

- [ ] Modal opens on button click
- [ ] Modal closes on backdrop click, Escape key, or X button
- [ ] Chat messages display correctly (user vs assistant)
- [ ] Streaming responses render in real-time
- [ ] Input form validates and submits messages
- [ ] Loading state shows during AI response
- [ ] Error states handle API failures gracefully

### Non-Functional Requirements

- [ ] Design tokens used for all spacing/colors (≥90% compliance)
- [ ] Barrel exports configured
- [ ] Tests pass (≥99% pass rate)
- [ ] TypeScript compiles (0 errors)
- [ ] ESLint passes (0 errors)
- [ ] Accessible (WCAG 2.1 AA compliant)
- [ ] Mobile responsive (breakpoints: sm, md, lg)
- [ ] Dark mode support
- [ ] Performance: <100ms modal open, streaming <2s first token

### Security Requirements

- [ ] API route validates all inputs with Zod
- [ ] Rate limiting considered (future: 10 requests/min per IP)
- [ ] Content sanitization for XSS prevention
- [ ] API key stored in environment variables only
- [ ] No PII logged to console/errors

---

## Out of Scope

### Not Included in Initial Implementation

- ❌ **Conversation persistence** - Chat history not saved (ephemeral sessions)
- ❌ **Multi-turn context** - No long-term conversation memory
- ❌ **Advanced RAG** - No portfolio content indexing (future enhancement)
- ❌ **Voice input/output** - Text-only interface
- ❌ **Multi-language support** - English only
- ❌ **Analytics tracking** - No usage metrics (future: Inngest events)

### Future Enhancements (Separate Backlog Items)

1. **RAG Integration** - Index portfolio content for context-aware responses
2. **Conversation History** - Store chats in Redis/Vercel KV
3. **Analytics Dashboard** - Track most asked questions via Inngest
4. **Custom Prompts** - Per-page system prompts (e.g., blog post summaries)
5. **Multi-model Support** - Switch between GPT-4, Claude, Gemini

---

## Risks & Mitigation

### Technical Risks

| Risk                   | Impact | Probability | Mitigation                                   |
| ---------------------- | ------ | ----------- | -------------------------------------------- |
| **API costs**          | High   | Medium      | Start with free tier, add rate limiting      |
| **Streaming failures** | Medium | Low         | Graceful fallback to non-streaming           |
| **Mobile UX**          | Medium | Medium      | Full-screen modal on mobile (<md breakpoint) |
| **Dark mode issues**   | Low    | Low         | Test both themes thoroughly                  |

### Dependencies

- **External:** OpenAI API availability (99.9% uptime SLA)
- **Internal:** Design token system must be stable
- **Skills:** Requires understanding of Vercel AI SDK streaming patterns

---

## Success Metrics

### Quantitative (Future Analytics)

- **Usage:** >10 chat sessions per week (after launch)
- **Engagement:** >3 messages per session average
- **Satisfaction:** <5% error rate
- **Performance:** <2s first token streaming latency

### Qualitative

- ✅ Positive user feedback on portfolio interactivity
- ✅ Reduced "Contact Me" form spam (FAQs answered by AI)
- ✅ Portfolio differentiation vs. competitors

---

## Cost Estimate

### Development Time

| Phase                  | Time         | Cost (@ $150/hr) |
| ---------------------- | ------------ | ---------------- |
| Phase 1: Foundation    | 1.5 hrs      | $225             |
| Phase 2: UI Components | 1.5 hrs      | $225             |
| Phase 3: Testing       | 0.75 hrs     | $112.50          |
| Phase 4: Integration   | 0.5 hrs      | $75              |
| **Total**              | **4.25 hrs** | **$637.50**      |

### Operational Costs

**OpenAI API** (GPT-4 Turbo):

- Input: $10 / 1M tokens
- Output: $30 / 1M tokens
- **Estimated:** ~$5-10/month (100 sessions, 10 messages each)

**Total First Year:** ~$700 (dev) + ~$100 (API) = **$800**

---

## Related Documentation

- [FOSS AI Chat Alternatives Research](../research/foss-ai-chat-alternatives-comparison.md)
- [Component Patterns Guide](../ai/component-patterns.md)
- [Design System Documentation](../ai/design-system.md)
- [API Patterns (Validate → Queue → Respond)](../ai/best-practices.md)
- [Testing Strategy](../testing/README.md)

---

## Decision Log

### February 1, 2026 - Solution Selection

**Decision:** Use Vercel AI SDK + assistant-ui (Solution #1)

**Rationale:**

- Perfect stack compatibility (Next.js 16, React 19, Tailwind v4)
- Active maintenance (both projects updated within 1 week)
- MIT license (fully FOSS, no vendor lock-in)
- Production-ready accessibility (WCAG 2.1 AA)
- Streaming support built-in
- Provider-agnostic (can swap OpenAI for Anthropic/Groq)

**Alternatives Considered:**

1. ❌ **assistant-ui.com** (commercial) - Y Combinator backed but has freemium model
2. ❌ **Vercel AI Chatbot Template** - Too opinionated, includes auth/DB we don't need
3. ❌ **shadcn-Chatbot-Kit** - Less mature, fewer features
4. ❌ **Chatbot UI (McKay)** - Unmaintained (2+ years no updates)

---

## Next Steps

1. ✅ **Research completed** - FOSS alternatives comparison done
2. ⏳ **Backlog created** - This document
3. 🔜 **Create GitHub issue** - When ready to implement
4. 🔜 **Assign to sprint** - Prioritize against other P2 items

**Ready for implementation when:**

- Design token system is stable (✅ already stable)
- API route patterns documented (✅ already documented)
- Testing infrastructure ready (✅ Vitest + Playwright configured)

---

**Status:** Ready for development
**Estimated Start Date:** TBD (awaiting sprint planning)
**Owner:** TBD
