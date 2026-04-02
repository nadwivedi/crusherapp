import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Loader2, Check, X, Wand2, RefreshCcw } from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Helper to create the Image object
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

// Convolution matrix to sharpen the image
const applySharpen = (ctx, w, h, strength = 0.5) => {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const dstData = ctx.createImageData(w, h);
  const dstBuff = dstData.data;

  // 3x3 Sharpen Kernel
  const weights = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  const side = 3;
  const halfSide = 1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dstOff = (y * w + x) * 4;
      let r = 0, g = 0, b = 0;

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = y + cy - halfSide;
          const scx = x + cx - halfSide;
          if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
            const srcOff = (scy * w + scx) * 4;
            const wt = weights[cy * side + cx];
            r += data[srcOff] * wt;
            g += data[srcOff + 1] * wt;
            b += data[srcOff + 2] * wt;
          }
        }
      }

      // Blend sharpened pixel with original pixel based on strength
      dstBuff[dstOff] = data[dstOff] * (1 - strength) + r * strength;
      dstBuff[dstOff + 1] = data[dstOff + 1] * (1 - strength) + g * strength;
      dstBuff[dstOff + 2] = data[dstOff + 2] * (1 - strength) + b * strength;
      dstBuff[dstOff + 3] = data[dstOff + 3]; // keep alpha
    }
  }

  ctx.putImageData(dstData, 0, 0);
};

// Core function to optionally enhance the entire image
const getEnhancedImg = async (imageSrc, crop, rotation = 0, enhance = false) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  let cropX = 0;
  let cropY = 0;
  let cropW = image.width;
  let cropH = image.height;

  if (crop && crop.width > 0 && crop.height > 0) {
      cropX = crop.x;
      cropY = crop.y;
      cropW = crop.width;
      cropH = crop.height;
  }

  // Optimization: Resize image if it's too large to save storage
  let finalW = cropW;
  let finalH = cropH;
  const MAX_DIMENSION = 1600;
  if (finalW > MAX_DIMENSION || finalH > MAX_DIMENSION) {
    if (finalW > finalH) {
      finalH = Math.round((finalH * MAX_DIMENSION) / finalW);
      finalW = MAX_DIMENSION;
    } else {
      finalW = Math.round((finalW * MAX_DIMENSION) / finalH);
      finalH = MAX_DIMENSION;
    }
  }

  if (rotation === 90 || rotation === 270) {
    canvas.width = finalH;
    canvas.height = finalW;
  } else {
    canvas.width = finalW;
    canvas.height = finalH;
  }

  if (enhance) {
    ctx.filter = 'contrast(1.6) brightness(1.2) grayscale(100%)';
  } else {
    ctx.filter = 'none';
  }

  // Draw with rotation
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  
  // Draw only the cropped portion
  ctx.drawImage(
      image,
      cropX, cropY, cropW, cropH,
      -finalW / 2, -finalH / 2, finalW, finalH
  );
  
  // Reset transform
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (enhance) {
    try {
      applySharpen(ctx, canvas.width, canvas.height, 0.45);
    } catch (e) {
      console.error("Sharpen failed:", e);
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      },
      'image/webp',
      0.8
    );
  });
};

export default function DocumentScannerPreview({ file, onCancel, onConfirm }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result));
      reader.readAsDataURL(file);
    }
  }, [file]);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
        makeAspectCrop({ unit: '%', width: 90, height: 90 }, width / height, width, height),
        width,
        height
    );
    setCrop(initialCrop); 
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    let pixelCrop = null;
    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && imgRef.current) {
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        
        pixelCrop = {
            unit: 'px',
            x: completedCrop.x * scaleX,
            y: completedCrop.y * scaleY,
            width: completedCrop.width * scaleX,
            height: completedCrop.height * scaleY
        };
    }

    try {
      const enhancedImageBlob = await getEnhancedImg(imageSrc, pixelCrop, rotation, isEnhancing);
      const newFile = new File([enhancedImageBlob], 'scanned_slip.webp', {
        type: 'image/webp',
      });
      onConfirm(newFile);
    } catch (e) {
      console.error(e);
      alert('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (!imageSrc) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  // Dynamic style for preview to reflect what will happen
  const previewStyle = {
    transform: `rotate(${rotation}deg)`,
    filter: isEnhancing ? 'contrast(1.6) brightness(1.2) grayscale(100%)' : 'none',
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    transition: 'transform 0.3s ease, filter 0.3s ease'
  };

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-slate-950 md:p-6 p-0 text-white backdrop-blur-[2px]">
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-900 shadow-xl md:rounded-2xl border border-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
          <h2 className="text-sm font-bold md:text-base">Document Preview & Crop</h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 transition hover:bg-slate-700"
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden p-4">
          <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
          >
              <img 
                ref={imgRef}
                src={imageSrc} 
                alt="Document preview" 
                onLoad={onImageLoad}
                style={previewStyle}
                className="max-h-[70vh]"
              />
          </ReactCrop>
        </div>

        {/* Bottom Controls */}
        <div className="bg-slate-800 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={rotateImage}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-xs font-semibold hover:bg-slate-600"
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Rotate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEnhancing(!isEnhancing)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    isEnhancing
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                      : 'border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  <Wand2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Scan Filter (B&W)</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="rounded-lg border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isProcessing ? 'Processing' : 'Done'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
