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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Define types for our data
interface CustomerData {
  customerId: string;
  totalPurchases: number;
  location: string;
  frequency?: number;
  recency?: number;
}

interface MappedData {
  customers: CustomerData[];
  segmentCount: number;
  primaryFactor: 'spending' | 'location' | 'frequency';
}

interface CustomerSegment {
  segmentName: string;
  customers: Array<{
    customerId: string;
    totalPurchases: number;
    location: string;
    segment: string;
  }>;
  averageSpend: number;
  count: number;
  color: string;
}

export default function CustomerSegmentation() {
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

  // Custom mapping component for customer segmentation
  const MappingSection = ({ data, onMapped }: { data: unknown, onMapped: (data: MappedData) => void }) => {
    const [segmentCount, setSegmentCount] = useState(3);
    const [primaryFactor, setPrimaryFactor] = useState<'spending' | 'location' | 'frequency'>('spending');
    
    const handleMapping = () => {
      // Create a mapped data object with the necessary parameters
      const mappedDataObj: MappedData = {
        customers: data as CustomerData[],
        segmentCount,
        primaryFactor
      };
      
      onMapped(mappedDataObj);
    };
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="segmentCount">Number of Segments</Label>
          <Input 
            id="segmentCount" 
            type="number" 
            value={segmentCount} 
            onChange={(e) => setSegmentCount(parseInt(e.target.value))} 
            min={2} 
            max={5}
          />
          <p className="text-sm text-muted-foreground">How many customer segments to create</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="primaryFactor">Primary Segmentation Factor</Label>
          <Select value={primaryFactor} onValueChange={(value) => setPrimaryFactor(value as 'spending' | 'location' | 'frequency')}>
            <SelectTrigger id="primaryFactor">
              <SelectValue placeholder="Select primary factor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spending">Spending Amount</SelectItem>
              <SelectItem value="location">Geographic Location</SelectItem>
              <SelectItem value="frequency">Purchase Frequency</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Main factor to consider when segmenting customers</p>
        </div>
        
        <Button onClick={handleMapping} className="w-full">Generate Customer Segments</Button>
      </div>
    );
  };

  // Custom visualization component for customer segmentation
  const VisualizationSection = ({ result }: { result: CustomerSegment[] | null }) => {
    if (!result || !result.length) {
      return <p>No customer segmentation data available</p>;
    }
    
    // Prepare data for pie chart
    const chartData = result.map(segment => ({
      name: segment.segmentName,
      value: segment.count,
      color: segment.color
    }));
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>
              Customer segments based on your selected criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} customers`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Segment Details</h4>
                <div className="space-y-4">
                  {result.map((segment, index) => (
                    <div key={index} className="p-4 border rounded-md" style={{ borderLeftColor: segment.color, borderLeftWidth: '4px' }}>
                      <h5 className="font-medium">{segment.segmentName}</h5>
                      <p className="text-sm text-muted-foreground">
                        {segment.count} customers ({((segment.count / result.reduce((sum, s) => sum + s.count, 0)) * 100).toFixed(1)}%)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Average spend: ${segment.averageSpend.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="font-medium mb-4">Customer List by Segment</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Total Purchases</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Segment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.flatMap(segment => 
                    segment.customers.slice(0, 3).map((customer, index) => (
                      <TableRow key={`${segment.segmentName}-${index}`}>
                        <TableCell>{customer.customerId}</TableCell>
                        <TableCell>${customer.totalPurchases.toFixed(2)}</TableCell>
                        <TableCell>{customer.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                            {segment.segmentName}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {result.reduce((sum, segment) => sum + segment.customers.length, 0) > result.length * 3 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        Showing top 3 customers per segment. {result.reduce((sum, segment) => sum + segment.customers.length, 0) - (result.length * 3)} more customers not shown.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <FeaturePage
      title="Customer Segmentation"
      description="Group customers based on spending patterns, location, and behavior"
      apiEndpoint="customer-segmentation"
      allowedFileTypes={['.xlsx', '.xls', '.csv']}
      tableName="customer_segments"
      mappingSection={<MappingSection data={null} onMapped={() => {}} />}
      visualizationSection={<VisualizationSection result={null} />}
      onCustomProcess={async (data) => {
        // Type assertion for the data
        const typedData = data as MappedData;
        
        // In a real implementation, this would call the DeepSeek API
        // For now, we'll simulate a response
        
        // Define segment colors
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];
        
        // Create segments based on the primary factor
        let segments: CustomerSegment[] = [];
        const customers = typedData.customers;
        
        if (typedData.primaryFactor === 'spending') {
          // Sort customers by spending
          const sortedCustomers = [...customers].sort((a, b) => b.totalPurchases - a.totalPurchases);
          
          // Divide into segments
          const segmentSize = Math.ceil(sortedCustomers.length / typedData.segmentCount);
          
          for (let i = 0; i < typedData.segmentCount; i++) {
            const start = i * segmentSize;
            const end = Math.min(start + segmentSize, sortedCustomers.length);
            const segmentCustomers = sortedCustomers.slice(start, end);
            
            if (segmentCustomers.length === 0) continue;
            
            // Calculate average spend
            const avgSpend = segmentCustomers.reduce((sum, c) => sum + c.totalPurchases, 0) / segmentCustomers.length;
            
            // Determine segment name based on spending level
            let segmentName = '';
            if (i === 0) segmentName = 'High Value';
            else if (i === typedData.segmentCount - 1) segmentName = 'Budget Conscious';
            else segmentName = `Mid-Tier ${i}`;
            
            segments.push({
              segmentName,
              customers: segmentCustomers.map(c => ({
                ...c,
                segment: segmentName
              })),
              averageSpend: avgSpend,
              count: segmentCustomers.length,
              color: colors[i % colors.length]
            });
          }
        } else if (typedData.primaryFactor === 'location') {
          // Group by location
          const locationGroups: Record<string, CustomerData[]> = {};
          
          customers.forEach(customer => {
            if (!locationGroups[customer.location]) {
              locationGroups[customer.location] = [];
            }
            locationGroups[customer.location].push(customer);
          });
          
          // Convert to segments
          Object.entries(locationGroups).forEach(([location, customers], index) => {
            const avgSpend = customers.reduce((sum, c) => sum + c.totalPurchases, 0) / customers.length;
            
            segments.push({
              segmentName: `${location} Region`,
              customers: customers.map(c => ({
                ...c,
                segment: `${location} Region`
              })),
              averageSpend: avgSpend,
              count: customers.length,
              color: colors[index % colors.length]
            });
          });
          
          // Limit to requested segment count
          segments = segments.sort((a, b) => b.count - a.count).slice(0, typedData.segmentCount);
        } else {
          // Frequency-based segmentation (using random frequency for demo)
          // In a real implementation, this would use actual frequency data
          const customersWithFreq = customers.map(c => ({
            ...c,
            frequency: c.frequency || Math.floor(Math.random() * 10) + 1 // Random 1-10 if not provided
          }));
          
          // Sort by frequency
          const sortedCustomers = [...customersWithFreq].sort((a, b) => b.frequency! - a.frequency!);
          
          // Create segments
          const segmentLabels = ['Frequent Buyers', 'Regular Customers', 'Occasional Shoppers', 'Rare Visitors', 'One-time Purchasers'];
          const segmentSize = Math.ceil(sortedCustomers.length / typedData.segmentCount);
          
          for (let i = 0; i < typedData.segmentCount; i++) {
            const start = i * segmentSize;
            const end = Math.min(start + segmentSize, sortedCustomers.length);
            const segmentCustomers = sortedCustomers.slice(start, end);
            
            if (segmentCustomers.length === 0) continue;
            
            const avgSpend = segmentCustomers.reduce((sum, c) => sum + c.totalPurchases, 0) / segmentCustomers.length;
            
            segments.push({
              segmentName: segmentLabels[i] || `Segment ${i + 1}`,
              customers: segmentCustomers.map(c => ({
                ...c,
                segment: segmentLabels[i] || `Segment ${i + 1}`
              })),
              averageSpend: avgSpend,
              count: segmentCustomers.length,
              color: colors[i % colors.length]
            });
          }
        }
        
        return segments;
      }}
    />
  );
}
