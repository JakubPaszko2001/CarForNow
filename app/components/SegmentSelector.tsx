import React from "react";
import Image from "next/image";
import hatchback from '../../public/hatchback.png'
import sedan from '../../public/sedan.png'
import kombi from '../../public/kombi.png'
import suv from '../../public/suv.png'

const SEGMENTS = [
  { id: "hatchback", label: "HATCHBACK", image: hatchback },
  { id: "sedan", label: "SEDAN", image: sedan },
  { id: "kombi", label: "KOMBI", image: kombi },
  { id: "suv", label: "SUV", image: suv },
];

export default function SegmentSelector() {
  return (
    <div className="w-full bg-[#f8f8f8] py-12">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Nagłówek zgodnie z Twoim obrazkiem */}
        <h3 className="text-[#334155] text-xl font-medium mb-12">
          WYSZUKAJ WEDŁUG <span className="font-black text-[#1a1a1a]">SEGMENTU</span>
        </h3>

        {/* Kontener na segmenty */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-end">
          {SEGMENTS.map((segment) => (
            <div
              key={segment.id}
              className="flex flex-col items-center group cursor-pointer"
            >
              {/* Miejsce na zdjęcie auta */}
              <div className="relative w-full aspect-[2/1] mb-6">
                <Image
                  src={segment.image}
                  alt={segment.label}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Podpis pod autem */}
              <span className="text-[13px] font-bold text-[#1a1a1a] tracking-wider uppercase">
                {segment.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}