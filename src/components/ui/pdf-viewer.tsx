"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  X,
  FileText,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
  candidateName?: string;
}

export function PDFViewer({ isOpen, onClose, pdfUrl, candidateName }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useIframe, setUseIframe] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setScale(1);
      setRotation(0);
      setError(null);
      setTotalPages(0);
      setUseIframe(false);
    }
  }, [isOpen]);

  // Load PDF when URL changes
  useEffect(() => {
    if (pdfUrl && isOpen) {
      loadPDF(pdfUrl);
    }
  }, [pdfUrl, isOpen]);

  const loadPDF = async (url: string) => {
    try {
      setLoading(true);
      setError(null);
      // Dynamic import of PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      
      // Use a more reliable worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;    
      // Configure PDF.js for better compatibility
      const loadingTask = pdfjsLib.getDocument({
        url: url,
        withCredentials: false,
        httpHeaders: {},
        disableAutoFetch: false,
        disableStream: false,
        disableRange: false,
        disableFontFace: false,
        cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`,
      });
      
      const pdf = await loadingTask.promise;
      pdfRef.current = pdf;
      setTotalPages(pdf.numPages);  
      // Render first page
      await renderPage(1);
      setLoading(false);
    } catch (err) {
      console.error('Error loading PDF:', err);
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          name: err.name,
          stack: err.stack,
        });
      } else {
        console.error('Error details (non-Error):', err);
      }
      setUseIframe(true);
      setError(null);
      setLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfRef.current || !canvasRef.current) return;

    try {
      const page = await pdfRef.current.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      const viewport = page.getViewport({ scale, rotation });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Failed to render PDF page.');
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      renderPage(newPage);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      renderPage(newPage);
    }
  };

  const zoomIn = () => {
    const newScale = Math.min(scale + 0.25, 3);
    setScale(newScale);
    renderPage(currentPage);
  };

  const zoomOut = () => {
    const newScale = Math.max(scale - 0.25, 0.5);
    setScale(newScale);
    renderPage(currentPage);
  };

  const rotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    renderPage(currentPage);
  };

  const downloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${candidateName || 'resume'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      renderPage(page);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              PDF Viewer
              {candidateName && (
                <Badge variant="secondary" className="ml-2">
                  {candidateName}
                </Badge>
              )}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            {!useIframe && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentPage}
                    onChange={handlePageInputChange}
                    className="w-16 px-2 py-1 text-sm border rounded"
                    min={1}
                    max={totalPages}
                  />
                  <span className="text-sm text-foreground">of {totalPages}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!useIframe && (
              <>
                <Button variant="outline" size="sm" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-foreground min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button variant="outline" size="sm" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={rotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (useIframe) {
                  setUseIframe(false);
                  if (pdfUrl) loadPDF(pdfUrl);
                } else {
                  setUseIframe(true);
                }
              }}
            >
              {useIframe ? 'Advanced View' : 'Simple View'}
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-muted p-4 flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-4">
              <Progress value={50} className="w-64" />
              <p className="text-sm text-foreground">Loading PDF...</p>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div>
                <p className="text-lg font-semibold text-red-700">Error Loading PDF</p>
                <p className="text-sm text-foreground mt-2">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setUseIframe(true);
                    setError(null);
                  }}
                >
                  Try Alternative View
                </Button>
              </div>
            </div>
          )}
          
          {!loading && !error && pdfUrl && useIframe && (
            <div className="w-full h-full bg-card shadow-lg rounded-lg overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={`Resume - ${candidateName || 'Candidate'}`}
                onError={() => {
                  console.error('Iframe also failed to load PDF');
                  setError('Unable to display PDF. Please try downloading the file.');
                }}
              />
            </div>
          )}
          
          {!loading && !error && pdfUrl && !useIframe && (
            <div className="bg-card shadow-lg rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            </div>
          )}
          
          {!pdfUrl && !loading && !error && (
            <div className="flex flex-col items-center gap-4 text-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold text-foreground">No Resume Available</p>
                <p className="text-sm text-foreground mt-2">
                  This candidate doesn&apos;t have a resume uploaded yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
