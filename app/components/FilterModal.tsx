"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useCars, Filters } from "@/app/context/CarsContext";
import gsap from "gsap";

type DropdownField = keyof Omit<Filters, "priceMin" | "priceMax" | "yearMin" | "yearMax" | "powerMin" | "powerMax">;

const FIELD_LABELS: Record<DropdownField, string> = {
  brand: "Marka",
  model: "Model",
  fuel: "Paliwo",
  transmission: "Skrzynia biegów",
  drive: "Napęd",
};

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const { cars, pendingFilters, setPendingFilters, applyFilters, maxPrice, minYear, maxYear, minPower, maxPower } = useCars();
  const [openDropdown, setOpenDropdown] = useState<DropdownField | null>(null);
  const [editingRange, setEditingRange] = useState<"power" | "year" | "price" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const getOptions = (field: DropdownField): string[] => {
    const filtered = cars.filter((car) => {
      const matchesSearch = !searchQuery || String(car[field]).toLowerCase().startsWith(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      return (Object.keys(FIELD_LABELS) as DropdownField[]).every((f) => {
        if (f === field) return true;
        if (!pendingFilters[f]) return true;
        return String(car[f]) === pendingFilters[f];
      });
    });
    return [...new Set(filtered.map((car) => String(car[field])).filter(Boolean))].sort();
  };

  const handleSelect = (field: DropdownField, value: string) => {
    setPendingFilters({ ...pendingFilters, [field]: value });
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
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );
    gsap.fromTo(modalRef.current,
      { opacity: 0, scale: 0.95, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power3.out" }
    );
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
    return (val as string) !== "";
  }).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white border border-zinc-200 rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.15)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-zinc-100">
          <div>
            <h2 className="text-zinc-900 text-xl font-black uppercase tracking-tight">Filtry</h2>
            {activeFiltersCount > 0 ? (
              <p className="text-[#e85d04] text-xs font-bold mt-0.5">
                {activeFiltersCount} aktywnych filtrów
              </p>
            ) : (
              <p className="text-zinc-400 text-xs font-bold mt-0.5">Brak aktywnych filtrów</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center bg-zinc-100 border border-zinc-200 rounded-full hover:bg-zinc-200 transition-all"
          >
            <XMarkIcon className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="px-7 py-5 overflow-y-auto max-h-[60vh] flex flex-col gap-2">

          {/* Dropdowns */}
          {(Object.keys(FIELD_LABELS) as DropdownField[]).map((field) => (
            <div key={field} className="relative">
              <button
                onClick={() => {
                  setOpenDropdown(openDropdown === field ? null : field);
                  setSearchQuery("");
                }}
                className="w-full flex items-center justify-between px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:border-zinc-300 transition-all"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
                    {FIELD_LABELS[field]}
                  </span>
                  <span className={`text-sm font-black uppercase tracking-wide ${pendingFilters[field] ? "text-[#e85d04]" : "text-zinc-500"}`}>
                    {pendingFilters[field] || "Wszystkie"}
                  </span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-[#e85d04] transition-transform duration-200 ${openDropdown === field ? "rotate-180" : ""}`} />
              </button>

              {openDropdown === field && (
                <div className="mt-1 border border-zinc-200 bg-white rounded-2xl overflow-hidden max-h-64 overflow-y-auto shadow-lg">
                  {(field === "brand" || field === "model") && (
                    <div className="p-2 sticky top-0 bg-white border-b border-zinc-100 z-10">
                      <input
                        type="text"
                        placeholder={`Szukaj ${FIELD_LABELS[field].toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#e85d04]/50"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => { handleSelect(field, ""); setSearchQuery(""); }}
                    className="w-full text-left px-5 py-3 text-zinc-400 hover:bg-zinc-50 text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    Wszystkie
                  </button>
                  {getOptions(field).map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSelect(field, option)}
                      className={`w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors border-t border-zinc-100 ${
                        pendingFilters[field] === option ? "text-[#e85d04]" : "text-zinc-700"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Slider mocy */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Moc</span>
              <div className="relative">
                <span 
                  onClick={() => setEditingRange("power")}
                  className="text-[#e85d04] text-xs font-black cursor-pointer hover:bg-zinc-100 px-2 py-1 rounded-lg transition-colors"
                >
                  {pendingFilters.powerMin} — {pendingFilters.powerMax} KM
                </span>
                {editingRange === "power" && (
                  <div className="absolute right-0 top-full mt-2 z-[60] bg-white border border-zinc-200 rounded-3xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col gap-4 min-w-[220px]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">Od</span>
                        <input
                          type="number"
                          value={pendingFilters.powerMin}
                          onChange={(e) => setPendingFilters({ ...pendingFilters, powerMin: Number(e.target.value) })}
                          onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)}
                          autoFocus
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#e85d04]/50"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">Do</span>
                        <input
                          type="number"
                          value={pendingFilters.powerMax}
                          onChange={(e) => setPendingFilters({ ...pendingFilters, powerMax: Number(e.target.value) })}
                          onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#e85d04]/50"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => setEditingRange(null)}
                      className="w-full bg-[#e85d04] text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-[#ff6d0a] shadow-lg shadow-[#e85d04]/20"
                    >
                      Zastosuj
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400 w-4">od</span>
                <input
                  type="range" min={minPower} max={maxPower}
                  value={pendingFilters.powerMin}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, powerMin: Number(e.target.value) })}
                  className="w-full accent-[#e85d04]"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400 w-4">do</span>
                <input
                  type="range" min={minPower} max={maxPower}
                  value={pendingFilters.powerMax}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, powerMax: Number(e.target.value) })}
                  className="w-full accent-[#e85d04]"
                />
              </div>
            </div>
          </div>

          {/* Slider roku */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Rok</span>
              <div className="relative">
                <span 
                  onClick={() => setEditingRange("year")}
                  className="text-[#e85d04] text-xs font-black cursor-pointer hover:bg-zinc-100 px-2 py-1 rounded-lg transition-colors"
                >
                  {pendingFilters.yearMin} — {pendingFilters.yearMax}
                </span>
                {editingRange === "year" && (
                  <div className="absolute right-0 top-full mt-2 z-[60] bg-white border border-zinc-200 rounded-3xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col gap-4 min-w-[220px]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">Od</span>
                        <input
                          type="number"
                          value={pendingFilters.yearMin}
                          onChange={(e) => setPendingFilters({ ...pendingFilters, yearMin: Number(e.target.value) })}
                          onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)}
                          autoFocus
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#e85d04]/50"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">Do</span>
                        <input
                          type="number"
                          value={pendingFilters.yearMax}
                          onChange={(e) => setPendingFilters({ ...pendingFilters, yearMax: Number(e.target.value) })}
                          onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#e85d04]/50"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => setEditingRange(null)}
                      className="w-full bg-[#e85d04] text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-[#ff6d0a] shadow-lg shadow-[#e85d04]/20"
                    >
                      Zastosuj
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400 w-4">od</span>
                <input
                  type="range" min={minYear} max={maxYear}
                  value={pendingFilters.yearMin}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, yearMin: Number(e.target.value) })}
                  className="w-full accent-[#e85d04]"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400 w-4">do</span>
                <input
                  type="range" min={minYear} max={maxYear}
                  value={pendingFilters.yearMax}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, yearMax: Number(e.target.value) })}
                  className="w-full accent-[#e85d04]"
                />
              </div>
            </div>
          </div>

          {/* Slider ceny */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Cena</span>
              <div className="relative">
                <span 
                  onClick={() => setEditingRange("price")}
                  className="text-[#e85d04] text-xs font-black cursor-pointer hover:bg-zinc-100 px-2 py-1 rounded-lg transition-colors"
                >
                  {pendingFilters.priceMin} — {pendingFilters.priceMax} zł
                </span>
                {editingRange === "price" && (
                  <div className="absolute right-0 top-full mt-2 z-[60] bg-white border border-zinc-200 rounded-3xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col gap-4 min-w-[260px]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">Od (zł)</span>
                        <input
                          type="number"
                          value={pendingFilters.priceMin}
                          onChange={(e) => setPendingFilters({ ...pendingFilters, priceMin: Number(e.target.value) })}
                          onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)}
                          autoFocus
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#e85d04]/50"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">Do (zł)</span>
                        <input
                          type="number"
                          value={pendingFilters.priceMax}
                          onChange={(e) => setPendingFilters({ ...pendingFilters, priceMax: Number(e.target.value) })}
                          onKeyDown={(e) => e.key === "Enter" && setEditingRange(null)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#e85d04]/50"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => setEditingRange(null)}
                      className="w-full bg-[#e85d04] text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-[#ff6d0a] shadow-lg shadow-[#e85d04]/20"
                    >
                      Zastosuj
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400 w-4">od</span>
                <input
                  type="range" min={0} max={maxPrice}
                  value={pendingFilters.priceMin}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, priceMin: Number(e.target.value) })}
                  className="w-full accent-[#e85d04]"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400 w-4">do</span>
                <input
                  type="range" min={0} max={maxPrice}
                  value={pendingFilters.priceMax}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, priceMax: Number(e.target.value) })}
                  className="w-full accent-[#e85d04]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-zinc-100 flex gap-3">
          <button
            onClick={handleClear}
            className="w-1/3 border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-400 font-black py-4 rounded-2xl uppercase tracking-[0.1em] text-xs transition-all"
          >
            Wyczyść
          </button>
          <button
            onClick={handleApply}
            className="w-2/3 bg-gradient-to-r from-[#e85d04] to-[#ff6d0a] text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-sm shadow-[0_15px_30px_rgba(232,93,4,0.25)] active:scale-95 transition-all"
          >
            Pokaż wyniki
          </button>
        </div>
      </div>
    </div>
  );
}