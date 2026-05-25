/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useQueryClient } from '@tanstack/react-query';
import { usePosStore } from '../store/usePosStore';
import { useInvoice } from '../hooks/useInvoice';
import CustomerSearch from '../../customers/components/CustomerSearch';
import PrescriptionGrid from '../../prescriptions/components/PrescriptionGrid';
import { useSavePrescription } from '../../prescriptions/hooks/useSavePrescription';
import { PrescriptionFormValues } from '../../prescriptions/schemas/prescription.schema';

export default function CustomerPanel(): JSX.Element {
  const activeInvoiceId = usePosStore((state) => state.activeInvoiceId);
  const { data: invoice } = useInvoice(activeInvoiceId || '');
  const { mutate: savePrescription } = useSavePrescription();
  const queryClient = useQueryClient();

  const handlePrescriptionSubmit = (data: PrescriptionFormValues) => {
    if (invoice?.customerId) {
      savePrescription({ customerId: invoice.customerId, data });
    }
  };

  let customerName = `ID: ${invoice?.customerId}`;
  let customerPhone = '';
  if (invoice?.customerId) {
    const queries = queryClient.getQueriesData<any[]>({ queryKey: ['customers', 'search'] });
    for (const [, cachedCustomers] of queries) {
      const cust = cachedCustomers?.find((c: any) => String(c.id) === String(invoice.customerId));
      if (cust) {
        customerName = cust.fullName;
        customerPhone = cust.phone || '';
        break;
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="text-lg font-semibold text-slate-800">Customer Details</h2>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!invoice?.customerId ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <CustomerSearch />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Customer Info</h3>
              <p className="text-slate-800 font-medium text-lg">{customerName}</p>
              {customerPhone && <p className="text-slate-500 text-sm">{customerPhone}</p>}
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Prescriptions</h3>
              <PrescriptionGrid onSubmit={handlePrescriptionSubmit} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
