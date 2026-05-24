import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../app/components/Navbar";
import PhoneButton from "../app/components/PhoneButton";
import { CarsProvider } from "@/app/context/CarsContext"; // ← dodaj

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://carfornow.pl"),
  title: {
    default: "CarForNow — Wynajem długoterminowy samochodów z opcją wykupu | Białystok",
    template: "%s | CarForNow",
  },
  description:
    "Wynajem długoterminowy samochodów z opcją wykupu w Białymstoku. Bez BIK, bez zaświadczeń o zarobkach — tylko dowód i prawo jazdy. Po ostatniej racie auto jest Twoje.",
  applicationName: "CarForNow",
  authors: [{ name: "FraymWeb", url: "https://fraymweb.pl" }],
  generator: "Next.js",
  keywords: [
    "wynajem długoterminowy",
    "wynajem samochodów Białystok",
    "leasing bez BIK",
    "leasing konsumencki",
    "auto z opcją wykupu",
    "wynajem aut bez zaświadczeń",
    "leasing dla osób z komornikiem",
    "wynajem auta z wykupem",
    "CarForNow",
    "wynajem aut Podlasie",
  ],
  category: "automotive",
  creator: "FraymWeb",
  publisher: "CFY Spółka Akcyjna",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "https://carfornow.pl",
    siteName: "CarForNow",
    title: "CarForNow — Wynajem długoterminowy samochodów z opcją wykupu",
    description:
      "Bez BIK, bez zaświadczeń o zarobkach. Wynajmij auto, jeźdź i wykup je na własność po ostatniej racie. Białystok i okolice.",
    images: [
      {
        url: "/HeroBg.png",
        width: 1200,
        height: 630,
        alt: "CarForNow — wynajem długoterminowy z opcją wykupu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CarForNow — Wynajem długoterminowy z opcją wykupu",
    description:
      "Bez BIK, bez zaświadczeń. Tylko dowód i prawo jazdy. Po ostatniej racie auto jest Twoje.",
    images: ["/HeroBg.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body suppressHydrationWarning={true} className={`${inter.className} bg-[#0a0a0a] text-white min-h-screen`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoRental",
              name: "CarForNow",
              legalName: "CFY Spółka Akcyjna",
              url: "https://carfornow.pl",
              logo: "https://carfornow.pl/Logo.png",
              image: "https://carfornow.pl/HeroBg.png",
              description:
                "Wynajem długoterminowy samochodów z opcją wykupu. Bez BIK, bez zaświadczeń o zarobkach.",
              telephone: "+48510510018",
              taxID: "9662156965",
              address: {
                "@type": "PostalAddress",
                streetAddress: "ul. Piękna 5/2",
                postalCode: "15-282",
                addressLocality: "Białystok",
                addressCountry: "PL",
              },
              areaServed: {
                "@type": "AdministrativeArea",
                name: "Podlasie",
              },
              priceRange: "$$",
              sameAs: ["https://m.me/61580848462292"],
            }),
          }}
        />
        <CarsProvider> {/* ← owija wszystko */}
          <Navbar />
          <div className="w-full">
            {children}
          </div>
          <PhoneButton />
        </CarsProvider>
      </body>
    </html>
  );
}