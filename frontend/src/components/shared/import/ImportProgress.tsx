import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ImportProgressProps {
  current: number;
  total: number;
  title?: string;
  description?: string;
}

export function ImportProgress({ 
  current, 
  total,
  title = "Importing Data...",
  description = "Please do not close this window while the import is in progress."
}: ImportProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="p-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-8">
        {description}
      </p>
      
      <div className="w-full max-w-md">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span>Processing record {current} of {total}</span>
          <span>{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-3" />
      </div>
    </div>
  );
}
