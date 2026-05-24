import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Szczegóły samochodu",
  description:
    "Sprawdź specyfikację, zdjęcia i ratę miesięczną wybranego samochodu w CarForNow. Wynajem długoterminowy z opcją wykupu — bez BIK, bez zaświadczeń.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function CarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
