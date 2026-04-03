import { useState, useCallback, useEffect } from 'react';
import { Loader2, Check, X, Wand2, RefreshCcw } from 'lucide-react';

// Helper to create an Image object from a URL
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

  const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  const side = 3;
  const halfSide = 1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dstOff = (y * w + x) * 4;
      let r = 0;
      let g = 0;
      let b = 0;

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

      dstBuff[dstOff] = data[dstOff] * (1 - strength) + r * strength;
      dstBuff[dstOff + 1] = data[dstOff + 1] * (1 - strength) + g * strength;
      dstBuff[dstOff + 2] = data[dstOff + 2] * (1 - strength) + b * strength;
      dstBuff[dstOff + 3] = data[dstOff + 3];
    }
  }

  ctx.putImageData(dstData, 0, 0);
};

// Process the image: apply rotation, optional B&W enhancement, resize, export as WebP
const getProcessedImage = async (imageSrc, rotation = 0, enhance = false) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  let finalW = image.width;
  let finalH = image.height;

  // Resize if too large (max dimension 1600px)
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

  // Swap dimensions for 90/270 rotation
  if (rotation === 90 || rotation === 270) {
    canvas.width = finalH;
    canvas.height = finalW;
  } else {
    canvas.width = finalW;
    canvas.height = finalH;
  }

  ctx.filter = enhance ? 'contrast(1.6) brightness(1.2) grayscale(100%)' : 'none';
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image, 0, 0, image.width, image.height, -finalW / 2, -finalH / 2, finalW, finalH);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (enhance) {
    try {
      applySharpen(ctx, canvas.width, canvas.height, 0.45);
    } catch (e) {
      console.error('Sharpen failed:', e);
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

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => setImageSrc(reader.result));
    reader.readAsDataURL(file);
  }, [file]);

  const rotateImage = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    try {
      const blob = await getProcessedImage(imageSrc, rotation, isEnhancing);
      const newFile = new File([blob], 'scanned_slip.webp', { type: 'image/webp' });
      onConfirm(newFile);
    } catch (e) {
      console.error(e);
      alert('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, rotation, isEnhancing, onConfirm]);

  if (!imageSrc) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  const previewStyle = {
    transform: `rotate(${rotation}deg)`,
    filter: isEnhancing ? 'contrast(1.6) brightness(1.2) grayscale(100%)' : 'none',
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    transition: 'transform 0.3s ease, filter 0.3s ease',
  };

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-slate-950 p-0 text-white backdrop-blur-[2px] md:p-6">
      <div className="flex flex-1 flex-col overflow-hidden border border-slate-700 bg-slate-900 shadow-xl md:rounded-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-3">
          <h2 className="text-sm font-bold md:text-base">Document Preview</h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 transition hover:bg-slate-700"
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black p-4">
          <img
            src={imageSrc}
            alt="Document preview"
            style={previewStyle}
            className="max-h-[70vh]"
          />
        </div>

        {/* Bottom Controls */}
        <div className="bg-slate-800 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={rotateImage}
                disabled={isProcessing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-xs font-semibold hover:bg-slate-600 disabled:opacity-50"
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Rotate</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEnhancing((prev) => !prev)}
                disabled={isProcessing}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                  isEnhancing
                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                    : 'border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                <Wand2 className="h-4 w-4" />
                <span className="hidden sm:inline">Scan Filter (B&amp;W)</span>
              </button>
            </div>

            {/* Right: confirm/cancel */}
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
                {isProcessing ? 'Processing…' : 'Done'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
