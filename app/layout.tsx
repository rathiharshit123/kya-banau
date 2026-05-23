import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { DeviceIdProvider } from "@/components/device-id-provider";
import { Toaster } from "@/components/ui/toaster";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "700", "900"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kya Banau? — Aaj ka khana decide karo",
  description:
    "AI-powered Indian meal suggestions personalised to your family's taste, region, and mood.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plusJakarta.variable}`}>
      <body>
        <DeviceIdProvider>
          {children}
          <Toaster />
        </DeviceIdProvider>
      </body>
    </html>
  );
}
