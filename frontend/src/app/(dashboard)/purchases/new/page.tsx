"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

export default function NewPurchasePage() {
  return (
    <PageContainer title="New Purchase" description="Create a new draft or log an incoming challan.">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Purchase Intake</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline">Save as Draft</Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Purchase
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bill Information</CardTitle>
            <CardDescription>Enter supplier details and document tracking numbers.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <select id="supplier" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select Supplier</option>
                <option value="1">Essilor Vision</option>
                <option value="2">Bausch & Lomb</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billNumber">Tax Invoice No.</Label>
              <Input id="billNumber" placeholder="Leave empty if challan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challanNumber">Challan No.</Label>
              <Input id="challanNumber" placeholder="Enter delivery challan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Purchase Date</Label>
              <Input id="date" type="date" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Item Grid</CardTitle>
            <CardDescription>Rapidly add items. Use the advanced matrix for contact lenses.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for the advanced Lens Matrix Grid UI */}
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/50">
              <p className="text-muted-foreground mb-4">Advanced Lens Matrix Component Goes Here</p>
              <Button variant="secondary">Add Standard Product</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
