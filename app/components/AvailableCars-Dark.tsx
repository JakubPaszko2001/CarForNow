// components/sections/AvailableCars.tsx
import { AdjustmentsHorizontalIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import CarCard from "./CarCard-Dark"; // Upewnij się, że ścieżka jest poprawna

// Przykładowe dane (docelowo będą pochodzić z API)
const CARS_DATA = [
  {
    brand: "Audi",
    model: "A6",
    version: "Sport 45 TFSI quattro",
    fuel: "Benzyna",
    transmission: "Automat",
    drive: "4x4",
    power: "245 KM",
    year: 2023,
    price: 450,
    image: "/car-audi-a6.jpg", // Dodaj zdjęcie do public/
    brandLogo: "/AudiLogo.png",
    tag: "Nowość" as const,
  },
  {
    brand: "BMW",
    model: "M4",
    version: "Competition M xDrive",
    fuel: "Benzyna",
    transmission: "Automat",
    drive: "RWD",
    power: "510 KM",
    year: 2024,
    price: 890,
    image: "/car-bmw-m4.jpg", 
    brandLogo: "/BmwLogo.png",
    tag: "Polecany" as const,
  },
  // Możesz tu dodać więcej aut...
];

export default function AvailableCars() {
  return (
    <section className="w-full bg-[#0a0a0a] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* NAGŁÓWEK I FILTRY */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <span className="h-[2px] w-8 bg-[#e85d04]"></span>
               <span className="text-[#e85d04] text-xs font-black uppercase tracking-[0.3em]">Nasza Flota</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
              Dostępne <span className="text-[#e85d04]">samochody</span>
            </h2>
            <p className="text-zinc-500 text-sm mt-4 font-medium">
              Znajdź idealne auto dopasowane do Twoich potrzeb. <span className="text-white">26 pojazdów czeka na Ciebie.</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-white/20 px-5 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all">
                Sortuj <ChevronDownIcon className="w-4 h-4 text-[#e85d04]" />
             </button>
             <button className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-white/20 px-5 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all">
                Filtruj <AdjustmentsHorizontalIcon className="w-4 h-4 text-[#e85d04]" />
             </button>
          </div>
        </div>

        {/* LISTA SAMOCHODÓW (Pętla .map) */}
        <div className="grid grid-cols-1 gap-8">
          {CARS_DATA.map((car, index) => (
            <CarCard key={`${car.brand}-${car.model}-${index}`} car={car} />
          ))}
        </div>

        {/* PRZYCISK POKAŻ WIĘCEJ (Opcjonalny) */}
        <div className="mt-16 flex justify-center">
          <button className="px-10 py-4 border border-white/10 hover:bg-white text-white hover:text-black transition-all rounded-2xl text-xs font-black uppercase tracking-[0.2em]">
            Załaduj więcej pojazdów
          </button>
        </div>

      </div>
    </section>
  );
}