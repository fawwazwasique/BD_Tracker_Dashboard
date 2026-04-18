import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface BulkUploadDialogProps {
  title: string;
  templateHeaders: string[];
  onUpload: (data: any[]) => void;
}

export function BulkUploadDialog({ title, templateHeaders, onUpload }: BulkUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const csvContent = templateHeaders.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`Error parsing CSV: ${results.errors[0].message}`);
            return;
          }
          
          // Basic validation: check if at least some expected headers exist
          const uploadedHeaders = results.meta.fields || [];
          const missingHeaders = templateHeaders.filter(h => !uploadedHeaders.includes(h));
          
          if (missingHeaders.length === templateHeaders.length) {
            setError('Invalid CSV format. Please use the provided template.');
            return;
          }

          onUpload(results.data);
          setIsOpen(false);
        },
        error: (error: any) => {
          setError(`Error reading file: ${error.message}`);
        }
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="outline" className="gap-2 bg-white/80 backdrop-blur-xl border-slate-200 hover:bg-slate-50 hover:text-indigo-600 rounded-xl font-semibold shadow-sm transition-all" />}>
        <Upload className="w-4 h-4" /> Bulk Upload
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Bulk Upload {title}</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Upload multiple records at once using a CSV file.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="p-4 border border-indigo-100 rounded-xl bg-indigo-50/50 flex items-center justify-between group hover:bg-indigo-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">1. Download Template</h4>
                  <p className="text-xs font-medium text-slate-500">Get the correct column format</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={handleDownloadTemplate} className="gap-2 rounded-lg bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-100 shadow-sm">
                <Download className="w-4 h-4" /> Template
              </Button>
            </div>

            <div className="p-4 border border-purple-100 rounded-xl bg-purple-50/50 flex items-center justify-between group hover:bg-purple-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">2. Upload Data</h4>
                  <p className="text-xs font-medium text-slate-500">Select your filled CSV file</p>
                </div>
              </div>
              <div>
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Button onClick={() => fileInputRef.current?.click()} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                  <Upload className="w-4 h-4" /> Select File
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
