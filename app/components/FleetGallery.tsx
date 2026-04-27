"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCars } from "@/app/context/CarsContext";
import gsap from "gsap";

interface FleetGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 16;

export default function FleetGallery({ isOpen, onClose }: FleetGalleryProps) {
  const { cars, loading } = useCars();
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [search, setSearch] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = cars.filter((car) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (car.brand || "").toLowerCase().includes(q) ||
      (car.model || "").toLowerCase().includes(q)
    );
  });

  const visible = filtered.slice(0, visibleCount);

  // Infinite scroll
  useEffect(() => {
    if (!isOpen) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
        }
      },
      { root: scrollRef.current, rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isOpen, filtered.length]);

  // Reset on open / search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [isOpen, search]);

  // GSAP open
  useEffect(() => {
    if (!isOpen || !overlayRef.current || !panelRef.current) return;
    document.body.style.overflow = "hidden";
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(panelRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" });
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const animateOut = (cb: () => void) => {
    if (!overlayRef.current || !panelRef.current) return cb();
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, ease: "power2.in" });
    gsap.to(panelRef.current, { opacity: 0, y: 30, duration: 0.2, ease: "power2.in", onComplete: cb });
    document.body.style.overflow = "";
  };

  const handleClose = () => animateOut(onClose);

  const handleCarClick = (link: string) => {
    animateOut(() => {
      onClose();
      router.push(link);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleClose}
      />

      <div ref={panelRef} className="relative z-10 flex flex-col h-full max-h-full">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-white/10 bg-[#0d0d0d]">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-none">
              Nasza <span className="text-[#e85d04]">Flota</span>
            </h2>
            <p className="text-zinc-500 text-[11px] font-bold mt-1">
              {loading
                ? "Ładowanie..."
                : search.trim()
                ? `${filtered.length} wyników dla „${search}"`
                : `${cars.length} samochodów`}
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Szukaj marki lub modelu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#e85d04]/50 w-52"
              />
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pt-3 pb-1 bg-[#0d0d0d]">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Szukaj marki lub modelu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#e85d04]/50"
            />
          </div>
        </div>

        {/* GALLERY */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#0d0d0d] px-4 md:px-8 py-5">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-[#e85d04] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Brak wyników</p>
              <button onClick={() => setSearch("")} className="text-[#e85d04] text-xs font-black uppercase tracking-wider hover:underline">Wyczyść wyszukiwanie</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3">
                {visible.map((car, i) => {
                  const slug = String(car.link).replace("/auto/", "").replace(/\//g, "");
                  return (
                    <div
                      key={slug + i}
                      onClick={() => handleCarClick(car.link)}
                      className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 block cursor-pointer"
                    >
                      <Image
                        src={car.image}
                        alt={`${car.brand} ${car.model}`}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Always-visible bottom gradient + info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                      {/* Tag badge */}
                      {car.tag && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#e85d04] text-white text-[9px] font-black uppercase tracking-wider">
                          {car.tag}
                        </div>
                      )}

                      {/* Car info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-[11px] font-black uppercase leading-tight tracking-wide">
                          {car.brand}{" "}
                          <span className="text-[#e85d04]">{car.model}</span>
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-zinc-400 text-[10px] font-bold">
                            {car.price ? `${car.price.toLocaleString("pl-PL")} zł` : "—"}
                          </p>
                          <span className="text-zinc-600 text-[9px] font-bold uppercase">
                            {car.year}
                          </span>
                        </div>
                      </div>

                      {/* Hover border glow */}
                      <div className="absolute inset-0 rounded-xl ring-2 ring-[#e85d04] ring-offset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  );
                })}
              </div>

              {/* Sentinel */}
              <div ref={sentinelRef} className="h-2 mt-4" />

              {/* Loading more */}
              {visibleCount < filtered.length && (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#e85d04] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* End */}
              {visibleCount >= filtered.length && filtered.length > PAGE_SIZE && (
                <p className="text-center text-zinc-700 text-[11px] font-bold uppercase tracking-widest py-6">
                  Wszystkie {filtered.length} samochodów
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}