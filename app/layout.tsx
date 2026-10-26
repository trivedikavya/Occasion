import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/providers/store-provider";
import { ShortcutsProvider } from "@/components/providers/shortcuts-provider";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Occasion — AI event planning",
  description:
    "An AI planning assistant for Indian weddings, birthdays and community events.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full font-sans antialiased">
        <StoreProvider>
          <ShortcutsProvider>
            <AppShell>{children}</AppShell>
          </ShortcutsProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
