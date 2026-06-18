import { Prescription } from "@/types/prescription";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PrescriptionHistoryTimelineProps {
  prescriptions: Prescription[];
}

export function PrescriptionHistoryTimeline({ prescriptions }: PrescriptionHistoryTimelineProps) {
  // Sort descending by date
  const sorted = [...prescriptions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (sorted.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-card">
        No prescription history found for this patient.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sorted.map((rx, index) => {
        const isLatest = index === 0;
        return (
          <div key={rx.id} className="relative flex gap-6">
            {/* Timeline connector line */}
            {index !== sorted.length - 1 && (
              <div className="absolute left-5 top-12 bottom-[-32px] w-0.5 bg-border" />
            )}
            
            <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${isLatest ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
              {isLatest ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            </div>
            
            <div className="flex-1 bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">{new Date(rx.createdAt).toLocaleDateString()}</span>
                    {isLatest && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Current Active</Badge>}
                    {!isLatest && <Badge variant="secondary">Archived</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rx ID: {rx.id}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/prescriptions/${rx.id}`}>View Full Details</Link>
                </Button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Right Eye */}
                  <div>
                    <h5 className="text-xs font-semibold text-blue-800 mb-3 border-b border-blue-100 pb-1">RIGHT EYE (OD)</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div><span className="text-muted-foreground text-xs block mb-1">SPH</span>{rx.tests?.[0]?.rightEyeDv?.sph || "—"}</div>
                      <div><span className="text-muted-foreground text-xs block mb-1">CYL</span>{rx.tests?.[0]?.rightEyeDv?.cyl || "—"}</div>
                      <div><span className="text-muted-foreground text-xs block mb-1">AXIS</span>{rx.tests?.[0]?.rightEyeDv?.axis || "—"}</div>
                      <div><span className="text-muted-foreground text-xs block mb-1">ADD</span>{rx.tests?.[0]?.rightEyeAdd || "—"}</div>
                    </div>
                  </div>
                  
                  {/* Left Eye */}
                  <div>
                    <h5 className="text-xs font-semibold text-green-800 mb-3 border-b border-green-100 pb-1">LEFT EYE (OS)</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div><span className="text-muted-foreground text-xs block mb-1">SPH</span>{rx.tests?.[0]?.leftEyeDv?.sph || "—"}</div>
                      <div><span className="text-muted-foreground text-xs block mb-1">CYL</span>{rx.tests?.[0]?.leftEyeDv?.cyl || "—"}</div>
                      <div><span className="text-muted-foreground text-xs block mb-1">AXIS</span>{rx.tests?.[0]?.leftEyeDv?.axis || "—"}</div>
                      <div><span className="text-muted-foreground text-xs block mb-1">ADD</span>{rx.tests?.[0]?.leftEyeAdd || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
