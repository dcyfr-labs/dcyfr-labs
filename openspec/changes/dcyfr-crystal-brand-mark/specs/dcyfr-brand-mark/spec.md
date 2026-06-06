<!-- TLP:AMBER - Internal Use Only -->

# dcyfr-brand-mark Specification (delta)

## ADDED Requirements

### Requirement: A brand-mark change SHALL be gated on a documented exploration, distinct from brand art

The canonical DCYFR identity mark (favicon, OG card, site logos, `design-tokens.ts` identity) SHALL NOT be replaced or restyled in production until a brand-mark exploration has resolved the open questions: (a) whether to keep the four-pointed "sparkle" silhouette, (b) evolve vs replace, and (c) production of an owned, hand-authored vector mark. AI-generated brand **art** (e.g. a homepage hero image) is permitted and SHALL NOT, by itself, constitute or imply a mark change.

#### Scenario: A hero render is brand art, not a mark change

- **GIVEN** an AI-generated crystal image used as homepage hero art
- **WHEN** it ships to production
- **THEN** the canonical mark (favicon, OG, logo) SHALL remain unchanged
- **AND** no `design-tokens.ts` identity change SHALL be implied by it

#### Scenario: A mark change references a completed exploration

- **GIVEN** a proposal to change the DCYFR favicon, logo, or identity mark
- **WHEN** it is raised
- **THEN** it SHALL reference a completed crystal brand-mark exploration that resolved the open questions (sparkle-or-not, evolve-or-replace, owned vector)
- **AND** SHALL NOT proceed without it
