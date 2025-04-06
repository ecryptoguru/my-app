'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Supplier Performance</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Evaluation</CardTitle>
            <CardDescription>
              Analyze and optimize your supplier relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Upload your supplier data to evaluate performance metrics such as delivery times, quality ratings, and pricing competitiveness. Our AI will help you identify top-performing suppliers and areas for improvement.
            </p>
            <div className="p-8 border rounded-lg border-dashed flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                Feature under development. Coming soon!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
