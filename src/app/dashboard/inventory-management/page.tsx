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
import { Badge } from "@/components/ui/badge"; // Ensuring the Badge import is correctly formatted
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

// Define types for our data
interface InventoryItem {
  productId: string;
  currentStock: number;
}

interface MappedData {
  inventoryItems: InventoryItem[];
  leadTime: number;
  safetyFactor: number;
}

interface InventoryRecommendation {
  productId: string;
  currentStock: number;
  optimalStock: number;
  reorderQuantity: number;
  status: 'OK' | 'Low' | 'Critical';
}

export default function InventoryManagement() {
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

  // Custom input component for manual data entry
  const InputSection = ({ onFileProcessed }: { onFileProcessed: (data: unknown, url: string) => void }) => {
    const [items, setItems] = useState<InventoryItem[]>([
      { productId: 'P001', currentStock: 100 },
      { productId: 'P002', currentStock: 50 },
      { productId: 'P003', currentStock: 25 },
    ]);
    const [newProductId, setNewProductId] = useState('');
    const [newStock, setNewStock] = useState('');

    const addItem = () => {
      if (newProductId && newStock) {
        setItems([...items, { 
          productId: newProductId, 
          currentStock: parseInt(newStock) 
        }]);
        setNewProductId('');
        setNewStock('');
      }
    };

    const handleSubmit = () => {
      onFileProcessed(items, '');
    };

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Product ID</Label>
              <Input 
                id="productId" 
                value={newProductId} 
                onChange={(e) => setNewProductId(e.target.value)} 
                placeholder="Enter product ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input 
                id="currentStock" 
                type="number" 
                value={newStock} 
                onChange={(e) => setNewStock(e.target.value)} 
                placeholder="Enter current stock"
                min="0"
              />
            </div>
          </div>
          <Button onClick={addItem}>Add Item</Button>
        </div>

        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">Current Inventory</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Current Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.productId}</TableCell>
                  <TableCell>{item.currentStock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button onClick={handleSubmit} className="w-full">Use This Data</Button>
      </div>
    );
  };

  // Custom mapping component for inventory management
  const MappingSection = ({ data, onMapped }: { data: unknown, onMapped: (data: MappedData) => void }) => {
    const [leadTime, setLeadTime] = useState(7);
    const [safetyFactor, setSafetyFactor] = useState(1.5);
    
    const handleMapping = () => {
      // Create a mapped data object with the necessary parameters
      const mappedDataObj: MappedData = {
        inventoryItems: data as InventoryItem[],
        leadTime,
        safetyFactor
      };
      
      onMapped(mappedDataObj);
    };
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="leadTime">Lead Time (days)</Label>
          <Input 
            id="leadTime" 
            type="number" 
            value={leadTime} 
            onChange={(e) => setLeadTime(parseInt(e.target.value))} 
            min={1} 
            max={90}
          />
          <p className="text-sm text-muted-foreground">Average time between placing an order and receiving it</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="safetyFactor">Safety Factor</Label>
          <Input 
            id="safetyFactor" 
            type="number" 
            value={safetyFactor} 
            onChange={(e) => setSafetyFactor(parseFloat(e.target.value))} 
            min={1} 
            max={3}
            step={0.1}
          />
          <p className="text-sm text-muted-foreground">Multiplier for safety stock (higher values = more buffer stock)</p>
        </div>
        
        <Button onClick={handleMapping} className="w-full">Calculate Optimal Inventory</Button>
      </div>
    );
  };

  // Custom visualization component for inventory recommendations
  const VisualizationSection = ({ result }: { result: InventoryRecommendation[] | null }) => {
    if (!result || !result.length) {
      return <p>No inventory recommendations available</p>;
    }
    
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'OK':
          return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'Low':
          return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        case 'Critical':
          return <AlertCircle className="h-5 w-5 text-red-500" />;
        default:
          return null;
      }
    };

    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'OK':
          return <Badge className="bg-green-100 text-green-800">OK</Badge>;
        case 'Low':
          return <Badge className="bg-amber-100 text-amber-800">Low</Badge>;
        case 'Critical':
          return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
        default:
          return null;
      }
    };
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Recommendations</CardTitle>
            <CardDescription>
              Optimal stock levels and reorder quantities based on your parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Optimal Stock</TableHead>
                  <TableHead>Reorder Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{item.currentStock}</TableCell>
                    <TableCell>{Math.round(item.optimalStock)}</TableCell>
                    <TableCell>{Math.round(item.reorderQuantity)}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      {getStatusBadge(item.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-6 space-y-2">
              <h4 className="font-medium">Inventory Summary</h4>
              <p className="text-sm text-muted-foreground">
                Total items: {result.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Items needing reorder: {result.filter(item => item.status !== 'OK').length}
              </p>
              <p className="text-sm text-muted-foreground">
                Total current stock value: {result.reduce((sum, item) => sum + item.currentStock, 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                Total optimal stock value: {result.reduce((sum, item) => sum + item.optimalStock, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <FeaturePage
      title="Inventory Management"
      description="Optimize inventory levels to reduce costs while meeting customer demand"
      apiEndpoint="inventory-optimization"
      allowedFileTypes={['.xlsx', '.xls', '.csv']}
      tableName="inventory_recommendations"
      inputSection={<InputSection onFileProcessed={() => {}} />}
      mappingSection={<MappingSection data={null} onMapped={() => {}} />}
      visualizationSection={<VisualizationSection result={null} />}
      onCustomProcess={async (data) => {
        // Type assertion for the data
        const typedData = data as MappedData;
        
        // In a real implementation, this would call the DeepSeek API
        // For now, we'll simulate a response
        const recommendations: InventoryRecommendation[] = typedData.inventoryItems.map(item => {
          // Simple inventory optimization simulation
          const avgDemand = Math.floor(Math.random() * 10) + 5; // Random daily demand between 5-15
          const safetyStock = Math.round(avgDemand * typedData.safetyFactor);
          const optimalStock = safetyStock + (avgDemand * typedData.leadTime);
          const reorderQuantity = Math.max(0, optimalStock - item.currentStock);
          
          // Determine status based on current stock vs optimal
          let status: 'OK' | 'Low' | 'Critical' = 'OK';
          if (item.currentStock < safetyStock) {
            status = 'Critical';
          } else if (item.currentStock < optimalStock * 0.7) {
            status = 'Low';
          }
          
          return {
            productId: item.productId,
            currentStock: item.currentStock,
            optimalStock,
            reorderQuantity,
            status
          };
        });
        
        return recommendations;
      }}
    />
  );
}
