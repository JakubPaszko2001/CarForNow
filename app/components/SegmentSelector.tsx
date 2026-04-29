"use client";

import Image from "next/image";
import hatchback from "../../public/hatchback.png";
import sedan from "../../public/sedan.png";
import kombi from "../../public/kombi.png";
import suv from "../../public/suv.png";
import { useCars } from "@/app/context/CarsContext";

const SEGMENTS = [
  { id: "hatchback", label: "HATCHBACK", image: hatchback },
  { id: "sedan", label: "SEDAN", image: sedan },
  { id: "kombi", label: "KOMBI", image: kombi },
  { id: "suv", label: "SUV", image: suv },
];

export default function SegmentSelector() {
  const { filters, applySegmentFilter } = useCars();
  const activeSegment = filters.nadwozie.toLowerCase();

  const handleClick = (id: string) => {
    applySegmentFilter(id);
    setTimeout(() => {
      document.getElementById("flota")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="w-full bg-[#f8f8f8] py-12">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h3 className="text-[#334155] text-xl font-medium mb-12">
          WYSZUKAJ WEDŁUG <span className="font-black text-[#1a1a1a]">SEGMENTU</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-end">
          {SEGMENTS.map((segment) => {
            const isActive = activeSegment === segment.id;
            return (
              <button
                key={segment.id}
                onClick={() => handleClick(segment.id)}
                className={`flex flex-col items-center group cursor-pointer rounded-2xl transition-all duration-200 p-4 ${
                  isActive
                    ? "bg-[#e85d04]/8 ring-2 ring-[#e85d04]/40"
                    : "hover:bg-zinc-100"
                }`}
              >
                <div
                  className={`relative w-full aspect-[2/1] mb-4 transition-transform duration-300 ${
                    isActive ? "scale-105" : "group-hover:scale-105"
                  }`}
                >
                  <Image
                    src={segment.image}
                    alt={segment.label}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                <span
                  className={`text-[13px] font-bold tracking-wider uppercase transition-colors ${
                    isActive ? "text-[#e85d04]" : "text-[#1a1a1a] group-hover:text-[#e85d04]"
                  }`}
                >
                  {segment.label}
                </span>

                {isActive && (
                  <span className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-[#e85d04]/70">
                    Aktywny · kliknij aby wyczyścić
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
