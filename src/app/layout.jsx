import React from "react";

import { Geist, Geist_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Restaurant ERP",
  description: "Complete Restaurant Management System with POS, Accounting, and Admin features",
};

export default function RootLayout({
  children,
}

) {
  return (
    React.createElement('html', { lang: "en", suppressHydrationWarning: true}
      , React.createElement('body', {
        className: `${geistSans.variable} ${geistMono.variable} antialiased`}

        , React.createElement(ConvexClientProvider, {}
          , children
          , React.createElement(Toaster, {} )
        )
      )
    )
  );
}
