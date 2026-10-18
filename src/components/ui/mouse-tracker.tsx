"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Modern Subtle Mouse Tracking & Ambient Spotlight Effect
 * - Follows cursor with buttery-smooth linear interpolation (lerping)
 * - Illuminates cards, borders, and sidebar with a soft ambient radial light
 * - Dynamically expands when hovering interactive elements (buttons, links, inputs)
 * - Automatically disables on touch/mobile devices
 * - Zero pointer interference (`pointer-events: none`)
 */
export function MouseTracker() {
  const [mounted, setMounted] = useState(false);
  const followerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on devices with fine pointer (mouse)
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    setMounted(true);

    const mouse = { x: -100, y: -100 };
    const smooth = { x: -100, y: -100 };
    let isVisible = false;
    let isHovering = false;
    let isMouseDown = false;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (followerRef.current) followerRef.current.style.opacity = "1";
        if (spotlightRef.current) spotlightRef.current.style.opacity = "1";
      }

      // Check if hovering over an interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'a, button, [role="button"], input, select, textarea, label, [data-interactive="true"], .cursor-pointer'
        );
        isHovering = Boolean(interactive);
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
      if (followerRef.current) followerRef.current.style.opacity = "0";
      if (spotlightRef.current) spotlightRef.current.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      isVisible = true;
      if (followerRef.current) followerRef.current.style.opacity = "1";
      if (spotlightRef.current) spotlightRef.current.style.opacity = "1";
    };

    // Smooth physics loop
    const animate = () => {
      // Lerp smooth coordinates toward mouse position
      smooth.x += (mouse.x - smooth.x) * 0.18;
      smooth.y += (mouse.y - smooth.y) * 0.18;

      if (followerRef.current) {
        const scale = isMouseDown ? 0.82 : isHovering ? 1.45 : 1;
        followerRef.current.style.transform = `translate3d(${smooth.x}px, ${smooth.y}px, 0) translate(-50%, -50%) scale(${scale})`;

        if (isHovering) {
          followerRef.current.classList.add("cursor-hovering");
        } else {
          followerRef.current.classList.remove("cursor-hovering");
        }
      }

      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(550px circle at ${mouse.x}px ${mouse.y}px, rgba(37, 99, 235, 0.05), rgba(139, 92, 246, 0.02) 40%, transparent 75%)`;
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
      {/* ─── 1. AMBIENT CURSOR SPOTLIGHT ─── */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-0"
        style={{ willChange: "background" }}
      />

      {/* ─── 2. REFINED CURSOR FOLLOWER AURA ─── */}
      <div
        ref={followerRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 transition-opacity duration-300 opacity-0"
        style={{ willChange: "transform" }}
      >
        <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          {/* Subtle Outer Glow Ring */}
          <div className="w-6 h-6 rounded-full border border-blue-500/35 dark:border-blue-400/40 bg-blue-500/[0.04] dark:bg-blue-400/[0.06] shadow-[0_0_12px_rgba(37,99,235,0.2)] transition-all duration-200 [.cursor-hovering_&]:w-9 [.cursor-hovering_&]:h-9 [.cursor-hovering_&]:border-indigo-500/50 [.cursor-hovering_&]:bg-indigo-500/[0.12] [.cursor-hovering_&]:shadow-[0_0_18px_rgba(99,102,241,0.35)]" />

          {/* Micro Core Dot */}
          <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-[0_0_6px_rgba(37,99,235,0.7)] transition-transform duration-200 [.cursor-hovering_&]:scale-125 [.cursor-hovering_&]:bg-indigo-500" />
        </div>
      </div>
    </>
  );
}
