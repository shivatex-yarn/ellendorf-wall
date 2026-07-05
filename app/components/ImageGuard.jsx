"use client";

import { useEffect } from "react";

/**
 * App-wide image protection.
 *
 * Blocks the right-click context menu and drag-start on <img> elements so a
 * user can't casually "Copy image address" / "Save image as…" / drag the
 * original out of the page. Mounted once in the root layout, it covers every
 * route (Gallery, Collections, Recent Installations, …) without having to edit
 * each image individually.
 *
 * NOTE: This is a deterrent, not DRM. A determined user with DevTools can still
 * read image bytes from the Network tab — fully hiding the origin requires a
 * server-side image proxy with signed URLs.
 */
export default function ImageGuard() {
  useEffect(() => {
    const onContextMenu = (e) => {
      if (e.target && e.target.tagName === "IMG") {
        e.preventDefault();
      }
    };
    const onDragStart = (e) => {
      if (e.target && e.target.tagName === "IMG") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return null;
}
