export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#0b2a4e" />
      <rect x="3.5" y="3.5" width="41" height="41" rx="9" fill="none" stroke="#c9a227" strokeOpacity="0.6" />
      <text
        x="24"
        y="31.5"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="20"
        fontWeight="700"
        fill="#ffffff"
        letterSpacing="-0.5"
      >
        GC
      </text>
    </svg>
  );
}

export function Logo({ light = false, subtitle = "Contabilidade & Direito" }: { light?: boolean; subtitle?: string }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark className="h-10 w-10 shrink-0" />
      <span className="leading-tight">
        <span className={`block font-serif text-[17px] font-bold tracking-tight ${light ? "text-white" : "text-navy-900"}`}>
          Goldoni Contadores
        </span>
        <span
          className={`block text-[10.5px] font-semibold uppercase tracking-[0.2em] ${light ? "text-gold-300" : "text-gold-600"}`}
        >
          {subtitle}
        </span>
      </span>
    </span>
  );
}
