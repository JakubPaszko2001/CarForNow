import type { Metadata } from "next";
import HeroSection from "./components/HeroSection";
import AvailableCars from "./components/AvailableCars-Light";
import SegmentSelector from "./components/SegmentSelector";

export const metadata: Metadata = {
  title: "Wynajem długoterminowy samochodów z opcją wykupu — Białystok",
  description:
    "Sprawdź flotę CarForNow — wynajem długoterminowy aut z opcją wykupu. Bez BIK, bez zaświadczeń o zarobkach. Tylko dowód i prawo jazdy. Auto od ręki.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Flota CarForNow — wynajem aut z opcją wykupu",
    description:
      "Przeglądaj dostępne samochody. Wynajmij długoterminowo i wykup auto na własność po ostatniej racie.",
    url: "https://carfornow.pl",
  },
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <SegmentSelector />
      <AvailableCars />
    </main>
  );
}