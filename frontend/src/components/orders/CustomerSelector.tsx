import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, User, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomerService } from "@/services/customer.service";
import { ApiCustomer } from "@/types/customer";
import { useDebounce } from "@/hooks/use-debounce";
import { CustomerQuickAddModal } from "./CustomerQuickAddModal";
import { PlusCircle } from "lucide-react";

interface CustomerSelectorProps {
  value: number | undefined;
  customer?: ApiCustomer | null;
  onChange: (customerId: number | undefined, customer: ApiCustomer | null) => void;
  error?: boolean;
  disabled?: boolean;
}

export function CustomerSelector({ value, customer, onChange, error, disabled }: CustomerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await CustomerService.getCustomers(debouncedSearch);
        if (isMounted) setCustomers(data);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchCustomers();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch]);

  const selectedCustomer = customers.find((c) => c.id === value) || customer;
  
  const sortedCustomers = [...customers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const [now] = useState(() => Date.now());
  const RECENT_THRESHOLD = 48 * 60 * 60 * 1000; // 48 hours
  const { recentCustomers, existingCustomers } = useMemo(() => {
    const recent = sortedCustomers.filter(c => (now - new Date(c.createdAt).getTime()) < RECENT_THRESHOLD);
    const existing = sortedCustomers.filter(c => (now - new Date(c.createdAt).getTime()) >= RECENT_THRESHOLD);
    return { recentCustomers: recent, existingCustomers: existing };
  }, [sortedCustomers, now, RECENT_THRESHOLD]);

  const renderCustomerItem = (c: ApiCustomer) => (
    <CommandItem
      key={c.id}
      value={c.id.toString()}
      onSelect={() => {
        onChange(c.id, c);
        setOpen(false);
      }}
      className="cursor-pointer"
    >
      <div className="flex flex-col">
        <span className="font-medium">{c.fullName}</span>
        <span className="text-xs text-muted-foreground">
          {c.phone || c.email || "No contact info"}
        </span>
      </div>
      <Check
        className={cn(
          "ml-auto h-4 w-4 shrink-0",
          value === c.id ? "opacity-100" : "opacity-0"
        )}
      />
    </CommandItem>
  );

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            {value && selectedCustomer ? (
              <span className="truncate">{selectedCustomer.fullName}</span>
            ) : value && !selectedCustomer ? (
              <span className="truncate">Customer Selected (ID: {value})</span>
            ) : (
              "Select Customer (Optional for Walk-in)"
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search customers by name, phone..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              ) : (
                "No customers found."
              )}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="walk-in"
                onSelect={() => {
                  onChange(undefined, null);
                  setOpen(false);
                }}
                className="font-medium text-primary cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Walk-in Customer (Guest)
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            </CommandGroup>
            
            {!isLoading && recentCustomers.length > 0 && (
              <CommandGroup heading="Recently Added">
                {recentCustomers.map(renderCustomerItem)}
              </CommandGroup>
            )}

            {!isLoading && existingCustomers.length > 0 && (
              <CommandGroup heading={recentCustomers.length > 0 ? "Existing Customers" : "Customers"}>
                {existingCustomers.map(renderCustomerItem)}
              </CommandGroup>
            )}
          </CommandList>
          
          <div className="p-2 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => {
                setOpen(false);
                setShowAddModal(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Customer
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>

    <CustomerQuickAddModal 
      open={showAddModal} 
      onOpenChange={setShowAddModal}
      onSuccess={(newCustomer) => {
        // Automatically select the new customer
        setCustomers(prev => [newCustomer, ...prev]);
        onChange(newCustomer.id, newCustomer);
      }}
    />
    </>
  );
}
