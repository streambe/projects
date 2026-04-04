import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LeadGen - Lead Management & Sales Pipeline",
  description: "Manage leads, track pipeline stages, and automate outreach sequences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-montserrat)]">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
