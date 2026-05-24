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

  const handlePrescriptionSubmit = (data: PrescriptionFormValues) => {
    if (invoice?.customerId) {
      savePrescription({ customerId: invoice.customerId, data });
    }
  };

  return (
    <div className="customer-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {!invoice?.customerId ? (
        <CustomerSearch />
      ) : (
        <div style={{ padding: '16px' }}>
          <h3>Customer ID: {invoice.customerId}</h3>
          <PrescriptionGrid onSubmit={handlePrescriptionSubmit} />
        </div>
      )}
    </div>
  );
}
