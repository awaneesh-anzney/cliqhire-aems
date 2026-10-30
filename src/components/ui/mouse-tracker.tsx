"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Modern Luxury SaaS Mouse Pointer & Ambient Spotlight
 * Inspired by Linear, Vercel, and Apple design systems:
 *
 * 1. Precision Lead Micro-Dot (Immediate, pinpoint tracking with glowing gradient)
 * 2. Fluid Magnetic Trailing Ring (Smooth lerped elastic physics that trails the cursor)
 * 3. Interactive Morphing:
 *    - Expands smoothly into a frosted-glass magnetic halo on buttons, links, cards, & rows
 *    - Morphs into a sleek vertical indicator on text inputs
 * 4. Click Tactile Compression (Spring-like press feedback on mousedown)
 * 5. Ambient Dual-Tone Spotlight (Gently illuminates cards and glassy borders)
 * 6. Mobile Safe & High Performance (Disabled on touch devices, runs via RAF on GPU layers)
 */
export function MouseTracker() {
  const [mounted, setMounted] = useState(false);
  const auraRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const dotInnerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on devices with a fine mouse pointer
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    setMounted(true);

    const mouse = { x: -200, y: -200 };
    const dotSmooth = { x: -200, y: -200 };
    const auraSmooth = { x: -200, y: -200 };

    let isVisible = false;
    let isHovering = false;
    let isTextInput = false;
    let isMouseDown = false;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (auraRef.current) auraRef.current.style.opacity = "1";
        if (spotlightRef.current) spotlightRef.current.style.opacity = "1";
      }

      // Check target element types
      const target = e.target as HTMLElement | null;
      if (target) {
        const textElement = target.closest('input[type="text"], input[type="search"], input[type="email"], textarea, [contenteditable="true"]');
        isTextInput = Boolean(textElement);

        if (!isTextInput) {
          const interactive = target.closest(
            'a, button, [role="button"], select, label, [data-interactive="true"], .cursor-pointer, input[type="checkbox"], input[type="radio"]'
          );
          isHovering = Boolean(interactive);
        } else {
          isHovering = false;
        }
      }
    };

    const handleMouseDown = () => {
      isMouseDown = true;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (auraRef.current) auraRef.current.style.opacity = "0";
      if (spotlightRef.current) spotlightRef.current.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      isVisible = true;
      if (dotRef.current) dotRef.current.style.opacity = "1";
      if (auraRef.current) auraRef.current.style.opacity = "1";
      if (spotlightRef.current) spotlightRef.current.style.opacity = "1";
    };

    // Smooth Dual-Physics RAF Loop
    const animate = () => {
      // 1. Fast responsive dot lerp (0.42)
      dotSmooth.x += (mouse.x - dotSmooth.x) * 0.42;
      dotSmooth.y += (mouse.y - dotSmooth.y) * 0.42;

      // 2. Buttery smooth trailing aura lerp (0.13)
      auraSmooth.x += (mouse.x - auraSmooth.x) * 0.13;
      auraSmooth.y += (mouse.y - auraSmooth.y) * 0.13;

      // Position the lead micro-dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotSmooth.x}px, ${dotSmooth.y}px, 0)`;
      }

      // Position & transform the trailing aura ring
      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${auraSmooth.x}px, ${auraSmooth.y}px, 0)`;
      }

      // Update ring appearance dynamically
      if (ringRef.current && dotInnerRef.current) {
        if (isTextInput) {
          // Subtle capsule for text input
          ringRef.current.className =
            "w-3.5 h-6 rounded-md border border-blue-500/40 bg-blue-500/[0.08] shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all duration-200 ease-out";
          dotInnerRef.current.style.transform = "scale(0.7)";
        } else if (isHovering) {
          // Expanded magnetic glowing halo on interactive targets
          const scale = isMouseDown ? "scale(0.85)" : "scale(1)";
          ringRef.current.className =
            "w-10 h-10 rounded-full border border-indigo-500/50 dark:border-indigo-400/60 bg-gradient-to-tr from-blue-500/[0.08] via-indigo-500/[0.12] to-purple-500/[0.08] shadow-[0_0_22px_rgba(99,102,241,0.32)] backdrop-blur-[0.5px] transition-all duration-200 ease-out";
          ringRef.current.style.transform = scale;
          dotInnerRef.current.style.transform = isMouseDown ? "scale(0.6)" : "scale(0.75)";
        } else {
          // Default sleek micro-ring
          const scale = isMouseDown ? "scale(0.75)" : "scale(1)";
          ringRef.current.className =
            "w-6 h-6 rounded-full border border-blue-500/35 dark:border-blue-400/45 bg-blue-500/[0.04] dark:bg-blue-400/[0.06] shadow-[0_0_12px_rgba(37,99,235,0.18)] transition-all duration-200 ease-out";
          ringRef.current.style.transform = scale;
          dotInnerRef.current.style.transform = isMouseDown ? "scale(0.7)" : "scale(1)";
        }
      }

      // Update ambient radial spotlight illumination
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(37, 99, 235, 0.05), rgba(139, 92, 246, 0.02) 40%, transparent 75%)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* ─── 1. AMBIENT DUAL-TONE RADIAL ILLUMINATION ─── */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-0"
        style={{ willChange: "background" }}
      />

      {/* ─── 2. FLUID MAGNETIC TRAILING AURA RING ─── */}
      <div
        ref={auraRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 transition-opacity duration-300 opacity-0"
        style={{ willChange: "transform" }}
      >
        <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <div
            ref={ringRef}
            className="w-6 h-6 rounded-full border border-blue-500/35 dark:border-blue-400/45 bg-blue-500/[0.04] dark:bg-blue-400/[0.06] shadow-[0_0_12px_rgba(37,99,235,0.18)] transition-all duration-200 ease-out"
          />
        </div>
      </div>

      {/* ─── 3. PINPOINT RESPONSIVE LEAD MICRO-DOT ─── */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 transition-opacity duration-300 opacity-0"
        style={{ willChange: "transform" }}
      >
        <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <div
            ref={dotInnerRef}
            className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 dark:from-blue-400 dark:to-indigo-300 shadow-[0_0_8px_rgba(37,99,235,0.7)] transition-transform duration-150"
          />
        </div>
      </div>
    </>
  );
}
