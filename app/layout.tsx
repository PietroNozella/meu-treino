import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

// App inteiro atrás de login e com dados por request — sem prerender.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meu Treino",
  description: "Registro rápido de séries durante a musculação",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Meu Treino",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <div
          className="mx-auto min-h-dvh w-full max-w-md px-4 pb-10"
          style={{
            paddingTop: "max(1rem, env(safe-area-inset-top))",
            paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))",
          }}
        >
          <Providers>{children}</Providers>        </div>
      </body>
    </html>
  );
}
