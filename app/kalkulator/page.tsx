import LeasingCalculatorFull from "@/app/components/LeasingCalculatorFull";
import {
  DocumentCheckIcon,
  IdentificationIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* HERO */}
      <div className="bg-[#1a1a1a] pt-28 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,93,4,0.12),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-[2px] w-8 bg-[#e85d04]" />
            <span className="text-[#e85d04] text-xs font-black uppercase tracking-[0.3em]">
              Kalkulator
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-none mb-6">
            Kalkulator
            <br />
            <span className="text-[#e85d04]">leasingowy</span>
          </h1>
          <p className="text-zinc-400 text-lg font-medium max-w-2xl leading-relaxed">
            Dopasuj ofertę do swoich możliwości. Zmieniaj parametry i zobacz,
            jak zmieni się Twoja rata.
          </p>
        </div>
      </div>

      {/* CALCULATOR */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <LeasingCalculatorFull />
      </div>

      {/* INFORMACJA */}
      <div className="bg-[#1a1a1a] py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="h-[2px] w-8 bg-[#e85d04]" />
            <span className="text-[#e85d04] text-xs font-black uppercase tracking-[0.3em]">
              Informacja
            </span>
            <span className="h-[2px] w-8 bg-[#e85d04]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight text-center mb-12">
            Rozliczenie i proces
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 bg-[#e85d04]/10 rounded-xl flex items-center justify-center mb-4">
                <CalculatorIcon className="w-5 h-5 text-[#e85d04]" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2">
                Bez ubezpieczenia
              </h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                Kwoty rat nie zawierają kosztu ubezpieczenia — wyliczamy je
                indywidualnie po otrzymaniu danych pojazdu i klienta.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 bg-[#e85d04]/10 rounded-xl flex items-center justify-center mb-4">
                <IdentificationIcon className="w-5 h-5 text-[#e85d04]" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2">
                Wymagane dokumenty
              </h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                Wystarczy dowód osobisty i prawo jazdy. Bez zaświadczeń o
                zarobkach i bez weryfikacji BIK / KRD.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 bg-[#e85d04]/10 rounded-xl flex items-center justify-center mb-4">
                <DocumentCheckIcon className="w-5 h-5 text-[#e85d04]" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2">
                Jasne zasady
              </h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                Prosta umowa, brak ukrytych opłat. Wiesz dokładnie, ile i za co
                płacisz przez cały okres wynajmu.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <p className="text-[#e85d04] text-xs font-black uppercase tracking-[0.3em] mb-5">
              Proces zakupowy
            </p>
            <ol className="space-y-3 text-zinc-300 text-sm font-medium leading-relaxed list-decimal list-inside marker:text-[#e85d04] marker:font-black">
              <li>Wybierasz samochód z ogłoszenia (dealer, komis, osoba prywatna).</li>
              <li>Wpłacasz opłatę wstępną: do nas lub bezpośrednio do sprzedawcy pojazdu.</li>
              <li>
                Zakup i rejestracja pojazdu: kupujemy pojazd wskazany przez
                Ciebie, zamawiamy komplet dokumentów od sprzedawcy, rejestrujemy
                samochód.
              </li>
              <li>
                Podpisanie umowy: podpisujesz umowę wynajmu z opcją wykupu —
                online (Profil Zaufany), podczas spotkania z handlowcem lub u
                notariusza.
              </li>
              <li>
                Odbiór pojazdu: po rejestracji wysyłamy do Ciebie komplet
                dokumentów wraz z pełnomocnictwem do odbioru pojazdu.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
