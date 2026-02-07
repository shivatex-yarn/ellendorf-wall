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
} from "lucide-react";
import { jsPDF } from "jspdf";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
// Import shared image loading utilities with retry logic
import { imageCache, preloadImage, preloadImagesBatch } from '../../lib/imageLoader.js';
import Image from "next/image";

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

// Helper: get initial image state from cache so pagination doesn't re-show loading
const getInitialImageState = (imageUrl) => {
  if (!imageUrl) return { src: "", isLoading: false, isError: true };
  const cached = imageCache.get(imageUrl);
  if (cached === null) {
    // Image previously failed to load
    return { src: "", isLoading: false, isError: true };
  }
  if (cached && cached !== null && !(cached instanceof Promise)) {
    return { src: cached, isLoading: false, isError: false };
  }
  return { src: "", isLoading: true, isError: false };
};

// WallpaperCard Component - Optimized with Intersection Observer for lazy loading
const WallpaperCard = React.memo(({ wp, index, onClick, onLike, isLiked, isHighlighted, id, compact = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageState, setImageState] = useState(() => getInitialImageState(wp?.imageUrl));
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const mountedRef = useRef(true);
  const timeoutRef = useRef(null);

  // Optimized: Use Intersection Observer for lazy loading + cache check
  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async (priority = false) => {
      // Clear any existing timeout
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

      // Check cache first
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

      // If there's a pending promise, wait for it with timeout
      const loadingPromise = imageCache.getLoadingPromise(wp.imageUrl);
      if (loadingPromise) {
        // Set loading state
        if (isMounted) {
          setImageState(prev => ({ ...prev, isLoading: true, isError: false }));
        }

        // Set timeout for loading (10 seconds max)
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

      // Set timeout for loading (10 seconds max)
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

    // Load immediately if it's in the first batch (above the fold)
    if (index < 12) {
      loadImage(true);
    } else {
      // Use Intersection Observer for lazy loading
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
            rootMargin: '50px', // Start loading 50px before entering viewport
            threshold: 0.01
          }
        );
        
        observerRef.current.observe(imgRef.current);
      } else {
        // Fallback: load immediately if IntersectionObserver not available
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
          ? 'border-blue-500 ring-4 ring-blue-500/20 scale-105 z-10' 
          : 'border-zinc-800'
      } ${compact ? 'rounded-lg' : 'rounded-2xl'}`}
      onClick={handleClick}
    >
      {/* Loading/Error state - Using shadcn Skeleton */}
      {imageState.isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center overflow-hidden ${compact ? 'rounded-lg' : 'rounded-2xl'}`}>
          <Skeleton className={`absolute inset-0 ${compact ? 'rounded-lg' : 'rounded-2xl'} bg-zinc-800`} />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-zinc-400 text-xs">Loading...</span>
          </div>
        </div>
      )}
      
      {imageState.isError && (
        <div className={`absolute inset-0 flex items-center justify-center overflow-hidden ${compact ? 'rounded-lg' : 'rounded-2xl'}`}>
          <Skeleton className={`absolute inset-0 ${compact ? 'rounded-lg' : 'rounded-2xl'} bg-zinc-800`} />
        </div>
      )}

      {/* Main image - native img so any size/domain loads (no Next Image limits) */}
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

      {/* Overlay info */}
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

