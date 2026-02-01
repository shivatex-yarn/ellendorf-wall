"use client";
import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, Shield, Leaf, ChevronRight, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LuxuryLandingPage() {
  const [currentQuote, setCurrentQuote] = useState(0);

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
      title: " Design",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Luxury Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-md opacity-30"></div>
              <div className="relative text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Ellendorf
              </div>
            </div>
            <div className="hidden md:block text-sm text-slate-600 font-medium border-l border-slate-200 pl-3">
              Textile Wall Coverings
            </div>
          </div>
          <Link href="/auth">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300">
              Start Exploring
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-blue-50/30"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <div className="inline-flex items-center justify-center space-x-3 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg border border-slate-200/50">
                <Sparkles className="w-6 h-6 text-blue-500" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Powered by ReImagine Wall
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Living Space
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuote}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl md:text-2xl text-slate-600 italic font-light"
                >
                  {quotes[currentQuote]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/auth">
                <Button className="group bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-lg px-12 py-6 rounded-full font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                  <Sparkles className="mr-3 w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Begin Your Transformation
                  <ChevronRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-full mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                Premium Features
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Redefining <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Luxury Design</span>
            </h2>
            <p className="text-lg text-slate-600">
              Experience the perfect blend of technology and craftsmanship
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl p-8 border border-slate-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-blue-200/50">
                  <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-blue-600">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-xl"></div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-slate-200/50 shadow-2xl"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  Ready to Transform Your Space?
                </h2>
                <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                  Join thousands who have reimagined their living spaces with our premium wall coverings.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth" className="flex-1 sm:flex-none">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-10 py-6 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
                      Start Exploring
                      <ChevronRight className="ml-3 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="bg-gradient-to-b from-white to-slate-100 border-t border-slate-200/50">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Ellendorf
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Your One-Stop Solution for Textile Wall Coverings
              </p>
            </div>

            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} Ellendorf. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}