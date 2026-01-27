"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Luxury ambient gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-indigo-500/12 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-slate-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Brand mark */}
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/brand.png"
            alt="Ellendorf"
            width={160}
            height={80}
            className="opacity-90"
          />
        </div>

        {/* 500 Internal Server Error label */}
        <p className="text-sm uppercase tracking-[0.3em] text-rose-400/70 font-medium mb-2">
          Internal Server Error
        </p>

        {/* 500 / error indicator - luxury typography */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <AlertCircle className="w-10 h-10 text-rose-400/80" />
          <p className="text-[clamp(3.5rem,12vw,6rem)] font-extralight tracking-tighter leading-none bg-gradient-to-b from-rose-200/80 via-rose-100/70 to-slate-300/50 bg-clip-text text-transparent select-none">
            500
          </p>
        </div>

        <div className="mt-4 space-y-4">
          <h1 className="text-2xl md:text-3xl font-light text-slate-200 tracking-wide">
            Something went wrong
          </h1>
          <p className="text-slate-400 font-light text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Our canvas encountered an unexpected shift. We’re already looking into it—please try again or return to safety.
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 my-10">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-rose-500/40" />
          <span className="w-2 h-2 rounded-full bg-rose-400/50" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-rose-500/40" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={reset}
            size="lg"
            className="group bg-gradient-to-r from-rose-600/90 to-rose-700/90 hover:from-rose-500 hover:to-rose-600 text-white font-semibold px-8 py-6 rounded-xl shadow-xl shadow-rose-900/20 border border-rose-400/20 hover:border-rose-400/40 transition-all duration-300 hover:scale-[1.02]"
          >
            <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </Button>
          <Link href="/">
            <Button
              size="lg"
              variant="outline"
              className="group bg-slate-800/40 hover:bg-slate-700/50 text-slate-200 font-medium px-8 py-6 rounded-xl border-slate-600/50 hover:border-slate-500 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-0.5 transition-transform" />
              Return Home
            </Button>
          </Link>
        </div>

        <p className="mt-12 text-slate-500 text-sm font-light">
          © {new Date().getFullYear()} Ellendorf Wallpaper · Reimagine
        </p>
      </div>
    </div>
  );
}
