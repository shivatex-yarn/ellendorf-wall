"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// Default blur placeholder (tiny gradient)
const DEFAULT_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k=";

/**
 * OptimizedImage Component
 * Uses Next.js Image with automatic optimization (MB→KB), lazy loading, and blur placeholders.
 * quality=85 and sizes keep clarity while serving WebP/AVIF in KB range.
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

  // Generate a low-quality blur placeholder for better perceived performance
  useEffect(() => {
    if (!src || hasError || src.startsWith("data:") || src.startsWith("blob:")) {
      setIsLoading(false);
      return;
    }

    // For priority images, skip blur generation to load faster
    if (priority) {
      setIsLoading(false);
      return;
    }

    // Generate blur placeholder asynchronously
    const generateBlurPlaceholder = () => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            
            // Create a very small version (10px max dimension for faster processing)
            const maxSize = 10;
            let drawWidth = img.width;
            let drawHeight = img.height;
            
            if (drawWidth > drawHeight) {
              if (drawWidth > maxSize) {
                drawHeight = (drawHeight / drawWidth) * maxSize;
                drawWidth = maxSize;
              }
            } else {
              if (drawHeight > maxSize) {
                drawWidth = (drawWidth / drawHeight) * maxSize;
                drawHeight = maxSize;
              }
            }
            
            canvas.width = drawWidth;
            canvas.height = drawHeight;
            ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
            
            // Convert to base64 blur placeholder
            const dataURL = canvas.toDataURL("image/jpeg", 0.1);
            setBlurDataURL(dataURL);
          } catch (err) {
            // Keep default blur on error
          }
        };
        
        img.onerror = () => {
          // Keep default blur on error
        };
        
        img.src = src;
      } catch (err) {
        // Keep default blur on error
      }
    };

    // Generate blur in next tick to not block rendering
    setTimeout(generateBlurPlaceholder, 0);
  }, [src, priority, hasError]);

  const handleError = (e) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError(e);
    }
  };

  const handleLoad = () => {
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

  // Use Next.js Image component for optimization
  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={aspectRatio && !useFill ? { aspectRatio } : {}}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
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
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={src.startsWith("data:") || src.startsWith("blob:") || src.includes("localhost")}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
