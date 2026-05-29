import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomerSelector } from "@/components/orders/CustomerSelector";
import { ProductOrderSelector } from "@/components/orders/ProductOrderSelector";
import { InvoiceLineItems, InvoiceLineItem } from "@/components/orders/InvoiceLineItems";
import { ApiCustomer } from "@/types/customer";
import { ApiProduct } from "@/services/product.service";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentStatusBadge } from "@/components/orders/PaymentStatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentStatus } from "@/types/order";

interface EditableOrderFormProps {
  customerId: number | undefined;
  customer: ApiCustomer | null;
  onCustomerChange: (id: number | undefined, c: ApiCustomer | null) => void;
  
  lineItems: InvoiceLineItem[];
  onAddProduct: (p: ApiProduct) => void;
  onUpdateQuantity: (productId: number, qty: number) => void;
  onRemoveProduct: (productId: number) => void;

  notes: string;
  onNotesChange: (notes: string) => void;

  dueDate: string;
  onDueDateChange: (date: string) => void;

  paymentStatus: PaymentStatus;
  onPaymentStatusChange: (status: PaymentStatus) => void;
  
  disabled?: boolean;
}

export function EditableOrderForm({
  customerId,
  customer,
  onCustomerChange,
  lineItems,
  onAddProduct,
  onUpdateQuantity,
  onRemoveProduct,
  notes,
  onNotesChange,
  dueDate,
  onDueDateChange,
  paymentStatus,
  onPaymentStatusChange,
  disabled
}: EditableOrderFormProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4 flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-lg">Customer & Meta</CardTitle>
            <CardDescription>Update customer association and order details.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <CustomerSelector 
              value={customerId} 
              customer={customer}
              onChange={onCustomerChange} 
              disabled={disabled}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input 
                type="date" 
                value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => onDueDateChange(e.target.value)}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={(v) => onPaymentStatusChange(v as PaymentStatus)} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Order Items</CardTitle>
            <CardDescription>Modify products and quantities.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProductOrderSelector onAdd={onAddProduct} disabled={disabled} />
          
          <div className="pt-2">
            <InvoiceLineItems 
              items={lineItems} 
              onChangeQuantity={onUpdateQuantity}
              onRemove={onRemoveProduct}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Notes</CardTitle>
          <CardDescription>Add or update internal notes or customer-facing terms.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Enter notes..." 
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            disabled={disabled}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
