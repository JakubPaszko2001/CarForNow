"use client";

import { useState } from "react";
import { CalculatorIcon } from "@heroicons/react/24/outline";

const PERIODS = [24, 36, 48, 60] as const;
type Period = (typeof PERIODS)[number];

function calcMonthly(carValue: number, downPayment: number, months: Period): number {
  if (carValue <= 0 || downPayment >= carValue) return 0;
  const downPct = Math.min(downPayment / carValue, 0.9);
  const capital = carValue - downPayment;
  const multiplier = 2.0 - downPct;
  const total60 = capital * multiplier;
  const yearsLess = (60 - months) / 12;
  const total = total60 * Math.pow(0.9, yearsLess);
  return Math.floor(total / months / 10) * 10;
}

interface Props {
  scrappedPrice?: number;
}

export default function LeasingCalculator({ scrappedPrice }: Props) {
  const [mode, setMode] = useState<"offer" | "calc">(scrappedPrice ? "offer" : "calc");
  const [carValue, setCarValue] = useState("");
  const [downValue, setDownValue] = useState("");
  const [downMode, setDownMode] = useState<"pln" | "pct">("pln");
  const [activePeriod, setActivePeriod] = useState<Period>(60);

  const carVal = parseFloat(carValue.replace(/\s/g, "").replace(",", ".")) || 0;
  const downRaw = parseFloat(downValue.replace(/\s/g, "").replace(",", ".")) || 0;
  const downAmt = downMode === "pln" ? downRaw : carVal * downRaw / 100;
  const downPct = carVal > 0 ? (downAmt / carVal) * 100 : 0;
  const capital = Math.max(carVal - downAmt, 0);
  const multiplier = carVal > 0 ? 2.0 - downAmt / carVal : 2.0;

  const results = PERIODS.map((p) => ({
    months: p,
    monthly: calcMonthly(carVal, downAmt, p),
  }));

  const activeMonthly = results.find((r) => r.months === activePeriod)?.monthly ?? 0;

  return (
    <div className="mt-6 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <CalculatorIcon className="w-5 h-5 text-[#e85d04]" />
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">
            Kalkulator finansowania
          </h3>
        </div>
        {scrappedPrice && (
          <div className="flex rounded-xl border border-zinc-200 overflow-hidden">
            {(["offer", "calc"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                  mode === m ? "bg-[#e85d04] text-white" : "text-zinc-400 hover:bg-zinc-50"
                }`}
              >
                {m === "offer" ? "Oferta" : "Kalkulator"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        {/* ── OFERTA MODE ── */}
        {mode === "offer" && scrappedPrice ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
              Miesięczna rata najmu
            </p>
            <p className="text-6xl font-black text-[#1a1a1a] leading-none">
              {scrappedPrice.toLocaleString("pl-PL")}
              <span className="text-2xl ml-2 text-[#e85d04]">zł</span>
            </p>
            <p className="text-xs text-zinc-400 font-medium mt-1">Oferta z CarForLease</p>
            <button
              onClick={() => setMode("calc")}
              className="mt-3 text-[10px] font-black uppercase tracking-wider text-[#e85d04] hover:underline"
            >
              Przelicz własne wartości →
            </button>
          </div>
        ) : (
          /* ── KALKULATOR MODE ── */
          <div className="flex flex-col gap-5">
            {/* Wartość pojazdu */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                Wartość pojazdu (zł)
              </label>
              <input
                type="number"
                value={carValue}
                onChange={(e) => setCarValue(e.target.value)}
                placeholder="np. 100000"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-900 focus:outline-none focus:border-[#e85d04]/50 placeholder-zinc-300"
              />
            </div>

            {/* Opłata wstępna */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Opłata wstępna
                  {carVal > 0 && downAmt > 0 && (
                    <span className="text-zinc-500 ml-1">
                      ({downPct.toFixed(0)}% · {downAmt.toLocaleString("pl-PL")} zł)
                    </span>
                  )}
                </label>
                <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
                  {(["pln", "pct"] as const).map((dm) => (
                    <button
                      key={dm}
                      onClick={() => { setDownMode(dm); setDownValue(""); }}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase transition-colors ${
                        downMode === dm ? "bg-[#e85d04] text-white" : "text-zinc-400"
                      }`}
                    >
                      {dm === "pln" ? "zł" : "%"}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                value={downValue}
                onChange={(e) => setDownValue(e.target.value)}
                placeholder={downMode === "pln" ? "np. 20000" : "np. 20"}
                min={0}
                max={downMode === "pct" ? 90 : undefined}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-900 focus:outline-none focus:border-[#e85d04]/50 placeholder-zinc-300"
              />
              {carVal > 0 && (
                <div className="flex justify-between mt-2 text-[10px] font-bold">
                  <span className="text-zinc-400">
                    Kapitał finansowany:{" "}
                    <span className="text-zinc-700">{capital.toLocaleString("pl-PL")} zł</span>
                  </span>
                  <span className="text-zinc-400">
                    Mnożnik:{" "}
                    <span className="text-[#e85d04]">×{multiplier.toFixed(2)}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Okres */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                Okres finansowania
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePeriod(p)}
                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                      activePeriod === p
                        ? "bg-[#e85d04] text-white border-[#e85d04] shadow-[0_6px_16px_rgba(232,93,4,0.2)]"
                        : "border-zinc-200 text-zinc-500 hover:border-[#e85d04]/40"
                    }`}
                  >
                    {p} msc
                  </button>
                ))}
              </div>
            </div>

            {/* Wyniki */}
            {carVal > 0 && (
              <>
                {/* Główny wynik */}
                <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 rounded-2xl p-5 text-center">
                  <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-3">
                    Rata miesięczna · {activePeriod} miesięcy
                  </p>
                  <p className="text-5xl font-black text-[#1a1a1a] leading-none">
                    {activeMonthly ? activeMonthly.toLocaleString("pl-PL") : "—"}
                    <span className="text-2xl ml-2 text-[#e85d04]">zł</span>
                  </p>
                </div>

                {/* Porównanie wszystkich okresów */}
                <div className="grid grid-cols-4 gap-2">
                  {results.map((r) => (
                    <button
                      key={r.months}
                      onClick={() => setActivePeriod(r.months)}
                      className={`rounded-xl p-3 border text-center transition-all ${
                        activePeriod === r.months
                          ? "border-[#e85d04]/30 bg-[#e85d04]/5"
                          : "border-zinc-100 hover:border-zinc-200 bg-zinc-50"
                      }`}
                    >
                      <p className="text-[9px] font-black uppercase text-zinc-400">{r.months} msc</p>
                      <p
                        className={`text-sm font-black mt-1 ${
                          activePeriod === r.months ? "text-[#e85d04]" : "text-zinc-700"
                        }`}
                      >
                        {r.monthly ? `${r.monthly.toLocaleString("pl-PL")} zł` : "—"}
                      </p>
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-zinc-400 font-medium text-center leading-relaxed">
                  * Kalkulacja orientacyjna na podstawie wartości pojazdu i opłaty wstępnej.
                  <br />
                  Ostateczne warunki ustalane indywidualnie.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}