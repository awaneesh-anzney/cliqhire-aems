"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Crop, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface ImageCropperDialogProps {
  image: string | null;
  open: boolean;
  onClose: () => void;
  onCrop: (croppedImage: string) => void;
}

export function ImageCropperDialog({
  image,
  open,
  onClose,
  onCrop,
}: ImageCropperDialogProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [open]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getCroppedImg = () => {
    if (!imageRef.current || !containerRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed size for avatar
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    const img = imageRef.current;
    
    // The circle in the UI is 200px wide. The canvas is 400px wide.
    // So we scale everything by 2x from UI to Canvas.
    const uiToCanvasScale = size / 200;
    
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Natural dimensions
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    // Displayed dimensions (before zoom/rotation)
    const displayWidth = img.width;
    const displayHeight = img.height;
    
    // Ratio between natural and displayed
    const naturalToDisplayRatio = naturalWidth / displayWidth;
    
    // How much the image is actually scaled in the UI including zoom
    // We want to draw the image such that the 200px circle area in the UI
    // maps to the 400px canvas area.
    
    const drawWidth = displayWidth * zoom * uiToCanvasScale;
    const drawHeight = displayHeight * zoom * uiToCanvasScale;
    
    // Position.x/y is the offset from center
    ctx.drawImage(
      img,
      (position.x * uiToCanvasScale) - (drawWidth / 2),
      (position.y * uiToCanvasScale) - (drawHeight / 2),
      drawWidth,
      drawHeight
    );
    
    ctx.restore();

    const base64Image = canvas.toDataURL("image/jpeg", 0.9);
    onCrop(base64Image);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl overflow-hidden border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-brand/10 rounded-lg text-brand">
               <Crop className="h-5 w-5" />
            </div>
            Adjust Profile Photo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Crop Area */}
          <div 
            ref={containerRef}
            className="relative h-80 w-full bg-slate-100 rounded-2xl overflow-hidden cursor-move touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="absolute inset-0 flex items-center justify-center">
               <img
                ref={imageRef}
                src={image || ""}
                alt="To crop"
                className="max-w-none transition-transform duration-75 select-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                }}
                draggable={false}
              />
            </div>
            
            {/* Circle Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-slate-900/40" style={{ 
                clipPath: 'path("M0 0h100v100H0z M50 50 m-40 0 a 40 40 0 1 0 80 0 a 40 40 0 1 0 -80 0")',
                clipRule: 'evenodd'
              }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[200px] h-[200px] rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4 px-2">
            <div className="flex items-center gap-4">
              <ZoomOut className="h-4 w-4 text-slate-400" />
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={([val]) => setZoom(val)}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-slate-400" />
            </div>

            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRotation((r) => r + 90)}
                className="rounded-xl border-slate-200 text-slate-600 font-bold"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 px-0">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-500 hover:bg-slate-50">
            Cancel
          </Button>
          <Button onClick={getCroppedImg} className="rounded-xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest px-8">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
