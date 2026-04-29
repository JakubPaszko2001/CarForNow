'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { 
  BoltIcon, Cog6ToothIcon, CalendarIcon, 
  ScaleIcon, MapPinIcon, ArrowLeftIcon,
  SwatchIcon, CheckCircleIcon, XMarkIcon,
  ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import LeasingCalculator from '@/app/components/LeasingCalculator';

const CACHE_TTL = 5 * 60 * 1000;

function getCachedCar(slug: string) {
  if (typeof window === 'undefined') return null;
  const cached = sessionStorage.getItem(`car_${slug}`);
  const cachedAt = sessionStorage.getItem(`car_${slug}_at`);
  if (cached && cachedAt && Date.now() - Number(cachedAt) < CACHE_TTL) {
    return JSON.parse(cached);
  }
  return null;
}

export default function CarPage() {
  const { slug } = useParams();
  
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState(0);

  // DODANY EFEKT: Scroll na górę przy załadowaniu slug
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const cachedData = getCachedCar(slug as string);
    
    if (cachedData) {
      console.log("Dane wczytane z CACHE:", cachedData);
      setCar(cachedData);
      setLoading(false);
      return;
    }

    fetch(`/api/cars/${slug}`)
      .then(r => r.json())
      .then(data => {
        console.log("Dane pobrane z API:", data);
        sessionStorage.setItem(`car_${slug}`, JSON.stringify(data));
        sessionStorage.setItem(`car_${slug}_at`, String(Date.now()));
        setCar(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd fetch:", err);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!modalOpen || !car) return;
      if (e.key === 'Escape') setModalOpen(false);
      if (e.key === 'ArrowRight') setModalImg(i => (i + 1) % car.images.length);
      if (e.key === 'ArrowLeft') setModalImg(i => (i - 1 + car.images.length) % car.images.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalOpen, car]);

  if (loading) return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e85d04]"></div>
    </div>
  );

  if (!car) return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center text-[#1a1a1a] font-bold">
      Nie znaleziono auta
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* MODAL GALERII */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <button 
            onClick={() => setModalOpen(false)}
            className="absolute top-5 right-5 z-10 bg-white/10 hover:bg-[#e85d04] text-white p-2 rounded-full transition-all"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
      
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-xs font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full">
            {modalImg + 1} / {car.images?.length || 0}
          </div>
      
          {car.images?.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setModalImg(i => (i - 1 + car.images.length) % car.images.length); }}
                className="absolute left-5 z-10 bg-white/10 hover:bg-[#e85d04] text-white p-3 rounded-full transition-all"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setModalImg(i => (i + 1) % car.images.length); }}
                className="absolute right-5 z-10 bg-white/10 hover:bg-[#e85d04] text-white p-3 rounded-full transition-all"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </>
          )}
      
          <div className="relative w-full max-w-5xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={car.images[modalImg]} 
              alt={car.brand} 
              fill 
              className="object-contain drop-shadow-2xl" 
            />
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-[#1a1a1a] text-xs font-black uppercase tracking-widest mb-10 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
          Wróć do floty
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-[2px] w-8 bg-[#e85d04]"></span>
              <span className="text-[#e85d04] text-xs font-black uppercase tracking-[0.3em]">Szczegóły pojazdu</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] uppercase tracking-tight leading-none">
              {car.brand} <span className="text-zinc-400">{car.model}</span>
            </h1>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2">{car.nadwozie}</p>
          </div>
          {car.brandLogo && (
            <div className="relative w-14 h-14 flex-shrink-0">
              <Image src={car.brandLogo} alt={car.brand} fill className="object-contain object-center" />
            </div>
          )}
        </div>

        {/* SEKCOJA ZDJĘĆ */}
        {car.images?.length > 0 && (
          <div className="mb-8">
            <div 
              className="relative w-full h-72 md:h-[420px] rounded-2xl overflow-hidden bg-zinc-100 shadow-sm cursor-zoom-in"
              onClick={() => { setModalImg(activeImg); setModalOpen(true); }}
            >
              <Image src={car.images[activeImg]} alt={car.brand} fill className="object-cover object-center" priority />
              <div className="absolute top-4 left-4 bg-[#e85d04] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg">
                Dostępny
              </div>
            </div>
            {car.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {car.images.map((img: string, i: number) => (
                  <div
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-24 h-16 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      activeImg === i ? 'border-[#e85d04]' : 'border-transparent opacity-40 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover object-center" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PARAMETRY */}
          <div className="md:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6">Parametry techniczne</h3>
            <div className="grid grid-cols-2 gap-y-5">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-4 h-4 text-[#e85d04]" />
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Rok</p>
                  <p className="text-sm font-black text-[#1a1a1a]">{car.rok}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BoltIcon className="w-4 h-4 text-[#e85d04]" />
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Paliwo</p>
                  <p className="text-sm font-black text-[#1a1a1a]">{car.paliwo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ScaleIcon className="w-4 h-4 text-[#e85d04]" />
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Przebieg</p>
                  <p className="text-sm font-black text-[#1a1a1a]">{car.przebieg}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Cog6ToothIcon className="w-4 h-4 text-[#e85d04]" />
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Skrzynia</p>
                  <p className="text-sm font-black text-[#1a1a1a]">{car.skrzynia}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BoltIcon className="w-4 h-4 text-[#e85d04]" />
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Silnik</p>
                  <p className="text-sm font-black text-[#1a1a1a]">{car.silnik}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SwatchIcon className="w-4 h-4 text-[#e85d04]" />
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Kolor</p>
                  <p className="text-sm font-black text-[#1a1a1a]">{car.kolor}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CENA I AKCJA */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Rata miesięczna</p>
              <p className="text-5xl font-black text-[#1a1a1a] leading-none">
                {car.price || car.cena || '---'}
                <span className="text-2xl ml-1">zł</span>
              </p>
              <button className="mt-6 w-full bg-[#e85d04] hover:bg-[#ff6d0a] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_10px_25px_rgba(232,93,4,0.2)]">
                Zapytaj o wynajem
              </button>
            </div>

            {car.lokalizacja && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-[#e85d04] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Lokalizacja</p>
                  <p className="text-sm font-bold text-zinc-700">{car.lokalizacja}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KALKULATOR */}
        <LeasingCalculator scrappedPrice={car.price || undefined} initialCarValue={car.wartoscPojazdu || undefined} />

        {/* WYPOSAŻENIE */}
        {car.wyposazenie?.length > 0 && (
          <div className="mt-6 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6">Wyposażenie pojazdu</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {car.wyposazenie.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#e85d04] flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-700 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPIS */}
        {car.opis && (
          <div className="mt-6 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Opis</h3>
            <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-wrap">{car.opis}</p>
          </div>
        )}
      </div>
    </div>
  );
}