# Authentication Flow Diagram

## Metadata

- Title: OAuth 2.0 Authentication Flow
- Diagram Type: flowchart
- Version: 1
- Last Updated: 2026-03-24
- Audience: blog readers
- TLP: CLEAR

## Diagram

```mermaid
graph TD
    User[User] -->|Clicks Login| App[Single Page App]
    App -->|Requests Auth Code| AuthServer[Auth Server]
    AuthServer -->|Issues Auth Code| App
    App -->|Exchanges Code for Token| AuthServer
    AuthServer -->|Issues Access Token| App
    App -->|Calls API with Token| API[Protected API]
    API -->|Returns Data| App
    App -->|Displays Data| User
```

## Usage in MDX

```tsx
import { StaticDiagram } from '@/components/StaticDiagram';

<StaticDiagram src="/diagrams/auth-flow-v1.html" alt="OAuth 2.0 Authentication Flow" />;
```
