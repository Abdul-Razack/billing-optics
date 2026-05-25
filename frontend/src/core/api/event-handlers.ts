/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { QueryClient } from '@tanstack/react-query';
import { sseClient } from './events';
import { inventoryQueryKeys } from '../../features/inventory/hooks/useInventoryStock';
import { invoiceQueryKeys } from '../../features/pos/hooks/useInvoice';
import { prescriptionQueryKeys } from '../../features/prescriptions/hooks/useSavePrescription';
import { customerQueryKeys } from '../../features/customers/hooks/useCustomerSearch';

export function initializeEventHandlers(queryClient: QueryClient) {
  sseClient.connect();

  sseClient.onMessage((payload) => {
    switch (payload.type) {
      case 'inventory.updated':
        queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.stock(payload.entityId), refetchType: 'active' });
        break;
      case 'invoice.updated':
        queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.detail(payload.entityId), refetchType: 'active' });
        break;
      case 'prescription.created':
        queryClient.invalidateQueries({ queryKey: prescriptionQueryKeys.patient(payload.entityId), refetchType: 'active' });
        break;
      case 'customer.updated':
        queryClient.invalidateQueries({ queryKey: customerQueryKeys.search(''), refetchType: 'active' });
        break;
    }
  });
}
