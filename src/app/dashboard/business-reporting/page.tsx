'use client';

import { useState, useRef } from 'react';
import FeaturePage from '@/components/FeaturePage';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ReportGenerator from '@/components/ReportGenerator';

// Define types for our data
interface BusinessData {
  date: string;
  sales: number;
  expenses: number;
  profit: number;
}

interface MappedData {
  businessData: BusinessData[];
  aggregation: 'daily' | 'weekly' | 'monthly';
  reportType: 'summary' | 'detailed';
}

interface BusinessReport {
  summary: {
    totalSales: number;
    totalExpenses: number;
    totalProfit: number;
    profitMargin: number;
    salesGrowth: number;
    expenseGrowth: number;
  };
  monthlyData: Array<{
    month: string;
    sales: number;
    expenses: number;
    profit: number;
  }>;
  topPerformingPeriods: Array<{
    period: string;
    sales: number;
    profit: number;
  }>;
}

interface DataState {
  input: BusinessData[] | null;
  mapped: MappedData | null;
  result: BusinessReport | null;
}

export default function BusinessReporting() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DataState>({
    input: null,
    mapped: null,
    result: null,
  });

  // Refs for PDF generation
  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

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

  const handleFileProcessed = (inputData: BusinessData[]) => {
    setData(prev => ({ ...prev, input: inputData }));
  };

  const handleDataMapped = (mappedData: MappedData) => {
    setData(prev => ({ ...prev, mapped: mappedData }));
  };

  // Custom input component for manual data entry
  const InputSection = ({ onFileProcessed }: { onFileProcessed: (data: BusinessData[]) => void }) => {
    const [entries, setEntries] = useState<BusinessData[]>([
      { date: '2025-01-01', sales: 10000, expenses: 6000, profit: 4000 },
      { date: '2025-02-01', sales: 12000, expenses: 7000, profit: 5000 },
      { date: '2025-03-01', sales: 15000, expenses: 8000, profit: 7000 },
    ]);
    const [newDate, setNewDate] = useState('');
    const [newSales, setNewSales] = useState('');
    const [newExpenses, setNewExpenses] = useState('');
    const [newProfit, setNewProfit] = useState('');

    const addEntry = () => {
      if (newDate && newSales && newExpenses && newProfit) {
        setEntries([...entries, { 
          date: newDate, 
          sales: parseInt(newSales), 
          expenses: parseInt(newExpenses),
          profit: parseInt(newProfit)
        }]);
        setNewDate('');
        setNewSales('');
        setNewExpenses('');
        setNewProfit('');
      }
    };

    const calculateProfit = () => {
      if (newSales && newExpenses) {
        const profit = parseInt(newSales) - parseInt(newExpenses);
        setNewProfit(profit.toString());
      }
    };

    const handleSubmit = () => {
      onFileProcessed(entries);
    };

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date"
                value={newDate} 
                onChange={(e) => setNewDate(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales">Sales</Label>
              <Input 
                id="sales" 
                type="number" 
                value={newSales} 
                onChange={(e) => setNewSales(e.target.value)} 
                onBlur={calculateProfit}
                placeholder="Enter sales amount"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenses">Expenses</Label>
              <Input 
                id="expenses" 
                type="number" 
                value={newExpenses} 
                onChange={(e) => setNewExpenses(e.target.value)}
                onBlur={calculateProfit}
                placeholder="Enter expenses amount"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profit">Profit</Label>
              <Input 
                id="profit" 
                type="number" 
                value={newProfit} 
                onChange={(e) => setNewProfit(e.target.value)} 
                placeholder="Auto-calculated"
                readOnly
              />
            </div>
          </div>
          <Button onClick={addEntry}>Add Entry</Button>
        </div>

        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">Business Data</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>${entry.sales.toLocaleString()}</TableCell>
                  <TableCell>${entry.expenses.toLocaleString()}</TableCell>
                  <TableCell>${entry.profit.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button onClick={handleSubmit} className="w-full">Generate Report</Button>
      </div>
    );
  };

  // Custom mapping component for business reporting
  const MappingSection = ({ data, onMapped }: { data: BusinessData[] | null, onMapped: (data: MappedData) => void }) => {
    const [aggregation, setAggregation] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [reportType, setReportType] = useState<'summary' | 'detailed'>('detailed');
    
    const handleMapping = () => {
      // Create a mapped data object with the necessary parameters
      if (!data) return;
      
      const mappedDataObj: MappedData = {
        businessData: data,
        aggregation,
        reportType
      };
      
      onMapped(mappedDataObj);
    };
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="aggregation">Data Aggregation</Label>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="daily"
                name="aggregation"
                value="daily"
                checked={aggregation === 'daily'}
                onChange={() => setAggregation('daily')}
                className="mr-2"
              />
              <Label htmlFor="daily">Daily</Label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="weekly"
                name="aggregation"
                value="weekly"
                checked={aggregation === 'weekly'}
                onChange={() => setAggregation('weekly')}
                className="mr-2"
              />
              <Label htmlFor="weekly">Weekly</Label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="monthly"
                name="aggregation"
                value="monthly"
                checked={aggregation === 'monthly'}
                onChange={() => setAggregation('monthly')}
                className="mr-2"
              />
              <Label htmlFor="monthly">Monthly</Label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reportType">Report Type</Label>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="summary"
                name="reportType"
                value="summary"
                checked={reportType === 'summary'}
                onChange={() => setReportType('summary')}
                className="mr-2"
              />
              <Label htmlFor="summary">Summary</Label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="detailed"
                name="reportType"
                value="detailed"
                checked={reportType === 'detailed'}
                onChange={() => setReportType('detailed')}
                className="mr-2"
              />
              <Label htmlFor="detailed">Detailed</Label>
            </div>
          </div>
        </div>
        
        <Button onClick={handleMapping} className="w-full">Generate Business Report</Button>
      </div>
    );
  };

  // Custom visualization component for business reporting
  const VisualizationSection = ({ result }: { result: BusinessReport | null }) => {
    if (!result) {
      return <p>No business report data available</p>;
    }
    
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
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
        <div className="flex justify-end">
          <ReportGenerator
            title="Business Performance Report"
            filename="business-performance-report"
            chartRef={chartRef}
            tableRef={tableRef}
            orientation="landscape"
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Business Performance Summary</CardTitle>
            <CardDescription>
              Key metrics and visualizations based on your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Total Sales</span>
                        <span className="text-2xl font-bold">{formatCurrency(result.summary.totalSales)}</span>
                        <span className={`text-xs ${result.summary.salesGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {result.summary.salesGrowth >= 0 ? '↑' : '↓'} {Math.abs(result.summary.salesGrowth).toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Total Profit</span>
                        <span className="text-2xl font-bold">{formatCurrency(result.summary.totalProfit)}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatPercentage(result.summary.profitMargin)} margin
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4" id="sales-trend-chart">Sales Trend</h4>
                  <div className="h-80 w-full" ref={chartRef} aria-labelledby="sales-trend-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                        <Legend />
                        <Line type="monotone" dataKey="sales" name="Sales" stroke="#3b82f6" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" />
                        <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4" id="top-performing-chart">Top Performing Periods</h4>
                  <div className="h-80 w-full" aria-labelledby="top-performing-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.topPerformingPeriods}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                        <Legend />
                        <Bar dataKey="sales" name="Sales" fill="#3b82f6" />
                        <Bar dataKey="profit" name="Profit" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4" id="monthly-performance-table">Monthly Performance</h4>
                <div className="overflow-x-auto">
                  <Table ref={tableRef} aria-labelledby="monthly-performance-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Expenses</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.monthlyData.map((month, index) => (
                        <TableRow key={index}>
                          <TableCell>{month.month}</TableCell>
                          <TableCell>{formatCurrency(month.sales)}</TableCell>
                          <TableCell>{formatCurrency(month.expenses)}</TableCell>
                          <TableCell>{formatCurrency(month.profit)}</TableCell>
                          <TableCell>{formatPercentage((month.profit / month.sales) * 100)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <FeaturePage
      title="Business Reporting"
      description="Generate comprehensive reports summarizing business performance"
      apiEndpoint="business-analytics"
      allowedFileTypes={['.xlsx', '.xls', '.csv']}
      tableName="business_reports"
      inputSection={<InputSection onFileProcessed={handleFileProcessed} />}
      mappingSection={<MappingSection data={data.input} onMapped={handleDataMapped} />}
      visualizationSection={<VisualizationSection result={data.result} />}
      onCustomProcess={async (mappedData) => {
        // Type assertion for the data
        const typedData = mappedData as MappedData;
        
        // In a real implementation, this would call the DeepSeek API
        // For now, we'll simulate a response
        
        // Sort data by date
        const sortedData = [...typedData.businessData].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        // Aggregate data by month for visualization
        const monthlyData: Record<string, { sales: number; expenses: number; profit: number }> = {};
        
        sortedData.forEach(entry => {
          const date = new Date(entry.date);
          const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { sales: 0, expenses: 0, profit: 0 };
          }
          
          monthlyData[monthKey].sales += entry.sales;
          monthlyData[monthKey].expenses += entry.expenses;
          monthlyData[monthKey].profit += entry.profit;
        });
        
        // Convert to array for chart
        const monthlyDataArray = Object.entries(monthlyData).map(([month, data]) => ({
          month,
          ...data
        }));
        
        // Calculate summary statistics
        const totalSales = sortedData.reduce((sum, entry) => sum + entry.sales, 0);
        const totalExpenses = sortedData.reduce((sum, entry) => sum + entry.expenses, 0);
        const totalProfit = sortedData.reduce((sum, entry) => sum + entry.profit, 0);
        const profitMargin = (totalProfit / totalSales) * 100;
        
        // Calculate growth (comparing first half to second half for demo)
        const midpoint = Math.floor(sortedData.length / 2);
        const firstHalfSales = sortedData.slice(0, midpoint).reduce((sum, entry) => sum + entry.sales, 0);
        const secondHalfSales = sortedData.slice(midpoint).reduce((sum, entry) => sum + entry.sales, 0);
        const salesGrowth = firstHalfSales > 0 ? ((secondHalfSales - firstHalfSales) / firstHalfSales) * 100 : 0;
        
        const firstHalfExpenses = sortedData.slice(0, midpoint).reduce((sum, entry) => sum + entry.expenses, 0);
        const secondHalfExpenses = sortedData.slice(midpoint).reduce((sum, entry) => sum + entry.expenses, 0);
        const expenseGrowth = firstHalfExpenses > 0 ? ((secondHalfExpenses - firstHalfExpenses) / firstHalfExpenses) * 100 : 0;
        
        // Find top performing periods
        const topPerformingPeriods = [...monthlyDataArray]
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 3)
          .map(period => ({
            period: period.month,
            sales: period.sales,
            profit: period.profit
          }));
        
        const result = {
          summary: {
            totalSales,
            totalExpenses,
            totalProfit,
            profitMargin,
            salesGrowth,
            expenseGrowth
          },
          monthlyData: monthlyDataArray,
          topPerformingPeriods
        };
        
        setData(prev => ({ ...prev, result }));
        return result;
      }}
    />
  );
}
