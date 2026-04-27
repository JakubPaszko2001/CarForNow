"use client";

export default function PhoneButton() {
  return (
    <a
      href="tel:+48510510018"
      aria-label="Zadzwoń do nas"
      className="fixed bottom-6 left-6 z-[999] flex items-center justify-center w-14 h-14 rounded-full bg-green-500 shadow-[0_4px_24px_rgba(34,197,94,0.5)] hover:bg-green-400 hover:scale-110 active:scale-95 transition-all duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        className="w-7 h-7"
      >
        <path
          fillRule="evenodd"
          d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
          clipRule="evenodd"
        />
      </svg>
      {/* Pulsujący ring */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
    </a>
  );
}