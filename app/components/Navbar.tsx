'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import FleetGallery from "@/app/components/FleetGallery";

export default function Navbar() {
  const [fleetOpen, setFleetOpen] = useState(false);

  const navLinks = [
    { name: "Strona Główna", href: "/" },
    { name: "O nas", href: "/o-nas" },
  ];

  return (
    <>
      <header className="w-full relative overflow-hidden bg-black/10 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex h-20 items-center justify-between px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">

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

          {/* Menu - wszystkie rozmiary */}
          <nav className="flex items-center gap-3 sm:gap-5 md:gap-7 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="hidden sm:block text-zinc-300 hover:text-[#e85d04] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => setFleetOpen(true)}
              className="text-zinc-300 hover:text-[#e85d04] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap"
            >
              Nasza Flota
            </button>
            <Link
              href="https://m.me/61580848462292"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#e85d04] text-white px-3 sm:px-5 md:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#ff6d0a] transition-all active:scale-95 shadow-[0_10px_20px_rgba(232,93,4,0.2)] whitespace-nowrap"
            >
              Kontakt
            </Link>
          </nav>

        </div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e85d04]/50 to-transparent opacity-30" />
      </header>

      <FleetGallery isOpen={fleetOpen} onClose={() => setFleetOpen(false)} />
    </>
  );
}