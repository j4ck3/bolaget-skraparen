import React from "react";
import "../styles/globals.css";
import "../styles/main.css";
import { Montserrat } from "next/font/google";
import Script from "next/script";

const mont = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Lagerstatus i butiker nära dig",
  icons: {
    icon: "./icon.png",
    apple: "./icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" className="h-screen" suppressHydrationWarning>
      <body className={`${mont.className} h-screen`}>
        <Script
          src="https://kit.fontawesome.com/acc20ec783.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
