import type { Metadata } from "next";
import { Geist, Geist_Mono, Alegreya } from "next/font/google";
import { ThemeProvider } from "@/components/features/theme/theme-provider";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
});

const alegreya = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin"],
  display: "optional",
});

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Support theme from URL parameter (e.g., ?theme=dark)
  // This will be passed from parent window via iframe src
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Listen for theme messages from parent window
              window.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'setTheme') {
                  const theme = event.data.theme;
                  document.documentElement.classList.remove('light', 'dark');
                  if (theme !== 'system') {
                    document.documentElement.classList.add(theme);
                  }
                }
              });
              
              // Read theme from URL parameter
              const urlParams = new URLSearchParams(window.location.search);
              const theme = urlParams.get('theme');
              if (theme && (theme === 'light' || theme === 'dark')) {
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${alegreya.variable} min-h-screen bg-background antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light"
          enableSystem={false}
          storageKey="embed-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

