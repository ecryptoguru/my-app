'use client';

import { useState } from 'react';
import FeaturePage from '@/components/FeaturePage';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define types for our data
interface HistoricalData {
  [key: string]: number | number[];
}

interface ForecastParams {
  periods: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  seasonality: boolean;
}

interface MappedData {
  historicalData: HistoricalData;
  forecastParams: ForecastParams;
}

interface ForecastResult {
  forecast: number[];
  confidence: number;
  method: string;
}

interface ChartDataPoint {
  period: string;
  value: number;
  type: 'Historical' | 'Forecast';
}

export default function DemandForecasting() {
  const { status } = useSession();
  const router = useRouter();
  const [mappedData, setMappedData] = useState<MappedData | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  // Custom mapping component for demand forecasting
  const MappingSection = ({ data, onMapped }: { data: unknown, onMapped: (data: MappedData) => void }) => {
    const [periods, setPeriods] = useState(12);
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    
    const handleMapping = () => {
      // Create a mapped data object with the necessary parameters
      const mappedDataObj: MappedData = {
        historicalData: data as HistoricalData,
        forecastParams: {
          periods,
          frequency,
          seasonality: true
        }
      };
      
      setMappedData(mappedDataObj);
      onMapped(mappedDataObj);
    };
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="periods">Forecast Periods</Label>
          <Input 
            id="periods" 
            type="number" 
            value={periods} 
            onChange={(e) => setPeriods(parseInt(e.target.value))} 
            min={1} 
            max={36}
          />
          <p className="text-sm text-muted-foreground">Number of periods to forecast ahead</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="frequency">Data Frequency</Label>
          <Select value={frequency} onValueChange={(value) => setFrequency(value as 'daily' | 'weekly' | 'monthly')}>
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">How often your data points occur</p>
        </div>
        
        <Button onClick={handleMapping} className="w-full">Map Data</Button>
      </div>
    );
  };

  // Custom visualization component for demand forecasting
  const VisualizationSection = ({ result }: { result: ForecastResult | null }) => {
    if (!result || !result.forecast) {
      return <p>No forecast data available</p>;
    }
    
    // Combine historical and forecast data for visualization
    const chartData: ChartDataPoint[] = [];
    
    // Add historical data
    if (mappedData && mappedData.historicalData) {
      const historicalValues = Array.isArray(mappedData.historicalData) 
        ? mappedData.historicalData 
        : Object.values(mappedData.historicalData);
        
      historicalValues.forEach((value: number, index: number) => {
        chartData.push({
          period: `Past ${index + 1}`,
          value,
          type: 'Historical'
        });
      });
    }
    
    // Add forecast data
    result.forecast.forEach((value: number, index: number) => {
      chartData.push({
        period: `Future ${index + 1}`,
        value,
        type: 'Forecast'
      });
    });
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Demand Forecast</CardTitle>
            <CardDescription>
              Forecast for the next {mappedData?.forecastParams?.periods} {mappedData?.forecastParams?.frequency} periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 space-y-2">
              <h4 className="font-medium">Forecast Summary</h4>
              <p className="text-sm text-muted-foreground">
                Average forecasted demand: {result.forecast.reduce((a: number, b: number) => a + b, 0) / result.forecast.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Peak demand: {Math.max(...result.forecast)}
              </p>
              <p className="text-sm text-muted-foreground">
                Minimum demand: {Math.min(...result.forecast)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <FeaturePage
      title="Demand Forecasting"
      description="Predict future demand based on historical data to optimize inventory and resources"
      apiEndpoint="time-series-forecasting"
      allowedFileTypes={['.xlsx', '.xls', '.csv']}
      tableName="demand_forecasts"
      mappingSection={<MappingSection data={null} onMapped={() => {}} />}
      visualizationSection={<VisualizationSection result={null} />}
      onCustomProcess={async (data) => {
        // Type assertion for the data
        const typedData = data as MappedData;
        
        // In a real implementation, this would call the DeepSeek API
        // For now, we'll simulate a response
        const historicalData = Array.isArray(typedData.historicalData) 
          ? typedData.historicalData 
          : Object.values(typedData.historicalData);
        
        // Simple forecasting simulation
        const lastValue = historicalData[historicalData.length - 1] as number;
        const forecast = Array(typedData.forecastParams.periods).fill(0).map((_, i) => {
          // Add some randomness to the forecast
          return lastValue * (1 + (Math.random() * 0.2 - 0.1)) + i * (lastValue * 0.05);
        });
        
        return {
          forecast,
          confidence: 0.85,
          method: "Time Series Forecast with Seasonality"
        } as ForecastResult;
      }}
    />
  );
}
