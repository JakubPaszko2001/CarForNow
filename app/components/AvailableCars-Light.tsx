"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  BoltIcon,
  TagIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import CarCard from "./CarCard-Light";
import { useCars, SortOption } from "@/app/context/CarsContext";
import FilterModal from "./FilterModal";

gsap.registerPlugin(ScrollTrigger);

const PAGE_SIZE = 4;

const SORT_OPTIONS: { value: SortOption; label: string; sublabel: string; icon: React.ReactNode }[] = [
  { value: "price_asc",  label: "Cena",  sublabel: "rosnąco",       icon: <ArrowUpIcon className="w-4 h-4" /> },
  { value: "price_desc", label: "Cena",  sublabel: "malejąco",      icon: <ArrowDownIcon className="w-4 h-4" /> },
  { value: "year_desc",  label: "Rok",   sublabel: "najnowsze",     icon: <CalendarIcon className="w-4 h-4" /> },
  { value: "year_asc",   label: "Rok",   sublabel: "najstarsze",    icon: <CalendarIcon className="w-4 h-4" /> },
  { value: "brand_asc",  label: "Marka", sublabel: "A → Z",         icon: <TagIcon className="w-4 h-4" /> },
  { value: "power_desc", label: "Moc",   sublabel: "od najmocniejszych", icon: <BoltIcon className="w-4 h-4" /> },
  { value: "power_asc",  label: "Moc",   sublabel: "od najsłabszych",    icon: <BoltIcon className="w-4 h-4" /> },
];

