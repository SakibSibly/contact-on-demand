import React, { useState, useRef } from 'react';
import api from '../lib/api';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Upload, FileText } from 'lucide-react';

interface UploadVCFDialogProps {
  userId: string;
  onContactsUploaded: () => void;
}

export const UploadVCFDialog: React.FC<UploadVCFDialogProps> = ({ userId, onContactsUploaded }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.vcf') || selectedFile.name.endsWith('.vcard') || selectedFile.type === 'text/vcard' || selectedFile.type === 'text/x-vcard') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid .vcf file');
        setFile(null);
      }
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      console.log('Uploading VCF file:', file.name);
      const response = await api.post('/contacts/upload-vcf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload successful:', response.data);
      const imported = response.data.count || 0;
      const skipped = response.data.skipped || 0;
      let successMsg = `Successfully imported ${imported} contact(s)`;
      if (skipped > 0) {
        successMsg += ` (${skipped} skipped)`;
      }
      setSuccess(successMsg);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => {
        setOpen(false);
        setSuccess('');
        onContactsUploaded();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to upload VCF file:', err);
      setError(err.response?.data?.detail || 'Failed to upload VCF file');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={(e) => { e.stopPropagation(); setOpen(true); }}>
          <Upload className="h-4 w-4 mr-2" />
          Import VCF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Import Contacts from VCF</DialogTitle>
          <DialogDescription>
            Upload a .vcf (vCard) file to import contacts with their phone numbers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              className="h-32 border-2 border-dashed"
              disabled={loading}
            >
              <div className="flex flex-col items-center">
                <FileText className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  {file ? (
                    <span className="font-semibold">{file.name}</span>
                  ) : (
                    <>
                      <span className="font-semibold">Click to upload</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">.vcf or .vcard files</p>
              </div>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".vcf,.vcard,text/vcard,text/x-vcard"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {success}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading || !file}>
            {loading ? 'Importing...' : 'Import Contacts'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
