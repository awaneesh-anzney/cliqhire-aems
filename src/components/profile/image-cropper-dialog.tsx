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
  const [baseSize, setBaseSize] = useState({ width: 0, height: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [open]);

  const handleImageLoad = () => {
    if (imageRef.current && containerRef.current) {
      const img = imageRef.current;
      const container = containerRef.current;
      
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      
      // Calculate base size to fit the container
      const ratio = Math.min(cw / nw, ch / nh);
      setBaseSize({
        width: nw * ratio,
        height: nh * ratio
      });
    }
  };

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
    if (!imageRef.current || !containerRef.current || baseSize.width === 0) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High res output
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    const img = imageRef.current;
    const uiCircleSize = 200;
    
    // The scale factor from UI pixels (at zoom 1.0) to natural pixels
    const uiToNaturalScale = img.naturalWidth / baseSize.width;
    
    // The actual crop size in natural pixels
    const cropSizeInNatural = (uiCircleSize / zoom) * uiToNaturalScale;
    
    // The center of the crop area in natural pixels
    // position.x/y is UI offset from center. 
    // Circle is fixed at center. So circle center relative to image center is -position.x/y
    const centerXInNatural = img.naturalWidth / 2 - (position.x / zoom) * uiToNaturalScale;
    const centerYInNatural = img.naturalHeight / 2 - (position.y / zoom) * uiToNaturalScale;
    
    const sourceX = centerXInNatural - cropSizeInNatural / 2;
    const sourceY = centerYInNatural - cropSizeInNatural / 2;
    
    ctx.save();
    
    // Handle rotation
    if (rotation !== 0) {
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-size / 2, -size / 2);
    }
    
    ctx.drawImage(
      img,
      sourceX, sourceY, cropSizeInNatural, cropSizeInNatural,
      0, 0, size, size
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
          <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
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
            className="relative h-80 w-full bg-muted rounded-2xl overflow-hidden cursor-move touch-none"
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
                onLoad={handleImageLoad}
                className="max-w-none select-none"
                style={{
                  width: baseSize.width ? `${baseSize.width * zoom}px` : "auto",
                  height: baseSize.height ? `${baseSize.height * zoom}px` : "auto",
                  transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
                }}
                draggable={false}
              />
            </div>
            
            {/* Circle Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[200px] h-[200px] rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4 px-2">
            <div className="flex items-center gap-4">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[zoom]}
                min={0.5}
                max={3}
                step={0.1}
                onValueChange={([val]) => setZoom(val)}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRotation((r) => r + 90)}
                className="rounded-xl border-border text-foreground font-bold"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 px-0">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-muted-foreground hover:bg-muted">
            Cancel
          </Button>
          <Button onClick={getCroppedImg} className="rounded-xl bg-foreground hover:bg-black text-white font-black uppercase tracking-widest px-8">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
