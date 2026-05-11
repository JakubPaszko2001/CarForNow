"use client";

import { useEffect, useState } from "react";
import { CalculatorIcon } from "@heroicons/react/24/outline";

const PERIODS = [24, 36, 48, 60] as const;
type Period = (typeof PERIODS)[number];

function calcMonthly(carValue: number, downPayment: number, months: number): number {
  if (carValue <= 0 || downPayment >= carValue) return 0;
  const downPct = Math.min(downPayment / carValue, 0.9);
  const capital = carValue - downPayment;
  const multiplier = 2.0 - downPct;
  const total60 = capital * multiplier;
  const yearsLess = (60 - months) / 12;
  const total = total60 * Math.pow(0.9, yearsLess);
  return Math.floor(total / months / 10) * 10;
}

// Reverse: dla zadanej raty miesięcznej, opłaty wstępnej i okresu — oblicza
// wartość pojazdu spełniającą formułę calcMonthly. Rozwiązuje równanie
// 2X² - (3D + total60)X + D² = 0 (większy pierwiastek).
function calcCarValue(monthly: number, downPayment: number, months: number): number {
  if (!monthly || monthly <= 0 || months <= 0) return 0;
  // +5 ⇒ środek 10-zł "kosza" floor w calcMonthly, by po zaokrągleniu trafić w monthly
  const targetMonthly = monthly + 5;
  const total = targetMonthly * months;
  const yearsLess = (60 - months) / 12;
  const total60 = total / Math.pow(0.9, yearsLess);
  const D = downPayment;
  const a = 2;
  const b = -(3 * D + total60);
  const c = D * D;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return 0;
  const X = (-b + Math.sqrt(disc)) / (2 * a);
  return Math.max(X, 0);
}

interface Props {
  scrappedPrice?: number;
  initialCarValue?: number;
  oplataWstepna?: number;
  okresUmowy?: number;
}

export default function LeasingCalculator({
  scrappedPrice,
  initialCarValue,
  oplataWstepna,
  okresUmowy,
}: Props) {
  const defaultPeriod: Period =
    okresUmowy && (PERIODS as readonly number[]).includes(okresUmowy)
      ? (okresUmowy as Period)
      : 60;

  // Wstępna wartość pojazdu: 1) jawna z admina, 2) reverse z API (rata + opłata + okres), 3) pusta
  const computedInitial =
    initialCarValue ??
    (scrappedPrice && okresUmowy
      ? Math.round(calcCarValue(scrappedPrice, oplataWstepna ?? 0, okresUmowy))
      : undefined);

  const [carValue, setCarValue] = useState(
    computedInitial ? String(computedInitial) : ""
  );
  const [downValue, setDownValue] = useState(
    oplataWstepna ? String(oplataWstepna) : ""
  );
  const [downMode, setDownMode] = useState<"pln" | "pct">("pln");
  const [activePeriod, setActivePeriod] = useState<Period>(defaultPeriod);

  // Jeśli API doleci z opóźnieniem — zsynchronizuj stan startowy
  useEffect(() => {
    if (oplataWstepna && !downValue) setDownValue(String(oplataWstepna));
  }, [oplataWstepna]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (computedInitial && !carValue) setCarValue(String(computedInitial));
  }, [computedInitial]); // eslint-disable-line react-hooks/exhaustive-deps

  const carVal = parseFloat(carValue.replace(/\s/g, "").replace(",", ".")) || 0;
  const downRaw = parseFloat(downValue.replace(/\s/g, "").replace(",", ".")) || 0;
  const downAmt = downMode === "pln" ? downRaw : carVal * downRaw / 100;

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
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-5">
          {/* Opłata wstępna */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Opłata wstępna
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
      </div>
    </div>
  );
}
