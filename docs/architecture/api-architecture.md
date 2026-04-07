# API Architecture Diagram

## Metadata

- Title: dcyfr-labs System Architecture
- Diagram Type: architecture
- Version: 1
- Last Updated: 2026-03-24
- Audience: blog readers
- TLP: CLEAR

## Diagram

```mermaid
graph TB
    subgraph Client
        Browser[Browser]
    end

    subgraph Vercel Edge
        CDN[CDN / Edge Cache]
        WAF[Vercel WAF]
    end

    subgraph NextJS[Next.js App]
        SSR[Server Components]
        API[API Routes]
        Cron[Cron Routes]
    end

    subgraph External
        Redis[(Upstash Redis)]
        Sentry[Sentry]
        Resend[Resend Email]
        GitHub[GitHub API]
    end

    Browser --> CDN
    CDN --> WAF
    WAF --> SSR
    WAF --> API
    API --> Redis
    API --> Sentry
    Cron --> Redis
    Cron --> Resend
    Cron --> GitHub
```

## Usage in MDX

```tsx
import { StaticDiagram } from '@/components/StaticDiagram';

<StaticDiagram src="/diagrams/api-architecture-v1.html" alt="dcyfr-labs System Architecture" />;
```
