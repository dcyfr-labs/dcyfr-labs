// Common/shared components
export {
  BlogPostCTA,
  ProjectsCTA,
  AvailabilityBanner,
  type CTAProps,
} from "./cta";
export { Alert, type AlertProps } from "./alert";
export { KeyTakeaway, type KeyTakeawayProps } from "./key-takeaway";
export { MetricsCard } from "./metrics-card";
export { ContextClue, type ContextClueProps } from "./context-clue";
export { ContactForm } from "./contact-form";
export { CopyCodeButton } from "./copy-code-button";
export { CodeBlockWithHeader } from "./code-block-with-header";
export { CodeComparison } from "./code-comparison";
export {
  EnhancedInlineCode,
  getInlineCodeVariant,
} from "./enhanced-inline-code";
export { HighlightText } from "./highlight-text";
export { HorizontalRule } from "./horizontal-rule";
export { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";
export { default as Logo } from "./logo";
export { SiteLogo } from "./site-logo";
export { ThemeAwareLogo } from "./theme-aware-logo";
export { MDX } from "./mdx";
export { ZoomableImage } from "./zoomable-image";
export { Figure, FigureProvider } from "./figure-caption";
export { TableCaption, type TableCaptionProps } from "./table-caption";
export {
  FAQ,
  FAQQuestion,
  FAQAnswer,
  type FAQProps,
  type FAQItem,
} from "./faq";
export { ProfileAvatar, type AvatarSize } from "./profile-avatar";
export { ScrollIndicator } from "./scroll-indicator";
export { RelatedPosts } from "./related-posts";
export { SectionHeader } from "./section-header";
export { SectionNavigator, Section } from "./section-navigator";
export { SmoothScrollToHash } from "./smooth-scroll-to-hash";
export { TableOfContents } from "./table-of-contents";
export { TableOfContentsSidebar } from "./table-of-contents-sidebar";
export { TransitionLink } from "./transition-link";
export { ViewToggle } from "./view-toggle";
export { default as DevToolsDropdown } from "./dev-tools-dropdown";
export { NavigationShortcutsProvider } from "./navigation-shortcuts-provider";

// Search components
export { SearchHighlight, SearchInput } from "./search";

// Code Playground components
export { CodePlayground } from "./code-playground";
export type { CodePlaygroundProps } from "./code-playground";

// Progressive content and depth styling
export {
  ProgressiveParagraph,
  ContentBlock,
  ContrastText,
  analyzeContentDepth,
} from "./progressive-content";

// Hero Overlays - light/dark mode aware contrast for hero images
export {
  HeroOverlay,
  BlogPostHeroOverlay,
  ProjectHeroOverlay,
  type HeroOverlayProps,
  type OverlayVariant,
  type OverlayDirection,
  type OverlayIntensity,
} from "./hero-overlay";

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
  type BracketType,
} from "./annotation";

// Interactive Diagrams (React Flow) - node-based diagrams
export {
  InteractiveDiagram,
  createLinearFlow,
  createBranchingFlow,
  type InteractiveDiagramProps,
  type BaseNodeData,
} from "./interactive-diagram";

// Diagram Presets (lazy-loaded for SSR compatibility)
export {
  MCPArchitecture,
  AuthenticationFlow,
  PipelineFlow,
  CVEDecisionTree,
} from "./lazy-diagrams";

// MDX Diagram Wrappers (client-only, prevents SSR bailout in MDX)
export {
  MDXMCPArchitecture,
  MDXAuthenticationFlow,
  MDXPipelineFlow,
  MDXCVEDecisionTree,
} from "./mdx-diagram-wrapper";

export { type DiagramPresetProps } from "./diagram-presets";

// Error boundaries
export { ErrorBoundary } from "./error-boundaries/error-boundary";
export { ContactFormErrorBoundary } from "./error-boundaries/contact-form-error-boundary";
export { PageErrorBoundary } from "./error-boundaries/page-error-boundary";
export { GitHubHeatmapErrorBoundary } from "./error-boundaries/github-heatmap-error-boundary";

// Skeletons
export { GitHubHeatmapSkeleton } from "./skeletons/github-heatmap-skeleton";
export { FormSkeleton } from "./skeletons/form-skeleton";
export { ChartSkeleton } from "./skeletons/chart-skeleton";
export { CommentSectionSkeleton } from "./skeletons/comment-section-skeleton";
export { DiagramSkeleton } from "./skeletons/diagram-skeleton";

// Team
export { TeamMemberCard, type TeamMemberCardLayout } from "./team-member-card";

// Stats
export { TrendingPosts } from "./stats/trending-posts";
export { UnifiedTimeline } from "./stats/unified-timeline";

// Cards (enhanced media cards)
export { MediaCard, type MediaCardProps } from "./cards";
export { QuoteCard, type QuoteCardProps } from "./cards";

// Post Interactions
export {
  PostInteractions,
  type PostInteractionsProps,
} from "./PostInteractions";

// Activity (replaces deprecated RecentActivity)
export * from "../activity";

// Filters
export { ActiveFilters } from "./filters/active-filters";
export * from "./filters";
