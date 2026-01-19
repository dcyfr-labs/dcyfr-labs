/**
 * Feeds Authentication Component
 *
 * Displays OAuth login button for Inoreader authentication.
 * Shows when user is not authenticated or tokens are expired.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Rss, Lock, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { SPACING } from "@/lib/design-tokens";

export function FeedsAuth() {
  const searchParams = useSearchParams();
  const authStatus = searchParams.get("auth");
  const errorMessage = searchParams.get("message");

  // Check if Inoreader is configured
  const clientId = process.env.NEXT_PUBLIC_INOREADER_CLIENT_ID;
  const isConfigured = Boolean(clientId);

  const handleLogin = () => {
    if (!clientId) {
      console.error("NEXT_PUBLIC_INOREADER_CLIENT_ID is not configured");
      alert(
        "Inoreader integration is not configured. Please add NEXT_PUBLIC_INOREADER_CLIENT_ID to your .env.local file."
      );
      return;
    }

    // Generate CSRF protection state
    const state = Math.random().toString(36).substring(7);

    // Store state in sessionStorage for verification
    if (typeof window !== "undefined") {
      sessionStorage.setItem("inoreader_oauth_state", state);
    }

    // Build OAuth consent URL
    const redirectUri = `${window.location.origin}/api/inoreader/callback`;
    const scope = "read";

    // Log redirect URI for debugging (development only)
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 OAuth Debug Info:");
      console.log("  Client ID:", clientId);
      console.log("  Redirect URI:", redirectUri);
      console.log("  Origin:", window.location.origin);
    }
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope,
      state,
    });

    const authUrl = `https://www.inoreader.com/oauth2/auth?${params.toString()}`;
    
    if (process.env.NODE_ENV === "development") {
      console.log("  Full Auth URL:", authUrl);
      console.log("\n✅ Make sure your Inoreader app is registered with EXACTLY this redirect URI:");
      console.log("  ", redirectUri);
    }

    // Redirect to Inoreader consent page
    window.location.href = authUrl;
  };

  return (
    <div className={SPACING.content}>
      {/* Configuration Warning */}
      {!isConfigured && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Inoreader integration is not configured. Please add{" "}
            <code className="font-mono">NEXT_PUBLIC_INOREADER_CLIENT_ID</code> to your{" "}
            <code className="font-mono">.env.local</code> file.
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {authStatus === "success" && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            Successfully connected to Inoreader! Refreshing feeds...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {authStatus === "error" && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Authentication failed: {errorMessage || "Unknown error"}</p>
              {errorMessage?.includes("redirect_uri") && (
                <div className="text-xs space-y-1 mt-2 p-2 bg-destructive/10 rounded">
                  <p className="font-mono">Expected redirect URI:</p>
                  <p className="font-mono text-foreground">
                    {typeof window !== "undefined" && `${window.location.origin}/api/inoreader/callback`}
                  </p>
                  <p className="mt-2">
                    Go to{" "}
                    <a
                      href="https://www.inoreader.com/developers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold"
                    >
                      inoreader.com/developers
                    </a>{" "}
                    and update your app&apos;s redirect URI to match exactly.
                  </p>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Auth Card */}
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Rss className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Connect to Inoreader</CardTitle>
          <CardDescription>
            Authenticate with Inoreader to access your curated developer feeds and content
            aggregation.
          </CardDescription>
        </CardHeader>

        <CardContent className={SPACING.content}>
          {/* Features List */}
          <ul className="mb-6 space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              <span className="text-sm">
                Aggregate RSS feeds from tech blogs, GitHub, npm, and security advisories
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              <span className="text-sm">
                Filter content by topics (Next.js, React, TypeScript, security, design)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              <span className="text-sm">
                Sync starred articles with dcyfr-labs bookmarks system
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              <span className="text-sm">
                Full-text search across all feeds with reading statistics
              </span>
            </li>
          </ul>

          {/* Security Notice */}
          <div className="mb-6 rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Secure OAuth 2.0 Authentication</p>
                <p>
                  You&apos;ll be redirected to Inoreader&apos;s consent page. Your credentials are never
                  shared with dcyfr-labs. You can revoke access anytime in your Inoreader account
                  settings.
                </p>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <Button 
            onClick={handleLogin} 
            size="lg" 
            className="w-full"
            disabled={!isConfigured}
          >
            <Rss className="mr-2 h-5 w-5" />
            Connect to Inoreader
          </Button>

          {/* Help Text */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Don&apos;t have an Inoreader account?{" "}
            <a
              href="https://www.inoreader.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Sign up for free
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
