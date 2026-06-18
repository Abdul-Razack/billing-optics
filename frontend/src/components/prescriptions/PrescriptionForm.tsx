"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCircle, Plus, Trash2, CalendarIcon } from "lucide-react";
import { Prescription, PrescriptionTest } from "@/types/prescription";
import { CustomerService } from "@/services/customer.service";
import { PrescriptionService } from "@/services/prescription.service";
import { ApiCustomer } from "@/types/customer";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const eyeMeasurementSchema = z.object({
  sph: z.string().optional().nullable(),
  cyl: z.string().optional().nullable(),
  axis: z.coerce.number().optional().nullable(),
  va: z.string().optional().nullable(),
});

const prescriptionTestSchema = z.object({
  testType: z.enum(["OLD_LENS", "AR_READING", "MANUAL_TESTING", "SPECTACLE"]),
  rightEyeDv: eyeMeasurementSchema.optional(),
  rightEyeNv: eyeMeasurementSchema.optional(),
  rightEyeAdd: z.string().optional().nullable(),
  rightEyePd: z.string().optional().nullable(),
  leftEyeDv: eyeMeasurementSchema.optional(),
  leftEyeNv: eyeMeasurementSchema.optional(),
  leftEyeAdd: z.string().optional().nullable(),
  leftEyePd: z.string().optional().nullable(),
});

const prescriptionSchema = z.object({
  customerId: z.coerce.number().min(1, "Customer is required"),
  patientName: z.string().min(1, "Patient name is required"),
  patientMobile: z.string().optional(),
  patientEmail: z.string().email().optional().or(z.literal("")),
  patientDob: z.string().optional(),
  patientGender: z.enum(["Male", "Female", "Other"]).optional(),
  
  prescriptionType: z.enum(["EYEWEAR", "CONTACT_LENS"]),
  cardDescription: z.string().optional().nullable(),
  countInRecords: z.boolean(),
  
  lensTypes: z.array(z.string()),
  notes: z.string().optional().nullable(),
  
  tests: z.array(prescriptionTestSchema),
  
  branchName: z.string().optional(),
  referralCode: z.string().optional(),
  doctorName: z.string().optional(),
});

type PrescriptionValues = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  initialData?: Prescription;
}

const LENS_TYPES = ["Constant Use", "Reading Wear", "Distance Wear", "Single Vision", "Progressive", "Bifocal"];
const LENS_RECOMMENDATIONS = ["Hard Coating", "Anti-Reflection", "Blue Cut", "Photochromic", "Transition", "Polycarbonate"];
const TEST_TYPES = [
  { id: "OLD_LENS", label: "OLD LENS POWER" },
  { id: "AR_READING", label: "AR READING" },
  { id: "MANUAL_TESTING", label: "MANUAL TESTING" },
  { id: "SPECTACLE", label: "SPECTACLE PRESCRIPTION" },
] as const;

