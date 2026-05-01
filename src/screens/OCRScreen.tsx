import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, Check, X, RefreshCcw, FileText, Wand2, Crop, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Cropper, { Area } from 'react-easy-crop';
import * as pdfjs from 'pdfjs-dist';
import { GoogleGenAI } from "@google/genai";

// PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface OCRScreenProps {
  onCapture?: (text: string) => void;
}

export default function OCRScreen({ onCapture }: OCRScreenProps) {
  const [mode, setMode] = useState<'camera' | 'upload' | 'refine'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setMode('camera');
      setError(null);
    } catch (err) {
      console.error("Scanner: Camera error", err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL('image/jpeg'));
        setMode('upload'); // Transition to crop/upload mode
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = async () => {
    if (!capturedImage || !croppedAreaPixels) return null;

    const image = new Image();
    image.src = capturedImage;
    await new Promise(resolve => image.onload = resolve);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const processOCR = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const imageData = await getCroppedImage();
      if (!imageData) throw new Error("Processing failed: Image data empty");

      // Initialize Gemini AI
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      const base64Data = imageData.split(',')[1];
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
              }
            },
            {
              text: "Extract all text from this image. Fix any common OCR typos. If it looks like a note, list, or document, preserve the structure. Only return the extracted text."
            }
          ]
        }
      });

      const text = result.text || "No text extracted.";
      setOcrText(text);
      setMode('refine');
    } catch (err) {
      console.error("AI: OCR failure", err);
      setError("Neural engine failed to parse image. Please try again with better lighting.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
        setMode('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full bg-slate-950 flex flex-col font-sans relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
      {/* Dynamic Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full animate-pulse ${isProcessing ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`} />
           <span className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">
             {mode.toUpperCase()} MODE
           </span>
        </div>
        <button onClick={() => setMode('camera')} className="text-slate-500 hover:text-white transition-colors">
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === 'camera' && (
            <motion.div 
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover grayscale brightness-125 contrast-125" 
              />
              {/* Scanner HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                <div className="w-full h-full border-2 border-blue-500/30 relative">
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500" />
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500" />
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500" />
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500" />
                   {/* Scanning Line */}
                   <div className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-scan" />
                </div>
              </div>
              
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 bg-slate-900/80 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                </button>
                <button 
                  onClick={captureImage}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-90 transition-transform"
                >
                  <div className="w-16 h-16 border-4 border-slate-950 rounded-full" />
                </button>
                <div className="w-12 h-12 invisible" />
              </div>
            </motion.div>
          )}

          {mode === 'upload' && capturedImage && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900"
            >
              <Cropper
                image={capturedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
              <div className="absolute bottom-10 inset-x-4 flex gap-4">
                 <button 
                   onClick={() => setMode('camera')}
                   className="flex-1 py-4 bg-slate-950/80 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500"
                 >
                   RELOAD
                 </button>
                 <button 
                   onClick={processOCR}
                   disabled={isProcessing}
                   className="flex-3 py-4 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                 >
                   {isProcessing ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                       ANALYZING_CONTEXT...
                     </>
                   ) : (
                     <>
                       <Wand2 className="w-4 h-4" />
                       RUN_NEURAL_PARSE
                     </>
                   )}
                 </button>
              </div>
            </motion.div>
          )}

          {mode === 'refine' && (
            <motion.div 
              key="refine"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-slate-950 p-6 flex flex-col"
            >
              <div className="flex-1 bg-slate-900 rounded-3xl p-6 border border-white/5 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4 text-blue-500">
                   <Check className="w-5 h-5" />
                   <h3 className="text-xs font-black uppercase tracking-widest">Parsing Successful</h3>
                </div>
                <textarea 
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  className="w-full h-full bg-transparent border-none focus:ring-0 text-sm leading-relaxed text-slate-300 font-medium font-mono resize-none"
                  placeholder="No data extracted..."
                />
              </div>
              <div className="mt-6 flex gap-4">
                 <button 
                   onClick={() => setMode('camera')}
                   className="p-4 bg-slate-900 rounded-2xl text-slate-500 hover:text-white transition-colors"
                 >
                   <RefreshCcw className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={() => onCapture?.(ocrText)}
                   className="flex-1 py-4 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                 >
                   INTEGRATE_INTO_WORKSPACE
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="image/*" 
      />

      {error && (
        <div className="absolute top-20 inset-x-4 bg-red-500/90 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3 text-white z-50 animate-in slide-in-from-top-4">
           <X className="w-5 h-5 shrink-0" onClick={() => setError(null)} />
           <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0% }
          100% { top: 100% }
        }
        .animate-scan {
          animation: scan 2.5s linear infinite;
        }
      `}</style>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
