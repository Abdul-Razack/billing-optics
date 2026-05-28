import { TableSkeleton, FormSkeleton, CardSkeleton } from "@/components/shared/LoadingSkeletons";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-[250px] lg:w-[350px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
      <TableSkeleton rows={5} columns={6} />
    </div>
  );
}

export function ProductFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <FormSkeleton />
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
