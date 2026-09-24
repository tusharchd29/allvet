import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Allvet Field Ops",
  description: "Field sales, orders and targets for the Allvet team",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#028090",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed decorative
            watermark behind all content; next/image's layout constraints aren't
            needed here and would add complexity for no benefit. */}
        <img
          src="/peacock-feather.webp"
          alt=""
          aria-hidden="true"
          className="fixed -bottom-10 -right-16 w-[280px] sm:w-[420px] opacity-[0.32] -z-10 pointer-events-none select-none"
        />
        {children}
      </body>
    </html>
  );
}
