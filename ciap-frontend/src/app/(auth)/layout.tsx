export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 transition-opacity duration-1000"
        style={{ backgroundImage: 'url("/auth-bg.png")' }}
      />
      
      {/* Content Layer */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </div>
    </div>
  );
}
