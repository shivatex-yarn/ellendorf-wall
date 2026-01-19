"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Define SectionLogo component outside the main component
const SectionLogo = ({ sectionId, logoPosition }: { sectionId: string; logoPosition: string | null }) => (
  <motion.div
    className="my-8"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: logoPosition === sectionId ? 1 : 0.3, scale: logoPosition === sectionId ? 1 : 0.9 }}
    transition={{ duration: 0.5 }}
  >
    <Image
      src="/assets/brand.png"
      alt="Ellendorf Logo"
      width={220}
      height={110}
      className="mx-auto"
      priority
    />
  </motion.div>
);

export default function AmazonLandingPage() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoPosition, setLogoPosition] = useState<string | null>(null);

  const quotes = [
    'A wall is a canvas for your dreams. Paint it with passion.',
    'Transform your space, transform your life.',
    'Style your space, shape your mood.',
    'Every wall tells a story; make yours unforgettable.',
    'Patterns that inspire, designs that captivate.',
    'Elevate your walls, elevate your world.',
    'Where creativity meets craftsmanship.',
    'Unleash the potential of your walls.',
    'From ordinary to extraordinary, one wall at a time.',
    'Your walls, your style, your story.',
    'Design your walls, design your life.',
    'Let your walls reflect your personality.',
    'Crafting spaces that inspire and delight.',
    'Innovative designs for modern living.',
    'Patterns that breathe life into your walls.',
    'Transforming walls into works of art.',
    'Elevate your interiors with stunning wallpapers.',
    'Where imagination meets design.',
    'Create a sanctuary with our exquisite wallpapers.',
    'Design is not just what it looks like, but how it feels.',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'welcome', el: document.querySelector('.welcome-section') },
        { id: 'customization', el: document.querySelector('.customization-section') },
        { id: 'why-choose', el: document.querySelector('.why-choose-section') },
        { id: 'contact', el: document.querySelector('.contact-section') },
      ];

      const offset = 150;
      let active: string | null = null;

      for (const { id, el } of sections) {
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset && rect.bottom >= offset) {
            active = id;
            break;
          }
        }
      }

      setLogoPosition(active);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      {/* HEADER - Luxury dark navy/blue theme */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-3xl font-bold">
            <span>Ellendorf</span>
            <span className="text-blue-300 ml-2">Wallpaper</span>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="md:hidden bg-slate-900/95 backdrop-blur-md overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4 text-center">
                <Link href="" className="block text-lg text-white">Custom Design</Link>
                <Link href="" className="block text-lg text-white">Installation</Link>
                <Link href="" className="block text-lg text-white">Todays Deals</Link>
              
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center welcome-section">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-4">
              Ellendorf — Powered by ReImagine AI
            </h1>
            <p className="text-2xl text-gray-700 mb-10">AI-Powered Wallpaper Solutions</p>

            <motion.div
              className="bg-white/95 backdrop-blur-lg rounded-3xl p-10 shadow-2xl max-w-2xl mx-auto lg:mx-0 border border-slate-200"
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuote}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-xl md:text-2xl text-gray-800 italic font-medium leading-relaxed"
                >
                  {quotes[currentQuote]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <p className="mt-8 text-gray-600">One-step solution for your dream space</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-10 max-w-md w-full border border-slate-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Welcome to Reimagine</h2>
                <p className="text-gray-600 mt-2">Transform your space today</p>
              </div>

              <Link href="/auth" className="block">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xl py-8 rounded-2xl shadow-lg transform hover:scale-105 transition"
                >
                  Start Your Transformation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CUSTOMIZATION */}
      <section className="py-24 bg-slate-50 customization-section">
        <div className="container mx-auto px-4 text-center">
          <SectionLogo sectionId="customization" logoPosition={logoPosition} />
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-6">
            Customization: Your Walls, Your Story
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
            Our expert architects and AI-powered designers bring your vision to life with personalized murals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🎨', title: 'Personalized Murals', desc: 'Transform your ideas into bespoke wall designs.' },
              { icon: '📐', title: 'Architect Precision', desc: 'Perfect proportions for your space.' },
              { icon: '🖼️', title: 'Visual Harmony', desc: 'Balanced colors and textures.' },
              { icon: '🧠', title: 'AI Intelligence', desc: 'Real-time design previews.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition border border-slate-100"
              >
                <div className="text-6xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-24 bg-white why-choose-section">
        <div className="container mx-auto px-4 text-center">
          <SectionLogo sectionId="why-choose" logoPosition={logoPosition} />
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-6">
            Why Choose Ellendorf?
          </h2>
          <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-10 py-4 rounded-full text-xl font-bold mb-6 shadow-lg">
            P.U.R.E. Quality Promise
          </div>
          <p className="text-lg text-gray-600 mb-16">
            Porosity • UV-Resistant • Bacteria Resistant • Eco-Friendly
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '✅', title: 'Porosity', desc: 'Breathable walls for healthy living.' },
              { icon: '☀️', title: 'UV-Resistant', desc: 'Preserves color against sunlight.' },
              { icon: '🛡️', title: 'Bacteria Resistant', desc: 'Safe for children and pets.' },
              { icon: '🌱', title: 'Eco-Friendly', desc: 'Sustainable and chemical-free.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition border border-slate-100"
              >
                <div className="text-6xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section className="py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 contact-section">
        <div className="container mx-auto px-4 text-center">
          <SectionLogo sectionId="contact" logoPosition={logoPosition} />
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-8">
            Ready to Transform Your Walls?
          </h2>
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
            Discover the art of sustainable design with our premium, AI-powered wallpapers.
          </p>
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-2xl px-16 py-8 rounded-2xl shadow-2xl transform hover:scale-110 transition"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-2">
            <span>Ellendorf</span>
            <span className="text-blue-300 ml-2">Wallpaper</span>
          </h3>
          <p className="text-blue-200">AI-Powered Design Solutions</p>
          <p className="text-sm mt-6 opacity-80">© 2025 Ellendorf. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}