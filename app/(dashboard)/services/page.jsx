'use client';

import React, { useState } from 'react';
import { 
  Palette, Ruler, Wrench, Sparkles, Shield, Settings, 
  ArrowRight, Award, Clock, Star, CheckCircle, Users,
  Calendar, FileText, Home, Building, Target, Zap,
  Crown, Gem, Diamond, Medal, Trophy, Sparkle,
  ArrowUpRight, ExternalLink
} from 'lucide-react';

const services = [
  {
    title: 'Consultation & Design Guidance',
    description: 'Expert support from in-house architects & designers. Personalized recommendations to suit your interiors.',
    icon: Palette,
    color: 'from-blue-600 to-indigo-700',
    gradient: 'bg-gradient-to-br from-blue-600/20 to-indigo-600/10',
    features: ['2D Visualization', 'Color Matching', 'Style Consultation'],
    badge: 'Premium'
  },
  {
    title: 'Custom Wall Covering Design',
    description: 'Bespoke designs for homes, offices & commercial spaces. Advanced digital tools for precise customization.',
    icon: Sparkles,
    color: 'from-purple-600 to-pink-600',
    gradient: 'bg-gradient-to-br from-purple-600/20 to-pink-600/10',
    features: ['AI Design Tools', 'Pattern Generation', 'Digital Mockups'],
    badge: 'Innovative'
  },
  {
    title: 'Professional Installation',
    description: 'Skilled installers ensuring seamless, bubble-free finishes. On-site supervision for premium quality execution.',
    icon: Wrench,
    color: 'from-emerald-600 to-teal-600',
    gradient: 'bg-gradient-to-br from-emerald-600/20 to-teal-600/10',
    features: ['Expert Installers', 'Quality Checks', 'Clean Installation'],
    badge: 'Certified'
  },
  {
    title: 'Site Measurement & Preparation',
    description: 'Accurate wall measurements for perfect fitting. Professional guidance on primers & wall readiness.',
    icon: Ruler,
    color: 'from-amber-600 to-orange-600',
    gradient: 'bg-gradient-to-br from-amber-600/20 to-orange-600/10',
    features: ['Perfect Measurement', 'Wall Assessment', 'Surface Prep'],
    badge: 'Precision'
  },
  {
    title: 'After-Sales Support',
    description: '5-year warranty on all wall coverings. Easy maintenance with dedicated customer care.',
    note: '*Terms & conditions apply for warranty coverage.',
    icon: Shield,
    color: 'from-rose-600 to-red-600',
    gradient: 'bg-gradient-to-br from-rose-600/20 to-red-600/10',
    features: ['5-Year Warranty', 'Maintenance Guide', '24/7 Support'],
    badge: 'Protected'
  }
];

