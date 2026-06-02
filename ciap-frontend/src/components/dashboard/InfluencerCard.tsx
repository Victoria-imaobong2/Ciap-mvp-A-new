// src/components/dashboard/InfluencerCard.tsx
export const InfluenceCard = () => {
  return (
    /* 1. Added w-full and used a subtle blue-white background */
    <div className="w-full bg-[#F5F9FF] rounded-[2.5rem] p-8 space-y-6 shadow-sm">
      
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-[#A5B4C9] uppercase tracking-[0.15em]">
          Influence Score
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-6xl font-extrabold text-[#1A1C1E]">78</span>
          <span className="text-2xl font-bold text-[#C5D0E0]">/100</span>
        </div>
      </div>

      {/* 2. The Progress Bar Track */}
      <div className="relative w-full h-[6px] bg-white rounded-full shadow-inner">
        <div className="absolute inset-0 bg-[#F0F4F8 rounded-full">

        </div>
        <div 
          className="absolute top-0 left-0 h-full bg-[#4F46E5] rounded-full shadow-[0_0_12px_rgba(93,95,239,0.4)] transition-all duration-1000 ease-out" 
          style={{ width: '78%' }}
        />
      </div>

      <p className="text-[11px] text-[#A5B4C9] font-medium leading-relaxed">
        Top 5% of creators in your niche this week.
      </p>
    </div>
  );
};