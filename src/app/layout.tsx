import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { siteConfig } from "@/config/site.config";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Providers>
          <Navbar />
          {children}
          <footer
            style={{
              borderTop: "1px solid var(--border)",
              marginTop: 80,
              padding: "32px 0",
            }}
          >
            <div
              className="container"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span className="eyebrow">
                © {new Date().getFullYear()} {siteConfig.name}
              </span>
              <span style={{ color: "var(--text-faint)", fontSize: "0.85rem" }}>
                Built with Next.js, Postgres, Redis &amp; Claude 🤖
              </span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
