import React from 'react';

interface BrandLogoProps {
  customLogoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  customLogoUrl,
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  if (customLogoUrl && customLogoUrl.trim() !== '') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src={customLogoUrl}
          alt="CENTER AL ASSAL - سنتر العسال"
          className={`object-contain transition-transform duration-300 hover:scale-105 ${
            size === 'sm' ? 'h-8' : size === 'lg' ? 'h-14' : size === 'xl' ? 'h-20' : 'h-11'
          }`}
        />
        {showSubtitle && (
          <div className="flex flex-col text-right">
            <span className="font-bold text-slate-800 text-sm tracking-wide">سنتر العسال</span>
            <span className="text-[10px] text-sky-600 font-medium tracking-wider">CENTER AL ASSAL</span>
          </div>
        )}
      </div>
    );
  }

  // Elegant Luxury SVG Monogram Crest for CENTER AL ASSAL
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Royal Crest Monogram Icon */}
      <div
        className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#FDFBF7] via-[#F4EBE1] to-[#E0F2FE] border border-[#D4AF37]/40 shadow-sm transition-transform duration-300 hover:scale-105 ${
          size === 'sm'
            ? 'w-9 h-9'
            : size === 'lg'
            ? 'w-14 h-14'
            : size === 'xl'
            ? 'w-20 h-20'
            : 'w-11 h-11'
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5 text-[#0284C7]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Diamond / Frame */}
          <rect
            x="20"
            y="20"
            width="60"
            height="60"
            rx="12"
            transform="rotate(45 50 50)"
            stroke="#D4AF37"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            opacity="0.85"
          />
          {/* Elegant Bedding & Crown Flourish */}
          <path
            d="M32 62C36 50 44 44 50 44C56 44 64 50 68 62"
            stroke="#0284C7"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M26 68H74C74 68 68 58 50 58C32 58 26 68 26 68Z"
            fill="#0284C7"
            fillOpacity="0.15"
            stroke="#0284C7"
            strokeWidth="2"
          />
          {/* Monogram CAA / Crown */}
          <circle cx="50" cy="34" r="5" fill="#D4AF37" />
          <circle cx="38" cy="38" r="3.5" fill="#D4AF37" opacity="0.8" />
          <circle cx="62" cy="38" r="3.5" fill="#D4AF37" opacity="0.8" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-right">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black text-slate-800 tracking-tight leading-none ${
              size === 'sm'
                ? 'text-base'
                : size === 'lg'
                ? 'text-2xl'
                : size === 'xl'
                ? 'text-3xl'
                : 'text-xl'
            }`}
          >
            سنتر العسال
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
        </div>
        {showSubtitle && (
          <span
            className={`font-semibold tracking-wider text-sky-700/90 leading-tight uppercase ${
              size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[11px]'
            }`}
          >
            CENTER AL ASSAL
          </span>
        )}
      </div>
    </div>
  );
};
