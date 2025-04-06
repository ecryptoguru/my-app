'use client';

import { useState } from 'react';
import FeaturePage from '@/components/FeaturePage';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Define types for our data
interface SupplierData {
  supplierId: string;
  deliveryTime: number;
  qualityRating: number;
  responseTime?: number;
  costEfficiency?: number;
}

interface MappedData {
  suppliers: SupplierData[];
  qualityWeight: number;
  deliveryWeight: number;
}

interface SupplierPerformance {
  supplierId: string;
  deliveryTime: number;
  qualityRating: number;
  performanceScore: number;
  ranking: number;
  recommendation: string;
}

export default function SupplierPerformance() {
  const { status } = useSession();
  const router = useRouter();

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

  // Custom mapping component for supplier performance
  const MappingSection = ({ data, onMapped }: { data: unknown, onMapped: (data: MappedData) => void }) => {
    const [qualityWeight, setQualityWeight] = useState(60);
    const [deliveryWeight, setDeliveryWeight] = useState(40);
    
    const handleMapping = () => {
      // Create a mapped data object with the necessary parameters
      const mappedDataObj: MappedData = {
        suppliers: data as SupplierData[],
        qualityWeight: qualityWeight / 100,
        deliveryWeight: deliveryWeight / 100
      };
      
      onMapped(mappedDataObj);
    };
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="qualityWeight">Quality Importance (%)</Label>
          <Input 
            id="qualityWeight" 
            type="number" 
            value={qualityWeight} 
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              setQualityWeight(newValue);
              setDeliveryWeight(100 - newValue);
            }} 
            min={0} 
            max={100}
          />
          <p className="text-sm text-muted-foreground">How important is quality rating in the overall score</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="deliveryWeight">Delivery Time Importance (%)</Label>
          <Input 
            id="deliveryWeight" 
            type="number" 
            value={deliveryWeight}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              setDeliveryWeight(newValue);
              setQualityWeight(100 - newValue);
            }}
            min={0} 
            max={100}
            disabled
          />
          <p className="text-sm text-muted-foreground">How important is delivery time in the overall score (automatically calculated)</p>
        </div>
        
        <Button onClick={handleMapping} className="w-full">Analyze Supplier Performance</Button>
      </div>
    );
  };

  // Custom visualization component for supplier performance
  const VisualizationSection = ({ result }: { result: SupplierPerformance[] | null }) => {
    if (!result || !result.length) {
      return <p>No supplier performance data available</p>;
    }
    
    // Sort suppliers by performance score for the chart
    const sortedSuppliers = [...result].sort((a, b) => b.performanceScore - a.performanceScore);
    
    // Prepare data for bar chart
    const chartData = sortedSuppliers.map(supplier => ({
      name: supplier.supplierId,
      score: supplier.performanceScore,
      color: getScoreColor(supplier.performanceScore)
    }));
    
    // Color function based on score
    function getScoreColor(score: number) {
      if (score >= 85) return '#4CAF50'; // Green
      if (score >= 70) return '#8BC34A'; // Light Green
      if (score >= 60) return '#FFEB3B'; // Yellow
      if (score >= 50) return '#FF9800'; // Orange
      return '#F44336'; // Red
    }
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Performance Analysis</CardTitle>
            <CardDescription>
              Performance scores and rankings based on quality and delivery metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [Number(value).toFixed(1) + '/100', 'Performance Score']} />
                  <Legend />
                  <Bar dataKey="score" name="Performance Score">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Supplier ID</TableHead>
                  <TableHead>Quality Rating</TableHead>
                  <TableHead>Delivery Time (days)</TableHead>
                  <TableHead>Performance Score</TableHead>
                  <TableHead>Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSuppliers.map((supplier, index) => (
                  <TableRow key={index}>
                    <TableCell>{supplier.ranking}</TableCell>
                    <TableCell>{supplier.supplierId}</TableCell>
                    <TableCell>{supplier.qualityRating.toFixed(1)}/10</TableCell>
                    <TableCell>{supplier.deliveryTime}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getScoreColor(supplier.performanceScore) }}></div>
                        {supplier.performanceScore.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell>{supplier.recommendation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <FeaturePage
      title="Supplier Performance"
      description="Analyze and rank suppliers based on quality and delivery metrics"
      apiEndpoint="supplier-performance"
      allowedFileTypes={['.xlsx', '.xls', '.csv']}
      tableName="supplier_performance"
      mappingSection={<MappingSection data={null} onMapped={() => {}} />}
      visualizationSection={<VisualizationSection result={null} />}
      onCustomProcess={async (data) => {
        // Type assertion for the data
        const typedData = data as MappedData;
        
        // In a real implementation, this would call the DeepSeek API
        // For now, we'll simulate a response
        
        // Normalize delivery time (lower is better)
        const maxDeliveryTime = Math.max(...typedData.suppliers.map(s => s.deliveryTime));
        
        // Calculate performance scores
        const suppliersWithScores = typedData.suppliers.map(supplier => {
          // Normalize delivery time to 0-10 scale (inverted, since lower is better)
          const normalizedDelivery = 10 - ((supplier.deliveryTime / maxDeliveryTime) * 10);
          
          // Calculate weighted score (0-100 scale)
          const performanceScore = (
            (supplier.qualityRating * typedData.qualityWeight * 10) + 
            (normalizedDelivery * typedData.deliveryWeight * 10)
          );
          
          return {
            ...supplier,
            performanceScore
          };
        });
        
        // Sort by performance score and add rankings
        const sortedSuppliers = suppliersWithScores
          .sort((a, b) => b.performanceScore - a.performanceScore)
          .map((supplier, index) => ({
            ...supplier,
            ranking: index + 1
          }));
        
        // Add recommendations based on score
        const suppliersWithRecommendations = sortedSuppliers.map(supplier => {
          let recommendation = '';
          
          if (supplier.performanceScore >= 85) {
            recommendation = 'Preferred supplier';
          } else if (supplier.performanceScore >= 70) {
            recommendation = 'Maintain relationship';
          } else if (supplier.performanceScore >= 60) {
            recommendation = 'Monitor performance';
          } else if (supplier.performanceScore >= 50) {
            recommendation = 'Request improvements';
          } else {
            recommendation = 'Consider alternatives';
          }
          
          return {
            ...supplier,
            recommendation
          };
        });
        
        return suppliersWithRecommendations;
      }}
    />
  );
}
