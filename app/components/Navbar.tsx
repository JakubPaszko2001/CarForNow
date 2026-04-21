'use client';

import Link from "next/link";
import Image from "next/image";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const navLinks = [
    { name: "Strona Główna", href: "/" },
    { name: "Nasza Flota", href: "/flota" },
    { name: "O nas", href: "/o-nas" },
    { name: "Kontakt", href: "/kontakt" },
  ];

  return (
    <header className="w-full relative overflow-hidden bg-black backdrop-blur-lg border-b border-white/5 shadow-2xl">
      {/* Zmieniono paddingi na mobile (px-6) i desktop (md:px-12) */}
      <div className="flex h-20 items-center justify-between px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Kontener Logo - responsywne wymiary */}
        <Link href="/" className="flex items-center transition-transform active:scale-95">
          <div className="relative w-24 h-12 md:w-32 md:h-16">
            <Image 
              src="/Logo.png" 
              alt="Logo Car For Now" 
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Menu tekstowe - Desktop (xl+) */}
        <nav className="hidden xl:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-zinc-300 hover:text-[#e85d04] text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <button className="ml-4 bg-[#e85d04] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff6d0a] transition-all active:scale-95 shadow-[0_10px_20px_rgba(232,93,4,0.2)]">
            Zarezerwuj
          </button>
        </nav>
        
        {/* Przycisk menu i akcji na Mobile */}
        <div className="flex items-center gap-4 xl:hidden">
          {/* Opcjonalnie: mały przycisk rezerwacji widoczny na mobile przed ikoną menu */}
          <Link 
            href="/rezerwacja" 
            className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-[#e85d04] border border-[#e85d04]/30 px-4 py-2 rounded-lg"
          >
            Rezerwuj
          </Link>
          
          <button className="text-[#e85d04] p-2 hover:bg-white/5 rounded-xl transition-all">
            <Bars3Icon className="w-7 h-7 stroke-2" /> 
          </button>
        </div>

      </div>

      {/* Dekoracyjna linia gradientowa na samym dole (opcjonalna, dodaje stylu) */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e85d04]/50 to-transparent opacity-30"></div>
    </header>
  );
}