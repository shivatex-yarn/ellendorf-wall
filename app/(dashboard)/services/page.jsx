'use client';

import React, { useState } from 'react';
import { 
  Palette, Ruler, Wrench, Sparkles, Shield, 
  ArrowRight, Award, Clock, Star, CheckCircle, 
  Gem, Diamond, Medal, Trophy, Sparkle,
  ExternalLink, Droplets, Sun, Heart, Leaf,Zap,
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
    title: 'Custom Wall Coverings Design',
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

// Service Process Timeline Data
const serviceProcess = [
  {
    step: 1,
    title: 'Initial Consultation',
    description: 'Personalized design discussion with expert architects and designers.',
    features: [
      'Expert support from in-house architects & designers',
      'Personalized recommendations to suit your interiors',
      '2D visualization of design concepts'
    ],
    icon: Palette,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    step: 2,
    title: 'Custom Design Creation',
    description: 'Bespoke designs tailored to your specific requirements and preferences.',
    features: [
      'Advanced digital tools for precise customization',
      'Bespoke designs for homes, offices & commercial spaces',
      'Pattern generation and digital mockups'
    ],
    icon: Sparkles,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    step: 3,
    title: 'Site Assessment & Measurement',
    description: 'Precise measurement and preparation of your space for perfect installation.',
    features: [
      'Accurate wall measurements for perfect fitting',
      'Professional guidance on primers & wall readiness',
      'Wall condition assessment and surface preparation'
    ],
    icon: Ruler,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  {
    step: 4,
    title: 'Professional Installation',
    description: 'Skilled execution with meticulous attention to detail and quality.',
    features: [
      'Skilled installers ensuring seamless, bubble-free finishes',
      'On-site supervision for premium quality execution',
      'Clean installation process with quality checks'
    ],
    icon: Wrench,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    step: 5,
    title: 'After-Sales Support',
    description: 'Comprehensive warranty and ongoing maintenance support.',
    features: [
      '5-year warranty on all wallpapers',
      'Easy maintenance with dedicated customer care',
      '24/7 support for any queries or assistance'
    ],
    icon: Shield,
    iconColor: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200'
  }
];

// Timeline Component - FIXED VERSION
function ServicesTimeline() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="relative py-12">
      {/* Main Timeline Line - Centered */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-emerald-400 hidden lg:block"></div>
      
      {serviceProcess.map((item, index) => {
        const isEven = index % 2 === 0;
        
        return (
          <div
            key={item.step}
            className={`relative mb-12 lg:mb-0 ${index !== serviceProcess.length - 1 ? 'lg:mb-20' : ''}`}
            onMouseEnter={() => setActiveStep(item.step)}
            onMouseLeave={() => setActiveStep(1)}
          >
            <div className="flex flex-col lg:flex-row lg:items-center">
              {/* Left side content for odd steps (1, 3, 5) */}
              {isEven ? (
                <div className="w-full lg:w-1/2 lg:pr-8 mb-6 lg:mb-0 order-2 lg:order-1">
                  <div className={`inline-block transition-all duration-500 ${activeStep === item.step ? 'scale-105' : 'scale-100'}`}>
                    <div className={`p-6 rounded-2xl border ${item.borderColor} ${item.bgColor} shadow-lg hover:shadow-xl transition-all duration-300 max-w-md ml-auto`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-full ${item.bgColor} border ${item.borderColor}`}>
                          <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-4">{item.description}</p>
                      <ul className="space-y-2">
                        {item.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full lg:w-1/2 order-2 lg:order-1"></div>
              )}

              {/* Timeline node - center aligned */}
              <div className="relative flex justify-center items-center order-1 lg:order-2 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
                <div className={`relative z-10 flex flex-col items-center ${activeStep === item.step ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
                  {/* Step circle */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${activeStep === item.step ? 'border-white shadow-xl' : item.borderColor} ${item.bgColor} relative`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeStep === item.step ? 'bg-gradient-to-br from-blue-500 to-purple-500' : item.bgColor}`}>
                      <item.icon className={`w-6 h-6 ${activeStep === item.step ? 'text-white' : item.iconColor}`} />
                    </div>
                    {/* Step number badge */}
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === item.step ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}>
                      {item.step}
                    </div>
                  </div>
                  {/* Step title for mobile */}
                  <div className="mt-4 lg:hidden text-center">
                    <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                </div>
              </div>

              {/* Right side content for even steps (2, 4) */}
              {!isEven ? (
                <div className="w-full lg:w-1/2 lg:pl-8 mb-6 lg:mb-0 order-3">
                  <div className={`inline-block transition-all duration-500 ${activeStep === item.step ? 'scale-105' : 'scale-100'}`}>
                    <div className={`p-6 rounded-2xl border ${item.borderColor} ${item.bgColor} shadow-lg hover:shadow-xl transition-all duration-300 max-w-md`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-full ${item.bgColor} border ${item.borderColor}`}>
                          <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-4">{item.description}</p>
                      <ul className="space-y-2">
                        {item.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full lg:w-1/2 order-3"></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ServicesPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <>
      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spin-slow-reverse {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 3s linear infinite;
        }
        
        .animate-pulse {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-white overflow-hidden">
        {/* Light Background Effects - Removed colored gradients, keeping white */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-white"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
          {/* Header with Company Story - Updated for franchise model */}
          <div className="text-center mb-24">
            {/* Company Story */}
            <div className="mb-16 max-w-4xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12 shadow-sm">
                <p className="text-gray-700 leading-relaxed font-medium italic">
                  We believe wall coverings should not trap air, mold, or moisture — they should breathe just like nature.
                </p>
              </div>
            </div>

            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full mb-8 shadow-sm">
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

        
         

          {/* P.U.R.E Section - Updated for franchise model */}
         
          {/* CTA Section */}
          <div className="relative">
            {/* Background - White */}
            <div className="absolute inset-0 bg-white rounded-[3rem]"></div>
            
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
                      <span className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-rose-600 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse">
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
    </>
  );
}