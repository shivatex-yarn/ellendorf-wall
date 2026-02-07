"use client";

import React, { useState, useEffect, useMemo, useCallback, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  Calendar,
  User,
  FileText,
  CheckCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
// Import shared image loading utilities with retry logic
import { imageCache, preloadImage, preloadImagesBatch } from '../../lib/imageLoader.js';
import Image from "next/image";

// Customer Name Dialog Component - Enhanced Luxury Version
const CustomerNameDialog = ({ isOpen, onClose, onConfirm, isGeneratingPDF }) => {
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
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-gradient-to-br from-zinc-900 via-black to-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-700/50 max-w-md w-full mx-4"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-amber-500/20 rounded-tl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-blue-500/20 rounded-br-2xl"></div>
        
        <Button 
          onClick={() => {
            setCustomerName("");
            onClose();
          }} 
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-200"
          disabled={isGeneratingPDF}
        >
          <X className="w-5 h-5" />
        </Button>
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500/20 to-blue-500/20 rounded-full mb-4">
            <FileText className="w-8 h-8 text-amber-400" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-blue-200">
            Generate Luxury Brochure
          </h2>
          
          <p className="text-sm text-zinc-400">
            Enter customer details to create a personalized PDF brochure
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer full name"
              className="w-full h-12 bg-zinc-900/50 border-zinc-600 text-base rounded-lg focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
              required
              autoFocus
              disabled={isGeneratingPDF}
            />
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Timestamp and download time will be included automatically
            </p>
          </div>
          
          {/* Features list */}
          <div className="bg-zinc-900/30 rounded-lg p-4 border border-zinc-700/30">
            <h4 className="text-sm font-medium text-zinc-300 mb-3">Brochure Includes:</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                Luxury cover page with customer details
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                High-quality images with watermarks
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                Product codes and descriptions
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                Automatic timestamp (12-hour format)
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                Page numbers and professional footer
              </li>
            </ul>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={() => {
                setCustomerName("");
                onClose();
              }}
              className="bg-zinc-800 hover:bg-zinc-700 px-6 py-2 rounded-lg text-sm transition-all duration-200"
              disabled={isGeneratingPDF}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!customerName.trim() || isGeneratingPDF}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-6 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-900/30"
            >
              {isGeneratingPDF ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Generate PDF
                </span>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Helper: get initial image state from cache
const getInitialImageState = (imageUrl) => {
  if (!imageUrl) return { src: "", isLoading: false, isError: true };
  const cached = imageCache.get(imageUrl);
  if (cached === null) {
    return { src: "", isLoading: false, isError: true };
  }
  if (cached && cached !== null && !(cached instanceof Promise)) {
    return { src: cached, isLoading: false, isError: false };
  }
  return { src: "", isLoading: true, isError: false };
};

// WallpaperCard Component
const WallpaperCard = React.memo(({ wp, index, onClick, onLike, isLiked, isHighlighted, id, compact = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageState, setImageState] = useState(() => getInitialImageState(wp?.imageUrl));
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const mountedRef = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async (priority = false) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (!wp.imageUrl) {
        if (isMounted) {
          setImageState({
            src: "",
            isLoading: false,
            isError: true
          });
        }
        return;
      }

      const cachedValue = imageCache.get(wp.imageUrl);
      if (cachedValue && cachedValue !== null && !(cachedValue instanceof Promise)) {
        if (isMounted) {
          setImageState({
            src: cachedValue,
            isLoading: false,
            isError: false
          });
        }
        return;
      }

      const loadingPromise = imageCache.getLoadingPromise(wp.imageUrl);
      if (loadingPromise) {
        if (isMounted) {
          setImageState(prev => ({ ...prev, isLoading: true, isError: false }));
        }

        timeoutRef.current = setTimeout(() => {
          if (isMounted) {
            setImageState({
              src: "",
              isLoading: false,
              isError: true
            });
          }
        }, 10000);

        try {
          const loadedUrl = await loadingPromise;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (isMounted) {
            setImageState({
              src: loadedUrl,
              isLoading: false,
              isError: false
            });
          }
        } catch (error) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (isMounted) {
            setImageState({
              src: "",
              isLoading: false,
              isError: true
            });
          }
        }
        return;
      }

      if (isMounted) {
        setImageState(prev => ({ ...prev, isLoading: true, isError: false }));
      }

      timeoutRef.current = setTimeout(() => {
        if (isMounted) {
          setImageState({
            src: "",
            isLoading: false,
            isError: true
          });
        }
      }, 10000);

      try {
        const loadedUrl = await preloadImage(wp.imageUrl, priority || index < 12);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (isMounted) {
          setImageState({
            src: loadedUrl,
            isLoading: false,
            isError: false
          });
        }
      } catch (error) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (isMounted) {
          setImageState({
            src: "",
            isLoading: false,
            isError: true
          });
        }
      }
    };

    if (index < 12) {
      loadImage(true);
    } else {
      if (typeof IntersectionObserver !== 'undefined' && imgRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && isMounted) {
                loadImage(false);
                if (observerRef.current && imgRef.current) {
                  observerRef.current.unobserve(imgRef.current);
                }
              }
            });
          },
          {
            rootMargin: '50px',
            threshold: 0.01
          }
        );
        
        observerRef.current.observe(imgRef.current);
      } else {
        loadImage(false);
      }
    }

    return () => {
      isMounted = false;
      mountedRef.current = false;
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [wp.imageUrl, index]);

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
          ? 'border-amber-500 ring-4 ring-amber-500/20 scale-105 z-10' 
          : 'border-zinc-800'
      } ${compact ? 'rounded-lg' : 'rounded-2xl'}`}
      onClick={handleClick}
    >
      {imageState.isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center overflow-hidden ${compact ? 'rounded-lg' : 'rounded-2xl'}`}>
          <Skeleton className={`absolute inset-0 ${compact ? 'rounded-lg' : 'rounded-2xl'} bg-zinc-800`} />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-amber-500 rounded-full animate-spin"></div>
            <span className="text-zinc-400 text-xs">Loading...</span>
          </div>
        </div>
      )}
      
      {imageState.isError && (
        <div className={`absolute inset-0 flex items-center justify-center overflow-hidden ${compact ? 'rounded-lg' : 'rounded-2xl'}`}>
          <Skeleton className={`absolute inset-0 ${compact ? 'rounded-lg' : 'rounded-2xl'} bg-zinc-800`} />
        </div>
      )}

      <motion.div 
        ref={imgRef}
        layoutId={compact ? undefined : `image-${wp.id}-${id}`} 
        className="w-full h-full"
      >
        {imageState.src && !imageState.isLoading && !imageState.isError && (
          <motion.img
            src={imageState.src}
            alt={wp.name}
            loading={index < 12 ? "eager" : "lazy"}
            decoding="async"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              compact ? 'rounded-lg' : 'rounded-2xl'
            }`}
            onError={() => {
              if (mountedRef.current) {
                setImageState({
                  src: "",
                  isLoading: false,
                  isError: true
                });
              }
            }}
          />
        )}
      </motion.div>

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
        
        {/* Like button overlay */}
        <Button
          onClick={handleLikeClick}
          size="icon"
          className={`absolute top-3 right-3 bg-black/70 hover:bg-black/90 rounded-full p-2 transition-all duration-200 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${
              isLiked ? "fill-red-500 text-red-500" : "text-white"
            }`}
          />
        </Button>
      </div>
    </motion.div>
  );
});

WallpaperCard.displayName = 'WallpaperCard';

// Compact Wallpaper Card for Liked Modal
const CompactWallpaperCard = React.memo(({ wp, index, onClick, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageState, setImageState] = useState(() => {
    const s = getInitialImageState(wp?.imageUrl);
    return { src: s.src, isLoading: s.isLoading, isError: s.isError || false };
  });
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const mountedRef = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async (priority = false) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (!wp.imageUrl) {
        if (isMounted) {
          setImageState({ 
            src: "", 
            isLoading: false, 
            isError: true 
          });
        }
        return;
      }
      const cachedValue = imageCache.get(wp.imageUrl);
      if (cachedValue && cachedValue !== null && !(cachedValue instanceof Promise)) {
        if (isMounted) {
          setImageState({
            src: cachedValue,
            isLoading: false,
            isError: false
          });
        }
        return;
      }

      const loadingPromise = imageCache.getLoadingPromise(wp.imageUrl);
      if (loadingPromise) {
        if (isMounted) {
          setImageState(prev => ({ ...prev, isLoading: true, isError: false }));
        }

        timeoutRef.current = setTimeout(() => {
          if (isMounted) {
            setImageState({ 
              src: "", 
              isLoading: false, 
              isError: true 
            });
          }
        }, 10000);

        try {
          const loadedUrl = await loadingPromise;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (isMounted) {
            setImageState({
              src: loadedUrl,
              isLoading: false,
              isError: false
            });
          }
        } catch (error) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (isMounted) {
            setImageState({ 
              src: "", 
              isLoading: false, 
              isError: true 
            });
          }
        }
        return;
      }

      if (isMounted) {
        setImageState(prev => ({ ...prev, isLoading: true, isError: false }));
      }

      timeoutRef.current = setTimeout(() => {
        if (isMounted) {
          setImageState({ 
            src: "", 
            isLoading: false, 
            isError: true 
          });
        }
      }, 10000);

      try {
        const loadedUrl = await preloadImage(wp.imageUrl, priority || index < 20);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (isMounted) {
          setImageState({ 
            src: loadedUrl, 
            isLoading: false, 
            isError: false 
          });
        }
      } catch (error) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (isMounted) {
          setImageState({ 
            src: "", 
            isLoading: false, 
            isError: true 
          });
        }
      }
    };

    if (index < 20) {
      loadImage(true);
    } else {
      if (typeof IntersectionObserver !== 'undefined' && imgRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && isMounted) {
                loadImage(false);
                if (observerRef.current && imgRef.current) {
                  observerRef.current.unobserve(imgRef.current);
                }
              }
            });
          },
          {
            rootMargin: '50px',
            threshold: 0.01
          }
        );
        
        observerRef.current.observe(imgRef.current);
      } else {
        loadImage(false);
      }
    }

    return () => {
      isMounted = false;
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [wp.imageUrl, index]);

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
      <div 
        ref={imgRef}
        className="relative aspect-[4/3] overflow-hidden"
        onClick={handleClick}
      >
        {imageState.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <Skeleton className="absolute inset-0 rounded-lg bg-zinc-800" />
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div className="w-4 h-4 border-2 border-zinc-600 border-t-amber-500 rounded-full animate-spin"></div>
              <span className="text-zinc-400 text-[10px]">Loading...</span>
            </div>
          </div>
        )}

        {imageState.isError && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
            <Skeleton className="absolute inset-0 rounded-lg bg-zinc-800" />
          </div>
        )}
        
        {imageState.src && !imageState.isLoading && !imageState.isError && (
          <motion.img
            src={imageState.src}
            alt={wp.name}
            loading={index < 20 ? "eager" : "lazy"}
            decoding="async"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => {
              if (mountedRef.current) {
                setImageState({ 
                  src: "", 
                  isLoading: false, 
                  isError: true 
                });
              }
            }}
          />
        )}

        <Button
          onClick={handleRemove}
          size="icon"
          className={`absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 rounded-full p-1 transition-all duration-200 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <Trash2 className="w-3 h-3 text-white" />
        </Button>

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

// FIXED: Category Section Component
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
  const [isChangingPage, setIsChangingPage] = useState(false);
  
  const itemsPerPage = 6;
  
  const categoryItems = useMemo(() => 
    wallpapers.filter((w) => w.subCategory?.name === category),
    [wallpapers, category]
  );
  
  const totalPages = Math.ceil(categoryItems.length / itemsPerPage);
  const currentPage = pageByCategory[category] || 0;
  const start = currentPage * itemsPerPage;
  const visibleItems = useMemo(() => 
    categoryItems.slice(start, start + itemsPerPage),
    [categoryItems, start]
  );

  useEffect(() => {
    if (!categoryItems.length) return;
    
    const preloadCategoryImages = async () => {
      const visibleUrls = visibleItems
        .filter(wp => wp.imageUrl)
        .map(wp => wp.imageUrl);
      
      if (visibleUrls.length > 0) {
        preloadImagesBatch(visibleUrls, 12, true);
      }
      
      const nextPageStart = Math.min(start + itemsPerPage, categoryItems.length);
      const prevPageStart = Math.max(0, start - itemsPerPage);
      
      const adjacentUrls = [
        ...categoryItems.slice(nextPageStart, nextPageStart + itemsPerPage)
          .filter(wp => wp.imageUrl).map(wp => wp.imageUrl),
        ...categoryItems.slice(prevPageStart, prevPageStart + itemsPerPage)
          .filter(wp => wp.imageUrl).map(wp => wp.imageUrl)
      ];
      
      if (adjacentUrls.length > 0) {
        preloadImagesBatch(adjacentUrls, 10, true);
      }
    };
    
    preloadCategoryImages();
  }, [categoryItems, start, visibleItems, itemsPerPage]);

  const containsHighlightedProduct = useMemo(() => {
    return visibleItems.some(wp => wp.productCode === highlightedProductCode);
  }, [visibleItems, highlightedProductCode]);

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

  const handlePageChange = useCallback(async (direction) => {
    let newPage = currentPage;
    if (direction === 'prev' && currentPage > 0) {
      newPage = currentPage - 1;
    } else if (direction === 'next' && currentPage < totalPages - 1) {
      newPage = currentPage + 1;
    } else {
      return;
    }
    
    setIsChangingPage(true);
    
    const newPageStart = newPage * itemsPerPage;
    const newPageItems = categoryItems.slice(newPageStart, newPageStart + itemsPerPage);
    const newPageUrls = newPageItems
      .filter(wp => wp.imageUrl)
      .map(wp => wp.imageUrl);
    
    try {
      await Promise.race([
        preloadImagesBatch(newPageUrls, 12, true),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]);
    } catch (err) {
      console.warn('Some images took longer than 2s to preload');
    }
    
    setPageByCategory(prev => ({ ...prev, [category]: newPage }));
    
    setTimeout(() => {
      setIsChangingPage(false);
    }, 100);
  }, [category, currentPage, totalPages, setPageByCategory, categoryItems, itemsPerPage]);

  return (
    <section key={category} className="mb-6" ref={sectionRef}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-medium text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          {category}
        </h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              disabled={currentPage === 0 || isChangingPage}
              onClick={() => handlePageChange('prev')}
              className="bg-zinc-900/70 hover:bg-zinc-800 rounded-full p-2 transition-all duration-200 disabled:opacity-30"
            >
              {isChangingPage ? (
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
            <span className="text-xs text-zinc-400 min-w-[60px] text-center">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              size="icon"
              disabled={currentPage === totalPages - 1 || isChangingPage}
              onClick={() => handlePageChange('next')}
              className="bg-zinc-900/70 hover:bg-zinc-800 rounded-full p-2 transition-all duration-200 disabled:opacity-30"
            >
              {isChangingPage ? (
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </div>
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 transition-opacity duration-300 ${isChangingPage ? 'opacity-70' : 'opacity-100'}`}>
        {visibleItems.map((wp, idx) => {
          const globalIndex = start + idx;
          return (
            <WallpaperCard 
              key={wp.id} 
              wp={wp} 
              index={globalIndex}
              onClick={onCardClick}
              onLike={onLike}
              isLiked={likedWallpapers.some(w => w.id === wp.id)}
              isHighlighted={wp.productCode === highlightedProductCode}
              id={id}
            />
          );
        })}
      </div>
    </section>
  );
});

CategorySection.displayName = 'CategorySection';

// Lightbox Component
const Lightbox = ({ wallpaper, isOpen, onClose, onLike, isLiked, id }) => {
  const [imageState, setImageState] = useState({ src: "", isLoading: false, isError: false });
  const mountedRef = useRef(true);
  const timeoutRef = useRef(null);

  const imageUrl = wallpaper?.imageUrl || "";

  useEffect(() => {
    mountedRef.current = true;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!imageUrl || !isOpen) {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          setImageState({ src: "", isLoading: false, isError: false });
        }
      }, 0);
      return () => {
        clearTimeout(timer);
        mountedRef.current = false;
      };
    }

    const animationFrame = requestAnimationFrame(() => {
      if (mountedRef.current) {
        setImageState({ src: imageUrl, isLoading: true, isError: false });
      }
    });

    const applySuccess = (src) => {
      if (mountedRef.current) {
        setImageState({ src: src || imageUrl, isLoading: false, isError: false });
      }
    };

    const applyError = () => {
      if (mountedRef.current) {
        setImageState({ src: imageUrl, isLoading: false, isError: true });
      }
    };

    const cached = imageCache.get(imageUrl);
    if (cached && cached !== null && !(cached instanceof Promise)) {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          applySuccess(cached);
        }
      }, 0);
      return () => {
        cancelAnimationFrame(animationFrame);
        clearTimeout(timer);
        mountedRef.current = false;
      };
    }

    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        applyError();
      }
    }, 15000);

    const loadImage = async () => {
      try {
        const cachedUrl = await preloadImage(imageUrl, true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (mountedRef.current) {
          applySuccess(cachedUrl);
        }
      } catch (err) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (mountedRef.current) {
          applyError();
        }
      }
    };

    const loadTimer = setTimeout(() => {
      loadImage();
    }, 0);

    return () => {
      cancelAnimationFrame(animationFrame);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      clearTimeout(loadTimer);
      mountedRef.current = false;
    };
  }, [imageUrl, isOpen]);

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

              <div className="relative w-full h-full flex items-center justify-center p-4">
                <motion.div 
                  layoutId={`image-${wallpaper.id}-${id}`}
                  className="w-full h-full flex items-center justify-center"
                >
                  {imageState.isLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden z-10 pointer-events-none"
                    >
                      <Skeleton className="absolute inset-0 rounded-lg bg-zinc-800" />
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-zinc-600 border-t-amber-500 rounded-full animate-spin"></div>
                        <span className="text-zinc-400 text-sm">Loading image...</span>
                      </div>
                    </motion.div>
                  )}

                  {imageState.isError && !imageState.src && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden"
                    >
                      <Skeleton className="absolute inset-0 rounded-lg bg-zinc-800" />
                    </motion.div>
                  )}

                  {wallpaper.imageUrl && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full h-full max-w-full max-h-[70vh] flex items-center justify-center"
                    >
                      <img
                        src={imageState.src || wallpaper.imageUrl}
                        alt={wallpaper.name}
                        loading="eager"
                        decoding="async"
                        className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg"
                        onLoad={() => {
                          if (mountedRef.current) {
                            setImageState((prev) => ({ ...prev, isLoading: false, isError: false }));
                          }
                        }}
                        onError={() => {
                          if (mountedRef.current) {
                            setImageState((prev) => ({
                              ...prev,
                              src: prev.src || wallpaper.imageUrl,
                              isLoading: false,
                              isError: true
                            }));
                          }
                        }}
                      />
                    </motion.div>
                  )}
                </motion.div>
                
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
                        className="text-lg text-amber-300 mb-1"
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

// FIXED PDF GENERATION FUNCTION
const generateLuxuryPDF = async (customerName, likedWallpapers, setIsGeneratingPDF) => {
  if (!customerName || !customerName.trim()) {
    alert("Please enter a customer name");
    return;
  }

  if (!likedWallpapers || likedWallpapers.length === 0) {
    alert("Please select at least one wallpaper to download");
    setIsGeneratingPDF(false);
    return;
  }

  setIsGeneratingPDF(true);

  try {
    console.log(`Starting PDF generation for ${customerName} with ${likedWallpapers.length} items`);
    
    // Initialize jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Get current timestamp in 12-hour format
    const currentDate = new Date();
    const timestamp = currentDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const formattedDate = currentDate.toISOString().split('T')[0];
    
    // 1. CREATE LUXURY COVER PAGE
    console.log("Creating luxury cover page...");
    
    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    
    // Decorative gold corner accents
    doc.setDrawColor(218, 165, 32); // Gold color
    doc.setLineWidth(0.5);
    
    // Top-left corner
    doc.line(15, 15, 30, 15);
    doc.line(15, 15, 15, 30);
    
    // Top-right corner
    doc.line(pageWidth - 15, 15, pageWidth - 30, 15);
    doc.line(pageWidth - 15, 15, pageWidth - 15, 30);
    
    // Bottom-left corner
    doc.line(15, pageHeight - 15, 30, pageHeight - 15);
    doc.line(15, pageHeight - 15, 15, pageHeight - 30);
    
    // Bottom-right corner
    doc.line(pageWidth - 15, pageHeight - 15, pageWidth - 30, pageHeight - 15);
    doc.line(pageWidth - 15, pageHeight - 15, pageWidth - 15, pageHeight - 30);
    
    // Main title
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    doc.text("ELLENDORF", pageWidth / 2, 60, { align: "center" });
    
    // Decorative line
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 40, 65, pageWidth / 2 + 40, 65);
    
    // Subtitle
    doc.setFontSize(18);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80, 80, 80);
    doc.text("Premium Textile Wall Coverings", pageWidth / 2, 75, { align: "center" });
    
    // Client info box
    const boxY = 100;
    const boxHeight = 45;
    const boxWidth = pageWidth - 60;
    
    doc.setFillColor(250, 250, 250);
    doc.roundedRect((pageWidth - boxWidth) / 2, boxY, boxWidth, boxHeight, 3, 3, 'F');
    
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect((pageWidth - boxWidth) / 2, boxY, boxWidth, boxHeight, 3, 3);
    
    // Client name
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(`Client: ${customerName}`, pageWidth / 2, boxY + 15, { align: "center" });
    
    // Timestamp in 12-hour format
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${timestamp}`, pageWidth / 2, boxY + 25, { align: "center" });
    
    // Total selections
    doc.text(`Total Selections: ${likedWallpapers.length}`, pageWidth / 2, boxY + 35, { align: "center" });
    
    // Decorative line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(30, boxY + boxHeight + 20, pageWidth - 30, boxY + boxHeight + 20);
    doc.setLineDashPattern([], 0);
    
    // Thank you message
    doc.setFontSize(14);
    doc.setFont("times", "italic");
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for choosing", pageWidth / 2, boxY + boxHeight + 40, { align: "center" });
    
    doc.setFontSize(20);
    doc.setFont("times", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Ellendorf Luxury Collection", pageWidth / 2, boxY + boxHeight + 50, { align: "center" });
    
    // Page number
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text(`Page 1 of ${likedWallpapers.length + 1}`, pageWidth / 2, pageHeight - 15, { align: "center" });
    
    // 2. PROCESS EACH WALLPAPER
    console.log(`Processing ${likedWallpapers.length} wallpapers...`);
    
    for (let i = 0; i < likedWallpapers.length; i++) {
      const wp = likedWallpapers[i];
      console.log(`Processing ${i + 1}/${likedWallpapers.length}: ${wp.name}`);
      
      // Add new page
      if (i > 0) {
        doc.addPage();
      }
      
      try {
        // Set background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        
        // Decorative top border
        doc.setDrawColor(240, 240, 240);
        doc.setLineWidth(0.3);
        doc.line(20, 15, pageWidth - 20, 15);
        
        // Wallpaper name
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        
        const displayName = wp.name && wp.name.length > 40 
          ? wp.name.substring(0, 37) + "..." 
          : wp.name || "Untitled";
        
        doc.text(displayName, pageWidth / 2, 28, { align: "center" });
        
        // Product code
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(`Product Code: ${wp.productCode || "N/A"}`, pageWidth / 2, 36, { align: "center" });
        
        // Collection
        if (wp.subCategory?.name) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(120, 120, 120);
          doc.text(`Collection: ${wp.subCategory.name}`, pageWidth / 2, 42, { align: "center" });
        }
        
        // Try to add image
        if (wp.imageUrl && wp.imageUrl !== "/placeholder.jpg") {
          try {
            console.log(`Loading image for PDF: ${wp.imageUrl.substring(0, 50)}...`);
            
            // Load image with timeout
            const imagePromise = new Promise((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              
              const timeout = setTimeout(() => {
                reject(new Error("Image load timeout"));
              }, 15000);
              
              img.onload = () => {
                clearTimeout(timeout);
                resolve(img);
              };
              
              img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error("Failed to load image"));
              };
              
              img.src = wp.imageUrl;
            });
            
            const img = await Promise.race([
              imagePromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 20000))
            ]);
            
            // Calculate dimensions for PDF (in mm)
            const maxWidth = pageWidth - 40; // 20mm margins
            const maxHeight = pageHeight - 80; // Space for text and footer
            
            // Get image dimensions
            const imgWidth = img.naturalWidth || img.width || 800;
            const imgHeight = img.naturalHeight || img.height || 600;
            
            // Calculate aspect ratio
            const aspectRatio = imgWidth / imgHeight;
            
            // Calculate target dimensions
            let targetWidth = maxWidth;
            let targetHeight = maxWidth / aspectRatio;
            
            if (targetHeight > maxHeight) {
              targetHeight = maxHeight;
              targetWidth = maxHeight * aspectRatio;
            }
            
            // Center the image
            const x = (pageWidth - targetWidth) / 2;
            const y = 50; // Start below text
            
            // Create canvas for better quality
            const canvas = document.createElement('canvas');
            // Limit canvas size for performance but maintain quality
            const maxCanvasSize = 1200;
            let canvasWidth = imgWidth;
            let canvasHeight = imgHeight;
            
            if (canvasWidth > maxCanvasSize || canvasHeight > maxCanvasSize) {
              const scale = maxCanvasSize / Math.max(canvasWidth, canvasHeight);
              canvasWidth = Math.round(canvasWidth * scale);
              canvasHeight = Math.round(canvasHeight * scale);
            }
            
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            
            // Convert to data URL with good quality
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Add image to PDF - FIXED: Using correct variable names
            doc.addImage(imageData, 'JPEG', x, y, targetWidth, targetHeight);
            
            console.log(`✓ Image ${i + 1} added successfully`);
            
          } catch (imageError) {
            console.warn(`⚠ Failed to add image ${i + 1}:`, imageError.message);
            
            // Add placeholder
            doc.setFontSize(16);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(150, 150, 150);
            doc.text("Image Preview Not Available", pageWidth / 2, pageHeight / 2, { align: "center" });
            doc.text("Please view online for full preview", pageWidth / 2, pageHeight / 2 + 10, { align: "center" });
          }
        } else {
          // No image
          doc.setFontSize(16);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(150, 150, 150);
          doc.text("No Image Available", pageWidth / 2, pageHeight / 2, { align: "center" });
        }
        
        // Page footer
        const footerY = pageHeight - 20;
        
        // Client and timestamp
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`Client: ${customerName}`, 20, footerY);
        
        // Page number
        doc.text(`Page ${i + 2} of ${likedWallpapers.length + 1}`, pageWidth / 2, footerY, { align: "center" });
        
        // Current timestamp in footer
        doc.text(timestamp, pageWidth - 20, footerY, { align: "right" });
        
        // Brand footer
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text("ELLENDORF Textile Wall Coverings - Premium Collection", pageWidth / 2, footerY + 8, { align: "center" });
        
      } catch (pageError) {
        console.error(`❌ Error on page ${i + 1}:`, pageError);
        
        // Continue with next wallpaper
        if (i < likedWallpapers.length - 1) {
          doc.addPage();
          doc.setFontSize(14);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(200, 0, 0);
          doc.text(`Error: ${wp.name || wp.productCode}`, 20, 30);
          doc.text("Continuing with remaining items...", 20, 40);
        }
      }
    }
    
    // 3. SAVE THE PDF
    console.log("Saving PDF...");
    const fileName = `Ellendorf_${customerName.replace(/\s+/g, '_')}_${formattedDate}.pdf`;
    
    let pdfSaved = false;
    
    // Method 1: Direct save
    try {
      doc.save(fileName);
      pdfSaved = true;
      console.log("✓ PDF saved successfully");
    } catch (saveError) {
      console.warn("Method 1 failed:", saveError.message);
    }
    
    // Method 2: Blob download
    if (!pdfSaved) {
      try {
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        
        pdfSaved = true;
        console.log("✓ PDF saved via blob method");
      } catch (blobError) {
        console.warn("Method 2 failed:", blobError.message);
      }
    }
    
    if (pdfSaved) {
      // Show success message
      const successMessage = `Luxury PDF brochure has been generated!\n\n` +
        `• Customer: ${customerName}\n` +
        `• Generated: ${timestamp}\n` +
        `• Total Items: ${likedWallpapers.length}\n` +
        `• File: ${fileName}`;
      
      alert(successMessage);
      
      // Optional: Show toast
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.success(`PDF downloaded: ${fileName}`, { duration: 5000 });
      }
    } else {
      throw new Error("All PDF save methods failed");
    }
    
  } catch (error) {
    console.error("❌ PDF generation failed completely:", error);
    
    // Fallback: Simple text PDF
    try {
      alert("Creating simplified PDF...");
      
      const fallbackDoc = new jsPDF();
      fallbackDoc.text("ELLENDORF Textile Wall Coverings", 20, 20);
      fallbackDoc.text(`Client: ${customerName}`, 20, 30);
      fallbackDoc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
      fallbackDoc.text(`Total: ${likedWallpapers.length} items`, 20, 50);
      
      let y = 70;
      likedWallpapers.forEach((wp, index) => {
        if (y > 280) {
          fallbackDoc.addPage();
          y = 20;
        }
        
        fallbackDoc.text(`${index + 1}. ${wp.name || "Untitled"}`, 20, y);
        fallbackDoc.text(`   Code: ${wp.productCode || "N/A"}`, 25, y + 7);
        
        if (wp.subCategory?.name) {
          fallbackDoc.text(`   Collection: ${wp.subCategory.name}`, 25, y + 14);
        }
        
        y += 25;
      });
      
      fallbackDoc.save(`Ellendorf_Selection_${customerName.replace(/\s+/g, '_')}.pdf`);
      alert("Simplified PDF has been downloaded!");
      
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      alert("Failed to generate PDF. Please try with fewer images or contact support.");
    }
  } finally {
    setIsGeneratingPDF(false);
  }
};

