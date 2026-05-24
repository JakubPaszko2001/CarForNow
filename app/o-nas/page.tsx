import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  TruckIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import CreatedBy from "@/app/components/CreatedBy";

export const metadata: Metadata = {
  title: "O nas — kim jesteśmy i jak działa wynajem z wykupem",
  description:
    "CarForNow to wynajem długoterminowy aut z opcją wykupu w Białymstoku. Poznaj proces w 4 krokach, wymagania (dowód + prawo jazdy) i zalety naszej oferty.",
  alternates: { canonical: "/o-nas" },
  openGraph: {
    title: "O CarForNow — wynajem długoterminowy z opcją wykupu",
    description:
      "Bez BIK, bez zaświadczeń. Po ostatniej racie auto jest Twoje. Sprawdź, jak działa nasz wynajem.",
    url: "https://carfornow.pl/o-nas",
  },
};

const STEPS = [
  {
    number: "01",
    title: "Wybierz pojazd",
    desc: "Przeglądaj naszą flotę i wybierz samochód dopasowany do Twoich potrzeb.",
  },
  {
    number: "02",
    title: "Podpisz umowę",
    desc: "Wymagamy jedynie dowodu osobistego i prawa jazdy. Zero zaświadczeń o zarobkach.",
  },
  {
    number: "03",
    title: "Płać miesięcznie",
    desc: "Reguluj raty miesięczne w ustalonym terminie i ciesz się samochodem.",
  },
  {
    number: "04",
    title: "Auto staje się Twoje",
    desc: "Po opłaceniu ostatniej raty samochód przechodzi na Twoją własność bez dodatkowych opłat.",
  },
];

