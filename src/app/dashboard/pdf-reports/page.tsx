'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PDFReportExample from "@/components/PDFReportExample";

export default function PDFReports() {
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
      <div className="flex min-h-screen items-center justify-center" aria-live="polite">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">PDF Report Generation</h1>
        <p className="text-muted-foreground mt-2">
          Generate PDF reports from your business data for sharing and archiving
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>About PDF Reports</CardTitle>
            <CardDescription>
              Learn how to use the PDF report generation feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The PDF report generation feature allows you to create professional PDF reports from your business data.
              These reports can include charts, tables, and other visualizations that help communicate insights effectively.
            </p>
            
            <div className="space-y-2">
              <h3 className="font-medium" id="key-features">Key Features:</h3>
              <ul className="list-disc pl-6 space-y-1" aria-labelledby="key-features">
                <li>High-quality charts and visualizations</li>
                <li>Tabular data with proper formatting</li>
                <li>Customizable report titles and filenames</li>
                <li>Support for both portrait and landscape orientations</li>
                <li>Multi-page reports for complex data</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium" id="how-to-use">How to Use:</h3>
              <ol className="list-decimal pl-6 space-y-1" aria-labelledby="how-to-use">
                <li>Navigate to any feature page with visualizations</li>
                <li>Look for the &quot;Download PDF Report&quot; button in the visualization section</li>
                <li>Click the button to generate and download the PDF</li>
                <li>Open the PDF with your preferred PDF viewer</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Report Example</CardTitle>
              <CardDescription>
                Interactive example of PDF report generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFReportExample />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
