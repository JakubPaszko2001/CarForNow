import Link from "next/link";
import { 
  Cog6ToothIcon, 
  BoltIcon, 
  ScaleIcon, 
  CalendarIcon, 
  ArrowRightIcon 
} from "@heroicons/react/24/outline";

interface CarCardProps {
  car: {
    brand: string;
    model: string;
    version: string;
    fuel: string;
    transmission: string;
    drive: string;
    power: string;
    year: number;
    price: number;
    image: string;
    tag?: "Nowość" | "Polecany";
    brandLogo: string;
    link: string;
  };
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <div className="relative w-full bg-[#121212] border border-white/5 rounded-2xl overflow-hidden group hover:border-[#e85d04]/30 transition-all duration-300">
      
      <div className="flex flex-col md:flex-row">
        
        {/* LEWA STRONA: ZDJĘCIE */}
        <Link 
          href={car.link || "#"} 
          className="relative w-full md:w-1/3 h-52 md:h-auto overflow-hidden block"
        >
          {car.tag && (
            <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
              car.tag === "Polecany" ? "bg-[#e85d04] text-white" : "bg-white/20 backdrop-blur-md text-white"
            }`}>
              {car.tag}
            </div>
          )}
          <Image 
            src={car.image} 
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* PRAWA STRONA: TREŚĆ */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
          
          {/* GÓRA: NAZWA I LOGO MARKI */}
          <div className="flex justify-between items-start">
            <Link href={car.link || "#"} className="hover:text-[#e85d04] transition-colors">
              <h3 className="text-3xl font-black text-white uppercase leading-none tracking-tight">
                {car.brand} <span className="text-zinc-500">{car.model}</span>
              </h3>
              <p className="text-zinc-500 text-[11px] mt-2 font-bold uppercase tracking-[0.1em]">
                {car.version}
              </p>
            </Link>
            <div className="relative w-10 h-10 opacity-30 grayscale group-hover:opacity-100 transition-all">
              <Image src={car.brandLogo} alt={car.brand} fill className="object-contain" />
            </div>
          </div>

          {/* ŚRODEK: SPECYFIKACJA */}
          <div className="grid grid-cols-2 gap-y-4 my-8">
            <div className="flex items-center gap-3">
              <BoltIcon className="w-4 h-4 text-[#e85d04]" />
              <span className="text-zinc-300 text-[13px] font-bold">{car.fuel}</span>
            </div>
            <div className="flex items-center gap-3">
              <Cog6ToothIcon className="w-4 h-4 text-[#e85d04]" />
              <span className="text-zinc-300 text-[13px] font-bold">{car.transmission}</span>
            </div>
            <div className="flex items-center gap-3">
              <ScaleIcon className="w-4 h-4 text-[#e85d04]" />
              <span className="text-zinc-300 text-[13px] font-bold">{car.drive}</span>
            </div>
            <div className="flex items-center gap-3">
              <BoltIcon className="w-4 h-4 text-[#e85d04]" />
              <div className="flex items-center flex-wrap text-zinc-300 text-[13px] font-bold">
                {car.power.split("/").map((part, index, arr) => (
                  <span key={index} className="flex items-center">
                    {part.trim()}
                    {index < arr.length - 1 && <span className="mx-1 text-zinc-600 font-normal">/</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-4 h-4 text-[#e85d04]" />
              <span className="text-zinc-300 text-[13px] font-bold">{car.year}</span>
            </div>
          </div>

          {/* DÓŁ: CENA I PRZYCISK */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-4xl font-black text-white leading-none">{car.price}</span>
                <span className="text-2xl font-black text-white leading-none mt-1">zł</span>
              </div>
              <div className="flex flex-col border-l border-white/10 pl-3">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Doba</span>
              </div>
            </div>
            
            <button className="flex items-center justify-center gap-4 bg-[#e85d04] hover:bg-[#ff6d0a] text-white px-8 py-5 rounded-[20px] transition-all active:scale-95 shadow-[0_15px_30px_rgba(232,93,4,0.25)]">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none mb-1">Zobacz</span>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none">Szczegóły</span>
              </div>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}