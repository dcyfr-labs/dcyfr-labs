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
 * ## Usage
 *
 * ```tsx
 * import { ReadingProgressBar, KeyTakeaway, TLDRSummary } from "@/components/blog/rivet";
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
 *     </>
 *   );
 * }
 * ```
 */

// Navigation (R - Reader-centric)
export { ReadingProgressBar } from "./navigation";

// Visual (V - Visual density)
export { KeyTakeaway, TLDRSummary } from "./visual";
