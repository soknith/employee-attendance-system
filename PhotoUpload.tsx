import { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, RotateCw, ZoomIn, ZoomOut, Check, Loader2, Crop } from 'lucide-react';

type PhotoUploadProps = {
  currentPhoto: string | null;
  onUpload: (file: File) => Promise<void>;
  onClose: () => void;
  lang: 'km' | 'en';
};

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MIN_DIM = 500;

export function PhotoUpload({ currentPhoto, onUpload, onClose, lang }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const t = (en: string, km: string) => lang === 'km' ? km : en;

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) {
      return t('Invalid format. Use PNG, JPG, or WEBP.', 'ទម្រង់មិនត្រឹមត្រូវ។ ប្រើ PNG, JPG ឬ WEBP។');
    }
    if (file.size > MAX_SIZE) {
      return t('File too large. Max 5MB.', 'ឯកសារធំពេក។ អតិបរមា 5MB។');
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    const err = validateFile(file);
    if (err) { setError(err); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        if (img.width < MIN_DIM || img.height < MIN_DIM) {
          setError(t(`Minimum resolution ${MIN_DIM}x${MIN_DIM}.`, `បំពង់អប្បបរមា ${MIN_DIM}x${MIN_DIM}។`));
          return;
        }
        setImageSrc(src);
        setImageEl(img);
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [lang]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const onMouseUp = () => setDragging(false);

  const cropAndCompress = (): File | null => {
    if (!imageEl || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const size = 500;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    const scaledW = imageEl.width * zoom;
    const scaledH = imageEl.height * zoom;
    const drawX = -scaledW / 2 + offset.x;
    const drawY = -scaledH / 2 + offset.y;
    ctx.drawImage(imageEl, drawX, drawY, scaledW, scaledH);
    ctx.restore();

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      setUploading(true);
      onUpload(file)
        .then(() => {
          setUploading(false);
          onClose();
        })
        .catch(() => {
          setUploading(false);
          setError(t('Upload failed.', 'បរាជ័យក្នុងការបង្ហោះ។'));
        });
    }, 'image/jpeg', 0.85);
    return null;
  };

  const handleConfirm = () => {
    setUploading(true);
    cropAndCompress();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl dark:bg-gray-800 sm:rounded-2xl animate-slide-in">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('Upload Photo', 'បង្ហោះរូបថត')}
          </h2>
          <button onClick={() => !uploading && onClose()} disabled={uploading} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!imageSrc ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragOver ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {currentPhoto && (
              <div className="mb-4 h-24 w-20 overflow-hidden rounded-lg border-2 border-gray-200">
                <img src={currentPhoto} alt="Current" className="h-full w-full object-cover" />
              </div>
            )}
            <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              {t('Drag & drop photo here', 'អូសដាក់រូបថតនៅទីនេះ')}
            </p>
            <p className="mb-4 text-xs text-gray-400">
              {t('PNG, JPG, WEBP — Max 5MB', 'PNG, JPG, WEBP — អតិបរមា 5MB')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                <Upload className="h-4 w-4" />
                {t('Gallery', 'ស្រុកហ្វ្រា')}
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Camera className="h-4 w-4" />
                {t('Camera', 'កាមេរ៉ា')}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={onFileSelect} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="user" onChange={onFileSelect} className="hidden" />
          </div>
        ) : (
          <div>
            {/* Crop area */}
            <div
              className="relative mx-auto mb-4 h-64 w-64 overflow-hidden rounded-xl bg-gray-900"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              style={{ cursor: dragging ? 'grabbing' : 'grab' }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={imageSrc}
                  alt="Crop"
                  className="max-h-full max-w-full select-none"
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  }}
                  draggable={false}
                />
              </div>
              {/* Crop overlay circle */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
              </div>
            </div>

            {/* Controls */}
            <div className="mb-4 flex items-center justify-center gap-2">
              <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                <ZoomIn className="h-4 w-4" />
              </button>
              <button onClick={() => setRotation((r) => r + 90)} className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                <RotateCw className="h-4 w-4" />
              </button>
              <button onClick={() => { setZoom(1); setRotation(0); setOffset({ x: 0, y: 0 }); }} className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                <Crop className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setImageSrc(null); setImageEl(null); }}
                disabled={uploading}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('Cancel', 'បោះបង់')}
              </button>
              <button
                onClick={handleConfirm}
                disabled={uploading}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {t('Confirm', 'បញ្ជាក់')}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <span className="mt-0.5 text-xs">{error}</span>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
