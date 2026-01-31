"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { getOptimizedImageUrl, CARD_IMAGE_SIZES } from "@/lib/imageLoader";

const ROOT_MARGIN = "200px";
const THRESHOLD = 0.01;

/**
 * LazyImage: fast loading via image loader (CDN-friendly for 300+ concurrent users).
 * Use priority={true} for above-the-fold images so they load immediately.
 */
export function LazyImage({ src, alt, className, priority, ...props }) {
  const [isInView, setIsInView] = useState(!!priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);

  const optimizedSrc = useMemo(
    () =>
      src
        ? getOptimizedImageUrl(src, {
            width: CARD_IMAGE_SIZES.width,
            height: CARD_IMAGE_SIZES.height,
          })
        : "",
    [src]
  );

  useEffect(() => {
    if (priority) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsInView(true);
        });
      },
      { rootMargin: ROOT_MARGIN, threshold: THRESHOLD }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [priority]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-0">
      {/* Image loader: visible shimmer while loading (fast perceived load) */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 image-loader-shimmer"
          aria-hidden
          aria-busy="true"
        />
      )}
      {isInView && optimizedSrc && (
        <img
          src={optimizedSrc}
          alt={alt ?? ""}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : undefined}
          className={`w-full h-full object-cover transition-opacity duration-300 ${className ?? ""} ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          {...props}
        />
      )}
    </div>
  );
}
