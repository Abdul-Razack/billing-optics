import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, BarChart3, PackageSearch, Users, DollarSign } from "lucide-react";

export type ReportType = "sales" | "inventory" | "customers" | "financial";

interface ReportExportSelectorProps {
  selected: ReportType;
  onSelect: (type: ReportType) => void;
}

export function ReportExportSelector({ selected, onSelect }: ReportExportSelectorProps) {
  const options = [
    {
      id: "sales",
      title: "Sales Report",
      description: "Revenue, orders, and top products",
      icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
      colorClass: "border-blue-200 bg-blue-50/50"
    },
    {
      id: "inventory",
      title: "Inventory Report",
      description: "Stock levels, valuation, and alerts",
      icon: <PackageSearch className="h-5 w-5 text-emerald-500" />,
      colorClass: "border-emerald-200 bg-emerald-50/50"
    },
    {
      id: "customers",
      title: "Customer Report",
      description: "Customer growth, segments, and top buyers",
      icon: <Users className="h-5 w-5 text-indigo-500" />,
      colorClass: "border-indigo-200 bg-indigo-50/50"
    },
    {
      id: "financial",
      title: "Financial Ledger",
      description: "Payment collections and receivables",
      icon: <DollarSign className="h-5 w-5 text-rose-500" />,
      colorClass: "border-rose-200 bg-rose-50/50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <Card 
            key={opt.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md relative overflow-hidden",
              isSelected ? `ring-2 ring-primary ${opt.colorClass}` : "hover:border-gray-300"
            )}
            onClick={() => onSelect(opt.id as ReportType)}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
            <CardContent className="p-4 flex items-start gap-4">
              <div className="mt-1 bg-white p-2 rounded-md shadow-sm border">
                {opt.icon}
              </div>
              <div className="space-y-1 pr-6">
                <h4 className="font-semibold text-base">{opt.title}</h4>
                <p className="text-sm text-muted-foreground">{opt.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
