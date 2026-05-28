import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

interface EyeMeasurementCardProps {
  title: "Right Eye (OD)" | "Left Eye (OS)";
  children: ReactNode;
  className?: string;
}

export function EyeMeasurementCard({ title, children, className }: EyeMeasurementCardProps) {
  const isRight = title.includes("Right");
  
  return (
    <div className={cn(
      "rounded-lg border shadow-sm flex flex-col overflow-hidden transition-all",
      isRight ? "border-blue-200/50 bg-blue-50/20" : "border-green-200/50 bg-green-50/20",
      className
    )}>
      <div className={cn(
        "px-4 py-2.5 border-b flex items-center gap-2",
        isRight ? "bg-blue-100/50 border-blue-200/50 text-blue-900" : "bg-green-100/50 border-green-200/50 text-green-900"
      )}>
        <Eye className="h-4 w-4 opacity-75" />
        <h3 className="font-semibold text-sm tracking-tight">{title}</h3>
      </div>
      <div className="p-4 flex-1">
        {children}
      </div>
    </div>
  );
}
