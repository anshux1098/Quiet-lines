import { useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (jsonData: string) => { success: boolean; error?: string };
}

export function ImportDialog({ isOpen, onClose, onConfirm }: ImportDialogProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');
    
    if (!file) {
      setFileContent(null);
      setFileName('');
      return;
    }

    if (!file.name.endsWith('.json')) {
      setError('Please select a JSON file');
      setFileContent(null);
      setFileName('');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
    };
    reader.onerror = () => {
      setError('Could not read file');
      setFileContent(null);
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    if (!fileContent) return;
    
    const result = onConfirm(fileContent);
    if (result.success) {
      handleClose();
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  const handleClose = () => {
    setFileContent(null);
    setFileName('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent className="bg-card border-border max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl text-foreground">
            Restore from file
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This will replace everything currently saved.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
            id="import-file-input"
          />
          <label
            htmlFor="import-file-input"
            className="block w-full p-4 border border-dashed border-border rounded-lg text-center cursor-pointer hover:border-primary/50 transition-colors duration-gentle"
          >
            {fileName ? (
              <span className="text-foreground">{fileName}</span>
            ) : (
              <span className="text-muted-foreground">Choose a file...</span>
            )}
          </label>
          
          {error && (
            <p className="mt-2 text-sm text-muted-foreground italic text-center">
              {error}
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleClose}
            className="bg-transparent border-border text-muted-foreground hover:bg-muted"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!fileContent}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Restore
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
