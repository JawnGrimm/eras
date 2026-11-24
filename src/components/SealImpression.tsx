import React from 'react';

export interface SealImpressionProps {
  status: 'authorized' | 'filed';
  institutionName?: string;
  className?: string;
  dayNumber?: number;
}

export function SealImpression({
  status,
  institutionName = 'Temple Storehouse',
  className = '',
  dayNumber,
}: SealImpressionProps) {
  const dayLabel = dayNumber !== undefined ? ` on Day ${dayNumber}` : '';

  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-lg border-2 border-[var(--seal-border)] p-2.5 text-[var(--seal-ochre)] select-none pointer-events-none rotate-[-2.5deg] mix-blend-multiply opacity-90 ${className}`}
      aria-label={`Official seal: ${status.toUpperCase()} by ${institutionName}${dayLabel}`}
      role="img"
    >
      <div className="flex w-full items-center justify-center gap-1.5 border-b border-[var(--seal-border)] pb-1">
        <svg
          className="h-4 w-4 fill-none stroke-[var(--seal-ochre)]"
          viewBox="0 0 24 24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2v20M12 4l-4 4M12 8l4 4M12 12l-4 4M12 16l4 4" />
        </svg>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
          {status}
        </span>
      </div>
      <div className="pt-1 text-center font-serif text-[11px] font-semibold uppercase leading-tight tracking-wider">
        {institutionName}
      </div>
      {dayNumber !== undefined && (
        <div className="mt-0.5 font-mono text-[9px] tracking-widest opacity-80">
          DAY · {dayNumber}
        </div>
      )}
    </div>
  );
}
