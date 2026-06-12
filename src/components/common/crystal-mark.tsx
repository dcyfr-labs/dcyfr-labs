import React from "react";
import {
  LOGO_PATH,
  LOGO_VIEWBOX,
  CRYSTAL_FACET_ORDER,
  CRYSTAL_FACET_PATHS,
  CRYSTAL_MARK_SCHEME,
  type CrystalMarkSurface,
} from "@/lib/logo-config";

/**
 * CrystalMark — the faceted "crystal" treatment of the DCYFR sparkle.
 *
 * Same silhouette as {@link Logo}/{@link LOGO_PATH}, divided into 8 flat facets for
 * a crystalline read (ratified "evolve" treatment, 2026-06-05). Renders as inline
 * SVG so it works in the DOM and in `next/og` (Satori) image routes.
 *
 * USE AT >= 64px ONLY (large logo, OG/social, hero-adjacent). For the favicon, small
 * sizes, monochrome and single-colour print use the flat {@link Logo} — the facets
 * blur into a muddy blob below ~32px (brand-mark reduction test). The faceted mark is
 * a large-surface treatment, never the favicon.
 *
 * @example
 * ```tsx
 * <CrystalMark surface="dark" width={96} height={96} />   // on a dark surface
 * <CrystalMark surface="light" width={120} height={120} /> // on a light surface
 * ```
 */
interface CrystalMarkProps extends Omit<React.SVGProps<SVGSVGElement>, "fill"> {
  /** Surface the mark sits on: "dark" (default) or "light". */
  surface?: CrystalMarkSurface;
  /** Width in pixels or CSS units (default: 64 — the minimum legible faceted size). */
  width?: string | number;
  /** Height in pixels or CSS units (default: 64). */
  height?: string | number;
}

export const CrystalMark: React.FC<CrystalMarkProps> = ({
  surface = "dark",
  width = 64,
  height = 64,
  className,
  style,
  ...props
}) => {
  const scheme = CRYSTAL_MARK_SCHEME[surface];
  return (
    <svg
      width={width}
      height={height}
      viewBox={LOGO_VIEWBOX}
      role="img"
      aria-label="DCYFR"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      {...props}
    >
      {/* Full-silhouette underlay hides anti-alias hairlines between facets */}
      <path d={LOGO_PATH} fill={scheme.base} />
      {CRYSTAL_FACET_ORDER.map((id) => (
        <path key={id} d={CRYSTAL_FACET_PATHS[id]} fill={scheme[id]} />
      ))}
    </svg>
  );
};

export default CrystalMark;
