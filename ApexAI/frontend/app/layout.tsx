import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "GenzAI",
  description: "AI built by Saffan from Kashmir",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}
