export const queryKeys = {
  auth: {
    session: () => ['auth', 'session'] as const,
  },
  inventory: {
    all: () => ['inventory', 'all'] as const,
    stock: (id: string) => ['inventory', 'stock', id] as const,
  },
  invoices: {
    all: () => ['invoices', 'all'] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
  },
  customers: {
    search: (query: string) => ['customers', 'search', query] as const,
  },
  prescriptions: {
    patient: (customerId: string) => ['prescriptions', 'patient', customerId] as const,
  },
} as const;