// Compact Wallpaper Card for Liked Modal - Optimized (init from cache to avoid re-loading)
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
      // Clear any existing timeout
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

      // If there's a pending promise, wait for it with timeout
      const loadingPromise = imageCache.getLoadingPromise(wp.imageUrl);
      if (loadingPromise) {
        // Set loading state
        if (isMounted) {
          setImageState(prev => ({ ...prev, isLoading: true, isError: false }));
        }

        // Set timeout for loading (10 seconds max)
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

      // Set timeout for loading (10 seconds max)
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

    // Load immediately if visible (first 20 items)
    if (index < 20) {
      loadImage(true);
    } else {
      // Use Intersection Observer for lazy loading
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
      {/* Image container */}
      <div 
        ref={imgRef}
        className="relative aspect-[4/3] overflow-hidden"
        onClick={handleClick}
      >
        {imageState.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <Skeleton className="absolute inset-0 rounded-lg bg-zinc-800" />
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div className="w-4 h-4 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
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

// FIXED Category Section Component - No image reloading on pagination
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
  
  // Calculate category items
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

  // Optimized: Preload visible images first, then adjacent pages with aggressive caching
  useEffect(() => {
    if (!categoryItems.length) return;
    
    const preloadCategoryImages = async () => {
      // Priority 1: Preload visible images immediately with link preload for fastest loading
      const visibleUrls = visibleItems
        .filter(wp => wp.imageUrl)
        .map(wp => wp.imageUrl);
      
      if (visibleUrls.length > 0) {
        // Use link preload for instant loading (browser-level optimization)
        visibleUrls.forEach(url => {
          if (!document.querySelector(`link[rel="preload"][href="${url}"]`)) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            link.fetchPriority = 'high';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
          }
        });
        
        // Preload with high concurrency for faster loading
        preloadImagesBatch(visibleUrls, 12, true);
      }
      
      // Priority 2: Aggressively preload next/previous page images (critical for smooth pagination)
      const nextPageStart = Math.min(start + itemsPerPage, categoryItems.length);
      const prevPageStart = Math.max(0, start - itemsPerPage);
      
      const nextPageItems = categoryItems.slice(nextPageStart, nextPageStart + itemsPerPage);
      const prevPageItems = categoryItems.slice(prevPageStart, prevPageStart + itemsPerPage);
      
      const adjacentUrls = [
        ...nextPageItems.filter(wp => wp.imageUrl).map(wp => wp.imageUrl),
        ...prevPageItems.filter(wp => wp.imageUrl).map(wp => wp.imageUrl)
      ];
      
      if (adjacentUrls.length > 0) {
        // Use link prefetch for adjacent pages
        adjacentUrls.forEach(url => {
          if (!document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.as = 'image';
            link.href = url;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
          }
        });
        
        // Load adjacent pages with high concurrency (don't wait)
        preloadImagesBatch(adjacentUrls, 10, true);
      }
      
      // Priority 3: Preload remaining images in background (throttled)
      const remainingUrls = categoryItems
        .filter((wp, idx) => {
          const itemStart = Math.floor(idx / itemsPerPage) * itemsPerPage;
          return itemStart !== start && 
                 itemStart !== nextPageStart && 
                 itemStart !== prevPageStart &&
                 wp.imageUrl;
        })
        .map(wp => wp.imageUrl);
      
      if (remainingUrls.length > 0) {
        // Load remaining images slowly in background
        setTimeout(() => {
          preloadImagesBatch(remainingUrls, 6, false);
        }, 300);
      }
    };
    
    preloadCategoryImages();
  }, [categoryItems, start, visibleItems, itemsPerPage]); // Include start and visibleItems

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

  // Handle page change - Optimized for 2-second loading with smooth transitions
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
    
    // Use link preload for instant browser-level caching
    newPageUrls.forEach(url => {
      if (!document.querySelector(`link[rel="preload"][href="${url}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        link.fetchPriority = 'high';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
    
    // Preload with high concurrency (12 parallel) and 2-second timeout
    const preloadPromise = Promise.race([
      preloadImagesBatch(newPageUrls, 12, true),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      )
    ]).catch(() => {
      // If timeout, continue anyway - images will load progressively
      console.warn('Some images took longer than 2s to preload, continuing...');
    });
    
    await preloadPromise;
    
    // Preload next-next page in background (don't block)
    const nextNextPageStart = Math.min(newPageStart + itemsPerPage, categoryItems.length);
    const nextNextPageItems = categoryItems.slice(nextNextPageStart, nextNextPageStart + itemsPerPage);
    const nextNextPageUrls = nextNextPageItems
      .filter(wp => wp.imageUrl)
      .map(wp => wp.imageUrl);
    if (nextNextPageUrls.length > 0) {
      // Use prefetch for next-next page
      nextNextPageUrls.forEach(url => {
        if (!document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.as = 'image';
          link.href = url;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }
      });
      preloadImagesBatch(nextNextPageUrls, 10, true);
    }
    
    // Change page after preload (images should be in cache now)
    setPageByCategory(prev => ({ ...prev, [category]: newPage }));
    
    // Reset loading state after a brief delay for smooth transition
    setTimeout(() => {
      setIsChangingPage(false);
    }, 100);
  }, [category, currentPage, totalPages, setPageByCategory, categoryItems, itemsPerPage]);

  return (
    <section key={category} className="mb-4" ref={sectionRef}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-medium text-white">{category}</h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              disabled={currentPage === 0 || isChangingPage}
              onClick={() => handlePageChange('prev')}
              className="bg-black/70 rounded-full p-2 hover:bg-black/90 disabled:opacity-30 transition-all duration-200"
            >
              {isChangingPage ? (
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
            <span className="text-xs text-zinc-400">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              size="icon"
              disabled={currentPage === totalPages - 1 || isChangingPage}
              onClick={() => handlePageChange('next')}
              className="bg-black/70 rounded-full p-2 hover:bg-black/90 disabled:opacity-30 transition-all duration-200"
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

// Lightbox: always show image when open — use wallpaper.imageUrl as display src so image never fails to show
// Lightbox: always show image when open — use wallpaper.imageUrl as display src so image never fails to show
const Lightbox = ({ wallpaper, isOpen, onClose, onLike, isLiked, id }) => {
  // Always have a display URL: prefer cached/preloaded, fallback to original so image always shows
  const [imageState, setImageState] = useState({ src: "", isLoading: false, isError: false });
  const mountedRef = useRef(true);
  const timeoutRef = useRef(null);

  // Extract imageUrl for cleaner dependency tracking
  const imageUrl = wallpaper?.imageUrl || "";

  useEffect(() => {
    mountedRef.current = true;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!imageUrl || !isOpen) {
      // Schedule state update for next render cycle
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

    // Use requestAnimationFrame or setTimeout to avoid synchronous updates
    const animationFrame = requestAnimationFrame(() => {
      if (mountedRef.current) {
        setImageState({ src: imageUrl, isLoading: true, isError: false });
      }
    });

    // Helper functions
    const applySuccess = (src) => {
      if (mountedRef.current) {
        setImageState({ src: src || imageUrl, isLoading: false, isError: false });
      }
    };

    const applyError = () => {
      if (mountedRef.current) {
        // Keep showing original URL so img still renders
        setImageState({ src: imageUrl, isLoading: false, isError: true });
      }
    };

    // Check cache first - use setTimeout to defer state update
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

    // Set a timeout for overall loading (15 seconds)
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        applyError();
      }
    }, 15000);

    // Load the image
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

    // Use setTimeout to defer the async operation
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

  // Rest of the component remains the same...
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

              {/* Image container — always show image when we have a URL so it never fails to display */}
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
                        <div className="w-12 h-12 border-4 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
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

                  {/* Always render img when wallpaper has imageUrl — use cached src or original URL so image always shows */}
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
  const [error, setError] = useState(null);
  const id = useId();

  // Load liked wallpapers from sessionStorage
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

  // Save liked wallpapers to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("likedWallpapers", JSON.stringify(likedWallpapers));
    } catch (err) {
      console.error("Failed to save liked wallpapers:", err);
    }
  }, [likedWallpapers]);

  // Handle escape key and body overflow
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
    
    // If the search term looks like a product code, highlight it
    if (value.trim().toUpperCase() === value.trim() && value.trim().length >= 3) {
      setHighlightedProductCode(value.trim().toUpperCase());
    } else {
      setHighlightedProductCode("");
    }
  }, []);

  const clearAllLiked = () => {
    setLikedWallpapers([]);
    try {
      sessionStorage.removeItem("likedWallpapers");
    } catch (err) {
      console.error("Failed to clear liked wallpapers:", err);
    }
  };

  // Remove wallpaper from liked list
  const removeFromLiked = useCallback((wp) => {
    setLikedWallpapers(prev => prev.filter(w => w.id !== wp.id));
  }, []);

  // Fetch wallpapers data using axios
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
        
        // Ultra-optimized: Use requestIdleCallback for better performance
        const schedulePreload = (callback, delay = 0) => {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(callback, { timeout: delay });
          } else {
            setTimeout(callback, delay);
          }
        };
        
        // Priority 1: Preload critical above-the-fold images immediately
        const criticalBatch = activeWallpapers.slice(0, 12);
        const criticalUrls = criticalBatch
          .filter(wp => wp.imageUrl)
          .map(wp => wp.imageUrl);
        
        if (criticalUrls.length > 0) {
          // Use link preload for critical above-the-fold images (faster than prefetch)
          criticalUrls.slice(0, 6).forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            link.fetchPriority = 'high';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
          });
          
          // Use prefetch for remaining critical images
          criticalUrls.slice(6).forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.as = 'image';
            link.href = url;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
          });
          
          // Also preload with high priority using our batch function
          preloadImagesBatch(criticalUrls, 8, true);
        }
        
        // Priority 2: Preload next visible batch (below the fold)
        schedulePreload(() => {
          const firstBatch = activeWallpapers.slice(12, 36);
          const firstBatchUrls = firstBatch
            .filter(wp => wp.imageUrl)
            .map(wp => wp.imageUrl);
          
          if (firstBatchUrls.length > 0) {
            preloadImagesBatch(firstBatchUrls, 6, true);
          }
        }, 50);
        
        // Priority 3: Continue loading next batches in background
        schedulePreload(() => {
          const secondBatch = activeWallpapers.slice(36, 72);
          const secondBatchUrls = secondBatch
            .filter(wp => wp.imageUrl)
            .map(wp => wp.imageUrl);
          
          if (secondBatchUrls.length > 0) {
            preloadImagesBatch(secondBatchUrls, 4, false);
          }
        }, 300);
        
        // Priority 4: Load remaining images slowly in background (idle time)
        schedulePreload(() => {
          const remainingUrls = activeWallpapers
            .slice(72)
            .filter(wp => wp.imageUrl)
            .map(wp => wp.imageUrl);
          
          if (remainingUrls.length > 0) {
            // Load in smaller chunks during idle time
            let chunkIndex = 0;
            const chunkSize = 20;
            
            const loadNextChunk = () => {
              const chunk = remainingUrls.slice(chunkIndex, chunkIndex + chunkSize);
              if (chunk.length > 0) {
                preloadImagesBatch(chunk, 3, false);
                chunkIndex += chunkSize;
                
                if (chunkIndex < remainingUrls.length) {
                  schedulePreload(loadNextChunk, 100);
                }
              }
            };
            
            loadNextChunk();
          }
        }, 1000);
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

  const downloadAllAsPDF = async (customerName) => {
    if (!customerName || !customerName.trim()) {
      alert("Please enter a customer name");
      return;
    }
  
    // Ensure we have selected images
    if (!likedWallpapers || likedWallpapers.length === 0) {
      alert("Please select at least one wallpaper to download");
      setIsGeneratingPDF(false);
      return;
    }
  
    setIsGeneratingPDF(true);
  
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
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
  
      // PDF image optimization
      const PDF_IMAGE_MAX_DIMENSION = 800;
      const PDF_JPEG_QUALITY = 0.55;
  
      // Helper function to load image with retry logic and cache support
      const loadImageForWatermark = async (imageUrl, retryCount = 0, maxRetries = 3) => {
        const cachedUrl = imageCache.get(imageUrl);
        if (cachedUrl && cachedUrl !== null && !(cachedUrl instanceof Promise)) {
          return cachedUrl;
        }
  
        const loadingPromise = imageCache.getLoadingPromise(imageUrl);
        if (loadingPromise) {
          try {
            return await loadingPromise;
          } catch (error) {
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
              return loadImageForWatermark(imageUrl, retryCount + 1, maxRetries);
            }
            throw error;
          }
        }
  
        try {
          return await preloadImage(imageUrl, true);
        } catch (error) {
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return loadImageForWatermark(imageUrl, retryCount + 1, maxRetries);
          }
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            
            const timeout = setTimeout(() => {
              reject(new Error("Image load timeout"));
            }, 30000);
            
            img.onload = () => {
              clearTimeout(timeout);
              resolve(imageUrl);
            };
            
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error("Failed to load image"));
            };
            
            img.src = imageUrl;
          });
        }
      };
  
      // Function to add watermark to image
      const addWatermarkToImage = async (imageUrl) => {
        let imageSrc = imageUrl;
        let objectUrl = null;
        
        try {
          imageSrc = await loadImageForWatermark(imageUrl);
          
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          if (imageSrc.startsWith('blob:') || imageSrc.startsWith('data:')) {
            img.src = imageSrc;
          } else {
            try {
              const response = await fetch(imageSrc, {
                mode: 'cors',
                credentials: 'omit',
                cache: 'force-cache'
              });
              
              if (response.ok) {
                const blob = await response.blob();
                objectUrl = URL.createObjectURL(blob);
                img.src = objectUrl;
              } else {
                img.src = imageSrc;
              }
            } catch (fetchError) {
              img.src = imageSrc;
            }
          }
          
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Image load timeout"));
            }, 30000);
            
            img.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error("Failed to load image"));
            };
          });
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          // Resize for PDF
          const w = canvas.width;
          const h = canvas.height;
          const maxDim = Math.max(w, h);
          let outW = Math.max(1, w);
          let outH = Math.max(1, h);
          if (maxDim > PDF_IMAGE_MAX_DIMENSION) {
            const scale = PDF_IMAGE_MAX_DIMENSION / maxDim;
            outW = Math.max(1, Math.round(w * scale));
            outH = Math.max(1, Math.round(h * scale));
          }
          let watermarkedImage;
          try {
            const outCanvas = document.createElement('canvas');
            outCanvas.width = outW;
            outCanvas.height = outH;
            const outCtx = outCanvas.getContext('2d');
            outCtx.drawImage(canvas, 0, 0, w, h, 0, 0, outW, outH);
            watermarkedImage = outCanvas.toDataURL('image/jpeg', PDF_JPEG_QUALITY);
          } catch (resizeErr) {
            watermarkedImage = canvas.toDataURL('image/jpeg', PDF_JPEG_QUALITY);
          }
          
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          
          return watermarkedImage;
        } catch (error) {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          throw error;
        }
      };
  
      // ===== COVER PAGE - EXACT MATCH TO SCREENSHOT =====
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
  
      // Brand name at top - exact styling from screenshot
      doc.setFontSize(48);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("ELLENDORF", pageWidth / 2, 80, { align: "center" });
  
      // Subtitle "Premium Wall Coverings"
      doc.setFontSize(32);
      doc.setFont("helvetica", "normal");
      doc.text("Premium Wall Coverings", pageWidth / 2, 120, { align: "center" });
  
      // "Powered by Reimagine Walls" - smaller, lighter
      doc.setFontSize(20);
      doc.setTextColor(100, 100, 100);
      doc.text("Powered by Reimagine Walls", pageWidth / 2, 150, { align: "center" });
  
      // Client info section
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.text("Client:", pageWidth / 2, 200, { align: "center" });
      
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text(customerName, pageWidth / 2, 235, { align: "center" });
  
      // Generated timestamp
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Generated: " + timestamp, pageWidth / 2, 270, { align: "center" });
  
      // Total Selections
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Selections: ${likedWallpapers.length}`, pageWidth / 2, 310, { align: "center" });
  
      // Thank you message
      doc.setFontSize(22);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(50, 50, 50);
      doc.text("Thank you for choosing", pageWidth / 2, 370, { align: "center" });
  
      // Brand footer
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Ellendorf Luxury Collection", pageWidth / 2, 410, { align: "center" });
  
      // Tagline
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Premium Quality | Timeless Elegance | Exceptional Craftsmanship", pageWidth / 2, 450, { align: "center" });
  
      // Add decorative border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
  
      // ===== CONTENT PAGES =====
      // Preload images
      const imageUrls = likedWallpapers
        .filter(wp => wp.imageUrl && wp.imageUrl !== "/placeholder.jpg")
        .map(wp => wp.imageUrl);
      
      if (imageUrls.length > 0) {
        try {
          await preloadImagesBatch(imageUrls, 12, true);
        } catch (preloadError) {
          console.warn("Some images failed to preload:", preloadError);
        }
      }
  
      // Process each wallpaper
      for (let i = 0; i < likedWallpapers.length; i++) {
        const wp = likedWallpapers[i];
        doc.addPage();
        
        // White background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
  
        // Add header with brand info
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("ELLENDORF", pageWidth / 2, 40, { align: "center" });
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Premium Wall Coverings", pageWidth / 2, 60, { align: "center" });
  
        try {
          // Add watermarked image
          const watermarkedImage = await addWatermarkToImage(wp.imageUrl);
          const img = new Image();
          img.src = watermarkedImage;
          
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Image load timeout"));
            }, 30000);
            
            img.onload = () => {
              clearTimeout(timeout);
              try {
                const imgRatio = img.width / img.height;
                
                // Image dimensions
                const MAX_IMAGE_WIDTH = pageWidth - 80;
                const MAX_IMAGE_HEIGHT = pageHeight - 180;
                
                let drawWidth, drawHeight;
                
                if (imgRatio > 1) {
                  drawWidth = MAX_IMAGE_WIDTH;
                  drawHeight = MAX_IMAGE_WIDTH / imgRatio;
                } else {
                  drawHeight = MAX_IMAGE_HEIGHT;
                  drawWidth = MAX_IMAGE_HEIGHT * imgRatio;
                }
                
                if (drawHeight > MAX_IMAGE_HEIGHT) {
                  drawHeight = MAX_IMAGE_HEIGHT;
                  drawWidth = MAX_IMAGE_HEIGHT * imgRatio;
                }
                if (drawWidth > MAX_IMAGE_WIDTH) {
                  drawWidth = MAX_IMAGE_WIDTH;
                  drawHeight = MAX_IMAGE_WIDTH / imgRatio;
                }
                
                // Center the image
                const x = (pageWidth - drawWidth) / 2;
                const y = 80; // Below header
                
                // Add the image
                doc.addImage(img, "JPEG", x, y, drawWidth, drawHeight);
                
                // Add wallpaper info below image
                const infoY = y + drawHeight + 20;
                
                // Product code
                doc.setFontSize(20);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(0, 0, 0);
                doc.text(wp.productCode || "N/A", pageWidth / 2, infoY, { align: "center" });
                
                // Product name
                doc.setFontSize(16);
                doc.setFont("helvetica", "normal");
                const displayName = wp.name && wp.name.length > 50 
                  ? wp.name.substring(0, 47) + "..." 
                  : wp.name || "Untitled";
                doc.text(displayName, pageWidth / 2, infoY + 25, { align: "center" });
                
                // Collection
                if (wp.subCategory?.name) {
                  doc.setFontSize(14);
                  doc.setTextColor(100, 100, 100);
                  doc.text(`Collection: ${wp.subCategory.name}`, pageWidth / 2, infoY + 45, { align: "center" });
                }
                
                // Footer
                const footerY = pageHeight - 40;
                
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`Client: ${customerName}`, 40, footerY);
                doc.text(timestamp, pageWidth - 40, footerY, { align: "right" });
                
                doc.setFontSize(10);
                doc.setFont("helvetica", "italic");
                doc.text(`Page ${i + 2} of ${likedWallpapers.length + 1}`, pageWidth / 2, footerY, { align: "center" });
                
                // Bottom brand line
                doc.setFontSize(8);
                doc.text("ELLENDORF Premium Wall Coverings - Powered by Reimagine Walls", pageWidth / 2, footerY + 15, { align: "center" });
                
                resolve();
              } catch (error) {
                reject(error);
              }
            };
            
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error("Failed to load watermarked image"));
            };
          });
        } catch (err) {
          console.error(`Error processing image ${i + 1}:`, err);
          
          // Fallback layout
          const fallbackY = pageHeight / 2 - 30;
          
          doc.setTextColor(150, 150, 150);
          doc.setFontSize(24);
          doc.setFont("helvetica", "italic");
          doc.text("Image unavailable", pageWidth / 2, fallbackY, { align: "center" });
          
          doc.setFontSize(18);
          doc.setFont("helvetica", "normal");
          doc.text(wp.name || "Untitled", pageWidth / 2, fallbackY + 40, { align: "center" });
          doc.text(`Code: ${wp.productCode || "N/A"}`, pageWidth / 2, fallbackY + 70, { align: "center" });
          
          // Fallback footer
          const footerY = pageHeight - 40;
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`Client: ${customerName}`, 40, footerY);
          doc.text(timestamp, pageWidth - 40, footerY, { align: "right" });
          doc.text(`Page ${i + 2} of ${likedWallpapers.length + 1}`, pageWidth / 2, footerY, { align: "center" });
        }
      }
  
      // Save PDF
      const fileName = `Ellendorf_Luxury_Collection_${customerName.replace(/\s+/g, '_')}_${formattedDate}.pdf`;
      
      const pdfBlob = doc.output('blob');
      
      try {
        doc.save(fileName);
      } catch (saveError) {
        console.warn("PDF save method failed, trying alternative:", saveError);
        try {
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
        } catch (blobError) {
          console.error("PDF blob download failed:", blobError);
          const pdfDataUrl = doc.output('dataurlstring');
          const link = document.createElement('a');
          link.href = pdfDataUrl;
          link.download = fileName;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          
          setTimeout(() => {
            document.body.removeChild(link);
          }, 100);
        }
      }
      
      // Show success message
      if (typeof window !== 'undefined' && window.toast) {
        const pdfSizeKB = (pdfBlob.size / 1024).toFixed(2);
        window.toast.success(`PDF downloaded: ${pdfSizeKB} KB`, { duration: 3000 });
      }
      
    } catch (error) {
      console.error("PDF generation error:", error);
      alert(`Failed to generate luxury brochure: ${error.message || "Please try again."}`);
    } finally {
      setIsGeneratingPDF(false);
    }
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
        <div className="text-2xl text-zinc-400">Loading wall Coverings...</div>
        <div className="text-sm text-zinc-500 mt-2">Optimizing for fast loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-2xl text-red-400 mb-4">Error</div>
        <div className="text-lg text-zinc-400 mb-6">{error}</div>
        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
          Retry
        </Button>
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
          <Button variant="ghost" onClick={() => router.push("/wallpaper")} className="mr-4">
            <ArrowLeft className="mr-2 w-5 h-5 md:w-6 md:h-6" /> Back
          </Button>
          <h1 className="text-lg font-semibold">Ellendorf Textile Wall Coverings</h1>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
            <Input
              placeholder="Search by Category or product code..."
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
           
                        <motion.div 
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.6 }}
                          className="mb-6"
                        >
                          <Image
                            src="/assets/brand.png"
                            alt="Brand Logo"
                            width={320}
                            height={100}
                            className="object-contain mx-auto mt-24"
                            priority
                          />
                        </motion.div>
                      </div> 
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-center mb-4 tracking-tight">
              {/* <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-blue-900 via-blue-400 to-blue-900 bg-[length:200%_200%] animate-[shine_6s_linear_infinite] drop-shadow-[0_1px_8px_rgba(59,130,246,0.4)]">
                Ellendorf
              </span> */}
              <br />
              <span className="text-xl md:text-3xl lg:text-4xl font-light text-zinc-300"> Textile Wall Coverings</span>
            </h1>
            
            <p className="text-sm md:text-lg lg:text-xl text-zinc-400 text-center max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed">
              Experience unparalleled luxury with our curated selection of premium  Textile Wall Coverings.
              Each design tells a story of craftsmanship and elegance.
            </p>
          </div>

      </section>

      <main id="collections" className="py-4 md:py-8 px-4 md:px-8 bg-black">
        <div className="container mx-auto">
          <h2 className="text-xl md:text-2xl font-light text-center text-zinc-300 mb-6 md:mb-8">
            {/* {searchTerm ? `Results for "${searchTerm}"` : "All Textile Wall Coverings"} */}
            {highlightedProductCode && (
              <span className="block text-sm md:text-base text-blue-400 mt-2">
                Highlighting product code: {highlightedProductCode}
              </span>
            )}
          </h2>
          
          {wallpapers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-xl text-zinc-400 mb-4">No wall coverings found</div>
              <p className="text-zinc-500">Please check your data source or try again later.</p>
            </div>
          ) : searchTerm ? (
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
              className="fixed inset-0 bg-black z-50"
              onClick={() => setShowLikedModal(false)}
            />
            
            <div className="fixed inset-0 z-50 flex flex-col">
              <div className="sticky top-0 bg-black  p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => setShowLikedModal(false)} 
                    className="bg-black hover:bg-white/20 rounded-full p-2"
                    size="icon"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  
                  <div>
                    <h2 className="text-lg md:text-xl font-light">Shortlisted Wall Coverings</h2>
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
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {likedWallpapers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Heart className="w-16 h-16 text-zinc-700 mb-4" />
                    <h3 className="text-xl text-zinc-400 mb-2">No Shortlisted Wall Coverings</h3>
                    <p className="text-zinc-500">Click the heart icon on wall coverings to add them here.</p>
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

      <footer className="py-6 px-4 border-t border-zinc-800 text-center text-zinc-500 text-sm">
        <p>Ellendorf Luxury Wall Covering Collection | Powered by Reimagine Walls</p>
        <p className="mt-1">© {new Date().getFullYear()} All rights reserved</p>
      </footer>
    </div>
  );
};