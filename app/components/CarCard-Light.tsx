"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
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

const CACHE_TTL = 5 * 60 * 1000;

function prefetchCar(slug: string) {
  const cacheKey = `car_${slug}`;
  const cachedAt = sessionStorage.getItem(`${cacheKey}_at`);
  if (cachedAt && Date.now() - Number(cachedAt) < CACHE_TTL) return;

  fetch(`/api/cars/${slug}`)
    .then(r => r.json())
    .then(data => {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      sessionStorage.setItem(`${cacheKey}_at`, String(Date.now()));
    })
    .catch(() => {});
}

export default function CarCard({ car }: CarCardProps) {
  const slug = car.link.replace('/auto/', '').replace(/\//g, '');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          prefetchCar(slug);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [slug]);

  return (
    <div
      ref={cardRef}
      className="relative w-full bg-white border border-zinc-200 rounded-2xl overflow-hidden group hover:border-[#e85d04]/50 transition-all duration-300 shadow-sm hover:shadow-xl"
    >
      <div className="flex flex-col md:flex-row">

        {/* LEWA STRONA: ZDJĘCIE */}
        <Link 
          href={car.link}
          className="relative w-full md:w-1/2 lg:w-2/5 h-52 md:h-auto overflow-hidden bg-zinc-100 block"
        >
          {car.tag && (
            <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
              car.tag === "Polecany" ? "bg-[#e85d04] text-white" : "bg-black/10 backdrop-blur-md text-white"
            }`}>
              {car.tag}
            </div>
          )}
          <Image 
            src={car.image} 
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* PRAWA STRONA: TREŚĆ */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">

          <div className="flex justify-between items-center gap-4">
            <Link href={car.link} className="hover:text-[#e85d04] transition-colors">
              <h3 className="text-3xl font-black text-[#1a1a1a] uppercase leading-none tracking-tight">
                {car.brand} <span className="text-zinc-400">{car.model}</span>
              </h3>
            </Link>
            <div className="relative w-10 h-10 min-w-[40px] min-h-[40px] flex-shrink-0">
              <Image src={car.brandLogo} alt={car.brand} fill className="object-contain object-center" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 my-8">
            <div className="flex items-center gap-3">
              <BoltIcon className="w-4 h-4 text-[#e85d04]" />
              <span className="text-zinc-700 text-[13px] font-bold">{car.fuel}</span>
            </div>
            <div className="flex items-center gap-3">
              <Cog6ToothIcon className="w-4 h-4 text-[#e85d04]" />
              <span className="text-zinc-700 text-[13px] font-bold">{car.transmission}</span>
            </div>
            <div className="flex items-center gap-3">
              <ScaleIcon className="w-4 h-4 text-[#e85d04]" />
              <span className="text-zinc-700 text-[13px] font-bold">{car.drive}</span>
            </div>
            <div className="flex items-center gap-3">
              <BoltIcon className="w-4 h-4 text-[#e85d04]" />
              <div className="flex items-center flex-wrap text-zinc-700 text-[13px] font-bold">
                {car.power.split("/").map((part, index, arr) => (
                  <span key={index} className="flex items-center">
                    {part.trim()}
                    {index < arr.length - 1 && <span className="mx-1 text-zinc-300 font-normal">/</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-4 h-4 text-[#e85d04]" />
              <span className="text-zinc-700 text-[13px] font-bold">{car.year}</span>
            </div>
          </div>
          {/* STOPKA: CENA I PRZYCISK */}
          <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 leading-none mb-1">
                Cena brutto
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#1a1a1a] tracking-tight">
                  {car.price.toLocaleString("pl-PL")}
                </span>
                <span className="text-lg font-bold text-[#e85d04]">zł</span>
              </div>
              {/* Opcjonalnie: rata miesięczna */}
              {/* <span className="text-[11px] text-zinc-500 font-medium">
                lub od <b className="text-zinc-800">{(car.price / 60).toFixed(0)} zł</b> / msc
              </span> */}
            </div>

            <Link
              href={car.link}
              className="flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#e85d04] text-white px-7 py-4 rounded-xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-[#e85d04]/20 group/btn"
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none">Sprawdź</span>
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none opacity-70">Ofertę</span>
              </div>
              <div className="bg-white/10 p-1 rounded-lg group-hover/btn:bg-white/20 transition-colors">
                <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}