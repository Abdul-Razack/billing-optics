import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export interface CustomerUrlState {
  q: string;
  status: string;
  date: string;
  hasFields: string;
  sort: string;
  page: number;
  size: number;
}

export function useCustomerUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: CustomerUrlState = {
    q: searchParams.get("q") || "",
    status: searchParams.get("status") || "all",
    date: searchParams.get("date") || "all",
    hasFields: searchParams.get("hasFields") || "all",
    sort: searchParams.get("sort") || "createdAt-desc",
    page: parseInt(searchParams.get("page") || "0", 10),
    size: parseInt(searchParams.get("size") || "10", 10),
  };

  const updateState = useCallback((updates: Partial<CustomerUrlState>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined || 
        value === "" || 
        (key === 'status' && value === 'all') ||
        (key === 'date' && value === 'all') ||
        (key === 'hasFields' && value === 'all') ||
        (key === 'sort' && value === 'createdAt-desc') ||
        (key === 'page' && value === 0) ||
        (key === 'size' && value === 10)
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // If changing filters or search, reset page to 0 automatically unless page is explicitly in updates
    if (("q" in updates || "status" in updates || "date" in updates || "hasFields" in updates) && !("page" in updates)) {
      params.delete("page");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const clearFilters = useCallback(() => {
    updateState({
      q: "",
      status: "all",
      date: "all",
      hasFields: "all",
      page: 0
    });
  }, [updateState]);

  return { state, updateState, clearFilters };
}