// Main Component
export default function EllendorfWallpaperApp() {
  const router = useRouter();
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [showLikedModal, setShowLikedModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageByCategory, setPageByCategory] = useState({});
  const [likedWallpapers, setLikedWallpapers] = useState([]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [highlightedProductCode, setHighlightedProductCode] = useState("");
  const [error, setError] = useState(null);
  const id = useId();

  // Load liked wallpapers
  useEffect(() => {
    const stored = sessionStorage.getItem("likedWallpapers");
    if (stored) {
      try {
        setLikedWallpapers(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse liked wallpapers:", err);
        setLikedWallpapers([]);
      }
    }
  }, []);

  // Save liked wallpapers
  useEffect(() => {
    try {
      sessionStorage.setItem("likedWallpapers", JSON.stringify(likedWallpapers));
    } catch (err) {
      console.error("Failed to save liked wallpapers:", err);
    }
  }, [likedWallpapers]);

  // Handle escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedWallpaper(null);
        setShowLikedModal(false);
      }
    };
    
    if (selectedWallpaper || showLikedModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedWallpaper, showLikedModal]);

  // Toggle like function
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
    
    if (value.trim().toUpperCase() === value.trim() && value.trim().length >= 3) {
      setHighlightedProductCode(value.trim().toUpperCase());
    } else {
      setHighlightedProductCode("");
    }
  }, []);

  const clearAllLiked = () => {
    if (window.confirm("Are you sure you want to clear all shortlisted wall coverings?")) {
      setLikedWallpapers([]);
      try {
        sessionStorage.removeItem("likedWallpapers");
      } catch (err) {
        console.error("Failed to clear liked wallpapers:", err);
      }
    }
  };

  const removeFromLiked = useCallback((wp) => {
    setLikedWallpapers(prev => prev.filter(w => w.id !== wp.id));
  }, []);

  // Fetch wallpapers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4500';
        
        const response = await axios.get(`${baseUrl}/api/wallpaper`, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const wpData = response.data;
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
        
        // Preload first batch
        const firstBatch = activeWallpapers.slice(0, 12);
        const firstBatchUrls = firstBatch
          .filter(wp => wp.imageUrl)
          .map(wp => wp.imageUrl);
        
        if (firstBatchUrls.length > 0) {
          preloadImagesBatch(firstBatchUrls, 8, true);
        }
        
      } catch (err) {
        console.error("Failed to fetch wallpapers:", err);
        setError("Failed to load wallpaper data. Please check your connection.");
        setWallpapers([]);
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

  const handleDownloadPDF = () => {
    setShowCustomerDialog(true);
  };

  const handleConfirmCustomerName = async (customerName) => {
    setShowCustomerDialog(false);
    await generateLuxuryPDF(customerName, likedWallpapers, setIsGeneratingPDF);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-zinc-700 border-t-amber-500 rounded-full animate-spin mb-6"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-medium text-zinc-300 mb-2">Loading Luxury Collection</h2>
        <p className="text-sm text-zinc-500">Curating premium wall coverings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <X className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-medium text-red-400 mb-2">Connection Error</h2>
        <p className="text-sm text-zinc-400 mb-6 text-center max-w-md">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 px-6 py-3 rounded-lg"
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      {/* Lightbox */}
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
        isGeneratingPDF={isGeneratingPDF}
      />

      {/* Luxury Header */}
      <header className="sticky top-0 bg-black/80 backdrop-blur-xl z-50 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Left side: Brand and Back button */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button 
                variant="ghost" 
                onClick={() => router.push("/wallpaper")} 
                className="bg-zinc-900/50 hover:bg-zinc-800 rounded-lg px-4 py-2 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm">Back</span>
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-blue-200">
                    Ellendorf Textile Wall Coverings
                  </h1>
                  <p className="text-xs text-zinc-400">Premium Collection</p>
                </div>
              </div>
            </div>
            
            {/* Center: Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search by name, code, or collection..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 w-full h-10 bg-zinc-900/50 border-zinc-700 rounded-lg text-sm focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            
            {/* Right side: Action buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                onClick={clearAllLiked}
                disabled={likedWallpapers.length === 0}
                variant="outline"
                className="flex-1 md:flex-none bg-zinc-900/50 hover:bg-zinc-800 border-zinc-700 text-sm px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setShowLikedModal(true)}
                disabled={likedWallpapers.length === 0}
                className="flex-1 md:flex-none bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-amber-900/30 disabled:opacity-50"
              >
                <Heart className={`w-4 h-4 mr-2 ${likedWallpapers.length > 0 ? 'fill-white' : ''}`} />
                Shortlisted ({likedWallpapers.length})
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-blue-900/5"></div>
          <div className="absolute top-0 left-0 w-64 h-64 border-t border-l border-amber-500/10 rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 border-b border-r border-blue-500/10 rounded-br-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/10 to-blue-500/10 rounded-full px-6 py-3 mb-6 border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-blue-300">
                  Exclusive Premium Collection
                </span>
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-light mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-white to-blue-300">
                  Ellendorf
                </span>
                <br />
                <span className="text-2xl md:text-4xl font-light text-zinc-300 mt-4">
                  Textile Wall Coverings
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Experience unparalleled luxury with our curated selection of premium textile wall coverings. 
                Each design tells a unique story of craftsmanship, elegance, and timeless beauty.
              </p>
            </motion.div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
              <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                <div className="text-2xl font-bold text-amber-400">{wallpapers.length}</div>
                <div className="text-sm text-zinc-400">Total Designs</div>
              </div>
              <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                <div className="text-2xl font-bold text-blue-400">{categories.length}</div>
                <div className="text-sm text-zinc-400">Collections</div>
              </div>
              <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                <div className="text-2xl font-bold text-emerald-400">{likedWallpapers.length}</div>
                <div className="text-sm text-zinc-400">Shortlisted</div>
              </div>
              <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-zinc-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Collections */}
      <main id="collections" className="py-8 md:py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-light text-white mb-2">
                {searchTerm ? `Search Results for "${searchTerm}"` : "Browse Collections"}
              </h2>
              {highlightedProductCode && (
                <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-300 text-sm px-3 py-1 rounded-full border border-amber-500/20">
                  <Sparkles className="w-3 h-3" />
                  Highlighting: {highlightedProductCode}
                </div>
              )}
            </div>
            
            {!searchTerm && (
              <div className="text-sm text-zinc-400">
                Showing {wallpapers.length} premium designs across {categories.length} collections
              </div>
            )}
          </div>
          
          {wallpapers.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-zinc-800/50">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-xl text-zinc-300 mb-2">No wall coverings found</h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                Please check your data source or try adjusting your search criteria.
              </p>
            </div>
          ) : searchTerm ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredWallpapers.map((wp, index) => (
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
            <div className="space-y-12">
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

      {/* Liked Wallpapers Modal */}
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
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-4 z-50 flex flex-col bg-gradient-to-br from-zinc-900 to-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/50"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800/50 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => setShowLikedModal(false)} 
                    className="bg-zinc-800 hover:bg-zinc-700 rounded-full p-2 transition-all duration-200"
                    size="icon"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  
                  <div>
                    <h2 className="text-lg md:text-xl font-light text-white flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      Shortlisted Wall Coverings
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-zinc-400">
                        {likedWallpapers.length} item{likedWallpapers.length !== 1 ? 's' : ''} selected
                      </p>
                      <span className="text-xs text-zinc-500">•</span>
                      <button
                        onClick={() => {
                          if (likedWallpapers.length > 0 && window.confirm("Clear all shortlisted items?")) {
                            clearAllLiked();
                          }
                        }}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Button 
                    onClick={handleDownloadPDF} 
                    disabled={isGeneratingPDF || likedWallpapers.length === 0}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-5 py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-900/30"
                  >
                    {isGeneratingPDF ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating PDF...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF Brochure
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {likedWallpapers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                      <Heart className="w-10 h-10 text-zinc-600" />
                    </div>
                    <h3 className="text-xl text-zinc-300 mb-2">No Shortlisted Items</h3>
                    <p className="text-zinc-500 max-w-md">
                      Click the heart icon on any wall covering to add it to your shortlist.
                    </p>
                    <Button
                      onClick={() => setShowLikedModal(false)}
                      className="mt-6 bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-lg"
                    >
                      Browse Collections
                    </Button>
                  </div>
                ) : (
                  <div>
                    {/* PDF Info Banner */}
                    <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 rounded-xl p-4 mb-6 border border-emerald-800/30">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white mb-1">
                              Ready to Generate PDF Brochure
                            </h4>
                            <p className="text-xs text-zinc-400">
                              Your shortlisted items will be included with customer details, 
                              timestamps in 12-hour format, and professional watermarking.
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white mb-1">
                            {likedWallpapers.length} Items
                          </div>
                          <div className="text-xs text-zinc-400">
                            Click "Download PDF Brochure" above
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Grid of shortlisted items */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
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
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Luxury Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800/50 mt-12">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-blue-200">
                  Ellendorf Luxury Collection
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                Premium Textile Wall Coverings • Timeless Elegance • Exceptional Craftsmanship
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="text-sm text-zinc-400">
                Powered by <span className="text-blue-400">Reimagine Walls</span>
              </div>
              <div className="text-xs text-zinc-600">
                © {new Date().getFullYear()} All rights reserved
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}