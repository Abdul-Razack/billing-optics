import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { Edit, FileText, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

interface CustomerProfileHeaderProps {
  customer: Customer;
  children?: ReactNode;
}

export function CustomerProfileHeader({ customer, children }: CustomerProfileHeaderProps) {
  const initials = customer.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6 p-6 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
          {initials}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{customer.fullName}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
            {customer.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{customer.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {children}
        <Button variant="outline" asChild>
          <Link href={`/customers/${customer.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>
    </div>
  );
}
