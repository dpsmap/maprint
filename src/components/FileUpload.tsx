import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileUp } from 'lucide-react';
import { t } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
}

export function FileUpload({ onFilesSelected, isLoading }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.shp', '.shx', '.dbf', '.prj', '.cpg'],
    },
    multiple: true,
    disabled: isLoading
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'upload-zone text-center font-myanmar',
        isDragActive && 'active',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {isLoading ? (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <FileUp className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{t.processing}</p>
          </>
        ) : (
          <>
            <div className={cn(
              'w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform',
              isDragActive && 'scale-110 bg-primary/20'
            )}>
              <Upload className={cn(
                'w-6 h-6 text-primary transition-transform',
                isDragActive && 'scale-110'
              )} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? t.dropFilesHere : t.uploadFiles}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.orClickToSelect}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.supportedFormats}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
