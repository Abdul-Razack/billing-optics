import { CustomField } from "@/types/custom-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFieldTypeIcon, getFieldTypeLabel } from "./FieldTypeSelector";
import { Edit, Package, Users } from "lucide-react";
import Link from "next/link";

interface DynamicFieldCardProps {
  field: CustomField;
}

export function DynamicFieldCard({ field }: DynamicFieldCardProps) {
  return (
    <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex flex-col hover:border-primary/30 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-md">
            {getFieldTypeIcon(field.type)}
          </div>
          <div>
            <h3 className="font-semibold">{field.name}</h3>
            <p className="text-xs font-mono text-muted-foreground">{field.key}</p>
          </div>
        </div>
        <Badge variant={field.isActive ? "default" : "secondary"}>
          {field.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mt-auto border-t border-border pt-4">
        <div>
          <span className="text-muted-foreground block text-xs mb-1">Target Entity</span>
          <div className="flex items-center gap-1 font-medium">
            {field.entityTarget === "PRODUCT" ? <Package className="h-3 w-3" /> : <Users className="h-3 w-3" />}
            {field.entityTarget === "PRODUCT" ? "Product" : "Customer"}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs mb-1">Field Type</span>
          <span className="font-medium">{getFieldTypeLabel(field.type)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs mb-1">Validation</span>
          <span className="font-medium">{field.isRequired ? "Required" : "Optional"}</span>
        </div>
        {field.options && field.options.length > 0 && (
          <div>
            <span className="text-muted-foreground block text-xs mb-1">Options</span>
            <span className="font-medium">{field.options.length} items</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/custom-fields/${field.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Configuration
          </Link>
        </Button>
      </div>
    </div>
  );
}
