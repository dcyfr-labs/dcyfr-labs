/**
 * RIVET Component Library
 *
 * Reader-centric, Interactive, Visual, Enhanced, Tiered content components.
 *
 * @module components/blog/rivet
 *
 * ## Organization
 *
 * - **navigation/** - Reader-centric navigation (R)
 *   - ReadingProgressBar
 *
 * - **visual/** - Visual density and highlighting (V)
 *   - KeyTakeaway
 *   - TLDRSummary
 *
 * - **interactive/** - Interactive elements (I)
 *   - GlossaryTooltip
 *   - SectionShare
 *   - CollapsibleSection
 *
 * - **engagement/** - Enhanced discoverability (E)
 *   - RoleBasedCTA
 *
 * - **tiered/** - Tiered content depth (T)
 *   - (Future: Role-based content depth)
 *
 * ## Usage
 *
 * ```tsx
 * import {
 *   ReadingProgressBar,
 *   KeyTakeaway,
 *   TLDRSummary,
 *   GlossaryTooltip,
 *   RoleBasedCTA,
 * } from "@/components/blog/rivet";
 *
 * export default function BlogPost() {
 *   return (
 *     <>
 *       <ReadingProgressBar />
 *       <TLDRSummary
 *         mostCommon={["Item 1"]}
 *         mostDangerous={["Item 2"]}
 *       />
 *       <KeyTakeaway variant="security">
 *         Always validate user input
 *       </KeyTakeaway>
 *       <GlossaryTooltip term="Term" definition="Definition">
 *         term
 *       </GlossaryTooltip>
 *       <RoleBasedCTA
 *         executive={{ title: "...", description: "...", buttonText: "...", buttonHref: "..." }}
 *         developer={{ title: "...", description: "...", buttonText: "...", buttonHref: "..." }}
 *       />
 *     </>
 *   );
 * }
 * ```
 */

// Navigation (R - Reader-centric)
export { ReadingProgressBar, SeriesNavigation } from "./navigation";
export type { SeriesNavigationProps, SeriesItem } from "./navigation";

// Visual (V - Visual density)
export { KeyTakeaway, TLDRSummary, RiskMatrix } from "./visual";
export type { RiskMatrixProps, RiskItem, RiskLevel } from "./visual";

// Interactive (I - Interactive elements)
export { GlossaryTooltip, SectionShare, CollapsibleSection, TabInterface } from "./interactive";
export type { TabInterfaceProps, TabItem } from "./interactive";

// Engagement (E - Enhanced discoverability)
export { RoleBasedCTA, FAQSchema, NewsletterSignup, DownloadableAsset } from "./engagement";
export type { RoleBasedCTAProps, FAQSchemaProps, FAQItem, NewsletterSignupProps, NewsletterVariant, DownloadableAssetProps } from "./engagement";

// Security - CVE and vulnerability components
export { SeverityLabel, CVELink, CVETracker, CVEFootnote } from "./security";
export type { SeverityLevel } from "./security";
