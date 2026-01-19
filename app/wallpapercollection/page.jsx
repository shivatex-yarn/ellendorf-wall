"use client";

import React, { useState, useEffect, useMemo, useCallback, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  Download,
  Sparkles,
  Eye,
  Maximize2,
  Trash2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { AnimatePresence, motion } from "framer-motion";

// Image cache for preloading
const imageCache = new Map();

// Preload image function
const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (imageCache.has(url)) {
      resolve(imageCache.get(url));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    
    img.onload = () => {
      imageCache.set(url, url);
      resolve(url);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
  });
};

// Customer Name Dialog Component
const CustomerNameDialog = ({ isOpen, onClose, onConfirm }) => {
  const [customerName, setCustomerName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (customerName.trim()) {
      onConfirm(customerName.trim());
      setCustomerName("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center">
      <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-[2rem] p-12 shadow-2xl border border-zinc-700 max-w-2xl w-full mx-4">
        <Button 
          onClick={() => {
            setCustomerName("");
            onClose();
          }} 
          className="absolute top-6 right-6 bg-white/20 rounded-full p-3"
        >
          <X className="w-6 h-6" />
        </Button>
        
        <h2 className="text-4xl font-semibold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-emerald-200">
          Enter Customer Name
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-lg font-medium text-zinc-300 mb-3">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full h-14 bg-zinc-900/80 border-zinc-600 text-lg rounded-xl"
              required
              autoFocus
            />
            <p className="text-sm text-zinc-400 mt-2">
              The PDF will be generated with watermark and customer details.
            </p>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              onClick={() => {
                setCustomerName("");
                onClose();
              }}
              className="bg-zinc-800 hover:bg-zinc-700 px-8 py-3 rounded-xl text-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!customerName.trim()}
              className="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 px-8 py-3 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate PDF
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// WallpaperCard Component - For grid view
const WallpaperCard = React.memo(({ wp, index, onClick, onLike, isLiked, isHighlighted, id, compact = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  // Preload image on component mount
  useEffect(() => {
    const loadImage = async () => {
      if (!wp.imageUrl) {
        setImageSrc("/placeholder.jpg");
        setIsImageLoaded(true);
        return;
      }

      try {
        setIsImageError(false);
        const cachedUrl = await preloadImage(wp.imageUrl);
        setImageSrc(cachedUrl);
      } catch (error) {
        console.error("Failed to load image:", error);
        setImageSrc("/placeholder.jpg");
        setIsImageError(true);
      }
    };

    loadImage();
  }, [wp.imageUrl]);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClick(wp);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onLike(wp);
  };

  return (
    <motion.div
      layoutId={compact ? undefined : `card-${wp.id}-${id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.01,
        ease: "easeOut"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-zinc-900/90 overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl border-2 aspect-[16/9] w-full rounded-2xl shadow-xl ${
        isHighlighted 
          ? 'border-blue-500 ring-4 ring-blue-500/20 scale-105 z-10' 
          : 'border-zinc-800'
      } ${compact ? 'rounded-lg' : 'rounded-2xl'}`}
      onClick={handleClick}
    >
      {/* Loading/Error state */}
      {!isImageLoaded && !isImageError && (
        <div className={`absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse ${compact ? 'rounded-lg' : 'rounded-2xl'}`} />
      )}
      
      {isImageError && (
        <div className={`absolute inset-0 bg-zinc-800 flex items-center justify-center ${compact ? 'rounded-lg' : 'rounded-2xl'}`}>
          <span className="text-zinc-500 text-xs">Failed to load</span>
        </div>
      )}

      {/* Main image */}
      <motion.div layoutId={compact ? undefined : `image-${wp.id}-${id}`} className="w-full h-full">
        {imageSrc && (
          <img
            src={imageSrc}
            alt={wp.name}
            loading={index < 12 ? "eager" : "lazy"}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => {
              setIsImageError(true);
              setIsImageLoaded(true);
            }}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            } ${compact ? 'rounded-lg' : 'rounded-2xl'}`}
            crossOrigin="anonymous"
            decoding="async"
          />
        )}
      </motion.div>

      {/* Overlay info - Only show on hover for compact mode */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300 ${
          compact 
            ? `p-2 rounded-b-lg ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}` 
            : `p-4 rounded-b-2xl ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`
        }`}
      >
        <motion.h3 
          layoutId={compact ? undefined : `title-${wp.id}-${id}`} 
          className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-white truncate`}
        >
          {wp.name}
        </motion.h3>
        <motion.p 
          layoutId={compact ? undefined : `code-${wp.id}-${id}`} 
          className={`${compact ? 'text-[10px]' : 'text-xs'} text-zinc-300 truncate`}
        >
          {wp.productCode}
        </motion.p>
      </div>
    </motion.div>
  );
});

WallpaperCard.displayName = 'WallpaperCard';

// Compact Wallpaper Card for Liked Modal
const CompactWallpaperCard = React.memo(({ wp, index, onClick, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    const loadImage = async () => {
      if (!wp.imageUrl) {
        setImageSrc("/placeholder.jpg");
        setIsImageLoaded(true);
        return;
      }

      try {
        const cachedUrl = await preloadImage(wp.imageUrl);
        setImageSrc(cachedUrl);
      } catch (error) {
        console.error("Failed to load image:", error);
        setImageSrc("/placeholder.jpg");
        setIsImageLoaded(true);
      }
    };

    loadImage();
  }, [wp.imageUrl]);

  const handleClick = (e) => {
    e.stopPropagation();
    onClick(wp);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove(wp);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-zinc-800/50 rounded-lg overflow-hidden cursor-pointer border border-zinc-700/50 hover:border-zinc-600 transition-all duration-200"
    >
      {/* Image container */}
      <div 
        className="relative aspect-[4/3] overflow-hidden"
        onClick={handleClick}
      >
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-zinc-800 animate-pulse rounded-lg" />
        )}
        
        {imageSrc && (
          <img
            src={imageSrc}
            alt={wp.name}
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Remove button */}
        <Button
          onClick={handleRemove}
          size="icon"
          className={`absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 rounded-full p-1 transition-all duration-200 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <Trash2 className="w-3 h-3 text-white" />
        </Button>

        {/* View button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            window.open(wp.imageUrl, '_blank');
          }}
          size="icon"
          className={`absolute top-1 left-1 bg-black/70 hover:bg-black/90 rounded-full p-1 transition-all duration-200 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <Eye className="w-3 h-3 text-white" />
        </Button>
      </div>

      {/* Info bar */}
      <div className="p-2 bg-zinc-900/80">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-white truncate" title={wp.name}>
            {wp.name}
          </span>
          <span className="text-[10px] text-zinc-400 truncate" title={wp.productCode}>
            {wp.productCode}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

CompactWallpaperCard.displayName = 'CompactWallpaperCard';

// Category Section Component
const CategorySection = React.memo(({ 
  category, 
  wallpapers, 
  pageByCategory, 
  setPageByCategory,
  onCardClick,
  onLike,
  likedWallpapers,
  highlightedProductCode,
  id 
}) => {
  const sectionRef = useRef(null);
  
  const itemsPerPage = 6;
  
  // Calculate category items
  const categoryItems = useMemo(() => 
    wallpapers.filter((w) => w.subCategory?.name === category),
    [wallpapers, category]
  );
  
  const totalPages = Math.ceil(categoryItems.length / itemsPerPage);
  const currentPage = pageByCategory[category] || 0;
  const start = currentPage * itemsPerPage;
  const visibleItems = categoryItems.slice(start, start + itemsPerPage);

  // Preload images for current and next page
  useEffect(() => {
    const preloadAllImages = async () => {
      const imagesToPreload = [];
      
      // Current page images
      visibleItems.forEach(wp => {
        if (wp.imageUrl) imagesToPreload.push(wp.imageUrl);
      });
      
      // Next page images (if exists)
      if (currentPage < totalPages - 1) {
        const nextStart = (currentPage + 1) * itemsPerPage;
        const nextPageItems = categoryItems.slice(nextStart, nextStart + itemsPerPage);
        nextPageItems.forEach(wp => {
          if (wp.imageUrl) imagesToPreload.push(wp.imageUrl);
        });
      }
      
      // Previous page images (if exists)
      if (currentPage > 0) {
        const prevStart = (currentPage - 1) * itemsPerPage;
        const prevPageItems = categoryItems.slice(prevStart, prevStart + itemsPerPage);
        prevPageItems.forEach(wp => {
          if (wp.imageUrl) imagesToPreload.push(wp.imageUrl);
        });
      }
      
      // Preload all images
      await Promise.allSettled(imagesToPreload.map(url => preloadImage(url)));
    };
    
    preloadAllImages();
  }, [categoryItems, currentPage, visibleItems, totalPages, itemsPerPage]);

  // Check if this category contains the highlighted product
  const containsHighlightedProduct = useMemo(() => {
    return visibleItems.some(wp => wp.productCode === highlightedProductCode);
  }, [visibleItems, highlightedProductCode]);

  // Auto-scroll to highlighted product
  useEffect(() => {
    if (containsHighlightedProduct && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  }, [containsHighlightedProduct, currentPage]);

  // Handle page change
  const handlePageChange = useCallback((direction) => {
    let newPage = currentPage;
    if (direction === 'prev' && currentPage > 0) {
      newPage = currentPage - 1;
    } else if (direction === 'next' && currentPage < totalPages - 1) {
      newPage = currentPage + 1;
    } else {
      return;
    }
    
    // Update page state
    setPageByCategory(prev => ({ ...prev, [category]: newPage }));
  }, [category, currentPage, totalPages, setPageByCategory]);

  return (
    <section key={category} className="mb-4" ref={sectionRef}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-medium text-white">{category}</h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              disabled={currentPage === 0}
              onClick={() => handlePageChange('prev')}
              className="bg-black/70 rounded-full p-2 hover:bg-black/90 disabled:opacity-30 transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-zinc-400">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              size="icon"
              disabled={currentPage === totalPages - 1}
              onClick={() => handlePageChange('next')}
              className="bg-black/70 rounded-full p-2 hover:bg-black/90 disabled:opacity-30 transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      <motion.div 
        key={currentPage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
      >
        {visibleItems.map((wp, idx) => (
          <WallpaperCard 
            key={`${wp.id}-${currentPage}-${idx}`} 
            wp={wp} 
            index={idx}
            onClick={onCardClick}
            onLike={onLike}
            isLiked={likedWallpapers.some(w => w.id === wp.id)}
            isHighlighted={wp.productCode === highlightedProductCode}
            id={id}
          />
        ))}
      </motion.div>
    </section>
  );
});

CategorySection.displayName = 'CategorySection';

// Lightbox Component for viewing full-size wallpaper
const Lightbox = ({ wallpaper, isOpen, onClose, onLike, isLiked, id }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  // Preload high-quality image for lightbox
  useEffect(() => {
    if (wallpaper?.imageUrl && isOpen) {
      const loadImage = async () => {
        try {
          // Don't set isImageLoaded to false here - let the natural loading state handle it
          const cachedUrl = await preloadImage(wallpaper.imageUrl);
          setImageSrc(cachedUrl);
          // Let the onLoad handler set isImageLoaded to true
        } catch (error) {
          console.error("Failed to load lightbox image:", error);
          setImageSrc(wallpaper.imageUrl);
          // Let the onError handler handle the loading state
        }
      };
      loadImage();
    }
  }, [wallpaper?.imageUrl, isOpen]);

  if (!isOpen || !wallpaper) return null;

  const handleLikeClick = (e) => {
    e.stopPropagation();
    onLike(wallpaper);
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = wallpaper.imageUrl;
    link.download = `${wallpaper.productCode || wallpaper.name}_wallpaper.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewFull = (e) => {
    e.stopPropagation();
    window.open(wallpaper.imageUrl, "_blank");
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/90 z-[60]"
            onClick={onClose}
          />
          
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              layoutId={`card-${wallpaper.id}-${id}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.23, 1, 0.32, 1],
                opacity: { duration: 0.3 }
              }}
              className="relative w-full max-w-6xl max-h-[90vh] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Controls */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                <Button
                  onClick={handleLikeClick}
                  className="bg-black/70 hover:bg-black/90 rounded-full p-3 transition-all duration-200"
                  size="icon"
                >
                  <Heart
                    className={`w-6 h-6 transition-all duration-200 ${
                      isLiked ? "fill-red-500 text-red-500" : "text-white"
                    }`}
                  />
                </Button>

                <Button
                  onClick={handleViewFull}
                  className="bg-black/70 hover:bg-black/90 rounded-full p-3 transition-all duration-200"
                  size="icon"
                >
                  <Maximize2 className="w-6 h-6 text-white" />
                </Button>

                <Button
                  onClick={onClose}
                  className="bg-black/70 hover:bg-black/90 rounded-full p-3 transition-all duration-200"
                  size="icon"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Image container */}
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <motion.div 
                  layoutId={`image-${wallpaper.id}-${id}`}
                  className="w-full h-full flex items-center justify-center"
                >
                  {!isImageLoaded && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg"
                    />
                  )}
                  
                  {imageSrc && (
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isImageLoaded ? 1 : 0 }}
                      transition={{ duration: 0.3, delay: isImageLoaded ? 0 : 0.1 }}
                      src={imageSrc}
                      alt={wallpaper.name}
                      loading="eager"
                      className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg"
                      onLoad={() => setIsImageLoaded(true)}
                      onError={() => {
                        setImageSrc("https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=1200&auto=format&fit=crop");
                        setIsImageLoaded(true);
                      }}
                    />
                  )}
                </motion.div>
                
                {/* Information overlay */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6"
                >
                  <div className="max-w-2xl mx-auto text-center">
                    <motion.h3 
                      layoutId={`title-${wallpaper.id}-${id}`}
                      className="text-2xl font-bold text-white mb-2"
                    >
                      {wallpaper.name}
                    </motion.h3>
                    {wallpaper.productCode && (
                      <motion.p 
                        layoutId={`code-${wallpaper.id}-${id}`}
                        className="text-lg text-blue-300 mb-1"
                      >
                        Code: {wallpaper.productCode}
                      </motion.p>
                    )}
                    {wallpaper.subCategory?.name && (
                      <p className="text-zinc-300">Collection: {wallpaper.subCategory.name}</p>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function EllendorfWallpaperApp() {
  const router = useRouter();
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [showLikedModal, setShowLikedModal] = useState(false);
  const [showTemplateChoice, setShowTemplateChoice] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageByCategory, setPageByCategory] = useState({});
  const [likedWallpapers, setLikedWallpapers] = useState([]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [highlightedProductCode, setHighlightedProductCode] = useState("");
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    const stored = sessionStorage.getItem("likedWallpapers");
    if (stored) setLikedWallpapers(JSON.parse(stored));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("likedWallpapers", JSON.stringify(likedWallpapers));
  }, [likedWallpapers]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSelectedWallpaper(null);
    };
    if (selectedWallpaper) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedWallpaper]);

  const toggleLike = useCallback((wp) => {
    setLikedWallpapers((prev) => {
      const exists = prev.some((w) => w.id === wp.id);
      return exists ? prev.filter((w) => w.id !== wp.id) : [...prev, wp];
    });
  }, []);

  const handleCardClick = useCallback((wp) => {
    setSelectedWallpaper(wp);
  }, []);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // If the search term looks like a product code, highlight it
    if (value.trim().toUpperCase() === value.trim() && value.trim().length >= 3) {
      setHighlightedProductCode(value.trim().toUpperCase());
    } else {
      setHighlightedProductCode("");
    }
  }, []);

  const clearAllLiked = () => {
    setLikedWallpapers([]);
    sessionStorage.removeItem("likedWallpapers");
  };

  // Remove wallpaper from liked list
  const removeFromLiked = useCallback((wp) => {
    setLikedWallpapers(prev => prev.filter(w => w.id !== wp.id));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:4500/api/wallpaper");
        const wpData = await res.json();
        const activeWallpapers = wpData
          .filter((w) => w.status?.toLowerCase() === "active")
          .map((w) => ({
            ...w,
            imageUrl: w.imageUrl || "/placeholder.jpg",
          }));
        activeWallpapers.sort((a, b) => {
          const catA = a.subCategory?.name || "Other";
          const catB = b.subCategory?.name || "Other";
          return catA.localeCompare(catB);
        });
        setWallpapers(activeWallpapers);
        
        // Preload first batch of images
        const firstBatch = activeWallpapers.slice(0, 24);
        await Promise.allSettled(firstBatch.map(wp => preloadImage(wp.imageUrl)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredWallpapers = useMemo(() => {
    if (!searchTerm) return wallpapers;
    const term = searchTerm.toLowerCase();
    return wallpapers.filter(
      (w) =>
        w.name?.toLowerCase().includes(term) ||
        w.subCategory?.name?.toLowerCase().includes(term) ||
        w.productCode?.toLowerCase().includes(term)
    );
  }, [wallpapers, searchTerm]);

  const categories = useMemo(() => {
    return [...new Set(wallpapers.map((w) => w.subCategory?.name).filter(Boolean))];
  }, [wallpapers]);

  const downloadAllAsPDF = async (customerName) => {
    if (!customerName || !customerName.trim()) {
      alert("Please enter a customer name");
      return;
    }

    setIsGeneratingPDF(true);
    
    const doc = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - 2 * margin;
    const contentHeight = pageHeight - 2 * margin;
    
    // Get current timestamp
    const currentDate = new Date();
    const timestamp = currentDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const formattedDate = currentDate.toISOString().split('T')[0];
    const timeString = currentDate.getTime();

    // Function to add luxury watermark to image
    const addLuxuryWatermarkToImage = (imageUrl) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas size to image size
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw original image
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          // Add luxury watermark - Center position
          ctx.save();
          
          // Calculate center position
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          // Watermark background (subtle white overlay)
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = "white";
          ctx.fillRect(centerX - 200, centerY - 80, 400, 160);
          
          // Main watermark text (Elegant Luxury Font)
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.font = "bold 48px 'Times New Roman', serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          // Ellendorf text
          ctx.fillText("ELLENDORF", centerX, centerY - 20);
          
          // Divider line
          ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(centerX - 100, centerY);
          ctx.lineTo(centerX + 100, centerY);
          ctx.stroke();
          
          // Powered by text
          ctx.font = "italic 20px 'Times New Roman', serif";
          ctx.fillText("Powered by Reimagine AI", centerX, centerY + 25);
          
          // Add subtle pattern overlay
          ctx.globalAlpha = 0.03;
          ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(centerX + (i - 2) * 80, centerY, 40, 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
          
          // Add corner accent
          ctx.save();
          ctx.globalAlpha = 0.1;
          ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
          ctx.lineWidth = 2;
          
          // Top-left corner
          ctx.beginPath();
          ctx.moveTo(50, 50);
          ctx.lineTo(100, 50);
          ctx.lineTo(50, 100);
          ctx.stroke();
          
          // Top-right corner
          ctx.beginPath();
          ctx.moveTo(canvas.width - 50, 50);
          ctx.lineTo(canvas.width - 100, 50);
          ctx.lineTo(canvas.width - 50, 100);
          ctx.stroke();
          
          // Bottom-left corner
          ctx.beginPath();
          ctx.moveTo(50, canvas.height - 50);
          ctx.lineTo(50, canvas.height - 100);
          ctx.lineTo(100, canvas.height - 50);
          ctx.stroke();
          
          // Bottom-right corner
          ctx.beginPath();
          ctx.moveTo(canvas.width - 50, canvas.height - 50);
          ctx.lineTo(canvas.width - 50, canvas.height - 100);
          ctx.lineTo(canvas.width - 100, canvas.height - 50);
          ctx.stroke();
          
          ctx.restore();
          
          // Convert canvas to data URL with good quality
          const watermarkedImage = canvas.toDataURL('image/jpeg', 0.8);
          resolve(watermarkedImage);
        };
        
        img.onerror = () => {
          reject(new Error("Failed to load image for watermarking"));
        };
      });
    };

    // Add cover page with white background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    
    // Add decorative border
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(2);
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
    
    // Add title with luxury styling
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(42);
    doc.setFont("times", "bolditalic");
    doc.text("ELLENDORF", pageWidth / 2, 120, { align: "center" });
    
    // Add decorative underline
    doc.setDrawColor(200, 180, 150);
    doc.setLineWidth(3);
    doc.line(pageWidth / 2 - 120, 135, pageWidth / 2 + 120, 135);
    
    doc.setFontSize(28);
    doc.setFont("times", "italic");
    doc.text("Wallpaper Collections", pageWidth / 2, 165, { align: "center" });
    
    doc.setFontSize(22);
    doc.setFont("helvetica", "normal");
    doc.text("Powered by Reimagine AI", pageWidth / 2, 200, { align: "center" });
    
    // Add decorative element
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(pageWidth / 2 - 180, 230, 360, 80, 10, 10, 'F');
    
    // Add customer info inside decorative box
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(`Customer: ${customerName}`, pageWidth / 2, 260, { align: "center" });
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${timestamp}`, pageWidth / 2, 290, { align: "center" });
    
    // Add wallpaper count
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(16);
    doc.text(`Total Selected Wallpapers: ${likedWallpapers.length}`, pageWidth / 2, 330, { align: "center" });
    
    // Add decorative divider
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(1);
    doc.setLineDash([5, 5]);
    doc.line(50, 350, pageWidth - 50, 350);
    doc.setLineDash([]);
    
    // Add thank you note with luxury styling
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(20);
    doc.setFont("times", "italic");
    doc.text("Thank you for choosing", pageWidth / 2, 380, { align: "center" });
    
    doc.setFontSize(24);
    doc.setFont("times", "bold");
    doc.text("Ellendorf Luxury Wallpapers", pageWidth / 2, 410, { align: "center" });
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text("Premium Quality | Timeless Elegance | Exceptional Craftsmanship", pageWidth / 2, 440, { align: "center" });
    
    // Add decorative corner accents on cover page
    doc.setDrawColor(200, 180, 150);
    doc.setLineWidth(1);
    
    // Top-left corner
    doc.line(40, 40, 80, 40);
    doc.line(40, 40, 40, 80);
    
    // Top-right corner
    doc.line(pageWidth - 40, 40, pageWidth - 80, 40);
    doc.line(pageWidth - 40, 40, pageWidth - 40, 80);
    
    // Bottom-left corner
    doc.line(40, pageHeight - 40, 80, pageHeight - 40);
    doc.line(40, pageHeight - 40, 40, pageHeight - 80);
    
    // Bottom-right corner
    doc.line(pageWidth - 40, pageHeight - 40, pageWidth - 80, pageHeight - 40);
    doc.line(pageWidth - 40, pageHeight - 40, pageWidth - 40, pageHeight - 80);

    // Process each wallpaper
    for (let i = 0; i < likedWallpapers.length; i++) {
      const wp = likedWallpapers[i];
      doc.addPage();
      
      // Set white background for content pages
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      
      // Add decorative border to content pages
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(1);
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

      try {
        // Add luxury watermark directly to the image
        const watermarkedImage = await addLuxuryWatermarkToImage(wp.imageUrl);
        const img = new Image();
        img.src = watermarkedImage;
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            const imgRatio = img.width / img.height;
            const pageRatio = contentWidth / contentHeight;
            let drawWidth, drawHeight;
            
            if (imgRatio > pageRatio) {
              drawWidth = contentWidth;
              drawHeight = contentWidth / imgRatio;
            } else {
              drawHeight = contentHeight;
              drawWidth = contentHeight * imgRatio;
            }
            
            const x = margin + (contentWidth - drawWidth) / 2;
            const y = margin + (contentHeight - drawHeight) / 2;
            
            // Add the watermarked image (watermark is already embedded in the image)
            doc.addImage(img, "JPEG", x, y, drawWidth, drawHeight);
            
            // Add decorative information box below image
            doc.setFillColor(250, 250, 250);
            doc.roundedRect(margin, y + drawHeight + 15, contentWidth, 80, 5, 5, 'F');
            
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(1);
            doc.roundedRect(margin, y + drawHeight + 15, contentWidth, 80, 5, 5);
            
            // Add wallpaper details in the info box
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text(wp.name || "Untitled", pageWidth / 2, y + drawHeight + 45, { align: "center" });
            
            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            doc.text(`Product Code: ${wp.productCode || "N/A"}`, pageWidth / 2, y + drawHeight + 70, { align: "center" });
            
            // Add page footer with luxury styling
            doc.setFillColor(245, 245, 245);
            doc.rect(0, pageHeight - 50, pageWidth, 50, 'F');
            
            // Add decorative top border to footer
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(1);
            doc.line(0, pageHeight - 50, pageWidth, pageHeight - 50);
            
            // Add customer name at bottom left
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`Customer: ${customerName}`, margin, pageHeight - 30);
            
            // Add timestamp at bottom right
            doc.text(timestamp, pageWidth - margin, pageHeight - 30, { align: "right" });
            
            // Add page number in center
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.text(`Page ${i + 2} of ${likedWallpapers.length + 1}`, pageWidth / 2, pageHeight - 15, { align: "center" });
            
            // Add brand footer
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(9);
            doc.text("Ellendorf Luxury Wallpaper Collection", pageWidth / 2, pageHeight - 5, { align: "center" });
            
            resolve();
          };
          img.onerror = reject;
        });
      } catch (err) {
        console.error("Error loading or watermarking image:", err);
        
        // Fallback: Show error message with styling
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(20);
        doc.setFont("helvetica", "italic");
        doc.text("Image unavailable", pageWidth / 2, pageHeight / 2 - 20, { align: "center" });
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "normal");
        doc.text(wp.name || "Untitled", pageWidth / 2, pageHeight / 2 + 10, { align: "center" });
        doc.text(`Code: ${wp.productCode || "N/A"}`, pageWidth / 2, pageHeight / 2 + 35, { align: "center" });
        
        // Still add footer for consistency
        doc.setFillColor(245, 245, 245);
        doc.rect(0, pageHeight - 50, pageWidth, 50, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(1);
        doc.line(0, pageHeight - 50, pageWidth, pageHeight - 50);
        
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Customer: ${customerName}`, margin, pageHeight - 30);
        doc.text(timestamp, pageWidth - margin, pageHeight - 30, { align: "right" });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(`Page ${i + 2} of ${likedWallpapers.length + 1}`, pageWidth / 2, pageHeight - 15, { align: "center" });
        
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(9);
        doc.text("Ellendorf Luxury Wallpaper Collection", pageWidth / 2, pageHeight - 5, { align: "center" });
      }
    }
    
    setIsGeneratingPDF(false);
    doc.save(`Ellendorf_Luxury_Wallpaper_${customerName.replace(/\s+/g, '_')}_${formattedDate}.pdf`);
  };

  const handleDownloadPDF = () => {
    setShowCustomerDialog(true);
  };

  const handleConfirmCustomerName = (customerName) => {
    setShowCustomerDialog(false);
    downloadAllAsPDF(customerName);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="w-16 h-16 border-4 border-zinc-700 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <div className="text-2xl text-zinc-400">Loading wallpapers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Lightbox for full-size wallpaper view */}
      <Lightbox
        wallpaper={selectedWallpaper}
        isOpen={!!selectedWallpaper}
        onClose={() => setSelectedWallpaper(null)}
        onLike={toggleLike}
        isLiked={selectedWallpaper ? likedWallpapers.some(w => w.id === selectedWallpaper.id) : false}
        id={id}
      />

      {/* Customer Name Dialog */}
      <CustomerNameDialog
        isOpen={showCustomerDialog}
        onClose={() => setShowCustomerDialog(false)}
        onConfirm={handleConfirmCustomerName}
      />

      <header className="sticky top-0 bg-black/95 backdrop-blur-2xl z-50 border-b border-zinc-800 px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center w-full md:w-auto">
          <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft className="mr-2 w-5 h-5 md:w-6 md:h-6" /> Back
          </Button>
          <h1 className="text-lg font-semibold">Ellendorf Wallpaper</h1>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
            <Input
              placeholder="Search by name, collection, or product code..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 md:pl-12 w-full h-9 md:h-10 bg-zinc-900/80 border-zinc-700 rounded-xl text-sm md:text-base"
            />
          </div>
          
          <div className="flex gap-2 md:gap-4 w-full md:w-auto">
            <Button
              onClick={clearAllLiked}
              disabled={likedWallpapers.length === 0}
              variant="outline"
              className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-blue-800 text-sm md:text-lg px-4 md:px-8 py-2 md:py-4 rounded-xl"
            >
              Clear Shortlisted
            </Button>
            <Button
              onClick={() => setShowLikedModal(true)}
              disabled={likedWallpapers.length === 0}
              className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-blue-800 text-sm md:text-lg px-4 md:px-8 py-2 md:py-4 rounded-xl"
            >
              Shortlisted ({likedWallpapers.length})
            </Button>
          </div>
        </div>
      </header>

      <section className="relative min-h-[60vh] md:min-h-[70vh] bg-gradient-to-br from-black via-zinc-900 to-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/50 to-black"></div>
        </div>
        <div className="absolute top-0 left-0 w-32 h-32 md:w-64 md:h-64 border-t border-l border-amber-500/20"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 md:w-64 md:h-64 border-b border-r border-blue-500/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-96 md:h-96 rounded-full border border-white/5"></div>
        
        <div className="relative z-10 container mx-auto px-4 md:px-8 pt-8 md:pt-16 pb-6 md:pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.6)]" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-100 to-blue-300 text-xs md:text-sm font-medium tracking-[0.25em] md:tracking-[0.35em] uppercase drop-shadow-[0_1px_6px_rgba(147,197,253,0.4)]">
                Premium Collection
              </span>
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.6)]" />
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-center mb-4 tracking-tight">
              <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-blue-900 via-blue-400 to-blue-900 bg-[length:200%_200%] animate-[shine_6s_linear_infinite] drop-shadow-[0_1px_8px_rgba(59,130,246,0.4)]">
                Ellendorf
              </span>
              <br />
              <span className="text-xl md:text-3xl lg:text-4xl font-light text-zinc-300">Wallpaper Collections</span>
            </h1>
            
            <p className="text-sm md:text-lg lg:text-xl text-zinc-400 text-center max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed">
              Experience unparalleled luxury with our curated selection of premium wallpapers.
              Each design tells a story of craftsmanship and elegance.
            </p>
          </div>
        </div>
      </section>

      <main id="collections" className="py-4 md:py-8 px-4 md:px-8 bg-black">
        <div className="container mx-auto">
          <h2 className="text-xl md:text-2xl font-light text-center text-zinc-300 mb-6 md:mb-8">
            {searchTerm ? `Results for "${searchTerm}"` : "All Wallpaper Collections"}
            {highlightedProductCode && (
              <span className="block text-sm md:text-base text-blue-400 mt-2">
                Highlighting product code: {highlightedProductCode}
              </span>
            )}
          </h2>
          
          {searchTerm ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {filteredWallpapers.slice(0, 48).map((wp, index) => (
                <WallpaperCard 
                  key={wp.id} 
                  wp={wp} 
                  index={index}
                  onClick={handleCardClick}
                  onLike={toggleLike}
                  isLiked={likedWallpapers.some(w => w.id === wp.id)}
                  isHighlighted={wp.productCode === highlightedProductCode}
                  id={id}
                />
              ))}
            </div>
          ) : (
            <div>
              {categories.map((category) => (
                <CategorySection 
                  key={category}
                  category={category}
                  wallpapers={filteredWallpapers}
                  pageByCategory={pageByCategory}
                  setPageByCategory={setPageByCategory}
                  onCardClick={handleCardClick}
                  onLike={toggleLike}
                  likedWallpapers={likedWallpapers}
                  highlightedProductCode={highlightedProductCode}
                  id={id}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Liked Wallpapers Modal - Compact View */}
      <AnimatePresence>
        {showLikedModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50"
              onClick={() => setShowLikedModal(false)}
            />
            
            <div className="fixed inset-0 z-50 flex flex-col">
              <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-xl z-10 border-b border-zinc-800 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => setShowLikedModal(false)} 
                    className="bg-white/10 hover:bg-white/20 rounded-full p-2"
                    size="icon"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  
                  <div>
                    <h2 className="text-lg md:text-xl font-light">Shortlisted Wallpapers</h2>
                    <p className="text-sm text-zinc-400">{likedWallpapers.length} items selected</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="flex gap-2">
                    <Button 
                      onClick={clearAllLiked}
                      disabled={likedWallpapers.length === 0}
                      variant="outline"
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
                    >
                      Clear All
                    </Button>
                    <Button 
                      onClick={handleDownloadPDF} 
                      disabled={isGeneratingPDF || likedWallpapers.length === 0}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3 mr-2" /> Download PDF
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => { setShowLikedModal(false); setShowTemplateChoice(true); }} 
                    disabled={likedWallpapers.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 px-4 py-2 rounded-lg text-sm"
                  >
                    Generate Templates
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {likedWallpapers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Heart className="w-16 h-16 text-zinc-700 mb-4" />
                    <h3 className="text-xl text-zinc-400 mb-2">No Shortlisted Wallpapers</h3>
                    <p className="text-zinc-500">Click the heart icon on wallpapers to add them here.</p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4"
                  >
                    {likedWallpapers.map((wp, index) => (
                      <CompactWallpaperCard
                        key={`${wp.id}-${index}`}
                        wp={wp}
                        index={index}
                        onClick={handleCardClick}
                        onRemove={removeFromLiked}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Template Choice Modal */}
      <AnimatePresence>
        {showTemplateChoice && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-xl md:rounded-2xl p-6 md:p-8 lg:p-12 shadow-2xl border border-zinc-700 max-w-4xl w-full">
              <Button onClick={() => setShowTemplateChoice(false)} className="absolute top-3 right-3 md:top-4 md:right-4 bg-white/20 rounded-full p-2 md:p-3">
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-center mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-blue-200">
                Choose Template Type
              </h2>
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center">
                <Button 
                  onClick={() => router.push("/templateview")} 
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-base md:text-lg lg:text-xl px-6 py-4 md:px-10 md:py-6 rounded-xl md:rounded-2xl shadow-xl shadow-blue-900/30"
                >
                  2D Template
                  <span className="block text-xs md:text-sm opacity-80 mt-1">Liked: {likedWallpapers.length}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-6 px-4 border-t border-zinc-800 text-center text-zinc-500 text-sm">
        <p>Ellendorf Luxury Wallpaper Collection | Powered by Reimagine AI</p>
        <p className="mt-1">© {new Date().getFullYear()} All rights reserved</p>
      </footer>
    </div>
  );
}