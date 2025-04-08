'use client';

import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ReportGenerator from '@/components/ReportGenerator';

// Sample data for demonstration
const sampleData = [
  { month: 'Jan 2025', sales: 10000, expenses: 6000, profit: 4000 },
  { month: 'Feb 2025', sales: 12000, expenses: 7000, profit: 5000 },
  { month: 'Mar 2025', sales: 15000, expenses: 8000, profit: 7000 },
  { month: 'Apr 2025', sales: 14000, expenses: 7500, profit: 6500 },
  { month: 'May 2025', sales: 16000, expenses: 9000, profit: 7000 },
  { month: 'Jun 2025', sales: 18000, expenses: 10000, profit: 8000 },
];

export default function PDFReportExample() {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [reportType, setReportType] = useState<'sales' | 'expenses'>('sales');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>PDF Report Generation</CardTitle>
            <CardDescription>
              Generate and download PDF reports from your business data
            </CardDescription>
          </div>
          <ReportGenerator
            title={`Business ${reportType === 'sales' ? 'Sales' : 'Expenses'} Report`}
            filename={`business-${reportType}-report`}
            chartRef={chartRef}
            tableRef={tableRef}
            orientation="landscape"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={reportType === 'sales' ? 'default' : 'outline'}
            onClick={() => setReportType('sales')}
            aria-pressed={reportType === 'sales'}
            aria-label="View sales report"
          >
            Sales Report
          </Button>
          <Button
            variant={reportType === 'expenses' ? 'default' : 'outline'}
            onClick={() => setReportType('expenses')}
            aria-pressed={reportType === 'expenses'}
            aria-label="View expenses report"
          >
            Expenses Report
          </Button>
        </div>

        <div className="space-y-6">
          <div ref={chartRef} className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4 text-gray-900" id="chart-title">
              {reportType === 'sales' ? 'Monthly Sales Performance' : 'Monthly Expenses Breakdown'}
            </h3>
            <div className="h-80 w-full" aria-labelledby="chart-title" role="img">
              <ResponsiveContainer width="100%" height="100%">
                {reportType === 'sales' ? (
                  <LineChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                    <Legend />
                    <Line type="monotone" dataKey="sales" name="Sales" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                ) : (
                  <BarChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                    <Legend />
                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="overflow-x-auto">
            <h3 className="text-lg font-medium mb-4 text-gray-900" id="table-title">
              {reportType === 'sales' ? 'Monthly Sales Data' : 'Monthly Expenses Data'}
            </h3>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <Table ref={tableRef} aria-labelledby="table-title" className="border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    {reportType === 'sales' ? (
                      <>
                        <TableHead>Sales</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Profit Margin</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Expenses</TableHead>
                        <TableHead>% of Revenue</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.map((month, index) => (
                    <TableRow key={index}>
                      <TableCell>{month.month}</TableCell>
                      {reportType === 'sales' ? (
                        <>
                          <TableCell>{formatCurrency(month.sales)}</TableCell>
                          <TableCell>{formatCurrency(month.profit)}</TableCell>
                          <TableCell>{((month.profit / month.sales) * 100).toFixed(1)}%</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{formatCurrency(month.expenses)}</TableCell>
                          <TableCell>{((month.expenses / month.sales) * 100).toFixed(1)}%</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
