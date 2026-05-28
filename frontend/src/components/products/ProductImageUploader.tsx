"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageUploaderProps {
  maxImages?: number;
}

export function ProductImageUploader({ maxImages = 5 }: ProductImageUploaderProps) {
  const [images, setImages] = useState<{ id: string; url: string; file: File }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFiles = (files: File[]) => {
    const validImageFiles = files.filter(f => f.type.startsWith("image/"));
    
    if (validImageFiles.length === 0) return;
    
    if (images.length + validImageFiles.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images.`);
      return;
    }

    const newImages = validImageFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // Clean up object URLs to prevent memory leaks
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      return filtered;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Media</CardTitle>
        <CardDescription>
          Upload up to {maxImages} images. The first image will be used as the thumbnail.
          <br/>
          <span className="text-xs text-muted-foreground italic">(Note: Backend API for image uploads is currently pending. Images are for UI demonstration only.)</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-8 transition-colors flex flex-col items-center justify-center text-center cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
            images.length >= maxImages && "opacity-50 pointer-events-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => images.length < maxImages && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange} 
            disabled={images.length >= maxImages}
          />
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <UploadCloud className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium mb-1">
            Drag & drop your images here
          </p>
          <p className="text-xs text-muted-foreground">
            or click to browse from your computer
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports: JPG, PNG, WEBP (Max 5MB each)
          </p>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
            {images.map((image, index) => (
              <div key={image.id} className="relative group rounded-md border border-border overflow-hidden bg-muted aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={image.url} 
                  alt={`Product Preview ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Thumbnail
                  </div>
                )}
              </div>
            ))}
            
            {images.length < maxImages && (
              <div 
                className="border border-dashed border-border rounded-md aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-6 w-6 text-muted-foreground mb-2 opacity-50" />
                <span className="text-xs text-muted-foreground font-medium">Add Image</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