const BENEFITS = [
  {
    icon: CurrencyDollarIcon,
    title: "Niskie koszty wejścia",
    desc: "Minimalna opłata wstępna — zacznij jeździć bez angażowania dużego kapitału.",
  },
  {
    icon: DocumentCheckIcon,
    title: "Uproszczona procedura",
    desc: "Tylko dowód i prawo jazdy. Nie sprawdzamy BIK, nie wymagamy zaświadczeń o dochodach.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Pełna dokumentacja",
    desc: "Pojazdy z udokumentowanym przebiegiem i historią serwisową.",
  },
  {
    icon: ClockIcon,
    title: "Auto od ręki",
    desc: "Podpisujesz umowę, wpłacasz opłatę wstępną — i tego samego dnia wyjeżdżasz.",
  },
  {
    icon: TruckIcon,
    title: "Pełen serwis",
    desc: "Olej, zawieszenie, hamulce, sprzęgło — dbamy o stan techniczny Twojego auta.",
  },
  {
    icon: CheckCircleIcon,
    title: "Elastyczność",
    desc: "Możesz zrezygnować w dowolnym momencie, zwracając pojazd przed początkiem kolejnego miesiąca.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">

      {/* HERO */}
      <div className="bg-[#1a1a1a] pt-28 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,93,4,0.12),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-[2px] w-8 bg-[#e85d04]" />
            <span className="text-[#e85d04] text-xs font-black uppercase tracking-[0.3em]">O firmie</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-none mb-6">
            Wynajem długoterminowy<br />
            <span className="text-[#e85d04]">z opcją wykupu</span>
          </h1>
          <p className="text-zinc-400 text-lg font-medium max-w-2xl leading-relaxed">
            CarForNow to nowoczesna forma wynajmu pojazdów, która pozwala stać się właścicielem samochodu
            przy zachowaniu gwarantowanego przebiegu i udokumentowanej historii.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/#flota"
              className="bg-[#e85d04] hover:bg-[#ff6d0a] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_10px_25px_rgba(232,93,4,0.25)]"
            >
              Przeglądaj flotę
            </Link>
            <Link
              href="https://m.me/61580848462292"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 hover:border-[#e85d04]/60 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-white/5"
            >
              Skontaktuj się
            </Link>
          </div>
        </div>
      </div>

      {/* JAK TO DZIAŁA */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-[#e85d04]" />
            <span className="text-[#e85d04] text-xs font-black uppercase tracking-[0.3em]">Proces</span>
            <span className="h-[2px] w-8 bg-[#e85d04]" />
          </div>
          <h2 className="text-4xl font-black text-[#1a1a1a] uppercase tracking-tight">
            Jak to działa?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div key={step.number} className="relative bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <span className="text-6xl font-black text-zinc-100 leading-none select-none absolute top-4 right-5">
                {step.number}
              </span>
              <div className="relative z-10">
                <span className="inline-block text-[#e85d04] text-xs font-black uppercase tracking-widest mb-3">
                  Krok {step.number}
                </span>
                <h3 className="text-base font-black text-[#1a1a1a] uppercase tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ZALETY */}
      <div className="bg-[#1a1a1a] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-[2px] w-8 bg-[#e85d04]" />
              <span className="text-[#e85d04] text-xs font-black uppercase tracking-[0.3em]">Dlaczego my</span>
              <span className="h-[2px] w-8 bg-[#e85d04]" />
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">
              Nasze zalety
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#e85d04]/30 transition-colors group"
              >
                <div className="w-10 h-10 bg-[#e85d04]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#e85d04]/20 transition-colors">
                  <b.icon className="w-5 h-5 text-[#e85d04]" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2">{b.title}</h3>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WYMAGANIA */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-8 bg-[#e85d04]" />
              <span className="text-[#e85d04] text-xs font-black uppercase tracking-[0.3em]">Wymagania</span>
            </div>
            <h2 className="text-4xl font-black text-[#1a1a1a] uppercase tracking-tight mb-6">
              Co potrzebujesz?
            </h2>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
              Nasz proces jest maksymalnie uproszczony. Nie stawiamy barier finansowych
              ani biurokratycznych — chcemy, żebyś jak najszybciej mógł cieszyć się swoim autem.
            </p>
            <div className="flex flex-col gap-3">
              {[
                "Dowód osobisty",
                "Prawo jazdy",
                "Brak zaświadczeń o zarobkach",
                "Nie sprawdzamy BIK ani KRD",
                "Zadłużenie u komornika nie dyskwalifikuje",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#e85d04] flex-shrink-0" />
                  <span className="text-zinc-700 text-sm font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-3xl p-8">
            <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-3">
              Ważne
            </p>
            <p className="text-white text-xl font-black leading-snug mb-6">
              "Gdy opłacisz ostatnią ratę, samochód staje się Twoją własnością bez żadnych dodatkowych opłat."
            </p>
            <div className="h-[1px] bg-white/10 mb-6" />
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Możesz też zrezygnować w dowolnym momencie — wystarczy zwrócić pojazd przed początkiem kolejnego miesiąca.
            </p>
          </div>
        </div>
      </div>

      {/* KONTAKT */}
      <div className="bg-white border-t border-zinc-100 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <span className="h-[2px] w-8 bg-[#e85d04]" />
            <span className="text-[#e85d04] text-xs font-black uppercase tracking-[0.3em]">Kontakt</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#e85d04]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <BuildingOfficeIcon className="w-5 h-5 text-[#e85d04]" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Firma</p>
                <p className="text-sm font-bold text-zinc-900">CFY SPÓŁKA AKCYJNA</p>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">NIP: 9662156965</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#e85d04]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPinIcon className="w-5 h-5 text-[#e85d04]" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Adres</p>
                <p className="text-sm font-bold text-zinc-900">ul. Piękna 5/2</p>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">15-282 Białystok</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#e85d04]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <PhoneIcon className="w-5 h-5 text-[#e85d04]" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Telefon</p>
                <a
                  href="tel:+48510510018"
                  className="text-sm font-bold text-zinc-900 hover:text-[#e85d04] transition-colors"
                >
                  510 510 018
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreatedBy />
    </div>
  );
}
