// src/components/dashboard/ContentCard.tsx

interface ContentCardProps {
  title: string;
  description?: string;
  views: string;
  engagement: string;
  engagementDelta?: string; // e.g. "+12%" or "-14%"
  platform: "YouTube" | "TikTok" | "Instagram";
  imageUrl: string;
  status?: "top" | "underperforming" | "normal";
  impactLabel?: string; // override the stats label e.g. "IMPACT" vs "ENGAGEMENT"
}

const platformIcon = (platform: ContentCardProps["platform"]) => {
  if (platform === "YouTube") {
    return (
      <svg className="w-3 h-3 text-red-500 fill-current" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" className="fill-black/60" />
        <polygon points="10,8 16,12 10,16" className="fill-white" />
      </svg>
    );
  }
  if (platform === "TikTok") {
    return (
      <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.83 1.53V6.77a4.84 4.84 0 0 1-1.06-.08z" />
      </svg>
    );
  }
  return (
    <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
};

export const ContentCard = ({
  title,
  description,
  views,
  engagement,
  engagementDelta,
  platform,
  imageUrl,
  status = "normal",
  impactLabel,
}: ContentCardProps) => {
  const isNegative = engagementDelta?.startsWith("-");
  const statsLabel = impactLabel ?? (status === "underperforming" ? "IMPACT" : "ENGAGEMENT");

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] border border-slate-100/80 transition-all active:scale-[0.98] hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.12)]">
      {/* Image */}
      <div className="relative h-52 w-full bg-slate-900 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover opacity-90"
        />

        {/* Platform Badge — top left */}
        <div className="absolute top-4 left-4 bg-black/55 backdrop-blur-sm px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10">
          {platformIcon(platform)}
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{platform}</span>
        </div>

        {/* Status Badge — top right */}
        {status === "top" && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm">
            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">⊕ Top Content</span>
          </div>
        )}
        {status === "underperforming" && (
          <div className="absolute top-4 right-4 bg-amber-50/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm border border-amber-100">
            <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">⚠ Underperforming</span>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="px-6 pt-5 pb-6 space-y-1">
        <h4 className="text-[17px] font-black text-slate-900 leading-snug line-clamp-2 tracking-tight">
          {title}
        </h4>
        {description && (
          <p className="text-[12px] font-medium text-slate-400 leading-relaxed line-clamp-1 pt-0.5">
            {description}
          </p>
        )}

        <div className="flex justify-between items-end pt-4">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Views</p>
            <p className="text-[22px] font-black text-slate-900 tracking-tight leading-none">{views}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{statsLabel}</p>
            <p
              className={`text-[22px] font-black tracking-tight leading-none flex items-center gap-0.5 justify-end ${
                isNegative ? "text-red-500" : "text-[#4F46E5]"
              }`}
            >
              {isNegative ? (
                <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13 17l5-5-5-5M6 17l5-5-5-5" style={{transform: 'rotate(90deg)', transformOrigin: 'center'}} /></svg>
              ) : (
                <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
              )}
              {engagementDelta ?? engagement}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};