export function PrescriptionForm({ initialData }: PrescriptionFormProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTestTab, setActiveTestTab] = useState<string>("SPECTACLE");

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await CustomerService.getCustomers();
        setCustomers(data);
      } catch (error) {
        toast.error("Failed to load customers");
      }
    }
    loadCustomers();
  }, []);

  const form = useForm<PrescriptionValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      customerId: initialData?.customerId || 0,
      patientName: "",
      prescriptionType: initialData?.prescriptionType || "EYEWEAR",
      countInRecords: initialData?.countInRecords ?? true,
      lensTypes: initialData?.lensTypes || [],
      tests: initialData?.tests?.length ? initialData.tests : [
        { testType: "SPECTACLE" },
        { testType: "OLD_LENS" },
        { testType: "AR_READING" },
        { testType: "MANUAL_TESTING" }
      ],
    },
  });

  const { fields: testFields } = useFieldArray({
    control: form.control,
    name: "tests",
  });

  // Auto-calculation logic for Near Vision (NV) based on Distance Vision (DV) + ADD
  const calculateNV = (testIndex: number, eye: "rightEye" | "leftEye") => {
    const dvSph = form.getValues(`tests.${testIndex}.${eye}Dv.sph`);
    const add = form.getValues(`tests.${testIndex}.${eye}Add`);
    
    if (dvSph && add) {
      const dvVal = parseFloat(dvSph);
      const addVal = parseFloat(add);
      if (!isNaN(dvVal) && !isNaN(addVal)) {
        const nvVal = dvVal + addVal;
        // Format to +2.50 or -1.25
        const formattedNv = (nvVal > 0 ? "+" : "") + nvVal.toFixed(2);
        form.setValue(`tests.${testIndex}.${eye}Nv.sph`, formattedNv, { shouldValidate: true });
      }
    }

    // Auto-copy CYL and AXIS from DV to NV
    const dvCyl = form.getValues(`tests.${testIndex}.${eye}Dv.cyl`);
    const dvAxis = form.getValues(`tests.${testIndex}.${eye}Dv.axis`);
    if (dvCyl) form.setValue(`tests.${testIndex}.${eye}Nv.cyl`, dvCyl);
    if (dvAxis !== undefined && dvAxis !== null) form.setValue(`tests.${testIndex}.${eye}Nv.axis`, dvAxis);
  };

  const onSubmit = async (values: PrescriptionValues) => {
    setIsSubmitting(true);
    try {
      // Filter out empty tests to only send ones with actual data
      const activeTests = values.tests?.filter(t => 
        t.rightEyeDv?.sph || t.leftEyeDv?.sph || t.rightEyeNv?.sph || t.leftEyeNv?.sph
      ) || [];
      
      const payload = {
        customerId: values.customerId,
        prescriptionType: values.prescriptionType,
        cardDescription: values.cardDescription,
        countInRecords: values.countInRecords,
        lensTypes: values.lensTypes,
        notes: values.notes,
        tests: activeTests,
      };

      if (initialData) {
        await PrescriptionService.updatePrescription(initialData.id, payload);
        toast.success("Prescription updated successfully");
      } else {
        await PrescriptionService.createPrescription(payload);
        toast.success("Prescription created successfully");
      }
      router.push("/prescriptions");
      router.refresh();
    } catch (error) {
      toast.error("Failed to save prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full pb-20">
      {/* Top Meta Data row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="space-y-2">
          <Label>Referral Code / Mobile</Label>
          <Input placeholder="Search..." {...form.register("referralCode")} />
        </div>
        <div className="space-y-2">
          <Label>Mobile No 1 <span className="text-destructive">*</span></Label>
          <div className="flex gap-2">
            <Input placeholder="Search Customer" className="flex-1" />
            <Button type="button" variant="secondary">Search</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Customer <span className="text-destructive">*</span></Label>
          <Select value={form.watch("customerId") ? form.watch("customerId").toString() : ""} onValueChange={(v: string | null) => v && form.setValue("customerId", parseInt(v))}>
            <SelectTrigger className={form.formState.errors.customerId ? "border-destructive" : ""}>
              <SelectValue placeholder="Select Customer Profile" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(c => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.fullName} ({c.phone})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Patient Information Section */}
      <Card>
        <CardHeader className="py-3 border-b bg-muted/10">
          <CardTitle className="text-lg">Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Patient Name <span className="text-destructive">*</span></Label>
            <Input {...form.register("patientName")} />
            {form.formState.errors.patientName && <p className="text-xs text-destructive">{form.formState.errors.patientName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Patient Mobile Number</Label>
            <Input {...form.register("patientMobile")} />
          </div>
          <div className="space-y-2">
            <Label>Patient Email</Label>
            <Input type="email" {...form.register("patientEmail")} />
          </div>
          <div className="space-y-2">
            <Label>Date Of Birth</Label>
            <Input type="date" {...form.register("patientDob")} />
          </div>
          <div className="space-y-2">
            <Label>Patient Age</Label>
            <Input type="number" readOnly className="bg-muted" placeholder="Auto-calculated" />
          </div>
          <div className="space-y-2">
            <Label>Patient Gender</Label>
            <RadioGroup defaultValue="Male" className="flex gap-4 mt-2" onValueChange={(v: any) => form.setValue("patientGender", v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Male" id="r1" />
                <Label htmlFor="r1">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Female" id="r2" />
                <Label htmlFor="r2">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Other" id="r3" />
                <Label htmlFor="r3">Other</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label>Prescription Type</Label>
          <RadioGroup 
            defaultValue={form.getValues("prescriptionType")} 
            className="flex gap-4 mt-2"
            onValueChange={(v: any) => form.setValue("prescriptionType", v)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="EYEWEAR" id="pt1" />
              <Label htmlFor="pt1">Eyewear</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CONTACT_LENS" id="pt2" />
              <Label htmlFor="pt2">Contact Lens</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label>Card Description</Label>
          <Input {...form.register("cardDescription")} />
        </div>
        <div className="space-y-2">
          <Label>Count In Eye Testing Records?</Label>
          <RadioGroup 
            defaultValue="Yes" 
            className="flex gap-4 mt-2"
            onValueChange={(v) => form.setValue("countInRecords", v === "Yes")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="c1" />
              <Label htmlFor="c1">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="c2" />
              <Label htmlFor="c2">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Prescription Date & Time</Label>
          <div className="flex gap-2">
            <Input type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Doctor / Optometrist Name</Label>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dr_smith">Dr. Smith</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Or type name..." {...form.register("doctorName")} />
          </div>
        </div>
      </div>

      {/* Power Details Grid */}
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="py-3 bg-primary/5 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-primary">Power Details</CardTitle>
          <Tabs value={activeTestTab} onValueChange={setActiveTestTab} className="w-full max-w-2xl">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              {TEST_TYPES.map(t => (
                <TabsTrigger key={t.id} value={t.id} className="text-[11px] sm:text-xs py-2 whitespace-normal h-auto text-center leading-tight">
                  {t.label === 'SPECTACLE PRESCRIPTION' ? 'SPECTACLE Rx' : t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          {TEST_TYPES.map((testType, testIndex) => {
            // Find the correct index in our form array
            const formIndex = testFields.findIndex(f => f.testType === testType.id);
            if (formIndex === -1 || activeTestTab !== testType.id) return null;

            return (
              <div key={testType.id} className="p-6 space-y-8 animate-in fade-in-50">
                {/* RIGHT EYE */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                    RIGHT EYE (OD)
                  </h4>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground bg-muted py-2 rounded-md">
                    <div className="col-span-2 text-left pl-4">Type</div>
                    <div>SPH</div>
                    <div>CYL</div>
                    <div>AXIS</div>
                    <div>VA</div>
                    <div>PD</div>
                  </div>
                  
                  {/* DV Row */}
                  <div className="grid grid-cols-7 gap-2 items-center">
                    <div className="col-span-2 font-medium text-sm text-muted-foreground pl-2">Distance Vision (DV)</div>
                    <Input placeholder="±0.00" className="text-center font-mono" {...form.register(`tests.${formIndex}.rightEyeDv.sph`)} onBlur={() => calculateNV(formIndex, "rightEye")} />
                    <Input placeholder="±0.00" className="text-center font-mono" {...form.register(`tests.${formIndex}.rightEyeDv.cyl`)} onBlur={() => calculateNV(formIndex, "rightEye")} />
                    <Input placeholder="0-180" className="text-center font-mono" {...form.register(`tests.${formIndex}.rightEyeDv.axis`)} onBlur={() => calculateNV(formIndex, "rightEye")} />
                    <Input placeholder="6/6" className="text-center font-mono" {...form.register(`tests.${formIndex}.rightEyeDv.va`)} />
                    <Input placeholder="62" className="text-center font-mono" {...form.register(`tests.${formIndex}.rightEyePd`)} />
                  </div>

                  {/* ADD Row */}
                  <div className="grid grid-cols-7 gap-2 items-center">
                    <div className="col-span-2 font-medium text-sm text-muted-foreground pl-2">Addition (ADD)</div>
                    <Input placeholder="+0.00" className="text-center font-mono bg-blue-50 border-blue-200" {...form.register(`tests.${formIndex}.rightEyeAdd`)} onBlur={() => calculateNV(formIndex, "rightEye")} />
                    <div className="col-span-4 text-xs text-muted-foreground pl-2 italic">Fill ADD to auto-calculate Near Vision</div>
                  </div>

                  {/* NV Row */}
                  <div className="grid grid-cols-7 gap-2 items-center">
                    <div className="col-span-2 font-medium text-sm text-muted-foreground pl-2">Near Vision (NV)</div>
                    <Input placeholder="±0.00" className="text-center font-mono" {...form.register(`tests.${formIndex}.rightEyeNv.sph`)} />
                    <Input placeholder="±0.00" className="text-center font-mono" {...form.register(`tests.${formIndex}.rightEyeNv.cyl`)} />
                    <Input placeholder="0-180" className="text-center font-mono" {...form.register(`tests.${formIndex}.rightEyeNv.axis`)} />
                    <Input placeholder="6/6" className="text-center font-mono" {...form.register(`tests.${formIndex}.rightEyeNv.va`)} />
                    <div className="col-span-1"></div>
                  </div>
                </div>

                <div className="h-px bg-border w-full my-6"></div>

                {/* LEFT EYE */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-700 flex items-center gap-2">
                    LEFT EYE (OS)
                  </h4>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground bg-muted py-2 rounded-md">
                    <div className="col-span-2 text-left pl-4">Type</div>
                    <div>SPH</div>
                    <div>CYL</div>
                    <div>AXIS</div>
                    <div>VA</div>
                    <div>PD</div>
                  </div>
                  
                  {/* DV Row */}
                  <div className="grid grid-cols-7 gap-2 items-center">
                    <div className="col-span-2 font-medium text-sm text-muted-foreground pl-2">Distance Vision (DV)</div>
                    <Input placeholder="±0.00" className="text-center font-mono" {...form.register(`tests.${formIndex}.leftEyeDv.sph`)} onBlur={() => calculateNV(formIndex, "leftEye")} />
                    <Input placeholder="±0.00" className="text-center font-mono" {...form.register(`tests.${formIndex}.leftEyeDv.cyl`)} onBlur={() => calculateNV(formIndex, "leftEye")} />
                    <Input placeholder="0-180" className="text-center font-mono" {...form.register(`tests.${formIndex}.leftEyeDv.axis`)} onBlur={() => calculateNV(formIndex, "leftEye")} />
                    <Input placeholder="6/6" className="text-center font-mono" {...form.register(`tests.${formIndex}.leftEyeDv.va`)} />
                    <Input placeholder="62" className="text-center font-mono" {...form.register(`tests.${formIndex}.leftEyePd`)} />
                  </div>

                  {/* ADD Row */}
                  <div className="grid grid-cols-7 gap-2 items-center">
                    <div className="col-span-2 font-medium text-sm text-muted-foreground pl-2">Addition (ADD)</div>
                    <Input placeholder="+0.00" className="text-center font-mono bg-blue-50 border-blue-200" {...form.register(`tests.${formIndex}.leftEyeAdd`)} onBlur={() => calculateNV(formIndex, "leftEye")} />
                    <div className="col-span-4 text-xs text-muted-foreground pl-2 italic">Fill ADD to auto-calculate Near Vision</div>
                  </div>

                  {/* NV Row */}
                  <div className="grid grid-cols-7 gap-2 items-center">
                    <div className="col-span-2 font-medium text-sm text-muted-foreground pl-2">Near Vision (NV)</div>
                    <Input placeholder="±0.00" className="text-center font-mono" {...form.register(`tests.${formIndex}.leftEyeNv.sph`)} />
                    <Input placeholder="±0.00" className="text-center font-mono" {...form.register(`tests.${formIndex}.leftEyeNv.cyl`)} />
                    <Input placeholder="0-180" className="text-center font-mono" {...form.register(`tests.${formIndex}.leftEyeNv.axis`)} />
                    <Input placeholder="6/6" className="text-center font-mono" {...form.register(`tests.${formIndex}.leftEyeNv.va`)} />
                    <div className="col-span-1"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Lens Recommendations & Types */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Lens Types</Label>
            <div className="grid grid-cols-2 gap-3">
              {LENS_TYPES.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`type-${type}`} 
                    checked={form.watch("lensTypes").includes(type)}
                    onCheckedChange={(checked) => {
                      const current = form.getValues("lensTypes");
                      const updated = checked 
                        ? [...current, type]
                        : current.filter(t => t !== type);
                      form.setValue("lensTypes", updated);
                    }}
                  />
                  <Label htmlFor={`type-${type}`} className="font-normal">{type}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Label className="text-base font-semibold">Lens Recommendations</Label>
            <div className="grid grid-cols-2 gap-3">
              {LENS_RECOMMENDATIONS.map(rec => (
                <div key={rec} className="flex items-center space-x-2">
                  <Checkbox id={`rec-${rec}`} />
                  <Label htmlFor={`rec-${rec}`} className="font-normal">{rec}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Notes */}
      <Card>
        <CardContent className="pt-6">
          <Label className="text-base font-semibold mb-2 block">Clinical Notes / Comments</Label>
          <Textarea 
            placeholder="Any special instructions for lenses, tinting, or general notes..."
            className="h-24 resize-none"
            {...form.register("notes")}
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 sticky bottom-4 bg-background/80 backdrop-blur p-4 border rounded-lg shadow-sm">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} size="lg" className="px-8">
          <CheckCircle className="mr-2 h-5 w-5" />
          {isSubmitting ? "Saving..." : (initialData ? "Update Prescription" : "Save Prescription")}
        </Button>
      </div>
    </form>
  );
}
