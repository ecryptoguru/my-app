'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';

// Import file parsing libraries
import * as XLSX from 'xlsx';
// We need to import pdfjs in a special way for Next.js
import * as pdfjs from 'pdfjs-dist';

// Define the props interface
interface FileUploadProps {
  onFileProcessed: (data: unknown, fileUrl: string) => void;
  allowedFileTypes?: string[];
  maxSizeMB?: number;
  bucketName?: string;
}

// Define the file processing state type
type FileStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

// Define PDF text content interfaces based on pdfjs types
interface TextItem {
  str: string;
  [key: string]: unknown;
}

interface TextContent {
  items: Array<TextItem>;
  [key: string]: unknown;
}

export default function FileUpload({
  onFileProcessed,
  allowedFileTypes = ['.pdf', '.xlsx', '.xls', '.docx'],
  maxSizeMB = 10,
  bucketName = 'uploads'
}: FileUploadProps) {
  // State management
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<FileStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = useCallback(
    async (selectedFile: File) => {
      try {
        // Reset states
        setError(null);
        setFile(selectedFile);
        
        // Validate file type
        const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
        if (!allowedFileTypes.includes(fileExtension)) {
          throw new Error(`File type not supported. Please upload ${allowedFileTypes.join(', ')} files.`);
        }
        
        // Validate file size
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`File size exceeds the maximum limit of ${maxSizeMB}MB.`);
        }

        // Start processing
        setStatus('uploading');
        setProgress(10);

        // Upload to Supabase
        const fileName = `${Date.now()}_${selectedFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        setProgress(40);
        
        // Get the file URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        setProgress(50);
        setStatus('processing');

        // Parse the file based on its type
        let parsedData: unknown;

        if (fileExtension === '.pdf') {
          parsedData = await parsePDF(selectedFile);
        } else if (['.xlsx', '.xls'].includes(fileExtension)) {
          parsedData = await parseExcel(selectedFile);
        } else if (fileExtension === '.docx') {
          parsedData = await parseDocx(selectedFile);
        }

        setProgress(90);

        // Call the callback with the parsed data and file URL
        onFileProcessed(parsedData, publicUrl);
        
        setProgress(100);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      }
    },
    [allowedFileTypes, maxSizeMB, bucketName, onFileProcessed]
  );

  // Parse PDF files
  const parsePDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Using pdfjs directly as imported at the top
      const pdf = await pdfjs.getDocument(new Uint8Array(arrayBuffer)).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent() as TextContent;
        
        // Extract text from each item
        const pageText = content.items
          .filter((item): item is TextItem => 'str' in item)
          .map(item => item.str)
          .join(' ');
          
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file');
    }
  };

  // Parse Excel files
  const parseExcel = async (file: File): Promise<Record<string, unknown[]>> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Convert to JSON
      const result: Record<string, unknown[]> = {};
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        result[sheetName] = XLSX.utils.sheet_to_json(worksheet);
      });
      
      return result;
    } catch (error) {
      console.error('Error parsing Excel:', error);
      throw new Error('Failed to parse Excel file');
    }
  };

  // Parse DOCX files
  const parseDocx = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Using dynamic import for mammoth to avoid issues with SSR
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('Error parsing DOCX:', error);
      throw new Error('Failed to parse DOCX file');
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  // Handle button click to open file dialog
  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File upload area */}
      <Card className={`border-2 ${dragActive ? 'border-primary border-dashed bg-primary/5' : 'border-border'}`}>
        <CardContent className="p-6">
          <div
            className="flex flex-col items-center justify-center gap-4"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              // Upload prompt
              <>
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Drag and drop your file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports {allowedFileTypes.join(', ')} (Max: {maxSizeMB}MB)
                  </p>
                </div>
                <Button
                  onClick={handleButtonClick}
                  variant="outline"
                  className="mt-2"
                >
                  Select File
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept={allowedFileTypes.join(',')}
                  onChange={handleInputChange}
                />
              </>
            ) : (
              // File selected view
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <File className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </span>
                  </div>
                  {status !== 'uploading' && status !== 'processing' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Progress indicator */}
                {(status === 'uploading' || status === 'processing') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {status === 'uploading' ? 'Uploading...' : 'Processing...'}
                      </span>
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>
                )}

                {/* Success message */}
                {status === 'success' && (
                  <div className="text-center text-sm text-primary font-medium mt-2">
                    File processed successfully!
                  </div>
                )}

                {/* Loading indicator */}
                {(status === 'uploading' || status === 'processing') && (
                  <div className="flex justify-center mt-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
