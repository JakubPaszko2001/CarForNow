"use client";

import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { BoltIcon, ReceiptPercentIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";
import { useCars, Filters, Car } from "@/app/context/CarsContext";

type DropdownField = "brand" | "model" | "fuel" | "transmission" | "drive" | "powerKM" | "capacityCM3";

const FIELD_LABELS: Record<DropdownField, string> = {
  brand: "Marka",
  model: "Model",
  powerKM: "Moc (KM)",
  capacityCM3: "Pojemność (cm3)",
  fuel: "Paliwo",
  transmission: "Skrzynia biegów",
  drive: "Napęd",
};

export default function HeroSection() {
  const { cars, pendingFilters, setPendingFilters, applyFilters, clearFilters, maxPrice, minYear, maxYear, minPower, maxPower, minCapacity, maxCapacity } = useCars();
  const [openDropdown, setOpenDropdown] = useState<DropdownField | null>(null);
  const [editingRange, setEditingRange] = useState<"power" | "year" | "price" | "capacity" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const mobileRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideMobile = mobileRef.current && !mobileRef.current.contains(event.target as Node);
      const isOutsideDesktop = desktopRef.current && !desktopRef.current.contains(event.target as Node);

      // Jeśli jesteśmy w wersji mobile, sprawdzamy tylko mobileRef i vice versa
      if (isOutsideMobile && isOutsideDesktop) {
        setOpenDropdown(null);
        setEditingRange(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getOptions = (field: DropdownField | "powerMin" | "powerMax" | "capacityMin" | "capacityMax"): string[] => {
    const options: string[] = cars.flatMap((car): string[] => {
      const parts: string[] = String(car.power).split("/").map((p: string) => p.trim());
      if (field === "powerKM" || field === "powerMin" || field === "powerMax") {
        return parts.filter((p: string) => p.toLowerCase().includes("km"));
      }
      if (field === "capacityCM3" || field === "capacityMin" || field === "capacityMax") {
        return parts.filter((p: string) => p.toLowerCase().includes("cm3"));
      }
      return [String(car[field as keyof Car])];
    }).filter((opt): opt is string => Boolean(opt));

    const uniqueOptions: string[] = [...new Set(options)];
    const filteredOptions: string[] = uniqueOptions.filter((opt: string) => {
      if (!searchQuery) return true;
      return opt.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filteredOptions.sort((a: string, b: string) => {
      const numA = parseInt(a.replace(/\D/g, ""));
      const numB = parseInt(b.replace(/\D/g, ""));
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  };

  const handleSelect = (field: DropdownField | "powerMin" | "powerMax" | "capacityMin" | "capacityMax", value: string) => {
    const newFilters = { ...pendingFilters };
    const numValue = value === "" ? null : parseInt(value);

    if (field === "powerMin") {
      newFilters.powerMin = numValue ?? minPower;
    } else if (field === "powerMax") {
      newFilters.powerMax = numValue ?? maxPower;
    } else if (field === "capacityMin") {
      newFilters.capacityMin = numValue ?? minCapacity;
    } else if (field === "capacityMax") {
      newFilters.capacityMax = numValue ?? maxCapacity;
    } else if (field === "powerKM") {
      newFilters.powerKM = value;
      if (numValue !== null) {
        newFilters.powerMin = numValue;
        newFilters.powerMax = numValue;
      } else {
        newFilters.powerMin = minPower;
        newFilters.powerMax = maxPower;
      }
    } else if (field === "capacityCM3") {
      newFilters.capacityCM3 = value;
      if (numValue !== null) {
        newFilters.capacityMin = numValue;
        newFilters.capacityMax = numValue;
      } else {
        newFilters.capacityMin = minCapacity;
        newFilters.capacityMax = maxCapacity;
      }
    } else {
      (newFilters as any)[field] = value;
    }

    setPendingFilters(newFilters);
    setOpenDropdown(null);
  };

  const handleSearch = () => {
    applyFilters();
    document.getElementById("flota")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full bg-black overflow-hidden">
      {/* BACKGROUND IMAGES (3 BREAKPOINTY) */}
      <div className="absolute inset-0 z-0">
        <div className="md:hidden absolute inset-0">
          <Image src="/BG2.jpg" alt="Background Mobile" fill priority unoptimized className="object-none" style={{ objectPosition: '30% center' }} />
        </div>
        <div className="hidden md:block lg:hidden absolute inset-0">
          <Image src="/BG2.jpg" alt="Background Tablet" fill priority unoptimized className="object-none" style={{ objectPosition: '35% center' }} />
        </div>
        <div className="hidden lg:block absolute inset-0">
          <Image src="/BG2.jpg" alt="Background Desktop" fill priority unoptimized className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
      </div>

      {/* ===== MOBILE (poniżej 1024px) ===== */}
      <div className="relative z-10 lg:hidden flex flex-col items-center pt-24 pb-12 px-6">
        <header className="w-full max-w-lg mb-10 text-center">
          <h1 className="text-5xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-2">
            Car <span className="text-[#e85d04]">For</span> Now
          </h1>
          <p className="text-zinc-400 text-sm font-medium tracking-wide">Najlepsze oferty wynajmu samochodów</p>
        </header>

        <div ref={mobileRef} className="w-full bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-[40px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col gap-2">
            {(["brand", "model", "fuel", "transmission", "drive"] as DropdownField[]).map((field) => (
              <div key={field} className="relative">
                <button
                  onClick={() => { setOpenDropdown(openDropdown === field ? null : field); setSearchQuery(""); }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${openDropdown === field ? "bg-white/10 border-[#e85d04]/60" : pendingFilters[field as keyof Filters] ? "bg-white/8 border-[#e85d04]/30" : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"}`}
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{FIELD_LABELS[field]}</span>
                    <span className={`text-sm font-black uppercase tracking-wide ${pendingFilters[field as keyof Filters] ? "text-[#e85d04]" : "text-zinc-300"}`}>{pendingFilters[field as keyof Filters] || "Wszystkie"}</span>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 text-[#e85d04] transition-transform duration-200 ${openDropdown === field ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === field && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#1e1e1e] border border-white/15 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)] max-h-64 overflow-y-auto">
                    {(field === "brand" || field === "model") && (
                      <div className="p-2 sticky top-0 bg-[#1e1e1e] border-b border-white/10 z-10">
                        <input type="text" placeholder={`Szukaj ${FIELD_LABELS[field].toLowerCase()}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#e85d04]/50" onClick={(e) => e.stopPropagation()} />
                      </div>
                    )}
                    <button onClick={() => { handleSelect(field, ""); setSearchQuery(""); }} className="w-full text-left px-5 py-3.5 text-zinc-500 hover:bg-white/8 text-xs font-black uppercase tracking-widest transition-colors border-b border-white/5">Wszystkie</button>
                    {getOptions(field).map((option) => (
                      <button key={option} onClick={() => handleSelect(field, option)} className={`w-full text-left px-5 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-white/8 transition-colors border-b border-white/5 last:border-0 ${pendingFilters[field as keyof Filters] === option ? "text-[#e85d04] bg-[#e85d04]/5" : "text-zinc-200"}`}>{option}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-1.5 mb-3">
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest px-1">Moc (KM)</span>
              <div className="grid grid-cols-2 gap-2">
                {["powerMin", "powerMax"].map((field) => (
                  <div key={field} className="relative">
                    <button
                      onClick={() => { setOpenDropdown(openDropdown as any === field ? null : field as any); setSearchQuery(""); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${openDropdown as any === field ? "bg-white/10 border-[#e85d04]/60" : (field === "powerMin" ? pendingFilters.powerMin > minPower : pendingFilters.powerMax < maxPower) ? "bg-white/8 border-[#e85d04]/30" : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"}`}
                    >
                      <span className={`text-xs font-black uppercase tracking-wide ${(field === "powerMin" ? pendingFilters.powerMin > minPower : pendingFilters.powerMax < maxPower) ? "text-[#e85d04]" : "text-zinc-400"}`}>
                        {field === "powerMin" ? (pendingFilters.powerMin > minPower ? `${pendingFilters.powerMin} KM` : "OD") : (pendingFilters.powerMax < maxPower ? `${pendingFilters.powerMax} KM` : "DO")}
                      </span>
                      <ChevronDownIcon className={`w-4 h-4 text-[#e85d04]/60 transition-transform duration-200 ${openDropdown as any === field ? "rotate-180" : ""}`} />
                    </button>
                    {openDropdown as any === field && (
                      <div className="absolute left-0 min-w-[140px] top-full mt-2 z-50 bg-[#1e1e1e] border border-white/15 rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.7)] max-h-64 overflow-y-auto">
                        <button onClick={() => handleSelect(field as any, "")} className="w-full text-left px-5 py-3.5 text-zinc-500 hover:bg-white/8 text-xs font-black uppercase transition-colors border-b border-white/5">Wszystkie</button>
                        {getOptions(field as any).map((option) => (
                          <button key={option} onClick={() => handleSelect(field as any, option)} className={`w-full text-left px-5 py-3.5 text-xs font-black uppercase whitespace-nowrap hover:bg-white/8 transition-colors border-b border-white/5 last:border-0 ${(field === "powerMin" ? pendingFilters.powerMin === parseInt(option) : pendingFilters.powerMax === parseInt(option)) ? "text-[#e85d04] bg-[#e85d04]/5" : "text-zinc-200"}`}>{option}</button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mb-3">
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest px-1">Pojemność (cm3)</span>
              <div className="grid grid-cols-2 gap-2">
                {["capacityMin", "capacityMax"].map((field) => (
                  <div key={field} className="relative">
                    <button
                      onClick={() => { setOpenDropdown(openDropdown as any === field ? null : field as any); setSearchQuery(""); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${openDropdown as any === field ? "bg-white/10 border-[#e85d04]/60" : (field === "capacityMin" ? pendingFilters.capacityMin > minCapacity : pendingFilters.capacityMax < maxCapacity) ? "bg-white/8 border-[#e85d04]/30" : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"}`}
                    >
                      <span className={`text-xs font-black uppercase tracking-wide ${(field === "capacityMin" ? pendingFilters.capacityMin > minCapacity : pendingFilters.capacityMax < maxCapacity) ? "text-[#e85d04]" : "text-zinc-400"}`}>
                        {field === "capacityMin" ? (pendingFilters.capacityMin > minCapacity ? `${pendingFilters.capacityMin} cm3` : "OD") : (pendingFilters.capacityMax < maxCapacity ? `${pendingFilters.capacityMax} cm3` : "DO")}
                      </span>
                      <ChevronDownIcon className={`w-4 h-4 text-[#e85d04]/60 transition-transform duration-200 ${openDropdown as any === field ? "rotate-180" : ""}`} />
                    </button>
                    {openDropdown as any === field && (
                      <div className="absolute left-0 min-w-[140px] top-full mt-2 z-50 bg-[#1e1e1e] border border-white/15 rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.7)] max-h-64 overflow-y-auto">
                        <button onClick={() => handleSelect(field as any, "")} className="w-full text-left px-5 py-3.5 text-zinc-500 hover:bg-white/8 text-xs font-black uppercase transition-colors border-b border-white/5">Wszystkie</button>
                        {getOptions(field as any).map((option) => (
                          <button key={option} onClick={() => handleSelect(field as any, option)} className={`w-full text-left px-5 py-3.5 text-xs font-black uppercase whitespace-nowrap hover:bg-white/8 transition-colors border-b border-white/5 last:border-0 ${(field === "capacityMin" ? pendingFilters.capacityMin === parseInt(option) : pendingFilters.capacityMax === parseInt(option)) ? "text-[#e85d04] bg-[#e85d04]/5" : "text-zinc-200"}`}>{parseInt(option)}</button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 mt-1">
              <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Rok</span>
                  <span className="text-sm font-black uppercase tracking-wide text-zinc-300">Rok produkcji</span>
                </div>
                <div className="relative">
                  <span onClick={() => setEditingRange("year")} className="text-[#e85d04] text-xs font-black cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-colors">{pendingFilters.yearMin} — {pendingFilters.yearMax}</span>
                  {editingRange === "year" && (
                    <div className="absolute right-0 top-full mt-2 z-[60] bg-[#1a1a1a] border border-[#e85d04]/40 rounded-3xl p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col gap-4 min-w-[240px]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-zinc-500 uppercase font-black">Od</span>
                          <input type="number" value={pendingFilters.yearMin} onChange={(e) => setPendingFilters({ ...pendingFilters, yearMin: Number(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)} autoFocus className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e85d04]/50" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-zinc-500 uppercase font-black">Do</span>
                          <input type="number" value={pendingFilters.yearMax} onChange={(e) => setPendingFilters({ ...pendingFilters, yearMax: Number(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e85d04]/50" />
                        </div>
                      </div>
                      <button onClick={() => setEditingRange(null)} className="w-full bg-[#e85d04] text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-[#ff6d0a] transition-colors">Gotowe</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <input type="range" min={minYear} max={maxYear} value={pendingFilters.yearMin} onChange={(e) => setPendingFilters({ ...pendingFilters, yearMin: Number(e.target.value) })} className="w-full accent-[#e85d04]" />
                <input type="range" min={minYear} max={maxYear} value={pendingFilters.yearMax} onChange={(e) => setPendingFilters({ ...pendingFilters, yearMax: Number(e.target.value) })} className="w-full accent-[#e85d04]" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 mt-1">
              <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Cena</span>
                  <span className="text-sm font-black uppercase tracking-wide text-zinc-300">Miesięczna rata</span>
                </div>
                <div className="relative">
                  <span onClick={() => setEditingRange("price")} className="text-[#e85d04] text-xs font-black cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-colors">{pendingFilters.priceMin} — {pendingFilters.priceMax} zł</span>
                  {editingRange === "price" && (
                    <div className="absolute right-0 top-full mt-2 z-[60] bg-[#1a1a1a] border border-[#e85d04]/40 rounded-3xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.15)] backdrop-blur-2xl flex flex-col gap-4 min-w-[280px]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col gap-1.5 w-full">
                          <span className="text-[10px] text-zinc-500 uppercase font-black">Od (zł)</span>
                          <input type="number" value={pendingFilters.priceMin} onChange={(e) => setPendingFilters({ ...pendingFilters, priceMin: Number(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)} autoFocus className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e85d04]/50" />
                        </div>
                        <div className="flex flex-col gap-1.5 w-full">
                          <span className="text-[10px] text-zinc-500 uppercase font-black">Do (zł)</span>
                          <input type="number" value={pendingFilters.priceMax} onChange={(e) => setPendingFilters({ ...pendingFilters, priceMax: Number(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e85d04]/50" />
                        </div>
                      </div>
                      <button onClick={() => setEditingRange(null)} className="w-full bg-[#e85d04] text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-[#ff6d0a] transition-colors">Gotowe</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <input type="range" min={0} max={maxPrice} value={pendingFilters.priceMin} onChange={(e) => setPendingFilters({ ...pendingFilters, priceMin: Number(e.target.value) })} className="w-full accent-[#e85d04]" />
                <input type="range" min={0} max={maxPrice} value={pendingFilters.priceMax} onChange={(e) => setPendingFilters({ ...pendingFilters, priceMax: Number(e.target.value) })} className="w-full accent-[#e85d04]" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={() => clearFilters()} className="w-1/3 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 font-black py-5 rounded-2xl uppercase tracking-[0.1em] text-xs transition-all">Wyczyść</button>
            <button onClick={handleSearch} className="w-2/3 bg-gradient-to-r from-[#e85d04] to-[#ff6d0a] text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-sm shadow-[0_15px_30px_rgba(232,93,4,0.3)] active:scale-95 transition-all">Szukaj</button>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP (od 1024px) ===== */}
      <div className="relative z-10 hidden lg:flex min-h-screen w-full items-start pt-12 pb-10">
        <div className="w-full max-w-7xl mx-auto px-12 flex flex-col xl:flex-row items-center xl:items-start xl:gap-16">
          <div className="w-full max-w-md xl:max-w-none xl:w-[420px] flex-shrink-0 flex flex-col gap-6 text-center xl:text-left items-center xl:items-start">
            <div ref={desktopRef} className="w-full bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
              <div className="flex flex-col gap-2 text-left">
                {(["brand", "model", "fuel", "transmission", "drive"] as DropdownField[]).map((field) => (
                  <div key={field} className="relative">
                    <button
                      onClick={() => { setOpenDropdown(openDropdown === field ? null : field); setSearchQuery(""); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${openDropdown === field ? "bg-white/10 border-[#e85d04]/60" : pendingFilters[field as keyof Filters] ? "bg-white/8 border-[#e85d04]/30" : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"}`}
                    >
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">{FIELD_LABELS[field]}</span>
                        <span className={`text-xs font-black uppercase tracking-wide ${pendingFilters[field as keyof Filters] ? "text-[#e85d04]" : "text-zinc-300"}`}>{pendingFilters[field as keyof Filters] || "Wszystkie"}</span>
                      </div>
                      <ChevronDownIcon className={`w-4 h-4 text-[#e85d04] transition-transform duration-200 ${openDropdown === field ? "rotate-180" : ""}`} />
                    </button>
                    {openDropdown === field && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#1e1e1e] border border-white/15 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)] max-h-64 overflow-y-auto">
                        {(field === "brand" || field === "model") && (
                          <div className="p-2 sticky top-0 bg-[#1e1e1e] border-b border-white/10 z-10">
                            <input type="text" placeholder={`Szukaj ${FIELD_LABELS[field].toLowerCase()}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#e85d04]/50" onClick={(e) => e.stopPropagation()} />
                          </div>
                        )}
                        <button onClick={() => { handleSelect(field, ""); setSearchQuery(""); }} className="w-full text-left px-4 py-2.5 text-zinc-500 hover:bg-white/8 text-[11px] font-black uppercase tracking-widest transition-colors border-b border-white/5">Wszystkie</button>
                        {getOptions(field).map((option) => (
                          <button key={option} onClick={() => handleSelect(field, option)} className={`w-full text-left px-4 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-white/8 transition-colors border-b border-white/5 last:border-0 ${pendingFilters[field as keyof Filters] === option ? "text-[#e85d04] bg-[#e85d04]/5" : "text-zinc-200"}`}>{option}</button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest px-1">Moc (KM)</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {["powerMin", "powerMax"].map((field) => (
                        <div key={field} className="relative">
                          <button
                            onClick={() => { setOpenDropdown(openDropdown as any === field ? null : field as any); setSearchQuery(""); }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${openDropdown as any === field ? "bg-white/10 border-[#e85d04]/60" : (field === "powerMin" ? pendingFilters.powerMin > minPower : pendingFilters.powerMax < maxPower) ? "bg-white/8 border-[#e85d04]/30" : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"}`}
                          >
                            <span className={`text-[11px] font-black uppercase tracking-wide ${(field === "powerMin" ? pendingFilters.powerMin > minPower : pendingFilters.powerMax < maxPower) ? "text-[#e85d04]" : "text-zinc-400"}`}>
                              {field === "powerMin" ? (pendingFilters.powerMin > minPower ? `${pendingFilters.powerMin}` : "OD") : (pendingFilters.powerMax < maxPower ? `${pendingFilters.powerMax}` : "DO")}
                            </span>
                            <ChevronDownIcon className={`w-3.5 h-3.5 text-[#e85d04]/60 transition-transform duration-200 ${openDropdown as any === field ? "rotate-180" : ""}`} />
                          </button>
                          {openDropdown as any === field && (
                            <div className="absolute left-0 min-w-[150px] top-full mt-2 z-50 bg-[#1e1e1e] border border-white/15 rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] max-h-64 overflow-y-auto">
                              <button onClick={() => handleSelect(field as any, "")} className="w-full text-left px-5 py-3 text-zinc-500 hover:bg-white/8 text-[10px] font-black uppercase transition-colors border-b border-white/5">Wszystkie</button>
                              {getOptions(field as any).map((option) => (
                                <button key={option} onClick={() => handleSelect(field as any, option)} className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase whitespace-nowrap hover:bg-white/8 transition-colors border-b border-white/5 last:border-0 ${(field === "powerMin" ? pendingFilters.powerMin === parseInt(option) : pendingFilters.powerMax === parseInt(option)) ? "text-[#e85d04] bg-[#e85d04]/5" : "text-zinc-200"}`}>{option}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest px-1">Pojemność (cm3)</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {["capacityMin", "capacityMax"].map((field) => (
                        <div key={field} className="relative">
                          <button
                            onClick={() => { setOpenDropdown(openDropdown as any === field ? null : field as any); setSearchQuery(""); }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${openDropdown as any === field ? "bg-white/10 border-[#e85d04]/60" : (field === "capacityMin" ? pendingFilters.capacityMin > minCapacity : pendingFilters.capacityMax < maxCapacity) ? "bg-white/8 border-[#e85d04]/30" : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"}`}
                          >
                            <span className={`text-[11px] font-black uppercase tracking-wide ${(field === "capacityMin" ? pendingFilters.capacityMin > minCapacity : pendingFilters.capacityMax < maxCapacity) ? "text-[#e85d04]" : "text-zinc-400"}`}>
                              {field === "capacityMin" ? (pendingFilters.capacityMin > minCapacity ? `${pendingFilters.capacityMin}` : "OD") : (pendingFilters.capacityMax < maxCapacity ? `${pendingFilters.capacityMax}` : "DO")}
                            </span>
                            <ChevronDownIcon className={`w-3.5 h-3.5 text-[#e85d04]/60 transition-transform duration-200 ${openDropdown as any === field ? "rotate-180" : ""}`} />
                          </button>
                          {openDropdown as any === field && (
                            <div className="absolute left-0 min-w-[150px] top-full mt-2 z-50 bg-[#1e1e1e] border border-white/15 rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] max-h-64 overflow-y-auto">
                              <button onClick={() => handleSelect(field as any, "")} className="w-full text-left px-5 py-3 text-zinc-500 hover:bg-white/8 text-[10px] font-black uppercase transition-colors border-b border-white/5">Wszystkie</button>
                              {getOptions(field as any).map((option) => (
                                <button key={option} onClick={() => handleSelect(field as any, option)} className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase whitespace-nowrap hover:bg-white/8 transition-colors border-b border-white/5 last:border-0 ${(field === "capacityMin" ? pendingFilters.capacityMin === parseInt(option) : pendingFilters.capacityMax === parseInt(option)) ? "text-[#e85d04] bg-[#e85d04]/5" : "text-zinc-200"}`}>{parseInt(option)}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Rok</span>
                      <span className="text-xs font-black uppercase tracking-wide text-zinc-300">Rok produkcji</span>
                    </div>
                    <div className="relative">
                      <span onClick={() => setEditingRange("year")} className="text-[#e85d04] text-[10px] font-black cursor-pointer hover:bg-white/5 px-1.5 py-0.5 rounded-md transition-colors">{pendingFilters.yearMin} — {pendingFilters.yearMax}</span>
                      {editingRange === "year" && (
                        <div className="absolute right-0 top-full mt-2 z-[60] bg-[#1a1a1a] border border-[#e85d04]/40 rounded-3xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col gap-4 min-w-[220px]">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-1.5 w-full">
                              <span className="text-[10px] text-zinc-500 uppercase font-black">Od</span>
                              <input type="number" value={pendingFilters.yearMin} onChange={(e) => setPendingFilters({ ...pendingFilters, yearMin: Number(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)} autoFocus className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e85d04]/50" />
                            </div>
                            <div className="flex flex-col gap-1.5 w-full">
                              <span className="text-[10px] text-zinc-500 uppercase font-black">Do</span>
                              <input type="number" value={pendingFilters.yearMax} onChange={(e) => setPendingFilters({ ...pendingFilters, yearMax: Number(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e85d04]/50" />
                            </div>
                          </div>
                          <button onClick={() => setEditingRange(null)} className="w-full bg-[#e85d04] text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-[#ff6d0a] shadow-lg shadow-[#e85d04]/20">Zastosuj</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input type="range" min={minYear} max={maxYear} value={pendingFilters.yearMin} onChange={(e) => setPendingFilters({ ...pendingFilters, yearMin: Number(e.target.value) })} className="w-full accent-[#e85d04]" />
                    <input type="range" min={minYear} max={maxYear} value={pendingFilters.yearMax} onChange={(e) => setPendingFilters({ ...pendingFilters, yearMax: Number(e.target.value) })} className="w-full accent-[#e85d04]" />
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Cena</span>
                      <span className="text-xs font-black uppercase tracking-wide text-zinc-300">Miesięczna rata</span>
                    </div>
                    <div className="relative">
                      <span onClick={() => setEditingRange("price")} className="text-[#e85d04] text-[10px] font-black cursor-pointer hover:bg-white/5 px-1.5 py-0.5 rounded-md transition-colors">{pendingFilters.priceMin} — {pendingFilters.priceMax} zł</span>
                      {editingRange === "price" && (
                        <div className="absolute right-0 top-full mt-2 z-[60] bg-[#1a1a1a] border border-[#e85d04]/40 rounded-3xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col gap-4 min-w-[260px]">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-1.5 w-full">
                              <span className="text-[10px] text-zinc-500 uppercase font-black">Od (zł)</span>
                              <input type="number" value={pendingFilters.priceMin} onChange={(e) => setPendingFilters({ ...pendingFilters, priceMin: Number(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)} autoFocus className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e85d04]/50" />
                            </div>
                            <div className="flex flex-col gap-1.5 w-full">
                              <span className="text-[10px] text-zinc-500 uppercase font-black">Do (zł)</span>
                              <input type="number" value={pendingFilters.priceMax} onChange={(e) => setPendingFilters({ ...pendingFilters, priceMax: Number(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e85d04]/50" />
                            </div>
                          </div>
                          <button onClick={() => setEditingRange(null)} className="w-full bg-[#e85d04] text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-[#ff6d0a] shadow-lg shadow-[#e85d04]/20">Zastosuj</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input type="range" min={0} max={maxPrice} value={pendingFilters.priceMin} onChange={(e) => setPendingFilters({ ...pendingFilters, priceMin: Number(e.target.value) })} className="w-full accent-[#e85d04]" />
                    <input type="range" min={0} max={maxPrice} value={pendingFilters.priceMax} onChange={(e) => setPendingFilters({ ...pendingFilters, priceMax: Number(e.target.value) })} className="w-full accent-[#e85d04]" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => clearFilters()} className="w-1/3 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 font-black py-3.5 rounded-2xl uppercase tracking-[0.1em] text-[11px] transition-all">Wyczyść</button>
                <button onClick={handleSearch} className="w-2/3 bg-gradient-to-r from-[#e85d04] to-[#ff6d0a] text-white font-black py-3.5 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-[0_15px_30px_rgba(232,93,4,0.3)] active:scale-95 transition-all">Szukaj</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}