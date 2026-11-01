"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Modern Emerald SaaS Mouse Tracker & Ambient Illumination
 * Crafted with a luxury emerald / mint / teal green palette:
 *
 * 1. Pinpoint Emerald Lead Micro-Dot (Immediate, ultra-crisp tracking with radiant mint glow)
 * 2. Fluid Magnetic Trailing Halo (Buttery smooth lerped elastic physics in emerald glass)
 * 3. Interactive Morphing:
 *    - Expands into an iridescent emerald-teal frosted glass halo on buttons, links, rows, & cards
 *    - Morphs into a sleek vertical indicator on text inputs & search bars
 * 4. Micro Click Feedback (Spring-like press compression on mousedown)
 * 5. Ambient Emerald Radial Spotlight (Gently illuminates cards and glassy borders with cyber-emerald glow)
 * 6. Mobile Safe & High Performance (Automatically disabled on touch devices, runs via RAF on GPU)
 */
export function MouseTracker() {
  const [mounted, setMounted] = useState(false);
  const auraRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const dotInnerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

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
        const textElement = target.closest(
          'input[type="text"], input[type="search"], input[type="email"], textarea, [contenteditable="true"]'
        );
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

      // Trigger micro ripple animation
      if (rippleRef.current) {
        rippleRef.current.style.transform = "scale(1.8)";
        rippleRef.current.style.opacity = "0";
        setTimeout(() => {
          if (rippleRef.current) {
            rippleRef.current.style.transform = "scale(0.8)";
            rippleRef.current.style.opacity = "0.7";
          }
        }, 180);
      }
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
      // 1. Fast responsive dot lerp (0.45)
      dotSmooth.x += (mouse.x - dotSmooth.x) * 0.45;
      dotSmooth.y += (mouse.y - dotSmooth.y) * 0.45;

      // 2. Buttery smooth trailing aura lerp (0.14)
      auraSmooth.x += (mouse.x - auraSmooth.x) * 0.14;
      auraSmooth.y += (mouse.y - auraSmooth.y) * 0.14;

      // Position the lead micro-dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotSmooth.x}px, ${dotSmooth.y}px, 0)`;
      }

      // Position & transform the trailing aura ring
      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${auraSmooth.x}px, ${auraSmooth.y}px, 0)`;
      }

      // Update ring appearance dynamically with modern Emerald / Mint palette
      if (ringRef.current && dotInnerRef.current) {
        if (isTextInput) {
          // Subtle capsule for text input
          ringRef.current.className =
            "w-3.5 h-6 rounded-md border border-emerald-500/50 bg-emerald-500/[0.08] shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all duration-200 ease-out";
          dotInnerRef.current.style.transform = "scale(0.7)";
        } else if (isHovering) {
          // Expanded magnetic glowing halo on interactive targets
          const scale = isMouseDown ? "scale(0.85)" : "scale(1)";
          ringRef.current.className =
            "w-10 h-10 rounded-full border border-emerald-400/60 dark:border-emerald-300/70 bg-gradient-to-tr from-emerald-500/[0.12] via-teal-500/[0.15] to-emerald-400/[0.1] shadow-[0_0_24px_rgba(16,185,129,0.38)] backdrop-blur-[0.5px] transition-all duration-200 ease-out";
          ringRef.current.style.transform = scale;
          dotInnerRef.current.style.transform = isMouseDown ? "scale(0.6)" : "scale(0.75)";
        } else {
          // Default sleek micro-ring in subtle emerald
          const scale = isMouseDown ? "scale(0.75)" : "scale(1)";
          ringRef.current.className =
            "w-6 h-6 rounded-full border border-emerald-500/40 dark:border-emerald-400/50 bg-emerald-500/[0.04] dark:bg-emerald-400/[0.06] shadow-[0_0_14px_rgba(16,185,129,0.2)] transition-all duration-200 ease-out";
          ringRef.current.style.transform = scale;
          dotInnerRef.current.style.transform = isMouseDown ? "scale(0.7)" : "scale(1)";
        }
      }

      // Update ambient radial spotlight illumination (Emerald-Teal subtle gradient)
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(620px circle at ${mouse.x}px ${mouse.y}px, rgba(16, 185, 129, 0.055), rgba(20, 184, 166, 0.02) 45%, transparent 75%)`;
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
      {/* ─── 1. AMBIENT EMERALD RADIAL ILLUMINATION ─── */}
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
          {/* Outer Emerald Aura */}
          <div
            ref={ringRef}
            className="w-6 h-6 rounded-full border border-emerald-500/40 dark:border-emerald-400/50 bg-emerald-500/[0.04] dark:bg-emerald-400/[0.06] shadow-[0_0_14px_rgba(16,185,129,0.2)] transition-all duration-200 ease-out"
          />

          {/* Micro Ripple Wave on Click */}
          <div
            ref={rippleRef}
            className="absolute w-6 h-6 rounded-full border border-emerald-400/50 pointer-events-none transition-all duration-300 ease-out scale-75 opacity-0"
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
            className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-green-300 dark:from-emerald-400 dark:via-teal-300 dark:to-green-200 shadow-[0_0_10px_rgba(16,185,129,0.85)] transition-transform duration-150"
          />
        </div>
      </div>
    </>
  );
}
