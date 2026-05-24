import Image from "next/image";
import Link from "next/link";

export default function CreatedBy() {
  return (
    <div className="w-full flex justify-center py-8 bg-[#0a0a0a]">
      <Link
        href="https://fraymweb.pl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Stworzone przez FraymWeb — przejdź na fraymweb.pl"
        className="group inline-flex items-center gap-3 bg-[#1a1a1a] border border-white/10 hover:border-white/25 rounded-full pl-5 pr-2 py-2 transition-all"
      >
        <span className="text-zinc-400 group-hover:text-zinc-200 text-xs font-medium tracking-wide transition-colors">
          Stworzone przez
        </span>
        <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden">
          <Image
            src="/Logo-Niebieskie.png"
            alt="FraymWeb"
            width={28}
            height={28}
            className="object-contain"
          />
        </span>
      </Link>
    </div>
  );
}
