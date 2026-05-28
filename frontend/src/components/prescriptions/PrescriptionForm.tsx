"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EyeMeasurementCard } from "./EyeMeasurementCard";
import { MeasurementInput } from "./MeasurementInput";
import { MOCK_CUSTOMERS } from "@/lib/mock-customer-data";
import { CheckCircle } from "lucide-react";
import { Prescription } from "@/types/prescription";
import { Input } from "@/components/ui/input";

const eyeMeasurementSchema = z.object({
  sphere: z.string().min(1, "Required"),
  cylinder: z.string().optional(),
  axis: z.string().optional(),
  addPower: z.string().optional(),
});

const prescriptionSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  rightEye: eyeMeasurementSchema,
  leftEye: eyeMeasurementSchema,
  pd: z.string().min(1, "PD is required"),
  notes: z.string().optional(),
});

type PrescriptionValues = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  initialData?: Prescription;
}

export function PrescriptionForm({ initialData }: PrescriptionFormProps) {
  const router = useRouter();

  const form = useForm<PrescriptionValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      customerId: initialData?.customerId || "",
      rightEye: {
        sphere: initialData?.rightEye.sphere || "",
        cylinder: initialData?.rightEye.cylinder || "",
        axis: initialData?.rightEye.axis || "",
        addPower: initialData?.rightEye.addPower || "",
      },
      leftEye: {
        sphere: initialData?.leftEye.sphere || "",
        cylinder: initialData?.leftEye.cylinder || "",
        axis: initialData?.leftEye.axis || "",
        addPower: initialData?.leftEye.addPower || "",
      },
      pd: initialData?.pd || "",
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = (values: PrescriptionValues) => {
    console.log("Mock Prescription Saved:", values);
    router.push("/prescriptions");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-4">
        <h3 className="font-medium text-foreground border-b border-border pb-2">Patient Selection</h3>
        <div className="max-w-md space-y-2">
          <label className="text-sm font-medium">Customer / Patient <span className="text-destructive">*</span></label>
          <Select 
            value={form.watch("customerId")} 
            onValueChange={(v) => {
              if (v) {
                form.setValue("customerId", v, { shouldValidate: true });
              }
            }}
          >
            <SelectTrigger className={form.formState.errors.customerId ? "border-destructive" : ""}>
              <SelectValue placeholder="Select patient..." />
            </SelectTrigger>
            <SelectContent>
              {MOCK_CUSTOMERS.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.fullName} ({c.phone})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.customerId && <p className="text-xs text-destructive">{form.formState.errors.customerId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EyeMeasurementCard title="Right Eye (OD)">
          <div className="flex gap-4 mb-4">
            <MeasurementInput 
              label="SPH" 
              placeholder="±0.00" 
              {...form.register("rightEye.sphere")}
              error={form.formState.errors.rightEye?.sphere?.message}
            />
            <MeasurementInput 
              label="CYL" 
              placeholder="±0.00" 
              {...form.register("rightEye.cylinder")}
            />
            <MeasurementInput 
              label="AXIS" 
              placeholder="0-180" 
              {...form.register("rightEye.axis")}
            />
          </div>
          <div className="w-1/3 pr-2">
             <MeasurementInput 
              label="ADD" 
              placeholder="+0.00" 
              {...form.register("rightEye.addPower")}
            />
          </div>
        </EyeMeasurementCard>

        <EyeMeasurementCard title="Left Eye (OS)">
          <div className="flex gap-4 mb-4">
            <MeasurementInput 
              label="SPH" 
              placeholder="±0.00" 
              {...form.register("leftEye.sphere")}
              error={form.formState.errors.leftEye?.sphere?.message}
            />
            <MeasurementInput 
              label="CYL" 
              placeholder="±0.00" 
              {...form.register("leftEye.cylinder")}
            />
            <MeasurementInput 
              label="AXIS" 
              placeholder="0-180" 
              {...form.register("leftEye.axis")}
            />
          </div>
          <div className="w-1/3 pr-2">
             <MeasurementInput 
              label="ADD" 
              placeholder="+0.00" 
              {...form.register("leftEye.addPower")}
            />
          </div>
        </EyeMeasurementCard>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-6">
        <h3 className="font-medium text-foreground border-b border-border pb-2">Additional Measurements & Notes</h3>
        
        <div className="max-w-xs space-y-2">
          <label className="text-sm font-medium">PD (Pupillary Distance) <span className="text-destructive">*</span></label>
          <Input 
            placeholder="e.g. 64 or 32/32" 
            {...form.register("pd")}
            className={form.formState.errors.pd ? "border-destructive" : ""}
          />
          {form.formState.errors.pd && <p className="text-xs text-destructive">{form.formState.errors.pd.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Clinical Notes / Recommendations</label>
          <Textarea 
            placeholder="Any special instructions for lenses, tinting, or general notes..."
            className="h-24 resize-none"
            {...form.register("notes")}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit">
          <CheckCircle className="mr-2 h-4 w-4" />
          {initialData ? "Save Prescription" : "Create Prescription"}
        </Button>
      </div>
    </form>
  );
}
