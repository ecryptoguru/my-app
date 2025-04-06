'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UploadDemo() {
  const [processedData, setProcessedData] = useState<unknown>(null);
  const [fileUrl, setFileUrl] = useState<string>('');

  const handleFileProcessed = (data: unknown, url: string) => {
    setProcessedData(data);
    setFileUrl(url);
    console.log('Processed data:', data);
    console.log('File URL:', url);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Link href="/" className="inline-flex items-center mb-6 text-sm hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">File Upload Demo</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upload a File</CardTitle>
              <CardDescription>
                Upload PDF, Excel, or Word documents to process their content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFileProcessed={handleFileProcessed} />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Processed Data</CardTitle>
              <CardDescription>
                The content extracted from your file will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedData ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-md overflow-auto max-h-[400px]">
                    <pre className="text-xs whitespace-pre-wrap">
                      {typeof processedData === 'string' 
                        ? processedData 
                        : JSON.stringify(processedData, null, 2)}
                    </pre>
                  </div>
                  
                  {fileUrl && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">File URL:</h4>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted p-2 rounded flex-1 overflow-hidden overflow-ellipsis">
                          {fileUrl}
                        </code>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(fileUrl, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No data to display yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
