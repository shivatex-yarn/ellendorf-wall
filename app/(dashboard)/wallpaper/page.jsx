"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Sparkles, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

export default function Wallpaper() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardsPerPage = 6;

  const quotes = [
    "Your walls deserve art, not just paint.",
    "Where luxury meets living.",
    "Design is a feeling you live in.",
    "Every room tells a story. Make yours unforgettable.",
    "Crafted for those who appreciate true elegance.",
  ];

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:4500/api/wallpaper');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const activeOnly = data.filter(w => w.status === 'active');
        setWallpapers(activeOnly || []);
      } catch (err) {
        setError('Unable to load collection. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallpapers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(wallpapers.map(w => w.category?.name).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [wallpapers]);

  const filteredWallpapers = useMemo(() => {
    const active = wallpapers; // already filtered
    return selectedCategory === 'All'
      ? active
      : active.filter(w => w.category?.name === selectedCategory);
  }, [wallpapers, selectedCategory]);

  const totalPages = Math.ceil(filteredWallpapers.length / cardsPerPage);
  const paginated = filteredWallpapers.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  useEffect(() => setCurrentPage(1), [selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Loader2 className="w-20 h-20 text-blue-600 animate-spin mb-6" />
          <p className="text-2xl font-light text-blue-700">Curating your collection...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center p-12 bg-gray-50 rounded-3xl shadow-xl border">
          <p className="text-xl text-blue-800 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white text-gray-800 overflow-hidden relative">
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 75%, #e5e7eb 0%, transparent 50%),
                               radial-gradient(circle at 75% 25%, #d1d5db 0%, transparent 50%)`
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl px-4 sm:px-10 py-10 space-y-10">
          <motion.div className="text-center mb-24" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-8"
            >
              <Sparkles className="w-16 h-16 text-blue-400" />
            </motion.div>
            <h1 className="text-3xl md:text-3xl bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-800 bg-clip-text text-transparent mb-6">
              ELLENDORF
            </h1>
            <p className="text-2xl md:text-4xl font-light text-blue-600 tracking-widest">
              Luxury Wallpaper Collection
            </p>
          </motion.div>

          <motion.div
            key={quoteIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mb-20 px-10"
          >
            <p className="text-3xl md:text-5xl font-light italic text-blue-600 max-w-6xl mx-auto leading-relaxed">
              {quotes[quoteIndex]}
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6 mb-20">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-lg font-semibold text-blue-700">Explore by Collection:</span>
              {categories.map(cat => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className={`rounded-full px-10 py-4 text-lg font-medium transition-all shadow-lg ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 hover:scale-105'
                      : 'border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400'
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-24">
            <AnimatePresence mode="popLayout">
              {paginated.map((wp, i) => (
                <motion.div
                  key={wp.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative"
                >
                  <div
                    className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer bg-white border border-blue-100"
                    onClick={() => setSelectedWallpaper(wp)}
                  >
                    <div className="aspect-[4/5] relative">
                      <img
                        src={wp.imageUrl}
                        alt={wp.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-500" />
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute bottom-0 left-0 right-0 p-8 text-white"
                    >
                      <h3 className="text-2xl font-bold mb-2">{wp.name}</h3>
                      <p className="text-blue-200 text-sm mb-4 font-medium">{wp.productCode}</p>
                      <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg">
                        <Maximize2 className="w-5 h-5 mr-2" />
                        View in Full Glory
                      </Button>
                    </motion.div>

                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur px-5 py-2.5 rounded-full text-blue-700 font-semibold text-sm shadow-md border border-blue-200">
                      {wp.subCategory?.name || "Exclusive"}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-8 my-20">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 rounded-full px-10 py-5"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <span className="text-xl font-medium text-blue-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 rounded-full px-10 py-5"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-10 my-32">
            {[
              { icon: Eye, title: "Room Preview", desc: "See it in your space before you buy" },
              { icon: Sparkles, title: "Fully Customizable", desc: "Your vision, perfectly realized" },
              { icon: Sparkles, title: "Premium Materials", desc: "Only the finest for your home" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center p-10 rounded-3xl bg-white border border-blue-100 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-700 mb-6">
                  <f.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-blue-800 mb-4">{f.title}</h3>
                <p className="text-blue-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedWallpaper && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWallpaper(null)}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-10 cursor-pointer"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-5xl w-full"
              >
                <img
                  src={selectedWallpaper.imageUrl}
                  alt={selectedWallpaper.name}
                  className="w-full rounded-3xl shadow-4xl"
                />
                <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black/90 to-transparent text-white">
                  <h2 className="text-6xl font-bold mb-4">{selectedWallpaper.name}</h2>
                  <p className="text-2xl text-blue-200">{selectedWallpaper.productCode}</p>
                </div>
                <Button
                  onClick={() => setSelectedWallpaper(null)}
                  className="absolute top-8 right-8 bg-white/20 backdrop-blur hover:bg-white/30 rounded-full p-4"
                >
                  <X className="w-8 h-8 text-white" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {[...Array(8)].map((_, i) => (
          <Sparkles
            key={i}
            className="fixed text-blue-300/20 animate-pulse pointer-events-none"
            style={{
              top: `${10 + i * 12}%`,
              left: `${8 + i * 11}%`,
              fontSize: `${25 + i * 10}px`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}