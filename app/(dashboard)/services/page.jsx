'use client';

import React, { useState } from 'react';
import { Palette, Ruler, Wrench, Sparkles, Shield, Settings, ChevronRight, ArrowRight, Award, Clock } from 'lucide-react';

const services = [
  {
    title: 'Consultation & Design Guidance',
    description: 'Expert support from in-house architects & designers. Personalized recommendations to suit your interiors.',
    icon: Palette,
    color: 'from-blue-600 to-indigo-700',
    gradient: 'bg-gradient-to-br from-blue-600/20 to-indigo-600/10',
    features: ['2D Visualization', 'Color Matching', 'Style Consultation']
  },
  {
    title: 'Custom Wallpaper Design',
    description: 'Bespoke designs for homes, offices & commercial spaces. Advanced digital tools for precise customization.',
    icon: Sparkles,
    color: 'from-purple-600 to-pink-600',
    gradient: 'bg-gradient-to-br from-purple-600/20 to-pink-600/10',
    features: ['AI Design Tools', 'Pattern Generation', 'Digital Mockups']
  },
  {
    title: 'Professional Installation',
    description: 'Skilled installers ensuring seamless, bubble-free finishes. On-site supervision for premium quality execution.',
    icon: Wrench,
    color: 'from-emerald-600 to-teal-600',
    gradient: 'bg-gradient-to-br from-emerald-600/20 to-teal-600/10',
    features: ['Expert Installers', 'Quality Checks', 'Clean Installation']
  },
  {
    title: 'Site Measurement & Preparation',
    description: 'Accurate wall measurements for perfect fitting. Professional guidance on primers & wall readiness.',
    icon: Ruler,
    color: 'from-amber-600 to-orange-600',
    gradient: 'bg-gradient-to-br from-amber-600/20 to-orange-600/10',
    features: ['Laser Measurement', 'Wall Assessment', 'Surface Prep']
  },
  {
    title: 'After-Sales Support',
    description: '5-year warranty on all wallpapers. Easy maintenance with dedicated customer care.',
    icon: Shield,
    color: 'from-red-600 to-rose-600',
    gradient: 'bg-gradient-to-br from-red-600/20 to-rose-600/10',
    features: ['5-Year Warranty', 'Maintenance Guide', '24/7 Support']
  },
];

export default function ServicesPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-md opacity-30 rounded-full"></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl">
                <Settings className="w-10 h-10 text-white" />
              </div>
            </div>
            <Sparkles className="w-8 h-8 text-blue-400 ml-4" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Premium Services
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            Complete luxury textile wall coverings solutions from concept to completion
          </p>
        </div>

        {/* Enhanced Quality Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16">
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl px-8 py-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">100%</div>
              <div className="text-sm text-slate-500">Premium Quality</div>
            </div>
          </div>
          
          <div className="hidden sm:block w-px h-12 bg-gradient-to-b from-transparent via-slate-300/50 to-transparent"></div>
          
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl px-8 py-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">98%</div>
              <div className="text-sm text-slate-500">On-Time Delivery</div>
            </div>
          </div>
        </div>

        {/* Services Grid - Enhanced Layout */}
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-blue-600/10 rounded-full blur-2xl"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 relative">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
              >
                {/* Floating background effect */}
                <div className={`absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 ${service.gradient}`}></div>
                
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-br ${service.color} blur-md`}></div>
                
                {/* Main Card */}
                <div className={`relative bg-white/90 backdrop-blur-sm border border-slate-200/30 rounded-3xl overflow-hidden transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl ${
                  activeIndex === index ? 'shadow-xl scale-[1.02]' : 'shadow-lg'
                }`}>
                  {/* Card Header */}
                  <div className={`relative bg-gradient-to-br ${service.color} p-8 overflow-hidden`}>
                    {/* Animated pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full -translate-y-1/2"></div>
                      <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-white rounded-full translate-y-1/2"></div>
                    </div>
                    
                    {/* Icon with floating animation */}
                    <div className="relative flex justify-center mb-6">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${service.color} blur-lg opacity-30 rounded-full animate-pulse`}></div>
                        <div className={`relative w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                          <service.icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Title with gradient text */}
                    <h3 className="text-xl font-semibold text-white text-center relative z-10 leading-tight px-4">
                      <span className="bg-gradient-to-r from-white via-white/90 to-white bg-clip-text text-transparent">
                        {service.title}
                      </span>
                    </h3>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-8">
                    {/* Description */}
                    <p className="text-slate-700 mb-6 leading-relaxed font-light">
                      {service.description}
                    </p>
                    
                    {/* Features Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="text-center">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mb-2"></div>
                          <span className="text-xs font-medium text-slate-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Action Area */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200/30">
                      <div>
                        <div className="text-sm font-semibold text-blue-600">Explore Service</div>
                        <div className="text-xs text-slate-400">Click to learn more</div>
                      </div>
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${service.color} flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 shadow-lg`}>
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Luxury CTA Section */}
        <div className="mt-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600/10 via-white/20 to-indigo-600/10 border border-blue-200/30 p-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 blur-xl opacity-50"></div>
            
            <div className="relative bg-white/90 backdrop-blur-sm rounded-[calc(2rem-4px)] p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 mb-8 shadow-xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
                  Begin Your Transformation
                </h2>
                
                <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                  Experience premium service excellence from initial consultation to final installation. Our expert team ensures every detail meets the highest standards of quality and craftsmanship.
                </p>
                
          
                
                <p className="text-sm text-slate-400 mt-8">
                  Premium service guaranteed • Expert consultation • 5-year warranty
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Process Steps with separate icon and number */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-full mb-6">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                Our Process
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">The Ellendorf Experience</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              A seamless journey from concept to completion, ensuring exceptional results every time
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline connector */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
              {[
                { step: '01', title: 'Consultation', desc: 'Personalized design discussion', icon: Palette },
                { step: '02', title: 'Design', desc: 'Custom pattern creation', icon: Sparkles },
                { step: '03', title: 'Measurement', desc: 'Precision wall assessment', icon: Ruler },
                { step: '04', title: 'Installation', desc: 'Expert application', icon: Wrench },
                { step: '05', title: 'Support', desc: 'Aftercare & warranty', icon: Shield },
              ].map((process, idx) => (
                <div key={idx} className="relative">
                  <div className="text-center group cursor-pointer">
                    {/* Step number container */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 blur-lg opacity-30 rounded-full animate-pulse"></div>
                      
                      {/* Number circle */}
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                        {process.step}
                      </div>
                      
                      {/* Icon circle - separate from number */}
                      <div className="relative w-12 h-12 rounded-full bg-white border-2 border-blue-100 flex items-center justify-center mx-auto shadow-md group-hover:shadow-lg transition-shadow duration-300">
                        <process.icon className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 group-hover:shadow-xl transition-shadow duration-300">
                      <h4 className="font-bold text-slate-900 mb-3 text-lg">{process.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{process.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}