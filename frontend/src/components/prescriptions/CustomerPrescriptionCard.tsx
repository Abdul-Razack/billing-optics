import { Customer } from "@/types/customer";
import { Prescription } from "@/types/prescription";
import { User, Phone, MapPin, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CustomerPrescriptionCardProps {
  customer: Customer;
  latestPrescription?: Prescription;
}

export function CustomerPrescriptionCard({ customer, latestPrescription }: CustomerPrescriptionCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{customer.fullName}</h3>
            <div className="text-sm text-muted-foreground mt-1 flex flex-col gap-1">
              <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {customer.phone}</span>
              {customer.address && <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {customer.address}</span>}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/customers/${customer.id}`}>View Profile</Link>
        </Button>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4" /> 
          Current Active Prescription
        </h4>
        {latestPrescription ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Recorded: {new Date(latestPrescription.createdAt).toLocaleDateString()}</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50/50 rounded p-3 border border-blue-100">
                <div className="text-xs font-semibold text-blue-900 mb-2">RIGHT EYE (OD)</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground text-xs block">SPH</span>{latestPrescription.rightEye.sphere || "—"}</div>
                  <div><span className="text-muted-foreground text-xs block">CYL</span>{latestPrescription.rightEye.cylinder || "—"}</div>
                </div>
              </div>
              <div className="bg-green-50/50 rounded p-3 border border-green-100">
                <div className="text-xs font-semibold text-green-900 mb-2">LEFT EYE (OS)</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground text-xs block">SPH</span>{latestPrescription.leftEye.sphere || "—"}</div>
                  <div><span className="text-muted-foreground text-xs block">CYL</span>{latestPrescription.leftEye.cylinder || "—"}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic py-2">
            No active prescription found for this patient.
          </div>
        )}
      </div>
    </div>
  );
}
