'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Ruler, Wrench, Home, Sparkles, Shield, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const services = [
  {
    title: 'Consultation & Design Guidance',
    description: 'Expert support from in-house architects & designers. Personalized recommendations to suit your interiors.',
    icon: Palette,
    color: 'from-blue-600 to-blue-800',
  },
  {
    title: 'Custom Wallpaper Design',
    description: 'Bespoke designs for homes, offices & commercial spaces. Advanced digital tools for precise customization.',
    icon: Sparkles,
    color: 'from-blue-600 to-blue-800',
  },
  {
    title: 'Professional Installation',
    description: 'Skilled installers ensuring seamless, bubble-free finishes. On-site supervision for premium quality execution.',
    icon: Wrench,
    color: 'from-blue-600 to-blue-800',
  },
  {
    title: 'Site Measurement & Preparation',
    description: 'Accurate wall measurements for perfect fitting. Professional guidance on primers & wall readiness.',
    icon: Ruler,
    color: 'from-blue-600 to-blue-800',
  },
  {
    title: 'After-Sales Support',
    description: '5-year warranty on all wallpapers. Easy maintenance with dedicated customer care.',
    icon: Shield,
    color: 'from-blue-600 to-blue-800',
  },
];

export default function ServicesPage() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white mb-6 shadow-xl">
            <Settings className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 tracking-tight mb-4 md:mb-6">
            Our Services
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto">
            End-to-end luxury textile wall coverings solutions
          </p>
        </motion.div>

        {/* Hero tagline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <Home className="h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 text-blue-700 mx-auto mb-6 md:mb-8 animate-pulse" />
          <p className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-800 tracking-wide mb-4">
            Transform Your Space with Confidence
          </p>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl lg:max-w-4xl mx-auto">
            Comprehensive support from design to installation — backed by expertise and care.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.03 }}
              onHoverStart={() => setActiveIndex(index)}
              onHoverEnd={() => setActiveIndex(null)}
            >
              <Card className="h-full bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden">
                <CardHeader className={`bg-gradient-to-br ${service.color} py-8 sm:py-10 md:py-12 px-6 sm:px-8 md:px-10 text-white`}>
                  <motion.div
                    animate={{
                      rotate: activeIndex === index ? 360 : 0,
                      scale: activeIndex === index ? 1.15 : 1,
                    }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-center mb-6 sm:mb-8"
                  >
                    <service.icon className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20" />
                  </motion.div>
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-light text-center tracking-wide">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 sm:pt-8 md:pt-10 pb-8 sm:pb-10 md:pb-12 px-6 sm:px-8 md:px-10 text-center">
                  <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}