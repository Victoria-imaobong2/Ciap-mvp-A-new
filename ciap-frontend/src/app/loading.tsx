// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="animate-pulse flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-brand-primary/20"></div>
        <p className="text-brand-primary font-bold animate-bounce">Loading CIAP...</p>
      </div>
    </div>
  );
}
