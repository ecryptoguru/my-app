'use client';

import { useRef, useState, ReactNode } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ReportGeneratorProps {
  title: string;
  filename?: string;
  chartRef: React.RefObject<HTMLDivElement | null>;
  tableRef?: React.RefObject<HTMLTableElement | null>;
  additionalContent?: ReactNode;
  orientation?: 'portrait' | 'landscape';
}

/**
 * ReportGenerator component for generating PDF reports
 * 
 * This component provides a button to generate and download a PDF report
 * containing a title, chart (converted from HTML), and optional table.
 * 
 * @param title - The title of the report
 * @param filename - The filename for the downloaded PDF (without extension)
 * @param chartRef - Ref to the chart element to be included in the PDF
 * @param tableRef - Optional ref to a table element to be included in the PDF
 * @param additionalContent - Optional additional content to include in the PDF
 * @param orientation - PDF orientation, 'portrait' (default) or 'landscape'
 */
export default function ReportGenerator({
  title,
  filename = 'report',
  chartRef,
  tableRef,
  additionalContent,
  orientation = 'portrait'
}: ReportGeneratorProps) {
  const isGenerating = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const generatePDF = async () => {
    // Prevent multiple clicks
    if (isGenerating.current) return;
    isGenerating.current = true;
    setIsLoading(true);

    try {
      // Create PDF document with appropriate orientation
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      // Set up dimensions
      const pageWidth = orientation === 'portrait' ? 210 : 297;
      const pageHeight = orientation === 'portrait' ? 297 : 210;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      // Add title
      pdf.setFontSize(18);
      pdf.text(title, margin, margin);
      
      // Add date
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, margin + 8);
      
      let yPosition = margin + 15;
      
      // Add chart data directly if available
      if (chartRef.current) {
        try {
          // Get chart data
          const chartTitle = chartRef.current.querySelector('h3')?.textContent || 'Chart';
          pdf.setFontSize(14);
          pdf.text(chartTitle, margin, yPosition);
          yPosition += 10;
          
          // Add chart description
          pdf.setFontSize(10);
          pdf.text("Chart data is included in the table below.", margin, yPosition);
          yPosition += 15;
        } catch (chartError) {
          console.error('Error adding chart data:', chartError);
          pdf.setFontSize(12);
          pdf.setTextColor(255, 0, 0);
          pdf.text('Error including chart data.', margin, yPosition);
          yPosition += 10;
          pdf.setTextColor(0, 0, 0);
        }
      }
      
      // Add table data directly if available
      if (tableRef?.current) {
        try {
          // Get table data
          const rows = tableRef.current.querySelectorAll('tr');
          const tableData: string[][] = [];
          
          // Extract table headers
          const headerRow = rows[0];
          if (headerRow) {
            const headers: string[] = [];
            headerRow.querySelectorAll('th').forEach(th => {
              headers.push(th.textContent || '');
            });
            tableData.push(headers);
          }
          
          // Extract table body data
          for (let i = 1; i < rows.length; i++) {
            const rowData: string[] = [];
            rows[i].querySelectorAll('td').forEach(td => {
              rowData.push(td.textContent || '');
            });
            tableData.push(rowData);
          }
          
          // Add table to PDF
          if (tableData.length > 0) {
            // Calculate column widths
            const colCount = tableData[0].length;
            const colWidth = contentWidth / colCount;
            
            // Set table styles
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            
            // Draw table headers
            pdf.setFillColor(240, 240, 240);
            pdf.rect(margin, yPosition, contentWidth, 8, 'F');
            
            for (let i = 0; i < tableData[0].length; i++) {
              pdf.text(tableData[0][i], margin + (i * colWidth) + 2, yPosition + 5);
            }
            yPosition += 8;
            
            // Draw table rows
            for (let i = 1; i < tableData.length; i++) {
              // Alternate row colors for readability
              if (i % 2 === 0) {
                pdf.setFillColor(248, 248, 248);
                pdf.rect(margin, yPosition, contentWidth, 7, 'F');
              }
              
              for (let j = 0; j < tableData[i].length; j++) {
                pdf.text(tableData[i][j], margin + (j * colWidth) + 2, yPosition + 5);
              }
              
              yPosition += 7;
              
              // Add new page if needed
              if (yPosition > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
              }
            }
            
            yPosition += 10;
          }
        } catch (tableError) {
          console.error('Error adding table data:', tableError);
          pdf.setFontSize(12);
          pdf.setTextColor(255, 0, 0);
          pdf.text('Error including table data.', margin, yPosition);
          yPosition += 10;
          pdf.setTextColor(0, 0, 0);
        }
      }
      
      // Add additional content if provided
      if (additionalContent) {
        pdf.setFontSize(12);
        pdf.text('Additional Notes:', margin, yPosition);
        yPosition += 10;
        
        const contentStr = String(additionalContent);
        pdf.setFontSize(10);
        pdf.text(contentStr, margin, yPosition);
      }
      
      // Save the PDF
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Provide more specific error messages based on the error type
      if (error instanceof Error) {
        alert(`Error generating PDF: ${error.message}`);
      } else {
        alert('There was an unexpected error generating the PDF. Please try again.');
      }
    } finally {
      isGenerating.current = false;
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={generatePDF} 
      className="flex items-center gap-2"
      variant="outline"
      disabled={isLoading}
      aria-label={`Generate and download ${title} as PDF`}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        <Download className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{isLoading ? 'Generating...' : 'Download PDF Report'}</span>
      <span className="sm:hidden">PDF</span>
    </Button>
  );
}
