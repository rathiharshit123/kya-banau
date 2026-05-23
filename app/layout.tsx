import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { DeviceIdProvider } from "@/components/device-id-provider";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "700", "900"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aaj Kya Banau? — Aaj ka khana decide karo",
  description:
    "AI-powered Indian meal suggestions personalised to your family's taste, cuisine, and health goals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <DeviceIdProvider>
          {children}
          <Toaster />
        </DeviceIdProvider>
      </body>
    </html>
  );
}
