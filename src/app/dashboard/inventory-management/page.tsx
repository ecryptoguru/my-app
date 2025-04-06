'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Optimization</CardTitle>
            <CardDescription>
              Optimize inventory levels to reduce costs while meeting customer demand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Upload your inventory data to get AI-powered recommendations on optimal stock levels, reorder points, and safety stock calculations.
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
