import { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from './button';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sync preview with value prop changes (for editing existing products)
  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      toast({
        title: 'Formato inválido',
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
        description: `O tamanho máximo permitido é ${maxSizeMB}MB. Seu arquivo tem ${fileSizeMB.toFixed(2)}MB`,
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
        throw new Error(uploadError.message || 'Erro ao fazer upload da imagem. Verifique se o bucket está configurado corretamente.');
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
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao enviar a imagem. Verifique se o bucket "product-images" existe e está público.',
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
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Alterar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="gap-2"
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

      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={uploading}
        className="w-full gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {preview !== '/placeholder.svg' ? 'Atualizar imagem' : 'Escolher imagem'}
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Formatos aceitos: JPG, PNG, WEBP. Máximo {maxSizeMB}MB.
      </p>
    </div>
  );
}
