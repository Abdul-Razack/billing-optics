import { ApiCustomer } from "@/types/customer";
import { UserIcon, PhoneIcon, MailIcon, MapPinIcon } from "lucide-react";

export function CustomerInvoiceCard({ customer, mockName }: { customer: ApiCustomer | null, mockName?: string }) {
  if (!customer && !mockName) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm h-full">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Customer Information</h2>
        <div className="flex items-center gap-3 text-gray-500 py-4">
          <UserIcon className="h-5 w-5" />
          <p className="italic">Walk-in Customer / No details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm h-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Customer Information</h2>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">{customer?.fullName || mockName}</p>
            {customer && <p className="text-sm text-gray-500">ID: {customer.id}</p>}
          </div>
        </div>
        
        {customer?.phone && (
          <div className="flex items-center gap-3">
            <PhoneIcon className="h-5 w-5 text-gray-400" />
            <p className="text-sm text-gray-700">{customer.phone}</p>
          </div>
        )}
        
        {customer?.email && (
          <div className="flex items-center gap-3">
            <MailIcon className="h-5 w-5 text-gray-400" />
            <p className="text-sm text-gray-700">{customer.email}</p>
          </div>
        )}
        
        {customer?.address && (
          <div className="flex items-start gap-3">
            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{customer.address}</p>
          </div>
        )}
      </div>
    </div>
  );
}
