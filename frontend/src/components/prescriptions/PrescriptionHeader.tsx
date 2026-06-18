import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Prescription } from "@/types/prescription";
import { Printer, Edit, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface PrescriptionHeaderProps {
  prescription: Prescription;
  children?: ReactNode;
}

export function PrescriptionHeader({ prescription, children }: PrescriptionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-6 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Prescription Data</h1>
            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
              Active
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
            <span>Rx ID: <span className="font-medium text-foreground">{String(prescription.id).toUpperCase()}</span></span>
            <span>•</span>
            <span>Recorded on: {new Date(prescription.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {children}
        <Button variant="outline" asChild>
          <Link href={`/prescriptions/${prescription.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Rx
        </Button>
      </div>
    </div>
  );
}
