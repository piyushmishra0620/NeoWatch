export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-transparent" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="loader-ring" aria-hidden="true" />
        <p className="text-sm font-medium tracking-[0.2em] text-slate-200">
          LOADING
        </p>
      </div>
      <style jsx>{`
        .loader-ring {
          width: 96px;
          height: 96px;
          border-radius: 999px;
          background: conic-gradient(#60a5fa, #ffffff, #60a5fa);
          -webkit-mask: radial-gradient(
            farthest-side,
            transparent calc(100% - 8px),
            #000 calc(100% - 8px)
          );
          mask: radial-gradient(
            farthest-side,
            transparent calc(100% - 8px),
            #000 calc(100% - 8px)
          );
          animation: spin 1.1s linear infinite;
          box-shadow: 0 0 30px rgba(96, 165, 250, 0.4);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
