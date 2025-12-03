// Common/shared components
export { BlogPostCTA, ProjectsCTA, AvailabilityBanner, type CTAProps } from "./cta";
export { ContactForm } from "./contact-form";
export { CopyCodeButton } from "./copy-code-button";
export { HighlightText } from "./highlight-text";
export { HorizontalRule } from "./horizontal-rule";
export { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";
export { default as Logo } from "./logo";
export { SiteLogo } from "./site-logo";
export { MDX } from "./mdx";
export { Mermaid } from "./mermaid";
export { ProfileAvatar, type AvatarSize } from "./profile-avatar";
export { ScrollIndicator } from "./scroll-indicator";
export { RelatedPosts } from "./related-posts";
export { SectionHeader } from "./section-header";
export { SectionNavigator, Section } from "./section-navigator";
export { TableOfContents } from "./table-of-contents";
export { ViewToggle } from "./view-toggle";
export { default as DevToolsDropdown } from "./dev-tools-dropdown";

// Math components
export { 
  InlineMath, 
  DisplayMath, 
  getMathClasses,
  INLINE_MATH_CLASSES,
  type InlineMathProps,
  type DisplayMathProps,
  type MathContext,
} from "./inline-math";

// Annotation (Rough Notation) - hand-drawn text annotations
export { 
  Annotation, 
  AnnotationVariants,
  type AnnotationProps, 
  type AnnotationType,
  type BracketType 
} from "./annotation";

// Interactive Diagrams (React Flow) - node-based diagrams
export {
  InteractiveDiagram,
  createLinearFlow,
  createBranchingFlow,
  type InteractiveDiagramProps,
  type BaseNodeData
} from "./interactive-diagram";

// Diagram Presets
export {
  MCPArchitecture,
  AuthenticationFlow,
  PipelineFlow,
  type DiagramPresetProps
} from "./diagram-presets";

// Error boundaries
export { ErrorBoundary } from "./error-boundaries/error-boundary";
export { ContactFormErrorBoundary } from "./error-boundaries/contact-form-error-boundary";
export { PageErrorBoundary } from "./error-boundaries/page-error-boundary";
export { GitHubHeatmapErrorBoundary } from "./error-boundaries/github-heatmap-error-boundary";

// Skeletons
export { GitHubHeatmapSkeleton } from "./skeletons/github-heatmap-skeleton";

// Team
export { TeamMemberCard, type TeamMemberCardLayout } from "./team-member-card";

// Stats
export { TrendingPosts } from "./stats/trending-posts";
export { UnifiedTimeline } from "./stats/unified-timeline";

// Activity (replaces deprecated RecentActivity)
export * from "../activity";

// Filters
export { ActiveFilters } from "./filters/active-filters";
export * from "./filters";
