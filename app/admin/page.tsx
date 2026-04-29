"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { MapPinIcon, CheckCircleIcon, CogIcon, LockClosedIcon } from "@heroicons/react/24/outline";

const PASSWORD = "admincarsfornow";
const SESSION_KEY = "admin_auth";

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onUnlock();
    } else {
      setError(true);
      setValue("");
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#e85d04]/10 border border-[#e85d04]/30 rounded-2xl flex items-center justify-center mb-4">
            <LockClosedIcon className="w-6 h-6 text-[#e85d04]" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-widest text-white">Panel admina</h1>
          <p className="text-xs text-zinc-500 font-medium mt-1">Podaj hasło aby kontynuować</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Hasło"
            className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none transition-all placeholder-zinc-600 ${
              error ? "border-red-500 animate-pulse" : "border-white/10 focus:border-[#e85d04]/50"
            }`}
          />
          {error && (
            <p className="text-red-400 text-xs font-bold text-center">Nieprawidłowe hasło</p>
          )}
          <button
            type="submit"
            className="w-full bg-[#e85d04] hover:bg-[#ff6d0a] text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-[0_10px_25px_rgba(232,93,4,0.25)]"
          >
            Wejdź
          </button>
        </form>
      </div>
    </div>
  );
}

interface ScrapedCar {
  brand: string;
  model: string;
  image: string;
  link: string;
  price: number;
  lokalizacja?: string;
  nadwozie?: string;
  wartoscPojazdu?: number;
}

interface AdminProps {
  lokalizacja: string;
  nadwozie: string;
  wartoscPojazdu: string;
}

function slugFromLink(link: string) {
  return link.replace("/auto/", "").replace(/\//g, "");
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [cars, setCars] = useState<ScrapedCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<Record<string, AdminProps>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/cars")
      .then((r) => r.json())
      .then((data: ScrapedCar[]) => {
        setCars(data);
        const initial: Record<string, AdminProps> = {};
        data.forEach((car) => {
          const slug = slugFromLink(car.link);
          initial[slug] = {
            lokalizacja: car.lokalizacja ?? "",
            nadwozie: car.nadwozie ?? "",
            wartoscPojazdu: car.wartoscPojazdu ? String(car.wartoscPojazdu) : "",
          };
        });
        setForms(initial);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authed]);

  if (!authed) return <PasswordGate onUnlock={() => setAuthed(true)} />;

  const handleChange = (slug: string, field: keyof AdminProps, value: string) => {
    setForms((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [field]: value },
    }));
    setSaved((prev) => ({ ...prev, [slug]: false }));
  };

  const handleSave = async (slug: string) => {
    setSaving((prev) => ({ ...prev, [slug]: true }));
    const f = forms[slug];
    await fetch("/api/admin/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        lokalizacja: f.lokalizacja,
        nadwozie: f.nadwozie,
        wartoscPojazdu: f.wartoscPojazdu ? Number(f.wartoscPojazdu) : null,
      }),
    });
    setSaving((prev) => ({ ...prev, [slug]: false }));
    setSaved((prev) => ({ ...prev, [slug]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [slug]: false })), 2000);
  };

  const filtered = cars.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="bg-[#1a1a1a] text-white px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CogIcon className="w-6 h-6 text-[#e85d04]" />
            <div>
              <h1 className="text-xl font-black uppercase tracking-widest">Panel Administracyjny</h1>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">Zarządzaj właściwościami pojazdów</p>
            </div>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
            {cars.length} pojazdów
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search */}
        <input
          type="text"
          placeholder="Szukaj po marce lub modelu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#e85d04]/50 placeholder-zinc-400 mb-8 shadow-sm"
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#e85d04]" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((car) => {
              const slug = slugFromLink(car.link);
              const f = forms[slug] ?? { lokalizacja: "", nadwozie: "", wartoscPojazdu: "" };
              const isSaving = saving[slug];
              const isSaved = saved[slug];

              return (
                <div
                  key={slug}
                  className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Car image */}
                    <div className="relative w-full md:w-48 h-36 flex-shrink-0 bg-zinc-100">
                      <Image
                        src={car.image}
                        alt={`${car.brand} ${car.model}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col gap-4">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-black text-[#1a1a1a] uppercase tracking-tight">
                            {car.brand} <span className="text-zinc-400">{car.model}</span>
                          </h2>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                            {slug}
                          </p>
                        </div>
                        {car.price > 0 && (
                          <span className="text-sm font-black text-[#e85d04] bg-[#e85d04]/10 px-3 py-1.5 rounded-xl whitespace-nowrap">
                            {car.price.toLocaleString("pl-PL")} zł/mc
                          </span>
                        )}
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                            Lokalizacja
                          </label>
                          <div className="relative">
                            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                              type="text"
                              value={f.lokalizacja}
                              onChange={(e) => handleChange(slug, "lokalizacja", e.target.value)}
                              placeholder="np. Białystok"
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#e85d04]/50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                            Nadwozie
                          </label>
                          <input
                            type="text"
                            value={f.nadwozie}
                            onChange={(e) => handleChange(slug, "nadwozie", e.target.value)}
                            placeholder="np. SUV"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#e85d04]/50"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                            Wartość pojazdu (zł) — kalkulator
                          </label>
                          <input
                            type="number"
                            value={f.wartoscPojazdu}
                            onChange={(e) => handleChange(slug, "wartoscPojazdu", e.target.value)}
                            placeholder="np. 120000"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#e85d04]/50"
                          />
                        </div>
                      </div>

                      {/* Save button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSave(slug)}
                          disabled={isSaving}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            isSaved
                              ? "bg-green-500 text-white"
                              : "bg-[#e85d04] hover:bg-[#ff6d0a] text-white active:scale-95"
                          } shadow-sm`}
                        >
                          {isSaving ? (
                            <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                          ) : isSaved ? (
                            <CheckCircleIcon className="w-4 h-4" />
                          ) : null}
                          {isSaved ? "Zapisano" : isSaving ? "Zapisuję..." : "Zapisz"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <p className="text-center text-zinc-400 font-bold py-12">Nie znaleziono pojazdów</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
