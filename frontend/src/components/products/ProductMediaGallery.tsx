import { ProductInfoCard } from "./ProductInfoCard";
import { Image as ImageIcon } from "lucide-react";

export function ProductMediaGallery() {
  return (
    <ProductInfoCard title="Media Gallery" description="Product images and assets">
      <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-lg bg-muted/20">
        <div className="bg-primary/10 p-3 rounded-full mb-3">
          <ImageIcon className="h-6 w-6 text-primary" />
        </div>
        <h4 className="text-sm font-medium">No images uploaded</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs text-center">
          Images can be added during product creation or editing (pending API support).
        </p>
      </div>
    </ProductInfoCard>
  );
}
