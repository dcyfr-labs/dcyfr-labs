import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_DOMAIN, SITE_TITLE } from "@/lib/site-config";
import { LOGO_PATH, LOGO_VIEWBOX } from "@/lib/logo-config";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type SearchParams = Record<string, string | string[] | undefined>;

const toStringParam = (value?: string | string[]): string | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

/**
 * Validates and truncates title to prevent layout overflow
 * Max 100 characters to ensure readability on OG image
 */
const validateTitle = (title: string): string => {
  const MAX_LENGTH = 100;

  if (title.length <= MAX_LENGTH) {
    return title;
  }

  // Truncate at word boundary and add ellipsis
  const truncated = title.slice(0, MAX_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...';
};

export default function OpenGraphImage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const rawTitle = toStringParam(searchParams?.title) || SITE_TITLE;
  const title = validateTitle(rawTitle);
  const description = toStringParam(searchParams?.description) || SITE_DESCRIPTION;

  return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            background: "linear-gradient(135deg, #020617 0%, #111827 50%, #1f2937 100%)",
            color: "#f9fafb",
            fontFamily: "Geist, Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 58,
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: "-0.015em",
              maxWidth: "920px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.4,
              opacity: 0.9,
              maxWidth: "780px",
            }}
          >
            {description}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#d1d5db",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox={LOGO_VIEWBOX}
              fill="#f9fafb"
              style={{ display: "flex" }}
            >
              <path d={LOGO_PATH} />
            </svg>
            {SITE_DOMAIN}
          </div>
        </div>
      ),
      size,
    );
  }