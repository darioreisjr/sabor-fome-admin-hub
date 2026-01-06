import { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Camera } from 'lucide-react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'product-images',
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Sync preview with value prop changes (for editing existing products)
  useEffect(() => {
    setPreview(value);
  }, [value]);

  const stopCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
  };

  useEffect(() => {
    if (!isCameraOpen) {
      stopCameraStream();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      toast({
        title: 'Camera nao suportada',
        description: 'Seu navegador nao suporta acesso a camera. Use a galeria.',
        variant: 'destructive',
      });
      setIsCameraOpen(false);
      return;
    }

    let cancelled = false;
    setIsCameraLoading(true);

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      .then(stream => {
        if (cancelled) return;
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      })
      .catch(error => {
        console.error('Error accessing camera:', error);
        toast({
          title: 'Falha ao abrir camera',
          description: 'Verifique as permissoes do navegador e tente novamente.',
          variant: 'destructive',
        });
        setIsCameraOpen(false);
      })
      .finally(() => {
        if (!cancelled) {
          setIsCameraLoading(false);
        }
      });

    return () => {
      cancelled = true;
      stopCameraStream();
    };
  }, [isCameraOpen, toast]);

  const processFile = async (file: File) => {
    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      toast({
        title: 'Formato invalido',
        description: `Por favor, selecione uma imagem nos formatos: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: 'Arquivo muito grande',
        description: `O tamanho maximo permitido e ${maxSizeMB}MB. Seu arquivo tem ${fileSizeMB.toFixed(2)}MB`,
        variant: 'destructive',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Delete old image if exists and is not a placeholder
      if (value && !value.includes('placeholder.svg') && value.includes(bucket)) {
        const oldPath = value.split(`${bucket}/`)[1];
        if (oldPath) {
          try {
            await supabase.storage.from(bucket).remove([oldPath]);
          } catch (deleteError) {
            // Ignore delete errors - continue with upload
            console.warn('Could not delete old image:', deleteError);
          }
        }
      }

      // Try upload with upsert true to avoid conflicts
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Changed to true to overwrite if exists
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(uploadError.message || 'Erro ao fazer upload da imagem. Verifique se o bucket esta configurado corretamente.');
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrlData.publicUrl);

      toast({
        title: 'Imagem enviada',
        description: 'A imagem foi enviada com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Erro ao enviar',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao enviar a imagem. Verifique se o bucket "product-images" existe e esta publico.',
        variant: 'destructive',
      });
      setPreview(value); // Restore old preview on error
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
    event.target.value = '';
  };

  const handleRemove = async () => {
    // Delete from storage if not a placeholder
    if (value && !value.includes('placeholder.svg') && value.includes(bucket)) {
      try {
        const path = value.split(`${bucket}/`)[1];
        if (path) {
          await supabase.storage.from(bucket).remove([path]);
        }
      } catch (error) {
        // Ignore delete errors
        console.warn('Error deleting image:', error);
      }
    }

    onChange('/placeholder.svg');
    setPreview('/placeholder.svg');
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    if (navigator.mediaDevices?.getUserMedia) {
      setIsCameraOpen(true);
      return;
    }

    cameraInputRef.current?.click();
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast({
        title: 'Camera nao pronta',
        description: 'Aguarde a camera carregar e tente novamente.',
        variant: 'destructive',
      });
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async blob => {
      if (!blob) {
        toast({
          title: 'Falha ao capturar',
          description: 'Nao foi possivel capturar a imagem.',
          variant: 'destructive',
        });
        return;
      }

      const file = new File([blob], `camera-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      await processFile(file);
      setIsCameraOpen(false);
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted relative group">
        <img
          src={preview}
          alt="Preview"
          className="h-full w-full object-cover"
        />

        {/* Overlay with actions - only show when there's an actual image */}
        {!uploading && preview !== '/placeholder.svg' && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClick}
              className="gap-1 px-2"
            >
              <Upload className="h-4 w-4" />
              Galeria
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCameraClick}
              className="gap-1 px-2"
            >
              <Camera className="h-4 w-4" />
              Câmera
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="gap-1 px-2"
            >
              <X className="h-4 w-4" />
              Remover
            </Button>
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Enviando...</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Dialog
        open={isCameraOpen}
        onOpenChange={open => {
          if (!open) stopCameraStream();
          setIsCameraOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Camera</DialogTitle>
            <DialogDescription>
              Capture uma foto para enviar como imagem do produto.
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-black">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              autoPlay
            />
            {isCameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-sm">Abrindo camera...</p>
                </div>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCameraOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCapture}
              disabled={isCameraLoading}
              className="gap-2"
            >
              <Camera className="h-4 w-4" />
              Capturar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={uploading}
          className="flex-1 gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {preview !== '/placeholder.svg' ? 'Galeria' : 'Escolher'}
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleCameraClick}
          disabled={uploading}
          className="flex-1 gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              Câmera
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Formatos aceitos: JPG, PNG, WEBP. Máximo {maxSizeMB}MB.
      </p>
    </div>
  );
}
