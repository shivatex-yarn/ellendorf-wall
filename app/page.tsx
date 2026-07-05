"use client";
import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, Shield, Leaf, ChevronRight, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function LuxuryLandingPage() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const quotes = [
    'A wall is a canvas for your dreams.',
    'Transform your space, transform your life.',
    'Style your space, shape your mood.',
    'Elevate your walls, elevate your world.',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const features = [
    {
      icon: <Wand2 className="w-8 h-8" />,
      title: "Design",
      description: "Exquisite patterns crafted by top designers."
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Personalized Murals",
      description: "Custom designs tailored to your exact specifications."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Premium Materials",
      description: "Durable, high-quality materials for a luxurious finish."
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Eco-Friendly",
      description: "Sustainable materials that are kind to the environment."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Floating glass header */}
      <header className="sticky top-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl bg-white/70 backdrop-blur-2xl border border-white/60 ring-1 ring-slate-900/5 shadow-lg shadow-slate-900/[0.04] px-4 sm:px-5 py-2.5">
          <div className="flex items-center space-x-3">
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: isImageLoaded ? 1 : 0, y: isImageLoaded ? 0 : -5 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onAnimationComplete={() => setIsImageLoaded(true)}
            >
              <Image
                src="/assets/brand.png"
                alt="Brand Logo"
                width={160}
                height={52}
                className="object-contain h-9 w-auto sm:h-11"
                priority
                onLoadingComplete={() => setIsImageLoaded(true)}
              />
            </motion.div>
            <motion.div
              className="hidden md:block text-sm text-slate-500 font-medium border-l border-slate-200 pl-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Textile Wall Coverings
            </motion.div>
          </div>
          <Link href="/auth">
            <Button className="group bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300">
              Start Exploring
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section — aurora background */}
      <section className="relative -mt-[4.5rem] pt-[4.5rem] min-h-[100svh] flex items-center justify-center overflow-hidden">
        {/* Base gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/60 to-indigo-100/70"></div>

        {/* Animated aurora blobs */}
        <motion.div
          aria-hidden
          className="absolute -top-40 -left-32 w-[42rem] h-[42rem] rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-500/20 blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-48 -right-24 w-[46rem] h-[46rem] rounded-full bg-gradient-to-tr from-indigo-400/25 to-sky-400/20 blur-[130px]"
          animate={{ x: [0, -50, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-violet-400/15 to-blue-400/10 blur-[110px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid backdrop with radial fade */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(30,41,59,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 30%, transparent 80%)",
          }}
        ></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-10 flex justify-center"
            >
              <div className="group inline-flex items-center justify-center gap-2.5 bg-white/70 backdrop-blur-xl pl-3 pr-5 py-2 rounded-full shadow-lg shadow-blue-500/10 border border-white/70 ring-1 ring-slate-900/5">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </span>
                <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                  Powered by ReImagine Walls
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.95] mb-8"
            >
              <span className="block text-slate-900">Transform Your</span>
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent animate-shimmer">
                Living Space
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12 h-8"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuote}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg sm:text-xl md:text-2xl text-slate-500 italic font-light"
                >
                  {quotes[currentQuote]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
            >
              <Link href="/auth">
                <Button className="group relative bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-base sm:text-lg px-9 sm:px-11 py-6 rounded-full font-semibold shadow-2xl shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.04]">
                  <Sparkles className="mr-2.5 w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Begin Your Transformation
                  <ChevronRight className="ml-2.5 w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade into features */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-white"></div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-[0.15em]">
                Premium Features
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              Redefining <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Luxury Design</span>
            </h2>
            <p className="text-lg text-slate-500">
              Experience the perfect blend of technology and craftsmanship
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative rounded-3xl p-[1.5px] bg-gradient-to-b from-slate-200/80 via-slate-100 to-transparent hover:from-blue-400/60 hover:via-indigo-300/40 transition-colors duration-300"
              >
                <div className="relative h-full rounded-3xl bg-white p-7 shadow-[0_2px_20px_-8px_rgba(30,58,138,0.15)] group-hover:shadow-[0_20px_50px_-15px_rgba(59,130,246,0.35)] transition-all duration-300 group-hover:-translate-y-1.5 overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl mb-6 shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="relative text-xl font-semibold text-slate-900 mb-2.5 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="relative text-slate-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — premium dark band */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-6 sm:px-12 py-16 md:py-20 text-center shadow-2xl shadow-indigo-900/30 ring-1 ring-white/10"
          >
            {/* Decorative glow + grid */}
            <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-blue-500/25 blur-3xl"></div>
            <div className="absolute -bottom-28 -right-10 w-96 h-96 rounded-full bg-indigo-500/25 blur-3xl"></div>
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
              }}
            ></div>

            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                Ready to Transform Your Space?
              </h2>
              <p className="text-lg text-blue-100/70 mb-10 max-w-2xl mx-auto">
                Join thousands who have reimagined their living spaces with our premium wall coverings.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth" className="flex-1 sm:flex-none">
                  <Button className="group w-full sm:w-auto bg-white text-slate-900 hover:bg-blue-50 px-10 py-6 rounded-full text-lg font-semibold shadow-xl transition-all duration-300 hover:scale-[1.03]">
                    Start Exploring
                    <ChevronRight className="ml-3 w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="bg-gradient-to-b from-white to-slate-100 border-t border-slate-200/60">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative inline-block"
              >
                <Image
                  src="/assets/brand.png"
                  alt="Brand Logo"
                  width={160}
                  height={50}
                  className="object-contain h-10 w-auto"
                />
              </motion.div>
              <p className="text-sm text-slate-500 mt-2">
                Your One-Stop Solution for Textile Wall Coverings
              </p>
            </div>

            <div className="text-sm text-slate-400">
              © {new Date().getFullYear()} All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}