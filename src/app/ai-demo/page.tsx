'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Sparkles, LineChart, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { generateText, timeSeriesForecasting, analyzeDocument, generateImage } from '@/lib/deepseek';

// Demo data for time series
const DEMO_TIME_SERIES = [120, 132, 145, 155, 159, 170, 182, 191, 201, 220, 228, 240];

interface ResultData {
  text?: string;
  forecast?: number[];
  historical?: number[];
  imageUrl?: string;
  [key: string]: unknown;
}

export default function AIDemo() {
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);

  // Text generation state
  const [textPrompt, setTextPrompt] = useState('');
  
  // Time series state
  const [periods, setPeriods] = useState(5);
  
  // Document analysis state
  const [documentText, setDocumentText] = useState('');
  const [analysisType, setAnalysisType] = useState<'summary' | 'entities' | 'sentiment' | 'keywords'>('summary');
  
  // Image generation state
  const [imagePrompt, setImagePrompt] = useState('');

  // Handle text generation
  const handleGenerateText = async () => {
    if (!textPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateText(textPrompt);
      
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error?.message || 'Failed to generate text');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle time series forecasting
  const handleForecast = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await timeSeriesForecasting(DEMO_TIME_SERIES, periods);
      
      if (response.success && response.data) {
        setResult({
          historical: DEMO_TIME_SERIES,
          forecast: response.data.forecast
        });
      } else {
        setError(response.error?.message || 'Failed to generate forecast');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle document analysis
  const handleAnalyzeDocument = async () => {
    if (!documentText.trim()) {
      setError('Please enter document text');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeDocument(documentText, analysisType);
      
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error?.message || 'Failed to analyze document');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle image generation
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateImage(imagePrompt);
      
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error?.message || 'Failed to generate image');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 p-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center mb-6 text-sm hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">AI Features Demo</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Text Generation</span>
              <span className="sm:hidden">Text</span>
            </TabsTrigger>
            <TabsTrigger value="timeseries" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">Forecasting</span>
              <span className="sm:hidden">Chart</span>
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Document Analysis</span>
              <span className="sm:hidden">Doc</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Image Generation</span>
              <span className="sm:hidden">Image</span>
            </TabsTrigger>
          </TabsList>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <TabsContent value="text">
            <Card>
              <CardHeader>
                <CardTitle>Text Generation</CardTitle>
                <CardDescription>
                  Generate AI-powered text based on your prompt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-prompt">Your Prompt</Label>
                  <Textarea
                    id="text-prompt"
                    placeholder="Enter your prompt here..."
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                {result && result.text && (
                  <div className="space-y-2 mt-4">
                    <Label>Generated Text</Label>
                    <div className="p-4 bg-muted rounded-md overflow-auto max-h-[300px]">
                      <p className="whitespace-pre-wrap">{result.text}</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleGenerateText} 
                  disabled={loading || !textPrompt.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Text
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeseries">
            <Card>
              <CardHeader>
                <CardTitle>Time Series Forecasting</CardTitle>
                <CardDescription>
                  Predict future values based on historical data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="periods">Number of Periods to Forecast</Label>
                  <Input
                    id="periods"
                    type="number"
                    min={1}
                    max={20}
                    value={periods}
                    onChange={(e) => setPeriods(parseInt(e.target.value) || 1)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Historical Data</Label>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="font-mono text-sm">{JSON.stringify(DEMO_TIME_SERIES)}</p>
                  </div>
                </div>
                
                {result && result.forecast && (
                  <div className="space-y-2 mt-4">
                    <Label>Forecast Result</Label>
                    <div className="p-4 bg-muted rounded-md">
                      <p className="font-mono text-sm">{JSON.stringify(result.forecast)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleForecast} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Forecasting...
                    </>
                  ) : (
                    <>
                      <LineChart className="mr-2 h-4 w-4" />
                      Generate Forecast
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="document">
            <Card>
              <CardHeader>
                <CardTitle>Document Analysis</CardTitle>
                <CardDescription>
                  Extract insights from text documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-text">Document Text</Label>
                  <Textarea
                    id="document-text"
                    placeholder="Paste your document text here..."
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="analysis-type">Analysis Type</Label>
                  <select
                    id="analysis-type"
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value as 'summary' | 'entities' | 'sentiment' | 'keywords')}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="summary">Summary</option>
                    <option value="entities">Entity Extraction</option>
                    <option value="sentiment">Sentiment Analysis</option>
                    <option value="keywords">Keyword Extraction</option>
                  </select>
                </div>
                
                {result && (
                  <div className="space-y-2 mt-4">
                    <Label>Analysis Result</Label>
                    <div className="p-4 bg-muted rounded-md overflow-auto max-h-[300px]">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleAnalyzeDocument} 
                  disabled={loading || !documentText.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Analyze Document
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="image">
            <Card>
              <CardHeader>
                <CardTitle>Image Generation</CardTitle>
                <CardDescription>
                  Create AI-generated images from text descriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-prompt">Image Description</Label>
                  <Textarea
                    id="image-prompt"
                    placeholder="Describe the image you want to generate..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                {result && result.imageUrl && (
                  <div className="space-y-2 mt-4">
                    <Label>Generated Image</Label>
                    <div className="overflow-hidden rounded-md border border-border">
                      <Image 
                        src={result.imageUrl} 
                        alt="AI-generated image" 
                        width={1024}
                        height={1024}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleGenerateImage} 
                  disabled={loading || !imagePrompt.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Image...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
