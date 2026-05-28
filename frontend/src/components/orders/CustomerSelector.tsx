import { useState, useEffect } from "react";
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

interface CustomerSelectorProps {
  value: number | undefined;
  onChange: (customerId: number | undefined, customer: ApiCustomer | null) => void;
  error?: boolean;
  disabled?: boolean;
}

export function CustomerSelector({ value, onChange, error, disabled }: CustomerSelectorProps) {
  const [open, setOpen] = useState(false);
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

  const selectedCustomer = customers.find((c) => c.id === value);
  // Also we might need to fetch the initial selected customer if they are not in the list,
  // but for create-invoice, it starts empty, so we don't strictly need it.

  return (
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
              {!isLoading && customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={customer.id.toString()}
                  onSelect={() => {
                    onChange(customer.id, customer);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{customer.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {customer.phone || customer.email || "No contact info"}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0",
                      value === customer.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
