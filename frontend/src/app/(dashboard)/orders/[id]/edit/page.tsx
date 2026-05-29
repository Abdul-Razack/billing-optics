"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { OrderService } from "@/services/order.service";
import { CustomerService } from "@/services/customer.service";
import { ProductService } from "@/services/product.service";
import { ApiInvoice } from "@/types/order";
import { ApiCustomer } from "@/types/customer";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InvoiceLineItem } from "@/components/orders/InvoiceLineItems";

import { EditableOrderForm } from "@/components/orders/edit/EditableOrderForm";
import { EditSummaryPanel } from "@/components/orders/edit/EditSummaryPanel";
import { UnsavedChangesDialog } from "@/components/orders/edit/UnsavedChangesDialog";

export default function EditOrderPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [originalInvoice, setOriginalInvoice] = useState<ApiInvoice | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);
  
  // State for unsaved changes warning
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [customer, setCustomer] = useState<ApiCustomer | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "PARTIAL" | "UNPAID">("UNPAID");

  // Track if changes made
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const invoiceData = await OrderService.getOrderById(id);
        if (!isMounted) return;
        setOriginalInvoice(invoiceData);
        
        // Check for local draft to prevent overwriting
        const draftJson = localStorage.getItem(`order_edit_draft_${id}`);
        let hasDraft = false;
        if (draftJson) {
          try {
            const draft = JSON.parse(draftJson);
            setCustomerId(draft.customerId);
            setCustomer(draft.customer);
            setNotes(draft.notes !== undefined ? draft.notes : "");
            setDueDate(draft.dueDate !== undefined ? draft.dueDate : "");
            setPaymentStatus(draft.paymentStatus || invoiceData.paymentStatus);
            if (draft.lineItems) {
              setLineItems(draft.lineItems);
            }
            hasDraft = true;
          } catch(e) {}
        }

        if (!hasDraft) {
          // Populate local state from backend ONLY if no draft exists
          setCustomerId(invoiceData.customerId);
          setNotes(invoiceData.notes || "");
          setDueDate(invoiceData.dueDate || "");
          setPaymentStatus(invoiceData.paymentStatus);

          // Fetch Customer
          if (invoiceData.customerId) {
            try {
              const customerData = await CustomerService.getCustomerById(invoiceData.customerId);
              if (isMounted) setCustomer(customerData);
            } catch (err) {
              console.error("Failed to fetch customer", err);
            }
          }
          
          // Fetch Products for lines
          if (invoiceData.lines && invoiceData.lines.length > 0) {
            try {
              const items: InvoiceLineItem[] = [];
              for (const line of invoiceData.lines) {
                const pData = await ProductService.getProductById(line.productId);
                items.push({ product: pData, quantity: line.quantity });
              }
              if (isMounted) setLineItems(items);
            } catch (err) {
              console.error("Failed to fetch products", err);
            }
          }
        }
        
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [id]);

  // Dirty state checker
  useEffect(() => {
    if (!originalInvoice) return;
    const notesChanged = notes !== (originalInvoice.notes || "");
    const dueDateChanged = dueDate !== (originalInvoice.dueDate ? new Date(originalInvoice.dueDate).toISOString().split('T')[0] : "");
    const customerChanged = customerId !== originalInvoice.customerId;
    const paymentStatusChanged = paymentStatus !== originalInvoice.paymentStatus;
    const itemsChanged = JSON.stringify(lineItems.map(i => ({ id: i.product.id, qty: i.quantity }))) 
      !== JSON.stringify((originalInvoice.lines || []).map(l => ({ id: l.productId, qty: l.quantity })));
      
    const dirty = notesChanged || dueDateChanged || customerChanged || paymentStatusChanged || itemsChanged;
    setIsDirty(dirty);

    // Save draft if dirty, otherwise clear
    if (dirty) {
      localStorage.setItem(`order_edit_draft_${id}`, JSON.stringify({
        customerId,
        customer,
        notes,
        dueDate,
        paymentStatus,
        lineItems
      }));
    } else {
      localStorage.removeItem(`order_edit_draft_${id}`);
    }
  }, [notes, dueDate, customerId, paymentStatus, lineItems, originalInvoice, id, customer]);

  // Live Math
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  }, [lineItems]);

  const discountTotal = originalInvoice?.discountTotal || 0; // Mocked, backend doesn't support changing it well yet
  const taxTotal = originalInvoice?.taxTotal || 0; // Mocked
  const amountPaid = originalInvoice?.amountPaid || 0;
  
  const grandTotal = subtotal + taxTotal - discountTotal;
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  const handleSave = async () => {
    if (lineItems.length === 0) {
      toast.error("Order must contain at least one item.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<ApiInvoice> = {
        customerId,
        notes,
        dueDate,
        paymentStatus,
        subtotal,
        grandTotal,
        lines: lineItems.map(i => ({
          id: "", // mock id
          productId: i.product.id,
          quantity: i.quantity,
          unitPrice: i.product.sellingPrice,
          subtotal: i.product.sellingPrice * i.quantity
        }))
      };

      await OrderService.updateOrder(parseInt(id), payload);
      setIsDirty(false);
      localStorage.removeItem(`order_edit_draft_${id}`);
      router.push(`/orders/${id}`);
    } catch (err) {
      toast.error("Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!originalInvoice) return;
    setCustomerId(originalInvoice.customerId);
    setNotes(originalInvoice.notes || "");
    setDueDate(originalInvoice.dueDate || "");
    setPaymentStatus(originalInvoice.paymentStatus);
    localStorage.removeItem(`order_edit_draft_${id}`);
    // Need to reset line items by fetching products again or caching them.
    // For simplicity, we just reload the page
    window.location.reload();
  };

  const handleCancel = () => {
    if (isDirty) {
      setPendingNavigation(`/orders/${id}`);
      setShowUnsavedDialog(true);
    } else {
      router.push(`/orders/${id}`);
    }
  };

  const handleConfirmLeave = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
  };

  return (
    <PageContainer title={`Edit Order: ${originalInvoice?.invoiceNumber || id}`} description="Modify an existing order or invoice.">
      <ProductHeader title={`Edit Order ${originalInvoice?.invoiceNumber || ""}`} />

      {isLoading ? (
        <div className="flex flex-col justify-center items-center p-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500 animate-pulse">Loading order details...</p>
        </div>
      ) : error || !originalInvoice ? (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-8 rounded-lg text-center max-w-2xl mx-auto mt-6">
          <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
          <p className="mb-6">The requested invoice could not be loaded or does not exist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <EditableOrderForm 
              customerId={customerId}
              customer={customer}
              onCustomerChange={(id, c) => {
                setCustomerId(id);
                setCustomer(c);
              }}
              lineItems={lineItems}
              onAddProduct={(product) => {
                setLineItems((prev) => {
                  const existing = prev.find(i => i.product.id === product.id);
                  if (existing) {
                    return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
                  }
                  return [...prev, { product, quantity: 1 }];
                });
              }}
              onUpdateQuantity={(productId, qty) => {
                setLineItems((prev) => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
              }}
              onRemoveProduct={(productId) => {
                setLineItems((prev) => prev.filter(i => i.product.id !== productId));
              }}
              notes={notes}
              onNotesChange={setNotes}
              dueDate={dueDate}
              onDueDateChange={setDueDate}
              paymentStatus={paymentStatus}
              onPaymentStatusChange={setPaymentStatus}
              disabled={isSubmitting}
            />
          </div>

          <div className="lg:col-span-1">
            <EditSummaryPanel 
              customer={customer}
              itemCount={lineItems.length}
              subtotal={subtotal}
              discountTotal={discountTotal}
              taxTotal={taxTotal}
              grandTotal={grandTotal}
              amountPaid={amountPaid}
              balanceDue={balanceDue}
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              onSave={handleSave}
              onReset={handleReset}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      <UnsavedChangesDialog 
        open={showUnsavedDialog} 
        onOpenChange={setShowUnsavedDialog}
        onConfirm={handleConfirmLeave}
      />
    </PageContainer>
  );
}