export default function ServicesPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white overflow-hidden">
      {/* Light Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-100/30 via-pink-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-indigo-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
        {/* Header */}
        <div className="text-center mb-24">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full mb-8 animate-pulse">
            <Sparkle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              Premium Excellence
            </span>
            <Sparkle className="w-4 h-4 text-blue-500" />
          </div>

          {/* Main Title */}
          <div className="relative mb-10">
            <div className="absolute -inset-x-20 top-1/2 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
            <h1 className="relative text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Premium
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Services
              </span>
            </h1>
            <div className="absolute -inset-x-20 bottom-1/2 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
          </div>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Complete luxury textile wall coverings solutions—crafted with precision from concept to completion
          </p>
        </div>

        {/* Stats - Centered */}
        <div className="flex justify-center mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 hover:border-blue-300 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-100">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 blur-lg opacity-20 rounded-full"></div>
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-1">100%</div>
                    <div className="text-lg font-medium text-gray-700">Premium Quality</div>
                    <div className="text-sm text-gray-500 mt-1">Certified materials & craftsmanship</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 hover:border-emerald-300 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-100">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 blur-lg opacity-20 rounded-full"></div>
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-xl">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-1">98%</div>
                    <div className="text-lg font-medium text-gray-700">On-Time Delivery</div>
                    <div className="text-sm text-gray-500 mt-1">Project completion guarantee</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="relative mb-32">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-full mb-8">
              <Gem className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
                Our Premium Services
              </span>
              <Gem className="w-4 h-4 text-indigo-500" />
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Bespoke Luxury
              </span>{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Solutions
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each service meticulously crafted for discerning clients who demand excellence
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="relative group"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Outer Glow */}
                <div className={`absolute -inset-0.5 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 ${service.gradient}`}></div>
                
                {/* Main Card */}
                <div className={`relative bg-white border border-gray-200 rounded-[1.75rem] overflow-hidden transition-all duration-500 group-hover:border-gray-300 ${
                  hoveredCard === index ? 'scale-[1.02] shadow-2xl' : 'scale-100 shadow-xl'
                }`}>
                  {/* Premium Badge */}
                  <div className="absolute top-6 right-6 z-10">
                    <div className={`px-3 py-1.5 bg-gradient-to-r ${service.color} rounded-full`}>
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        {service.badge}
                      </span>
                    </div>
                  </div>

                  {/* Card Header */}
                  <div className={`relative bg-gradient-to-br ${service.color} p-10 overflow-hidden`}>
                    {/* Icon Container */}
                    <div className="relative flex justify-center mb-8">
                      <div className="relative">
                        {/* Middle Ring */}
                        <div className={`absolute -inset-4 bg-gradient-to-br ${service.color} blur-xl opacity-0 group-hover:opacity-30 rounded-full transition-all duration-700`}></div>
                        
                        {/* Icon Container */}
                        <div className={`relative w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                          <service.icon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white text-center px-4 leading-tight">
                      <span className="bg-gradient-to-r from-white via-white/95 to-white bg-clip-text text-transparent">
                        {service.title}
                      </span>
                    </h3>
                  </div>

                  {/* Card Content */}
                  <div className="p-8">
                    {/* Description */}
                    <p className="text-gray-600 mb-8 leading-relaxed font-light">
                      {service.description}
                    </p>

                    {/* Note Section - Only shows if note exists */}
                    {service.note && (
                      <div className="mb-8 p-4 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-rose-700 font-medium">
                              {service.note}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                        Key Features
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {service.features.map((feature, idx) => (
                          <div 
                            key={idx} 
                            className="group/feature flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-300"
                          >
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 group-hover/feature:scale-150 transition-transform duration-300"></div>
                            <span className="text-sm font-medium text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Timeline */}
        <div className="relative mb-32">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-full mb-8">
              <Crown className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">
                The Journey
              </span>
              <Crown className="w-4 h-4 text-emerald-500" />
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Our Luxury Process
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A meticulously crafted experience from initial consultation to final masterpiece
            </p>
          </div>

          {/* Process Timeline */}
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

                    {/* Content Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 group-hover:border-gray-300 transition-all duration-300 hover:shadow-xl">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">{process.title}</h4>
                      <p className="text-gray-600 leading-relaxed mb-6">{process.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">
                          Step {process.step.slice(1)} of 5
                        </span>
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-[3rem] blur-3xl"></div>
          
          {/* Main Container */}
          <div className="relative overflow-hidden rounded-[3rem] border border-gray-200 bg-white">
            <div className="p-1">
              <div className="bg-gradient-to-br from-white via-white to-white rounded-[calc(3rem-4px)] p-16">
                <div className="max-w-3xl mx-auto text-center">
                  {/* Icon */}
                  <div className="relative inline-flex mb-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 blur-2xl rounded-full"></div>
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl border-2 border-white">
                      <Diamond className="w-12 h-12 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-5xl font-bold text-gray-900 mb-8">
                    Begin Your{' '}
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Transformation
                    </span>
                  </h2>

                  {/* Description */}
                  <p className="text-xl text-gray-600 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
                    Experience unparalleled service excellence from initial consultation to final installation. Our master craftsmen ensure every detail meets the highest standards of luxury and perfection.
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8">
                    {[
                      { icon: Shield, text: '5-year warranty', color: 'text-rose-500' },
                      { icon: Medal, text: 'Master craftsmen', color: 'text-blue-500' },
                      { icon: Trophy, text: 'Premium service', color: 'text-amber-500' },
                      { icon: Zap, text: '24/7 support', color: 'text-emerald-500' },
                    ].map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center gap-2"
                      >
                        <feature.icon className={`w-5 h-5 ${feature.color}`} />
                        <span className="text-sm text-gray-600 font-medium">
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Terms & Conditions Glow Note */}
                  <div className="mt-6 flex justify-center">
                    <span className="
                      relative inline-flex items-center gap-2
                      px-4 py-2 rounded-full
                      text-xs font-semibold text-rose-600
                      bg-rose-500/10
                      shadow-[0_0_15px_rgba(244,63,94,0.4)]
                      animate-pulse
                    ">
                      <ExternalLink className="w-4 h-4" />
                      Terms & Conditions Apply
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}