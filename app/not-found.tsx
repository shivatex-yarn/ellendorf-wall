import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Luxury ambient gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-slate-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
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

        {/* 404 number - luxury typography */}
        <p className="text-[clamp(6rem,18vw,12rem)] font-extralight tracking-tighter leading-none bg-gradient-to-b from-amber-200/90 via-amber-100/80 to-slate-300/60 bg-clip-text text-transparent select-none">
          404
        </p>

        <div className="mt-6 space-y-4">
          <h1 className="text-2xl md:text-3xl font-light text-slate-200 tracking-wide">
            The page you seek has slipped beyond the frame
          </h1>
          <p className="text-slate-400 font-light text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Every wall tells a story—yours simply led somewhere we haven’t designed yet.
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 my-10">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/40" />
          <Sparkles className="w-4 h-4 text-amber-400/60" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/40" />
        </div>

        <Link href="/">
          <Button
            size="lg"
            className="group bg-gradient-to-r from-amber-600/90 to-amber-700/90 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-semibold px-8 py-6 rounded-xl shadow-xl shadow-amber-900/20 border border-amber-400/20 hover:border-amber-400/40 transition-all duration-300 hover:scale-[1.02]"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-0.5 transition-transform" />
            Return Home
          </Button>
        </Link>

        <p className="mt-12 text-slate-500 text-sm font-light">
          © {new Date().getFullYear()} Ellendorf Wallpaper · Reimagine
        </p>
      </div>
    </div>
  );
}
