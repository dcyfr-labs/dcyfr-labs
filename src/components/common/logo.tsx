import React from 'react';
import { LOGO_CONFIG } from '@/lib/logo-config';

/**
 * Logo Component - Sparkle/Star SVG
 * 
 * A reusable SVG logo component that displays a decorative sparkle/star symbol.
 * Supports customizable size, color, and styling through props.
 * 
 * @example
 * ```tsx
 * // Default usage
 * <Logo />
 * 
 * // With custom size and color
 * <Logo width={32} height={32} className="text-primary" />
 * 
 * // Inline with text
 * <span className="flex items-center gap-2">
 *   <Logo width={24} height={24} />
 *   <span>DCYFR Labs</span>
 * </span>
 * ```
 */

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  /** Additional CSS classes to apply */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Fill color (defaults to currentColor for theme support) */
  fill?: string;
  /** Width in pixels or CSS units */
  width?: string | number;
  /** Height in pixels or CSS units */
  height?: string | number;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  style = {},
  fill = 'currentColor',
  width = LOGO_CONFIG.defaultSize,
  height = LOGO_CONFIG.defaultSize,
  ...props
}) => {
  return (
    <svg
        className={className}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          shapeRendering: 'geometricPrecision',
          ...style
        }}
        fill={fill}
        width={width}
        height={height}
        viewBox={LOGO_CONFIG.viewBox}
        role="img"
        aria-label="DCYFR (Decipher) Labs"
        {...props}
    >
        <path d={LOGO_CONFIG.path} />
    </svg>
  );
};

export default Logo;
