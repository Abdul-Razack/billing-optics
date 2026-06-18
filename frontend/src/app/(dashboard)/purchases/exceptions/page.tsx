"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PurchasesExceptionsPage() {
  return (
    <PageContainer title="Exceptions & Adjustments" description="Handle missing purchase prices and post-bill financials.">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Missing Purchase Prices</CardTitle>
            <CardDescription>Items received into inventory without a defined cost.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
              <p className="text-muted-foreground text-sm text-center mb-4">
                No items are currently missing purchase prices.
              </p>
              <Button variant="outline" disabled>Review Missing Prices</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Adjustments</CardTitle>
            <CardDescription>Log freight, fitting charges, or vendor rebates post-bill.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
              <p className="text-muted-foreground text-sm text-center mb-4">
                Add manual adjustments to existing purchase bills to keep accounting accurate.
              </p>
              <Button>Add New Adjustment</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
