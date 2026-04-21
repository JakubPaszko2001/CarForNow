import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../app/components/Navbar";
import { CarsProvider } from "@/app/context/CarsContext"; // ← dodaj

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Car For Now",
  description: "Wynajem samochodów",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body suppressHydrationWarning={true} className={`${inter.className} bg-[#0a0a0a] text-white min-h-screen`}>
        <CarsProvider> {/* ← owija wszystko */}
          <Navbar />
          <div className="w-full">
            {children}
          </div>
        </CarsProvider>
      </body>
    </html>
  );
}