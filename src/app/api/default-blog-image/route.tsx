import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Default Blog Image Generator
 * 
 * Generates a default featured image for blog posts without custom images.
 * Uses Vercel's OG Image generation with brand colors and typography.
 * 
 * Usage:
 * - Direct: /api/default-blog-image
 * - With text: /api/default-blog-image?title=Post+Title
 * - With style: /api/default-blog-image?style=gradient (gradient, minimal, geometric)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "";
    const style = searchParams.get("style") || "gradient"; // gradient, minimal, geometric

    // Validate title length to prevent abuse
    const maxTitleLength = 1000;
    if (title.length > maxTitleLength) {
      return new Response(
        JSON.stringify({ 
          error: "Title too long", 
          message: `Title must not exceed ${maxTitleLength} characters`,
          provided: title.length 
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Brand colors (adjust to match your site theme)
    const colors = {
      primary: "#3b82f6", // blue-500
      secondary: "#8b5cf6", // violet-500
      accent: "#06b6d4", // cyan-500
      dark: "#0f172a", // slate-900
      light: "#f1f5f9", // slate-100
    };

    // Style variants
    const styles = {
      gradient: {
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        pattern: null,
      },
      minimal: {
        background: colors.dark,
        pattern: "dots",
      },
      geometric: {
        background: `linear-gradient(45deg, ${colors.dark} 0%, ${colors.primary} 100%)`,
        pattern: "grid",
      },
    };

    const selectedStyle = styles[style as keyof typeof styles] || styles.gradient;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: selectedStyle.background,
            position: "relative",
          }}
        >
          {/* Pattern overlay */}
          {selectedStyle.pattern === "dots" && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
          )}
          {selectedStyle.pattern === "grid" && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "50px 50px",
              }}
            />
          )}

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px",
              zIndex: 1,
            }}
          >
            {/* Logo/Brand */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: title ? "40px" : "0",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Title (if provided) */}
            {title && (
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "white",
                  textAlign: "center",
                  maxWidth: "900px",
                  lineHeight: 1.2,
                  textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                }}
              >
                {title}
              </div>
            )}

            {/* Site name */}
            <div
              style={{
                fontSize: "24px",
                color: "rgba(255, 255, 255, 0.9)",
                marginTop: title ? "30px" : "20px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontWeight: "600",
              }}
            >
              Developer Blog
            </div>
          </div>

          {/* Decorative elements */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "40px",
              width: "200px",
              height: "200px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              filter: "blur(60px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "40px",
              width: "200px",
              height: "200px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              filter: "blur(60px)",
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error("Error generating default blog image:", e);
    return new Response("Failed to generate image", { status: 500 });
  }
}
