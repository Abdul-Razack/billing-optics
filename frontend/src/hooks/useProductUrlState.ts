import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export interface ProductUrlState {
  search: string;
  categoryId: string;
  stockStatus: string; // "all", "in-stock", "low-stock", "out-of-stock"
  status: string;      // "all", "active", "inactive"
  minPrice: string;
  maxPrice: string;
  sort: string;
  page: number;
  size: number;
  [key: string]: any; // For dynamic custom fields
}

export function useProductUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract all dynamic custom fields from URL
  const customFieldParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith("custom_")) {
      customFieldParams[key] = value;
    }
  });

  const state: ProductUrlState = {
    search: searchParams.get("search") || "",
    categoryId: searchParams.get("categoryId") || "all",
    stockStatus: searchParams.get("stockStatus") || "all",
    status: searchParams.get("status") || "all",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
    page: parseInt(searchParams.get("page") || "0", 10),
    size: parseInt(searchParams.get("size") || "10", 10),
    ...customFieldParams,
  };

  const updateState = useCallback((updates: Partial<ProductUrlState>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined || 
        value === "" || 
        ((key === 'categoryId' || key === 'stockStatus' || key === 'status') && value === 'all') ||
        (key === 'sort' && value === 'newest') ||
        (key === 'page' && value === 0) ||
        (key === 'size' && value === 10)
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // If changing filters or search, reset page to 0 automatically unless page is explicitly in updates
    if (
      Object.keys(updates).some(k => k !== 'page' && k !== 'size' && k !== 'sort') && 
      !("page" in updates)
    ) {
      params.delete("page");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const clearFilters = useCallback(() => {
    // Keep only search and sort, clear all other filters
    const updates: Partial<ProductUrlState> = {
      categoryId: "all",
      stockStatus: "all",
      status: "all",
      minPrice: "",
      maxPrice: "",
      page: 0
    };

    // Clear dynamic custom fields
    searchParams.forEach((_, key) => {
      if (key.startsWith("custom_")) {
        (updates as any)[key] = "";
      }
    });

    updateState(updates);
  }, [searchParams, updateState]);

  return { state, updateState, clearFilters };
}