export default function AvailableCars() {
  const { filteredCars: cars, loading, sortOption, setSortOption } = useCars();
  console.log("🚗 Aktualne dane aut w przeglądarce:", cars);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [cars]);

  // Infinite scroll
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => (prev >= cars.length ? prev : prev + PAGE_SIZE));
        }
      },
      { rootMargin: "200px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, cars.length]);

// GSAP ScrollTrigger – sticky toolbar
  useEffect(() => {
    // Dodajemy loading do zależności, aby odświeżyć trigger, gdy dojdą nowe dane
    if (!toolbarRef.current || !sectionRef.current || loading) return;

    const trigger = ScrollTrigger.create({
      trigger: toolbarRef.current,
      start: "top top", 
      // Zmieniamy end na dół sekcji minus wysokość toolbara, 
      // aby nie uciekał za wcześnie
      endTrigger: sectionRef.current,
      end: "bottom bottom", 
      pin: true,
      pinSpacing: false,
      // Refreshuj przy zmianie rozmiaru/zawartości
      invalidateOnRefresh: true, 
      onEnter: () => {
        gsap.to(toolbarRef.current, {
          backgroundColor: "rgba(248,248,248,0.95)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          duration: 0.3,
          ease: "power2.out",
        });
      },
      onLeaveBack: () => {
        gsap.to(toolbarRef.current, {
          backgroundColor: "transparent",
          backdropFilter: "blur(0px)",
          boxShadow: "none",
          duration: 0.3,
          ease: "power2.out",
        });
      },
    });

    // Bardzo ważne: odświeżamy ScrollTrigger, gdy zmienia się wysokość listy (infinite scroll)
    ScrollTrigger.refresh();

    return () => trigger.kill();
  }, [loading, visibleCount]); // Dodano visibleCount, aby przeliczyć pozycję po doładowaniu aut

  // Animacja dropdownu
  useEffect(() => {
    if (!sortDropdownRef.current) return;
    if (sortOpen) {
      gsap.fromTo(sortDropdownRef.current,
        { opacity: 0, y: -8, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power2.out" }
      );
    }
  }, [sortOpen]);

  // Kliknięcie poza dropdown
  useEffect(() => {
    if (!sortOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node) &&
        sortButtonRef.current && !sortButtonRef.current.contains(e.target as Node)
      ) {
        closeSortDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortOpen]);

  const closeSortDropdown = () => {
    if (!sortDropdownRef.current) return setSortOpen(false);
    gsap.to(sortDropdownRef.current, {
      opacity: 0, y: -8, scale: 0.97,
      duration: 0.2, ease: "power2.in",
      onComplete: () => setSortOpen(false),
    });
  };

  const handleSortSelect = (value: SortOption) => {
    setSortOption(value === sortOption ? null : value);
    closeSortDropdown();
  };

  const visibleCars = cars.slice(0, visibleCount);
  const hasMore = visibleCount < cars.length;

  return (
    <section ref={sectionRef} id="flota" className="w-full bg-[#f8f8f8] py-20 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-6">

        {/* Nagłówek */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-8 bg-[#e85d04]" />
              <span className="text-[#e85d04] text-xs font-black uppercase tracking-[0.3em]">Nasza Flota</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a1a1a] uppercase tracking-tight leading-none">
              Dostępne <span className="text-[#e85d04]">samochody</span>
            </h2>
            <p className="text-zinc-500 text-sm mt-4 font-medium">
              {loading
                ? "Pobieranie aktualnych ofert..."
                : `Pokazuję ${visibleCars.length} z ${cars.length} pojazdów gotowych do wynajmu.`}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar - Naprawiony poziomy scroll */}
      <div
        ref={toolbarRef}
        className="z-50 w-full py-4"
        style={{ willChange: "transform" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-3">
          {/* Sortuj */}
          <div className="relative">
            <button
              ref={sortButtonRef}
              onClick={() => sortOpen ? closeSortDropdown() : setSortOpen(true)}
              className={`flex items-center gap-3 bg-white border px-5 py-3 rounded-2xl text-xs font-black uppercase transition-all shadow-sm ${
                sortOption
                  ? "border-[#e85d04] text-[#e85d04]"
                  : "border-zinc-200 hover:border-[#e85d04] text-zinc-800"
              }`}
            >
              Sortuj
              <ChevronDownIcon className={`w-4 h-4 text-[#e85d04] transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
            </button>

            {sortOpen && (
              <div
                ref={sortDropdownRef}
                className="absolute top-full left-0 mt-2 w-64 bg-white border border-zinc-100 rounded-2xl shadow-xl overflow-hidden z-50"
              >
                {SORT_OPTIONS.map((option) => {
                  const isActive = sortOption === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSortSelect(option.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-zinc-50 last:border-0 ${
                        isActive ? "bg-[#e85d04]/5" : "hover:bg-zinc-50"
                      }`}
                    >
                      <span className={`${isActive ? "text-[#e85d04]" : "text-zinc-400"}`}>
                        {option.icon}
                      </span>
                      <div className="flex flex-col flex-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-[#e85d04]" : "text-zinc-400"}`}>
                          {option.label}
                        </span>
                        <span className={`text-xs font-black uppercase ${isActive ? "text-[#e85d04]" : "text-zinc-700"}`}>
                          {option.sublabel}
                        </span>
                      </div>
                      {isActive && <CheckIcon className="w-4 h-4 text-[#e85d04] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filtruj */}
          <button
            onClick={() => setFilterModalOpen(true)}
            className="flex items-center gap-3 bg-white border border-zinc-200 hover:border-[#e85d04] px-5 py-3 rounded-2xl text-zinc-800 text-xs font-black uppercase transition-all shadow-sm"
          >
            Filtruj <AdjustmentsHorizontalIcon className="w-4 h-4 text-[#e85d04]" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Lista aut */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e85d04]" />
          </div>
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-zinc-400 text-lg font-black uppercase tracking-widest">Brak wyników</p>
            <p className="text-zinc-500 text-sm">Spróbuj zmienić filtry lub sortowanie</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 mt-4">
              {visibleCars.map((car, index) => (
                <CarCard key={`${car.brand}-${car.model}-${index}`} car={car} />
              ))}
            </div>

            <div ref={sentinelRef} className="h-1" />

            {hasMore && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e85d04]" />
              </div>
            )}
          </>
        )}
      </div>

      <FilterModal isOpen={filterModalOpen} onClose={() => setFilterModalOpen(false)} />
    </section>
  );
}