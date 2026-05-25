import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCreateCustomer } from '../hooks/useCreateCustomer';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (customerId: number) => void;
  initialName?: string;
}

export default function CustomerFormModal({ isOpen, onClose, onSuccess, initialName = '' }: CustomerFormModalProps): JSX.Element | null {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const { mutate: createCustomer, isPending } = useCreateCustomer();

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setPhone('');
      setEmail('');
      setAddress('');
    }
  }, [isOpen, initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer(
      { name, phone, email: email || undefined, address: address || undefined },
      {
        onSuccess: (newCustomer) => {
          onSuccess?.(newCustomer.id);
          onClose();
        }
      }
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center animate-in fade-in duration-200 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[500px] shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Create Customer</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input 
              required
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
            <input 
              required
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. 555-0123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address (Optional)</label>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
              placeholder="123 Main St..."
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className={`px-6 py-2.5 font-semibold text-white rounded-lg flex items-center gap-2 transition-all ${
                isPending ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-95'
              }`}
            >
              {isPending && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isPending ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
