"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import axios from 'axios'; 
import { 
  Loader2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Grid, 
  Filter, 
  Search, 
  List, 
  Eye, 
  LayoutGrid, 
  LayoutList, 
  Star,
  Layers
} from 'lucide-react';

// Temporary auth mock - replace with actual import when available
const useAuth = () => ({ 
  user: null, 
  isAuthenticated: false,
  isSuperadmin: false,
  isAdmin: false,
  canViewAllBranches: () => false,
  getCurrentBranchId: () => null,
  isAdminOrHigher: () => false,
  login: () => {},
  logout: () => {},
  loadingUser: false
});

// Import image loading utilities
import { preloadAllImages, imageCache } from '@/lib/imageLoader';

export default function Wallpaper() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [imageLoadProgress, setImageLoadProgress] = useState({ loaded: 0, total: 0 });

  const cardsPerPage = viewMode === 'grid' ? 9 : 6;

  const quotes = [
    "Your walls deserve art, not just paint.",
    "Where luxury meets living.",
    "Design is a feeling you live in.",
    "Every room tells a story. Make yours unforgettable.",
    "Crafted for those who appreciate true elegance.",
  ];

  useEffect(() => {
    const fetchWallpapers = async () => {
      setLoading(true);
      setError(null);
      setImageLoadProgress({ loaded: 0, total: 0 });

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4500';
        const response = await axios.get(`${baseUrl}/api/wallpaper`);
        
        const data = response.data;
        const activeOnly = Array.isArray(data) ? data.filter(w => w.status === 'active') : [];
        
        // Set wallpapers immediately so UI can render
        setWallpapers(activeOnly);
        
        // Aggressively preload ALL images during loading state
        const imageUrls = activeOnly
          .filter(w => w.imageUrl && w.imageUrl !== "/placeholder.jpg")
          .map(w => w.imageUrl);
        
        setImageLoadProgress({ loaded: 0, total: imageUrls.length });
        
        // Preload all images with progress tracking
        await preloadAllImages(activeOnly, (loaded, total) => {
          setImageLoadProgress({ loaded, total });
        });
        
        console.log(`Successfully preloaded ${imageUrls.length} images`);
      } catch (err) {
        console.error('Error fetching wallpapers:', err);
        setError('Unable to load collection. Please try again.');
        setWallpapers([]);
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

  // Get unique subcategories from wallpapers
  const subCategories = useMemo(() => {
    const subCats = new Set();
    wallpapers.forEach(wp => {
      if (wp.subCategory?.name) {
        subCats.add(wp.subCategory.name);
      }
    });
    return Array.from(subCats).sort();
  }, [wallpapers]);

  // Search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results = [];
    
    // Search in wallpapers
    wallpapers.forEach(wp => {
      let matches = false;
      
      // Search in product code
      if (wp.productCode?.toLowerCase().includes(query)) {
        matches = true;
      }
      
      // Search in name
      if (wp.name?.toLowerCase().includes(query)) {
        matches = true;
      }
      
      // Search in description
      if (wp.description?.toLowerCase().includes(query)) {
        matches = true;
      }
      
      // Search in subcategory
      if (wp.subCategory?.name?.toLowerCase().includes(query)) {
        matches = true;
      }
      
      if (matches) {
        results.push({
          type: 'wallpaper',
          data: wp,
          highlight: wp.productCode?.toLowerCase().includes(query) ? 'productCode' : 
                    wp.subCategory?.name?.toLowerCase().includes(query) ? 'subcategory' : 
                    wp.name?.toLowerCase().includes(query) ? 'name' : 'description'
        });
      }
    });
    
    // Search in subcategories
    subCategories.forEach(subCat => {
      if (subCat.toLowerCase().includes(query)) {
        results.push({
          type: 'subcategory',
          data: subCat,
          highlight: 'subcategory'
        });
      }
    });
    
    setSearchResults(results);
  }, [searchQuery, wallpapers, subCategories]);

  const categories = useMemo(() => {
    const cats = new Set(wallpapers.map(w => w.category?.name).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [wallpapers]);

  const filteredWallpapers = useMemo(() => {
    let filtered = [...wallpapers];
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(w => w.category?.name === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w => 
        w.name?.toLowerCase().includes(query) ||
        w.productCode?.toLowerCase().includes(query) ||
        w.description?.toLowerCase().includes(query) ||
        w.subCategory?.name?.toLowerCase().includes(query)
      );
    }
    
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name?.localeCompare(b.name));
        break;
      case 'code':
        filtered.sort((a, b) => a.productCode?.localeCompare(b.productCode));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'subcategory':
        filtered.sort((a, b) => a.subCategory?.name?.localeCompare(b.subCategory?.name));
        break;
      default:
        break;
    }
    
    return filtered;
  }, [wallpapers, selectedCategory, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredWallpapers.length / cardsPerPage);
  const paginated = filteredWallpapers.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  useEffect(() => setCurrentPage(1), [selectedCategory, searchQuery, viewMode]);

  // Fixed watermark function with INCREASED text sizes and MINIMIZED white boxes
  const applyEllendorfWatermark = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Add CORS handling
      img.crossOrigin = "Anonymous";
      
      // Create a proxy URL if needed (for external images)
      let src = imageUrl;
      if (!imageUrl.includes('data:image') && !imageUrl.startsWith('blob:')) {
        src = imageUrl + '?t=' + new Date().getTime(); // Cache busting
      }
      
      img.src = src;
      
      img.onload = function() {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw original image
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          // INCREASED FONT SIZES with MINIMIZED boxes
          const STANDARD_FONT_SIZES = {
            mainBrand: 88,     // INCREASED from 72 to 88
            subBrand: 44,      // INCREASED from 36 to 44
            premiumCollection: 36, // INCREASED from 28 to 36
            footer: 32,        // INCREASED from 24 to 32
            productInfo: 40    // INCREASED product info font
          };
          
          const STANDARD_FOOTER = {
            marginBottom: 50,  // INCREASED margin
            height: 50         // INCREASED height
          };
          
          // ========== CENTER WATERMARK WITH INCREASED TEXT SIZE ==========
          ctx.save();
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const boxWidth = canvas.width * 0.7; // REDUCED from 0.8 to 0.7 (minimized box)
          const boxHeight = canvas.height * 0.2; // REDUCED from 0.25 to 0.2 (minimized box)
          
          // MINIMIZED transparent background box
          ctx.globalAlpha = 0.25; // REDUCED from 0.32
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(
            centerX - boxWidth/2, 
            centerY - boxHeight/2, 
            boxWidth, 
            boxHeight
          );
          
          // Main brand text with INCREASED size
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
          ctx.font = `bold ${STANDARD_FONT_SIZES.mainBrand}px 'Times New Roman', serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Subtle shadow for depth
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)"; // Increased shadow
          ctx.shadowBlur = 10; // Increased blur
          ctx.shadowOffsetY = 4; // Increased offset

          // Brand text - LARGER as requested
          ctx.fillText(
            "ELLENDORF – Textile Wall Coverings",
            centerX,
            centerY - (boxHeight * 0.18) // Adjusted for larger text
          );

          // Reset shadow before drawing lines
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;

          // Decorative luxury divider - THICKER
          ctx.globalAlpha = 0.5; // Increased opacity
          ctx.strokeStyle = "rgba(0,0,0,0.7)";
          ctx.lineWidth = 2; // Increased line width
          ctx.beginPath();
          ctx.moveTo(centerX - boxWidth * 0.25, centerY + (boxHeight * 0.08)); // Adjusted position
          ctx.lineTo(centerX + boxWidth * 0.25, centerY + (boxHeight * 0.08));
          ctx.stroke();

          // Sub branding - INCREASED size
          ctx.font = `italic ${STANDARD_FONT_SIZES.subBrand}px 'Times New Roman', serif`;
          ctx.fillText("Textile Wall Coverings", centerX, centerY + (boxHeight * 0.02));
          
          // Premium Collection text - INCREASED size
          ctx.font = `italic ${STANDARD_FONT_SIZES.premiumCollection}px 'Times New Roman', serif`;
          ctx.fillText("Premium Collection", centerX, centerY + (boxHeight * 0.15));
          
          ctx.restore();
          
          // ========== STANDARD FOOTER with INCREASED TEXT SIZE ==========
          ctx.save();
          const footerY = canvas.height - STANDARD_FOOTER.marginBottom;
          const footerWidth = canvas.width * 0.75; // REDUCED from 0.8 to 0.75 (minimized)
          
          // MINIMIZED Footer background
          ctx.globalAlpha = 0.06; // REDUCED from 0.08
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(
            centerX - footerWidth/2,
            footerY - (STANDARD_FOOTER.height/2),
            footerWidth,
            STANDARD_FOOTER.height
          );
          
          // Footer text - INCREASED size
          ctx.globalAlpha = 0.85; // Increased opacity
          ctx.fillStyle = "rgba(0, 0, 0, 0.9)"; // Darker
          ctx.font = `italic ${STANDARD_FONT_SIZES.footer}px 'Times New Roman', serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            "ELLENDORF Textile Wall Coverings - Premium Collection",
            centerX,
            footerY
          );
          ctx.restore();
          
          // ========== TOP CORNER WATERMARKS with INCREASED TEXT SIZE ==========
          ctx.save();
          const topLeftX = 40;
          const topLeftY = 40;
          const topRightX = canvas.width - 40;
          
          // Product Code at top-left - INCREASED size
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
          ctx.font = `bold ${STANDARD_FONT_SIZES.productInfo}px 'Arial', sans-serif`;
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText("CV019", topLeftX, topLeftY);
          
          // "Product Code:" label - INCREASED size
          ctx.font = `italic 24px 'Times New Roman', serif`; // Increased from 18
          ctx.fillText("Product Code:", topLeftX, topLeftY + 50); // Adjusted spacing
          
          // Collection at top-right - INCREASED size
          ctx.textAlign = "right";
          ctx.font = `bold ${STANDARD_FONT_SIZES.productInfo}px 'Arial', sans-serif`;
          ctx.fillText("City View(CV)", topRightX, topLeftY);
          
          // "Collection:" label - INCREASED size
          ctx.font = `italic 24px 'Times New Roman', serif`; // Increased from 18
          ctx.fillText("Collection:", topRightX, topLeftY + 50); // Adjusted spacing
          
          ctx.restore();
          
          // ========== BOTTOM-LEFT CORNER for additional branding ==========
          ctx.save();
          const bottomLeftX = 40;
          const bottomLeftY = canvas.height - 60;
          
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.font = `italic 28px 'Times New Roman', serif`; // Increased size
          ctx.textAlign = "left";
          ctx.textBaseline = "bottom";
          ctx.fillText("Luxury Textile Collection", bottomLeftX, bottomLeftY);
          ctx.restore();
          
          // Convert to data URL with high quality
          const watermarkedImage = canvas.toDataURL('image/jpeg', 0.95);
          resolve(watermarkedImage);
          
        } catch (error) {
          console.error("Error in watermark processing:", error);
          reject(error);
        }
      };
      
      img.onerror = function() {
        console.error("Failed to load image for watermarking:", imageUrl);
        reject(new Error("Failed to load image"));
      };
    });
  };

  const handleFullViewWithWatermark = async (wallpaper) => {
    try {
      setIsGeneratingPDF(true);
      
      // Apply watermark
      const watermarkedImage = await applyEllendorfWatermark(wallpaper.imageUrl);
      
      // Open watermarked image in new tab - CLEAN VIEW without any buttons
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${wallpaper.name} - ELLENDORF Wall Coverings</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #000;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                overflow: hidden;
              }
              .image-container {
                width: 100vw;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <div class="image-container">
              <img src="${watermarkedImage}" alt="${wallpaper.name}" />
            </div>
            <script>
              // Auto focus for better UX
              window.focus();
              
              // Close on Escape key
              document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                  window.close();
                }
              });
              
              // Right-click for save
              document.querySelector('img').addEventListener('contextmenu', function(e) {
                e.preventDefault();
                alert('Right-click and select "Save Image As..." to download');
              });
            </script>
          </body>
          </html>
        `);
        newWindow.document.close();
      }
      
      setIsGeneratingPDF(false);
    } catch (error) {
      console.error("Error in full view with watermark:", error);
      setIsGeneratingPDF(false);
      
      // Fallback: open original image in new tab
      const fallbackWindow = window.open('', '_blank');
      if (fallbackWindow) {
        fallbackWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${wallpaper.name} - Original Image</title>
            <style>
              body { margin: 0; padding: 20px; background: #f0f0f0; text-align: center; }
              img { max-width: 90vw; max-height: 85vh; }
              .message { 
                background: #ffebee; 
                padding: 20px; 
                margin: 20px auto; 
                max-width: 600px;
                border-radius: 10px;
                color: #c62828;
              }
            </style>
          </head>
          <body>
            <div class="message">
              <h3>Watermark Preview Unavailable</h3>
              <p>Showing original image instead. Watermark feature requires image to be loaded from a CORS-enabled source.</p>
            </div>
            <img src="${wallpaper.imageUrl}" alt="${wallpaper.name}" />
          </body>
          </html>
        `);
        fallbackWindow.document.close();
      }
    }
  };

  if (loading) {
    const progressPercent = imageLoadProgress.total > 0 
      ? Math.round((imageLoadProgress.loaded / imageLoadProgress.total) * 100)
      : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-8"
          >
            <div className="w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full" />
          </motion.div>
          <p className="text-2xl font-light text-slate-700">Curating Luxury Collection...</p>
          <p className="text-sm text-slate-500 mt-2">
            {imageLoadProgress.total > 0 
              ? `Loading images: ${imageLoadProgress.loaded} / ${imageLoadProgress.total} (${progressPercent}%)`
              : 'Loading premium designs...'
            }
          </p>
          
          {/* Progress bar */}
          {imageLoadProgress.total > 0 && (
            <div className="mt-6 w-64 mx-auto">
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-12 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-2xl max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-xl text-slate-700 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <header className="sticky ">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {/* Logo commented */}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-blue-50/30"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-6"
              >
                <Sparkles className="w-12 h-12 text-blue-400" />
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Luxury Textile
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Wall Coverings
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Premium collection of exquisite designs for your living spaces
              </p>
            </motion.div>

            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <div className="inline-block bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-200/50 shadow-lg">
                <p className="text-xl font-light italic text-slate-600">
                  {quotes[quoteIndex]}
                </p>
              </div>
            </motion.div>

            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by product code, name, category"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => searchQuery && setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-full text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                />
                
                {/* Search Suggestions Dropdown */}
                {showSearchSuggestions && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/50 z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="p-2">
                      <div className="text-xs text-slate-500 font-medium px-4 py-2">
                        Found {searchResults.length} results for {searchQuery}
                      </div>
                      
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                          onClick={() => {
                            if (result.type === 'wallpaper') {
                              setSelectedWallpaper(result.data);
                            } else if (result.type === 'subcategory') {
                              setSearchQuery(result.data);
                              setShowSearchSuggestions(false);
                            }
                          }}
                        >
                          {result.type === 'wallpaper' ? (
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={result.data.imageUrl}
                                  alt={result.data.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-slate-900 truncate">
                                    {result.data.name}
                                  </span>
                                  <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {result.data.productCode}
                                  </span>
                                </div>
                                {result.highlight === 'subcategory' && result.data.subCategory?.name && (
                                  <div className="text-xs text-slate-600">
                                    <span className="font-medium">Collection:</span>{' '}
                                    <span className="text-blue-600">{result.data.subCategory.name}</span>
                                  </div>
                                )}
                                {result.highlight === 'productCode' && (
                                  <div className="text-xs text-slate-600">
                                    <span className="font-medium">Product Code:</span>{' '}
                                    <span className="text-blue-600">{result.data.productCode}</span>
                                  </div>
                                )}
                                {result.highlight === 'name' && (
                                  <div className="text-xs text-slate-600">
                                    <span className="font-medium">Name:</span>{' '}
                                    <span className="text-blue-600">{result.data.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                                <Layers className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">Collection</div>
                                <div className="text-sm text-blue-600">{result.data}</div>
                              </div>
                              <div className="ml-auto text-xs text-slate-500">
                                Click to filter
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Quick Search Tips */}
              <div className="mt-3 text-center">
                <p className="text-xs text-slate-500">
                  Try searching by: <span className="text-blue-600">product code</span>,{' '}
                  <span className="text-blue-600">name</span>,{' '}
                  <span className="text-blue-600">collection</span>, or{' '}
                  <span className="text-blue-600">keywords</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Filter className="w-4 h-4" />
                  Collections:
                </div>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    variant={selectedCategory === cat ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-full ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              <div className="flex bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-full p-1">
                <Button
                  onClick={() => setViewMode('grid')}
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className={`rounded-full px-4 ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : ''}`}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className={`rounded-full px-4 ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : ''}`}
                >
                  <LayoutList className="w-4 h-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="pb-24">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <p className="text-slate-600">
              {/* Showing <span className="font-semibold text-blue-600">{filteredWallpapers.length}</span> designs */}
              {selectedCategory !== 'All' && (
                <span className="ml-2">
                  in <span className="font-semibold text-indigo-600">{selectedCategory}</span>
                </span>
              )}
              {searchQuery && (
                <span className="ml-2">
                  matching <span className="font-semibold text-green-600">{searchQuery}</span>
                </span>
              )}
            </p>
          </div>

          {viewMode === 'grid' ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            >
              <AnimatePresence mode="popLayout">
                {paginated.map((wp, i) => (
                  <motion.div
                    key={wp.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ 
                      duration: 0.4,
                      delay: i * 0.05,
                      layout: { duration: 0.3 }
                    }}
                    className="group relative"
                  >
                    <div
                      className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white border border-slate-200/50"
                      onClick={() => setSelectedWallpaper(wp)}
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img
                          src={wp.imageUrl}
                          alt={wp.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            // Retry loading the image if it fails
                            const img = e.target;
                            const retryCount = parseInt(img.dataset.retryCount || '0');
                            if (retryCount < 3) {
                              img.dataset.retryCount = (retryCount + 1).toString();
                              setTimeout(() => {
                                img.src = wp.imageUrl + '?retry=' + Date.now();
                              }, 1000 * (retryCount + 1));
                            } else {
                              img.src = "/placeholder.jpg";
                            }
                          }}
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWallpaper(wp);
                            }}
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>
                        </div>
                        
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-slate-700 shadow-sm">
                          {wp.subCategory?.name || "Premium"}
                        </div>
                      </div>

                      <div className="p-6 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 truncate">
                            {wp.name}
                          </h3>
                          <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {wp.productCode}
                          </span>
                        </div>
                        
                        {wp.description && (
                          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                            {wp.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {wp.subCategory?.name || 'Premium Collection'}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWallpaper(wp);
                              }}
                            >
                              <Maximize2 className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="space-y-6 mb-16"
            >
              <AnimatePresence mode="popLayout">
                {paginated.map((wp, i) => (
                  <motion.div
                    key={wp.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.4,
                      delay: i * 0.05
                    }}
                  >
                    <div
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200/50 cursor-pointer"
                      onClick={() => setSelectedWallpaper(wp)}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 relative overflow-hidden">
                          <img
                            src={wp.imageUrl}
                            alt={wp.name}
                            className="w-full h-64 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              // Retry loading the image if it fails
                              const img = e.target;
                              const retryCount = parseInt(img.dataset.retryCount || '0');
                              if (retryCount < 3) {
                                img.dataset.retryCount = (retryCount + 1).toString();
                                setTimeout(() => {
                                  img.src = wp.imageUrl + '?retry=' + Date.now();
                                }, 1000 * (retryCount + 1));
                              } else {
                                img.src = "/placeholder.jpg";
                              }
                            }}
                          />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-slate-700">
                            {wp.subCategory?.name || "Premium"}
                          </div>
                        </div>
                        
                        <div className="md:w-2/3 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-col md:flex-row md:items-start justify-between mb-3">
                              <h3 className="text-xl font-semibold text-slate-900 mb-2 md:mb-0">
                                {wp.name}
                              </h3>
                              <span className="text-sm font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                {wp.productCode}
                              </span>
                            </div>
                            
                            {wp.description && (
                              <p className="text-slate-600 mb-4 line-clamp-3">
                                {wp.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="text-sm text-slate-500">
                              <span className="bg-slate-100 px-3 py-1 rounded-full">
                                {wp.subCategory?.name || 'Premium Collection'}
                              </span>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedWallpaper(wp);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-full"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        className={`w-8 h-8 p-0 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-full"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages} • {filteredWallpapers.length} designs
              </span>
            </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedWallpaper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedWallpaper(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.8, rotateX: -10 }}
              animate={{ scale: 1, rotateX: 0 }}
              exit={{ scale: 0.8, rotateX: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl w-full bg-gradient-to-br from-white to-slate-50 rounded-3xl overflow-hidden border border-slate-200/50 shadow-2xl"
            >
              <div className="relative h-[70vh] overflow-hidden">
                <img
                  src={selectedWallpaper.imageUrl}
                  alt={selectedWallpaper.name}
                  className="w-full h-full object-contain"
                  loading="eager"
                  onError={(e) => {
                    // Retry loading the image if it fails
                    const img = e.target;
                    const retryCount = parseInt(img.dataset.retryCount || '0');
                    if (retryCount < 3) {
                      img.dataset.retryCount = (retryCount + 1).toString();
                      setTimeout(() => {
                        img.src = selectedWallpaper.imageUrl + '?retry=' + Date.now();
                      }, 1000 * (retryCount + 1));
                    } else {
                      img.src = "/placeholder.jpg";
                    }
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/95 to-transparent">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                      {selectedWallpaper.name}
                    </h2>
                    <div className="flex flex-wrap gap-4 items-center">
                      <span className="text-xl text-blue-600 font-mono">
                        {selectedWallpaper.productCode}
                      </span>
                      {selectedWallpaper.subCategory?.name && (
                        <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full">
                          {selectedWallpaper.subCategory.name}
                        </span>
                      )}
                    </div>
                    {selectedWallpaper.description && (
                      <p className="mt-4 text-slate-600 max-w-2xl">
                        {selectedWallpaper.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setSelectedWallpaper(null)}
                className="absolute top-6 right-6 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-3 shadow-lg"
                size="icon"
              >
                <X className="w-6 h-6 text-slate-700" />
              </Button>

              <Button
                onClick={() => handleFullViewWithWatermark(selectedWallpaper)}
                className="absolute top-6 left-6 bg-white/80 hover:bg-white backdrop-blur-sm text-slate-700"
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Maximize2 className="w-5 h-5 mr-2" />
                )}
                {isGeneratingPDF ? "Applying Watermark..." : "Full View with Watermark"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-gradient-to-b from-white to-slate-100 border-t border-slate-200/50">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Ellendorf
                </div>
                <div className="h-6 w-px bg-slate-300"></div>
                <p className="text-sm text-slate-500">
                  Luxury Textile Wall Coverings
                </p>
              </div>
              <p className="text-sm text-slate-400 mt-4 max-w-md">
                Premium collection of exquisite designs for modern living spaces.
                Elevate your decor with our stunning wall coverings.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end space-y-2">
              {/* <p className="text-sm text-slate-500">
                Showing {filteredWallpapers.length} of {wallpapers.length} designs
              </p> */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-full ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewMode('list')}
                  className={`rounded-full ${viewMode === 'list' ? 'bg-slate-100' : ''}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-400">
                © {new Date().getFullYear()} Ellendorf. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}