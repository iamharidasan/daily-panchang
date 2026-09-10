import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "நித்ய பஞ்சாங்கம் | Daily Panchangam",
  description: "Tamil and English daily Panchangam with downloadable shareable images.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ta"><body className="antialiased">{children}</body></html>;
}
