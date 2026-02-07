"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Default blur placeholder (tiny gradient)
const DEFAULT_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k=";

/**
 * OptimizedImage Component
 * Uses Next.js Image component with automatic optimization, lazy loading, and blur placeholders
 * Simplified version to avoid DOM timeout errors
 */
const OptimizedImage = ({
  src,
  alt,
  priority = false,
  className = "",
  onError,
  aspectRatio,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw",
  quality = 85,
  fill = false,
  width,
  height,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [blurDataURL, setBlurDataURL] = useState(DEFAULT_BLUR);
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      // Abort any ongoing fetch requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Generate blur placeholder - SIMPLIFIED VERSION
  useEffect(() => {
    if (!isMounted.current || !src) return;

    // Reset states
    setIsLoading(true);
    setHasError(false);
    setBlurDataURL(DEFAULT_BLUR);

    // For data URLs or blob URLs, skip processing
    if (src.startsWith("data:") || src.startsWith("blob:")) {
      if (isMounted.current) {
        setIsLoading(false);
      }
      return;
    }

    // For priority images or if we want to skip blur generation
    if (priority) {
      if (isMounted.current) {
        setIsLoading(false);
      }
      return;
    }

    // SIMPLIFIED: Only generate blur for same-origin images to avoid CORS issues
    const isSameOrigin = () => {
      try {
        const url = new URL(src, window.location.origin);
        return url.origin === window.location.origin;
      } catch {
        return false;
      }
    };

    // Only generate blur for same-origin images to avoid CORS/timeout issues
    if (!isSameOrigin()) {
      if (isMounted.current) {
        setIsLoading(false);
      }
      return;
    }

    // Generate blur placeholder with timeout
    const generateBlur = async () => {
      if (!isMounted.current) return;

      try {
        // Create abort controller for timeout
        abortControllerRef.current = new AbortController();
        
        // Fetch image with timeout
        const timeoutId = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        }, 5000); // 5 second timeout

        const response = await fetch(src, {
          signal: abortControllerRef.current.signal,
          headers: {
            // Add cache control to avoid repeated fetches
            'Cache-Control': 'max-age=86400',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        // Create promise for image loading
        const imgLoadPromise = new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = imgUrl;
        });

        // Add timeout for image loading
        const imgTimeout = setTimeout(() => {
          reject(new Error('Image loading timeout'));
        }, 3000);

        const loadedImg = await imgLoadPromise;
        clearTimeout(imgTimeout);

        // Create small canvas for blur
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          throw new Error("Canvas context not available");
        }

        // Very small dimensions for blur
        canvas.width = 8;
        canvas.height = 6;
        
        ctx.drawImage(loadedImg, 0, 0, 8, 6);
        
        const dataURL = canvas.toDataURL("image/jpeg", 0.2);
        
        // Clean up object URL
        URL.revokeObjectURL(imgUrl);

        if (isMounted.current) {
          setBlurDataURL(dataURL);
        }

      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Blur generation aborted or timed out');
        } else if (error.message.includes('timeout')) {
          console.warn('Image loading timeout');
        } else {
          console.warn('Failed to generate blur:', error.message);
        }
        // Use default blur on error
        if (isMounted.current) {
          setBlurDataURL(DEFAULT_BLUR);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    // Start blur generation
    generateBlur();

    return () => {
      // Cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [src, priority]);

  const handleError = (e) => {
    if (!isMounted.current) return;
    
    console.error('Image load error:', e);
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError(e);
    }
  };

  const handleLoad = () => {
    if (!isMounted.current) return;
    setIsLoading(false);
  };

  // If error, show placeholder
  if (hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center ${className}`}
        style={aspectRatio ? { aspectRatio } : {}}
      >
        <span className="text-zinc-500 text-xs">Failed to load</span>
      </div>
    );
  }

  // If no src, show placeholder
  if (!src || src === "/placeholder.jpg") {
    return (
      <div
        className={`bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center ${className}`}
        style={aspectRatio ? { aspectRatio } : {}}
      >
        <span className="text-zinc-500 text-xs">No image</span>
      </div>
    );
  }

  // Determine if we should use fill or width/height
  const useFill = fill || (!width && !height);

  // Check if this is an external URL that might need unoptimized
  const isExternalUrl = src.startsWith('http') && !src.includes('localhost');

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={aspectRatio && !useFill ? { aspectRatio } : {}}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center z-10">
          <div className="w-4 h-4 border border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={src}
        alt={alt || "Image"}
        fill={useFill}
        width={!useFill ? width : undefined}
        height={!useFill ? height : undefined}
        priority={priority}
        quality={quality}
        sizes={sizes}
        className={`object-cover transition-opacity duration-200 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        onError={handleError}
        onLoad={handleLoad}
        onLoadingComplete={() => {
          if (isMounted.current) {
            setIsLoading(false);
          }
        }}
        // Unoptimized for external URLs to avoid Next.js Image optimization issues
        unoptimized={isExternalUrl || src.startsWith("data:") || src.startsWith("blob:")}
        // Add loading="lazy" for non-priority images
        loading={priority ? "eager" : "lazy"}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;