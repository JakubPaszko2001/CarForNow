  "use client";

import { useMemo, useState } from "react";

const PERIODS = [6, 12, 24, 36, 48, 60, 72];
const VAT = 1.23;
const MIN_INITIAL_RATIO = 0.15;
const MAX_INITIAL_RATIO = 0.8;
const MAX_BUYOUT_RATIO = 0.4;
const CAR_VALUE_MAX = 300000;

const currencyFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

function baseRate(nettoValue: number) {
  if (nettoValue <= 20000) return 0.706;
  if (nettoValue >= 30000) return 0.49;
  const span = 10000;
  const diff = 0.706 - 0.49;
  return 0.706 - (diff / span) * (nettoValue - 20000);
}

function computeMonthlyPayment(
  financedAmount: number,
  buyout: number,
  months: number,
  monthlyRate: number
) {
  if (financedAmount <= 0) return 0;
  if (monthlyRate === 0) return (financedAmount - buyout) / months;
  const numerator =
    financedAmount * monthlyRate -
    buyout * monthlyRate * Math.pow(1 + monthlyRate, -months);
  const denominator = 1 - Math.pow(1 + monthlyRate, -months);
  return numerator / denominator;
}

export default function LeasingCalculatorFull() {
  const [isBrutto, setIsBrutto] = useState(false);
  const [carValueRaw, setCarValueRaw] = useState(30000);
  const [initialPayment, setInitialPayment] = useState(
    30000 * VAT * MIN_INITIAL_RATIO
  );
  const [buyout, setBuyout] = useState(0);

  const calc = useMemo(() => {
    const netto = isBrutto ? carValueRaw / VAT : carValueRaw;
    const brutto = isBrutto ? carValueRaw : carValueRaw * VAT;
    const minInitial = brutto * MIN_INITIAL_RATIO;
    const maxInitial = brutto * MAX_INITIAL_RATIO;

    const clampedInitial = Math.min(
      Math.max(initialPayment, minInitial),
      maxInitial
    );
    const financed = Math.max(0, brutto - clampedInitial);
    const maxBuyout = Math.max(
      0,
      Math.min(brutto * MAX_BUYOUT_RATIO, financed, clampedInitial)
    );
    const clampedBuyout = Math.min(Math.max(0, buyout), maxBuyout);

    const initialNetto = clampedInitial / VAT;
    const buyoutNetto = clampedBuyout / VAT;
    const initialRatio = netto > 0 ? initialNetto / netto : 0;
    const buyoutRatio = netto > 0 ? buyoutNetto / netto : 0;
    const D = baseRate(netto);
    const initialDiscount = (initialRatio - MIN_INITIAL_RATIO) * 0.5;
    const buyoutPremium = buyoutRatio * 0.5;
    const annualRate = Math.max(0, Math.min(1, D - initialDiscount + buyoutPremium));
    const monthlyRate = annualRate / 12;

    const rates = PERIODS.map((months) => ({
      months,
      value: computeMonthlyPayment(
        financed,
        clampedBuyout,
        months,
        monthlyRate
      ),
    }));

    const initialPercent =
      brutto > 0 ? Math.round((clampedInitial / brutto) * 100) : 0;

    return {
      netto,
      brutto,
      minInitial,
      maxInitial,
      maxBuyout,
      clampedInitial,
      clampedBuyout,
      initialPercent,
      rates,
    };
  }, [carValueRaw, initialPayment, buyout, isBrutto]);

  const handleTypeChange = (nextBrutto: boolean) => {
    if (nextBrutto === isBrutto) return;
    setIsBrutto(nextBrutto);
    const brutto = nextBrutto ? carValueRaw : carValueRaw * VAT;
    setInitialPayment(brutto * MIN_INITIAL_RATIO);
  };

  const handleCarValueChange = (value: number) => {
    const safe = Math.max(0, Math.min(CAR_VALUE_MAX, value));
    setCarValueRaw(safe);
    const brutto = isBrutto ? safe : safe * VAT;
    setInitialPayment(brutto * MIN_INITIAL_RATIO);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* INPUTS */}
      <div className="lg:col-span-5 bg-[#1a1a1a] rounded-3xl border border-white/10 p-7 space-y-7">
        {/* Toggle netto/brutto */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
            Typ dokumentu
          </span>
          <div className="inline-flex rounded-full bg-black/40 border border-white/10 p-1">
            <button
              type="button"
              onClick={() => handleTypeChange(false)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors ${
                !isBrutto
                  ? "bg-[#e85d04] text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Netto
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange(true)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors ${
                isBrutto
                  ? "bg-[#e85d04] text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Brutto (VAT)
            </button>
          </div>
        </div>

        {/* Car value */}
        <NumberField
          label={`Kwota auta (${isBrutto ? "brutto" : "netto"})`}
          displayValue={formatCurrency(carValueRaw)}
          min={0}
          max={CAR_VALUE_MAX}
          step={1000}
          value={carValueRaw}
          onChange={handleCarValueChange}
          helper={
            <span>
              Do kalkulacji ({isBrutto ? "netto" : "brutto"}):{" "}
              <span className="text-white font-bold">
                {formatCurrency(isBrutto ? calc.netto : calc.brutto)}
              </span>
            </span>
          }
        />

        {/* Initial payment */}
        <NumberField
          label="Opłata wstępna"
          displayValue={`${formatCurrency(calc.clampedInitial)} (${calc.initialPercent}%)`}
          min={calc.minInitial}
          max={calc.maxInitial}
          step={100}
          value={calc.clampedInitial}
          onChange={(v) => setInitialPayment(v)}
          helper={
            <span>
              Min: {formatCurrency(calc.minInitial)} (15%) • Max:{" "}
              {formatCurrency(calc.maxInitial)} (80%)
            </span>
          }
        />

        {/* Buyout */}
        <NumberField
          label="Wykup (Wartość końcowa)"
          displayValue={formatCurrency(calc.clampedBuyout)}
          min={0}
          max={Math.max(0, calc.maxBuyout)}
          step={100}
          value={calc.clampedBuyout}
          onChange={(v) => setBuyout(v)}
          helper={
            calc.maxBuyout > 0 ? (
              <span>Max: {formatCurrency(calc.maxBuyout)}</span>
            ) : (
              <span>Wykup niedostępny dla obecnych parametrów</span>
            )
          }
          disabled={calc.maxBuyout <= 0}
        />
      </div>

      {/* RESULTS */}
      <div className="lg:col-span-7">
        <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 overflow-hidden h-full flex flex-col">
                    <div className="px-7 py-6 border-b border-white/10">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              Symulacja Rat
            </h3>
            <p className="text-sm text-zinc-400 font-medium mt-1">
              Poniżej przedstawiamy orientacyjną wysokość raty miesięcznej.
            </p>
          </div>

          <div className="flex-grow p-0">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-7 py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Okres
                  </th>
                  <th className="px-7 py-3 text-right text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Rata miesięczna (brutto)*
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {calc.rates.map(({ months, value }) => (
                  <tr key={months} className="hover:bg-white/5 transition-colors">
                    <td className="px-7 py-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">
                          {months}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                          miesięcy
                        </span>
                      </div>
                    </td>
                    <td className="px-7 py-3 text-right text-2xl md:text-3xl font-black text-[#e85d04] tracking-tight">
                      {formatCurrency(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

                    <div className="bg-black/40 px-6 py-3 border-t border-white/10 text-center text-[11px] text-zinc-500 font-medium">
            * Przedstawiona kalkulacja ma charakter orientacyjny.
          </div>
        </div>
      </div>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  helper?: React.ReactNode;
  disabled?: boolean;
};

function NumberField({
  label,
  displayValue,
  min,
  max,
  step,
  value,
  onChange,
  helper,
  disabled = false,
}: NumberFieldProps) {
  const safeMax = Math.max(min, max);
  const clampedValue = Math.min(Math.max(value, min), safeMax);
  return (
    <div className={disabled ? "opacity-50" : ""}>
      <label className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          {label}
        </span>
        <span className="text-white font-black text-sm">{displayValue}</span>
      </label>
      <input
        type="range"
        min={min}
        max={safeMax}
        step={step}
        value={clampedValue}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#e85d04] cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(Math.max(min, value - 100))}
          className="w-9 h-9 rounded-lg bg-black/40 border border-white/10 text-[#e85d04] font-black text-lg hover:bg-[#e85d04] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-black/40 disabled:hover:text-[#e85d04]"
          aria-label={`Zmniejsz: ${label}`}
        >
          −
        </button>
        <input
          type="number"
          step={100}
          value={Math.round(value)}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-black/40 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-bold text-center focus:outline-none focus:border-[#e85d04] focus:ring-1 focus:ring-[#e85d04] transition-colors disabled:opacity-50"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(Math.min(safeMax, value + 100))}
          className="w-9 h-9 rounded-lg bg-black/40 border border-white/10 text-[#e85d04] font-black text-lg hover:bg-[#e85d04] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-black/40 disabled:hover:text-[#e85d04]"
          aria-label={`Zwiększ: ${label}`}
        >
          +
        </button>
      </div>
      {helper && (
        <div className="mt-2 text-xs text-zinc-500 font-medium">{helper}</div>
      )}
    </div>
  );
}
