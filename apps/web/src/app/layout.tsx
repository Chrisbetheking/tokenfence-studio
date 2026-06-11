import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TokenFence Studio",
  description: "Local-first AI workspace and model gateway"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
