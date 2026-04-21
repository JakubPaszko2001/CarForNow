import HeroSection from "./components/HeroSection";
import AvailableCars from "./components/AvailableCars-Light";
import SegmentSelector from "./components/SegmentSelector";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <SegmentSelector />
      <AvailableCars />
    </main>
  );
}