'use client';

import { useState, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUpload from '@/components/FileUpload';
import { callDeepSeek } from '@/lib/deepseek';
import { insertRecord } from '@/lib/supabase';
import { Loader2, Save, FileText, BarChart, Database } from 'lucide-react';
import { useSession } from 'next-auth/react';

// Types for the feature page
export interface FeaturePageProps {
  title: string;
  description: string;
  apiEndpoint: string;
  allowedFileTypes?: string[];
  children?: ReactNode;
  inputSection?: ReactNode;
  mappingSection?: ReactNode;
  processingSection?: ReactNode;
  visualizationSection?: ReactNode;
  storageSection?: ReactNode;
  onCustomProcess?: (data: unknown) => Promise<unknown>;
  tableName: string;
}

// Types for the data state
export interface ProcessedData {
  input: unknown;
  mapped?: unknown;
  result?: unknown;
  error?: string;
}

export default function FeaturePage({
  title,
  description,
  apiEndpoint,
  allowedFileTypes = ['.pdf', '.xlsx', '.xls', '.docx'],
  children,
  inputSection,
  mappingSection,
  processingSection,
  visualizationSection,
  storageSection,
  onCustomProcess,
  tableName
}: FeaturePageProps) {
  // State management
  const [activeTab, setActiveTab] = useState('input');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<ProcessedData>({ input: null });
  const [fileUrl, setFileUrl] = useState<string>('');
  const { data: session } = useSession();

  // Handle file upload and processing
  const handleFileProcessed = (processedData: unknown, url: string) => {
    setData({ input: processedData });
    setFileUrl(url);
    setActiveTab('mapping');
  };

  // Handle data mapping
  const handleDataMapped = (mappedData: unknown) => {
    setData(prev => ({ ...prev, mapped: mappedData }));
    setActiveTab('processing');
  };

  // Process data with DeepSeek API
  const processData = async () => {
    if (!data.mapped) {
      return;
    }

    setIsProcessing(true);
    try {
      let result;
      
      if (onCustomProcess) {
        // Use custom processing function if provided
        result = await onCustomProcess(data.mapped);
      } else {
        // Use default DeepSeek API call
        const response = await callDeepSeek({
          endpoint: apiEndpoint,
          data: { input: data.mapped }
        });
        
        if (!response.success) {
          throw new Error(response.error?.message || 'Processing failed');
        }
        
        result = response.data;
      }
      
      setData(prev => ({ ...prev, result }));
      setActiveTab('visualization');
    } catch (error) {
      setData(prev => ({ ...prev, error: (error as Error).message }));
    } finally {
      setIsProcessing(false);
    }
  };

  // Save data to Supabase
  const saveData = async () => {
    if (!data.result || !session?.user?.id) {
      return;
    }

    setIsSaving(true);
    try {
      await insertRecord(tableName, {
        title: `${title} - ${new Date().toLocaleString()}`,
        data: data.result,
        input_data: data.input,
        mapped_data: data.mapped,
        user_id: session.user.id,
        file_url: fileUrl
      });
      
      alert('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert(`Error saving data: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="input" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Input</span>
          </TabsTrigger>
          <TabsTrigger value="mapping" disabled={!data.input} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Mapping</span>
          </TabsTrigger>
          <TabsTrigger value="processing" disabled={!data.mapped} className="flex items-center gap-2">
            <Loader2 className="h-4 w-4" />
            <span>Processing</span>
          </TabsTrigger>
          <TabsTrigger value="visualization" disabled={!data.result} className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Visualization</span>
          </TabsTrigger>
          <TabsTrigger value="storage" disabled={!data.result} className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Storage</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Input</CardTitle>
              <CardDescription>
                Upload a file or enter data manually to begin analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inputSection || (
                <FileUpload 
                  onFileProcessed={handleFileProcessed}
                  allowedFileTypes={allowedFileTypes}
                  bucketName="uploads"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Mapping</CardTitle>
              <CardDescription>
                Map your data fields to the required format
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mappingSection || (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      This is a placeholder for the data mapping interface. 
                      Implement a custom mapping section for each feature.
                    </AlertDescription>
                  </Alert>
                  
                  <Button onClick={() => handleDataMapped(data.input)}>
                    Use Default Mapping
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Processing</CardTitle>
              <CardDescription>
                Process your data with AI to generate insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processingSection || (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Your data will be processed using the DeepSeek API.
                      This may take a few moments.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={processData} 
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isProcessing ? 'Processing...' : 'Process Data'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Visualization</CardTitle>
              <CardDescription>
                View the results of your analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visualizationSection || (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      This is a placeholder for the data visualization.
                      Implement a custom visualization for each feature.
                    </AlertDescription>
                  </Alert>
                  
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(data.result, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => setActiveTab('storage')}>
                Continue to Storage
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Save Results</CardTitle>
              <CardDescription>
                Store your results for future reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              {storageSection || (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Your results will be saved to your account.
                      You can access them later from your dashboard.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={saveData} 
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Results'}
                    {!isSaving && <Save className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {children}
    </div>
  );
}
