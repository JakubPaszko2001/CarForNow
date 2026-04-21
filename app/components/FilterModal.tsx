"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useCars, Filters } from "@/app/context/CarsContext";
import gsap from "gsap";

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

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const { cars, pendingFilters, setPendingFilters, applyFilters, maxPrice, minYear, maxYear, minPower, maxPower, minCapacity, maxCapacity } = useCars();
  const [openDropdown, setOpenDropdown] = useState<DropdownField | "powerMin" | "powerMax" | "capacityMin" | "capacityMax" | null>(null);
  const [editingRange, setEditingRange] = useState<"power" | "year" | "price" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const getOptions = (field: DropdownField | "powerMin" | "powerMax" | "capacityMin" | "capacityMax"): string[] => {
    const options = cars.flatMap((car) => {
      const parts = String(car.power).split("/").map(p => p.trim());
      if (field === "powerKM" || field === "powerMin" || field === "powerMax") {
        return parts.filter(p => p.toLowerCase().includes("km"));
      }
      if (field === "capacityCM3" || field === "capacityMin" || field === "capacityMax") {
        return parts.filter(p => p.toLowerCase().includes("cm3"));
      }
      return [String(car[field as keyof Car])];
    }).filter(Boolean);

    const uniqueOptions = [...new Set(options)];
    const filteredOptions = uniqueOptions.filter(opt => {
      if (!searchQuery) return true;
      return opt.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filteredOptions.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""));
      const numB = parseInt(b.replace(/\D/g, ""));
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  };

  const handleSelect = (field: DropdownField | "powerMin" | "powerMax" | "capacityMin" | "capacityMax", value: string) => {
    const newFilters = { ...pendingFilters };
    const numValue = value === "" ? null : parseInt(value.replace(/\D/g, ""));

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

  const handleApply = () => {
    applyFilters();
    animateOut(onClose);
  };

  const handleClear = () => {
    setPendingFilters({
      brand: "", model: "", fuel: "", transmission: "", drive: "",
      yearMin: minYear, yearMax: maxYear,
      priceMin: 0, priceMax: maxPrice,
      powerMin: minPower, powerMax: maxPower,
      capacityMin: minCapacity, capacityMax: maxCapacity,
    });
  };

  const animateOut = (callback: () => void) => {
    if (!modalRef.current || !overlayRef.current) return callback();
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" });
    gsap.to(modalRef.current, {
      opacity: 0, scale: 0.95, y: 10,
      duration: 0.25, ease: "power2.in",
      onComplete: callback,
    });
  };

  const handleClose = () => animateOut(onClose);

  useEffect(() => {
    if (!isOpen || !modalRef.current || !overlayRef.current) return;
    document.body.style.overflow = "hidden";
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power3.out" });
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeFiltersCount = Object.entries(pendingFilters).filter(([key, val]) => {
    if (key === "priceMin") return (val as number) > 0;
    if (key === "priceMax") return (val as number) < maxPrice;
    if (key === "yearMin") return (val as number) > minYear;
    if (key === "yearMax") return (val as number) < maxYear;
    if (key === "powerMin") return (val as number) > minPower;
    if (key === "powerMax") return (val as number) < maxPower;
    if (key === "capacityMin") return (val as number) > minCapacity;
    if (key === "capacityMax") return (val as number) < maxCapacity;
    return (val as string) !== "";
  }).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div ref={overlayRef} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div ref={modalRef} className="relative w-full max-w-md bg-white border border-zinc-200 rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-zinc-100">
          <div>
            <h2 className="text-zinc-900 text-xl font-black uppercase tracking-tight">Filtry</h2>
            {activeFiltersCount > 0 ? (
              <p className="text-[#e85d04] text-xs font-bold mt-0.5">{activeFiltersCount} aktywnych filtrów</p>
            ) : (
              <p className="text-zinc-400 text-xs font-bold mt-0.5">Brak aktywnych filtrów</p>
            )}
          </div>
          <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center bg-zinc-100 border border-zinc-200 rounded-full hover:bg-zinc-200 transition-all">
            <XMarkIcon className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="px-7 py-5 overflow-y-auto max-h-[60vh] flex flex-col gap-2">
          {(["brand", "model", "fuel", "transmission", "drive"] as DropdownField[]).map((field) => (
            <div key={field} className="relative">
              <button
                onClick={() => { setOpenDropdown(openDropdown === field ? null : field); setSearchQuery(""); }}
                className="w-full flex items-center justify-between px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:border-zinc-300 transition-all"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{FIELD_LABELS[field]}</span>
                  <span className={`text-sm font-black uppercase tracking-wide ${pendingFilters[field as keyof Filters] ? "text-[#e85d04]" : "text-zinc-500"}`}>{pendingFilters[field as keyof Filters] || "Wszystkie"}</span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-[#e85d04] transition-transform duration-200 ${openDropdown === field ? "rotate-180" : ""}`} />
              </button>
              {openDropdown === field && (
                <div className="absolute left-0 right-0 mt-1 z-50 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-lg max-h-64 overflow-y-auto">
                  {(field === "brand" || field === "model") && (
                    <div className="p-2 sticky top-0 bg-white border-b border-zinc-100 z-10">
                      <input type="text" placeholder={`Szukaj ${FIELD_LABELS[field].toLowerCase()}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#e85d04]/50" onClick={(e) => e.stopPropagation()} />
                    </div>
                  )}
                  <button onClick={() => { handleSelect(field, ""); setSearchQuery(""); }} className="w-full text-left px-5 py-3 text-zinc-400 hover:bg-zinc-50 text-xs font-black uppercase tracking-widest transition-colors border-b border-zinc-100">Wszystkie</button>
                  {getOptions(field).map((option) => (
                    <button key={option} onClick={() => handleSelect(field, option)} className={`w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors border-t border-zinc-100 ${pendingFilters[field as keyof Filters] === option ? "text-[#e85d04]" : "text-zinc-700"}`}>{option}</button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* MOC (KM) - Od / Do */}
          <div className="flex flex-col gap-1.5 px-1 mt-2">
            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest px-1">Moc (KM)</span>
            <div className="grid grid-cols-2 gap-2">
              {["powerMin", "powerMax"].map((field) => (
                <div key={field} className="relative">
                  <button
                    onClick={() => { setOpenDropdown(openDropdown === field ? null : field as any); setSearchQuery(""); }}
                    className="w-full flex items-center justify-between px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl transition-all"
                  >
                    <span className={`text-sm font-black uppercase ${(field === "powerMin" ? pendingFilters.powerMin > minPower : pendingFilters.powerMax < maxPower) ? "text-[#e85d04]" : "text-zinc-500"}`}>
                      {field === "powerMin" ? (pendingFilters.powerMin > minPower ? `${pendingFilters.powerMin} KM` : "OD") : (pendingFilters.powerMax < maxPower ? `${pendingFilters.powerMax} KM` : "DO")}
                    </span>
                    <ChevronDownIcon className="w-5 h-5 text-[#e85d04]/60" />
                  </button>
                  {openDropdown === field && (
                    <div className="absolute left-0 mt-2 z-50 bg-white border border-zinc-200 rounded-2xl shadow-2xl min-w-[150px] max-h-64 overflow-y-auto">
                      <button onClick={() => handleSelect(field as any, "")} className="w-full text-left px-5 py-3 text-xs text-zinc-400 font-black uppercase border-b border-zinc-50">Wszystkie</button>
                      {getOptions(field as any).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleSelect(field as any, opt)}
                          className={`w-full text-left px-5 py-3.5 text-xs font-black uppercase whitespace-nowrap hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 ${
                            (field === "powerMin" ? pendingFilters.powerMin : pendingFilters.powerMax) === parseInt(opt) 
                            ? "text-[#e85d04]" 
                            : "text-zinc-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* POJEMNOŚĆ (cm3) - Od / Do */}
          <div className="flex flex-col gap-1.5 px-1 mt-2">
            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest px-1">Pojemność (cm3)</span>
            <div className="grid grid-cols-2 gap-2">
              {["capacityMin", "capacityMax"].map((field) => (
                <div key={field} className="relative">
                  <button
                    onClick={() => { setOpenDropdown(openDropdown === field ? null : field as any); setSearchQuery(""); }}
                    className="w-full flex items-center justify-between px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl transition-all"
                  >
                    <span className={`text-sm font-black uppercase ${(field === "capacityMin" ? pendingFilters.capacityMin > minCapacity : pendingFilters.capacityMax < maxCapacity) ? "text-[#e85d04]" : "text-zinc-500"}`}>
                      {field === "capacityMin" ? (pendingFilters.capacityMin > minCapacity ? `${pendingFilters.capacityMin} cm3` : "OD") : (pendingFilters.capacityMax < maxCapacity ? `${pendingFilters.capacityMax} cm3` : "DO")}
                    </span>
                    <ChevronDownIcon className="w-5 h-5 text-[#e85d04]/60" />
                  </button>
                  {openDropdown === field && (
                    <div className="absolute left-0 mt-2 z-50 bg-white border border-zinc-200 rounded-2xl shadow-2xl min-w-[150px] max-h-64 overflow-y-auto">
                      <button onClick={() => handleSelect(field as any, "")} className="w-full text-left px-5 py-3 text-xs text-zinc-400 font-black uppercase border-b border-zinc-50">Wszystkie</button>
                      {getOptions(field as any).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleSelect(field as any, opt)}
                          className={`w-full text-left px-5 py-3.5 text-xs font-black uppercase whitespace-nowrap hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 ${
                            (field === "capacityMin" ? pendingFilters.capacityMin : pendingFilters.capacityMax) === parseInt(opt) 
                            ? "text-[#e85d04]" 
                            : "text-zinc-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Rok</span>
              <div className="relative">
                <span onClick={() => setEditingRange("year")} className="text-[#e85d04] text-xs font-black cursor-pointer hover:bg-zinc-100 px-2 py-1 rounded-lg transition-colors">{pendingFilters.yearMin} — {pendingFilters.yearMax}</span>
                {editingRange === "year" && (
                  <div className="absolute right-0 top-full mt-2 z-[60] bg-white border border-zinc-200 rounded-3xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col gap-4 min-w-[220px]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">Od</span>
                        <input type="number" value={pendingFilters.yearMin} onChange={(e) => setPendingFilters({ ...pendingFilters, yearMin: Number(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)} autoFocus className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#e85d04]/50" />
                      </div>
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">Do</span>
                        <input type="number" value={pendingFilters.yearMax} onChange={(e) => setPendingFilters({ ...pendingFilters, yearMax: Number(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#e85d04]/50" />
                      </div>
                    </div>
                    <button onClick={() => setEditingRange(null)} className="w-full bg-[#e85d04] text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-[#ff6d0a]">Zastosuj</button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <input type="range" min={minYear} max={maxYear} value={pendingFilters.yearMin} onChange={(e) => setPendingFilters({ ...pendingFilters, yearMin: Number(e.target.value) })} className="w-full accent-[#e85d04]" />
              <input type="range" min={minYear} max={maxYear} value={pendingFilters.yearMax} onChange={(e) => setPendingFilters({ ...pendingFilters, yearMax: Number(e.target.value) })} className="w-full accent-[#e85d04]" />
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Cena</span>
              <div className="relative">
                <span onClick={() => setEditingRange("price")} className="text-[#e85d04] text-xs font-black cursor-pointer hover:bg-zinc-100 px-2 py-1 rounded-lg transition-colors">{pendingFilters.priceMin} — {pendingFilters.priceMax} zł</span>
                {editingRange === "price" && (
                  <div className="absolute right-0 top-full mt-2 z-[60] bg-white border border-zinc-200 rounded-3xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col gap-4 min-w-[260px]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">Od (zł)</span>
                        <input type="number" value={pendingFilters.priceMin} onChange={(e) => setPendingFilters({ ...pendingFilters, priceMin: Number(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)} autoFocus className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#e85d04]/50" />
                      </div>
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">Do (zł)</span>
                        <input type="number" value={pendingFilters.priceMax} onChange={(e) => setPendingFilters({ ...pendingFilters, priceMax: Number(e.target.value) })} onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#e85d04]/50" />
                      </div>
                    </div>
                    <button onClick={() => setEditingRange(null)} className="w-full bg-[#e85d04] text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-[#ff6d0a]">Zastosuj</button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <input type="range" min={0} max={maxPrice} value={pendingFilters.priceMin} onChange={(e) => setPendingFilters({ ...pendingFilters, priceMin: Number(e.target.value) })} className="w-full accent-[#e85d04]" />
              <input type="range" min={0} max={maxPrice} value={pendingFilters.priceMax} onChange={(e) => setPendingFilters({ ...pendingFilters, priceMax: Number(e.target.value) })} className="w-full accent-[#e85d04]" />
            </div>
          </div>
        </div>

        <div className="px-7 py-5 border-t border-zinc-100 flex gap-3">
          <button onClick={handleClear} className="w-1/3 border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-400 font-black py-4 rounded-2xl uppercase tracking-[0.1em] text-xs transition-all">Wyczyść</button>
          <button onClick={handleApply} className="w-2/3 bg-gradient-to-r from-[#e85d04] to-[#ff6d0a] text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-sm shadow-[0_15px_30px_rgba(232,93,4,0.25)] active:scale-95 transition-all">Zastosuj</button>
        </div>
      </div>
    </div>
  );
}