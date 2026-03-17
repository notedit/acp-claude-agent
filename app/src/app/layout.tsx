import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ACP Agent",
  description: "Agent Control Panel — Claude Agent SDK",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
