"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  method: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER"]),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentValues = z.infer<typeof paymentSchema>;

export function PaymentForm() {
  const router = useRouter();

  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: "",
      amount: 0,
      method: "CASH",
      referenceNumber: "",
      notes: "",
    },
  });

  const onSubmit = (values: PaymentValues) => {
    console.log("Mock Payment Recorded:", values);
    router.push("/payments");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-card rounded-lg border border-border shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Invoice ID <span className="text-destructive">*</span></label>
          <Input 
            placeholder="INV-..." 
            {...form.register("invoiceId")}
            className={form.formState.errors.invoiceId ? "border-destructive" : ""}
          />
          {form.formState.errors.invoiceId && <p className="text-xs text-destructive">{form.formState.errors.invoiceId.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount Received <span className="text-destructive">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
            <Input 
              type="number" 
              step="0.01"
              {...form.register("amount", { valueAsNumber: true })}
              className={`pl-7 ${form.formState.errors.amount ? "border-destructive" : ""}`}
            />
          </div>
          {form.formState.errors.amount && <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Method <span className="text-destructive">*</span></label>
          <Controller
            control={form.control}
            name="method"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Credit/Debit Card</SelectItem>
                  <SelectItem value="UPI">UPI / QR Code</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer / NEFT</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Reference Number (Optional)</label>
          <Input 
            placeholder="TXN ID, Check No, etc." 
            {...form.register("referenceNumber")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <Textarea 
          placeholder="Any internal notes regarding this payment..."
          className="resize-none h-24"
          {...form.register("notes")}
        />
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-border">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit">
          <CheckCircle className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>
    </form>
  );
}
