import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // em MB
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value: _value, // renomeado para evitar erro TS6133
  onChange,
  accept = "image/*",
  maxSize = 5,
  className = ""
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
      return;
    }

    onChange(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          id="file-upload"
        />
        
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg"
            />
            <Button
              type="button"
              variant="outline"
              onClick={removeFile}
              className="mx-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Remover
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">
                Arraste uma imagem aqui ou
              </p>
              <label htmlFor="file-upload">
                <Button type="button" variant="outline" className="mt-2">
                  Selecionar arquivo
                </Button>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: JPG, PNG, GIF (máx. {maxSize}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
