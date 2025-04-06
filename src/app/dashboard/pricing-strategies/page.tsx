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
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';

// Define types for our data
interface PricingItem {
  productId: string;
  cost: number;
  competitorPrice: number;
  marketDemand: number;
}

interface MappedData {
  pricingItems: PricingItem[];
  marginTarget: number;
  competitorWeight: number;
}

interface PricingRecommendation {
  productId: string;
  cost: number;
  competitorPrice: number;
  recommendedPrice: number;
  margin: number;
  priceChange: 'increase' | 'decrease' | 'maintain';
  changePercentage: number;
}

export default function PricingStrategies() {
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

  // Custom mapping component for pricing strategies
  const MappingSection = ({ data, onMapped }: { data: unknown, onMapped: (data: MappedData) => void }) => {
    const [marginTarget, setMarginTarget] = useState(30);
    const [competitorWeight, setCompetitorWeight] = useState(50);
    
    const handleMapping = () => {
      // Create a mapped data object with the necessary parameters
      const mappedDataObj: MappedData = {
        pricingItems: data as PricingItem[],
        marginTarget,
        competitorWeight: competitorWeight / 100
      };
      
      onMapped(mappedDataObj);
    };
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="marginTarget">Target Profit Margin (%)</Label>
          <Input 
            id="marginTarget" 
            type="number" 
            value={marginTarget} 
            onChange={(e) => setMarginTarget(parseInt(e.target.value))} 
            min={5} 
            max={80}
          />
          <p className="text-sm text-muted-foreground">Desired profit margin percentage</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="competitorWeight">Competitor Price Influence (%)</Label>
          <Input 
            id="competitorWeight" 
            type="number" 
            value={competitorWeight} 
            onChange={(e) => setCompetitorWeight(parseInt(e.target.value))} 
            min={0} 
            max={100}
          />
          <p className="text-sm text-muted-foreground">How much competitor pricing should influence recommendations (0-100%)</p>
        </div>
        
        <Button onClick={handleMapping} className="w-full">Generate Pricing Recommendations</Button>
      </div>
    );
  };

  // Custom visualization component for pricing recommendations
  const VisualizationSection = ({ result }: { result: PricingRecommendation[] | null }) => {
    if (!result || !result.length) {
      return <p>No pricing recommendations available</p>;
    }
    
    const getPriceChangeIcon = (change: string) => {
      switch (change) {
        case 'increase':
          return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
        case 'decrease':
          return <ArrowDownIcon className="h-5 w-5 text-red-500" />;
        case 'maintain':
          return <MinusIcon className="h-5 w-5 text-gray-500" />;
        default:
          return null;
      }
    };

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(value);
    };

    const formatPercentage = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value / 100);
    };
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pricing Recommendations</CardTitle>
            <CardDescription>
              Optimal pricing strategies based on costs, competitor prices, and market demand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Competitor Price</TableHead>
                  <TableHead>Recommended Price</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{formatCurrency(item.cost)}</TableCell>
                    <TableCell>{formatCurrency(item.competitorPrice)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(item.recommendedPrice)}</TableCell>
                    <TableCell>{formatPercentage(item.margin)}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {getPriceChangeIcon(item.priceChange)}
                      <span className={
                        item.priceChange === 'increase' 
                          ? 'text-green-600' 
                          : item.priceChange === 'decrease' 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                      }>
                        {item.priceChange === 'maintain' 
                          ? 'No change' 
                          : `${formatPercentage(item.changePercentage)} ${item.priceChange}`}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-6 space-y-2">
              <h4 className="font-medium">Pricing Summary</h4>
              <p className="text-sm text-muted-foreground">
                Average recommended margin: {formatPercentage(result.reduce((sum, item) => sum + item.margin, 0) / result.length)}
              </p>
              <p className="text-sm text-muted-foreground">
                Products with price increases: {result.filter(item => item.priceChange === 'increase').length}
              </p>
              <p className="text-sm text-muted-foreground">
                Products with price decreases: {result.filter(item => item.priceChange === 'decrease').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <FeaturePage
      title="Pricing Strategies"
      description="Optimize pricing to maximize profits while staying competitive"
      apiEndpoint="pricing-optimization"
      allowedFileTypes={['.xlsx', '.xls', '.csv']}
      tableName="pricing_strategies"
      mappingSection={<MappingSection data={null} onMapped={() => {}} />}
      visualizationSection={<VisualizationSection result={null} />}
      onCustomProcess={async (data) => {
        // Type assertion for the data
        const typedData = data as MappedData;
        
        // In a real implementation, this would call the DeepSeek API
        // For now, we'll simulate a response
        const recommendations: PricingRecommendation[] = typedData.pricingItems.map(item => {
          // Calculate base price from cost and target margin
          const basePrice = item.cost * (1 + typedData.marginTarget / 100);
          
          // Adjust based on competitor price and market demand
          const competitorInfluence = (item.competitorPrice - basePrice) * typedData.competitorWeight;
          const demandFactor = (item.marketDemand / 50) - 1; // Normalize demand to a factor around 0
          
          // Calculate recommended price
          let recommendedPrice = basePrice + competitorInfluence + (basePrice * demandFactor * 0.1);
          
          // Ensure minimum margin
          recommendedPrice = Math.max(recommendedPrice, item.cost * 1.1);
          
          // Calculate actual margin
          const margin = ((recommendedPrice - item.cost) / recommendedPrice) * 100;
          
          // Determine if price is changing
          let priceChange: 'increase' | 'decrease' | 'maintain' = 'maintain';
          let changePercentage = 0;
          
          // Compare to competitor price
          if (recommendedPrice > item.competitorPrice * 1.02) {
            priceChange = 'increase';
            changePercentage = ((recommendedPrice / item.competitorPrice) - 1) * 100;
          } else if (recommendedPrice < item.competitorPrice * 0.98) {
            priceChange = 'decrease';
            changePercentage = (1 - (recommendedPrice / item.competitorPrice)) * 100;
          }
          
          return {
            productId: item.productId,
            cost: item.cost,
            competitorPrice: item.competitorPrice,
            recommendedPrice,
            margin,
            priceChange,
            changePercentage
          };
        });
        
        return recommendations;
      }}
    />
  );
}
