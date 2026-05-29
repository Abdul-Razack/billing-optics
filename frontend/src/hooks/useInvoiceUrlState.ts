import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export interface InvoiceUrlState {
  q: string;
  paymentStatus: string;
  status: string;
  sort: string;
  page: number;
  size: number;
}

export function useInvoiceUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: InvoiceUrlState = {
    q: searchParams.get("q") || "",
    paymentStatus: searchParams.get("paymentStatus") || "all",
    status: searchParams.get("status") || "all",
    sort: searchParams.get("sort") || "date-desc",
    page: parseInt(searchParams.get("page") || "0", 10),
    size: parseInt(searchParams.get("size") || "10", 10),
  };

  const updateState = useCallback((updates: Partial<InvoiceUrlState>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined || 
        value === "" || 
        (key === 'paymentStatus' && value === 'all') ||
        (key === 'status' && value === 'all') ||
        (key === 'sort' && value === 'date-desc') ||
        (key === 'page' && value === 0) ||
        (key === 'size' && value === 10)
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // If changing filters or search, reset page to 0 automatically unless page is explicitly in updates
    if (("q" in updates || "paymentStatus" in updates || "status" in updates) && !("page" in updates)) {
      params.delete("page");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const clearFilters = useCallback(() => {
    updateState({
      q: "",
      paymentStatus: "all",
      status: "all",
      page: 0
    });
  }, [updateState]);

  return { state, updateState, clearFilters };
}
