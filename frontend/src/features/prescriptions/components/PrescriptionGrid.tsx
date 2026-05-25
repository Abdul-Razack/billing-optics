/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { prescriptionSchema, PrescriptionFormValues } from '../schemas/prescription.schema';

interface PrescriptionGridProps {
  onSubmit: (data: PrescriptionFormValues) => void;
}

export default function PrescriptionGrid({ onSubmit }: PrescriptionGridProps): JSX.Element {
  const { register, handleSubmit, formState: { errors } } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.tagName !== 'INPUT') return;

    const form = target.form;
    if (!form) return;

    const inputs = Array.from(form.querySelectorAll('input'));
    const index = inputs.indexOf(target);

    let nextIndex = -1;

    if (e.key === 'ArrowRight') nextIndex = index + 1;
    else if (e.key === 'ArrowLeft') nextIndex = index - 1;
    else if (e.key === 'ArrowDown' || e.key === 'Enter') nextIndex = index + 5;
    else if (e.key === 'ArrowUp') nextIndex = index - 5;

    if (nextIndex >= 0 && nextIndex < inputs.length) {
      e.preventDefault();
      inputs[nextIndex].focus();
    }
  };

  const renderEyeRow = (eye: 'rightEye' | 'leftEye', label: string) => (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-24 font-bold text-slate-700 text-sm">{label}</div>
      <input type="number" step="any" placeholder="SPH" {...register(`${eye}.sphere`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-20 border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
      <input type="number" step="any" placeholder="CYL" {...register(`${eye}.cylinder`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-20 border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
      <input type="number" step="any" placeholder="AXIS" {...register(`${eye}.axis`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-20 border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
      <input type="number" step="any" placeholder="ADD" {...register(`${eye}.add`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-20 border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
      <input type="number" step="any" placeholder="PD" {...register(`${eye}.pd`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-20 border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Prescription</h3>
      
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-[100px_repeat(5,minmax(60px,1fr))] gap-3 mb-2 items-center">
          <div></div>
          <div className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider">SPH</div>
          <div className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider">CYL</div>
          <div className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider">AXIS</div>
          <div className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider">ADD</div>
          <div className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider">PD</div>
        </div>
        
        <div className="grid grid-cols-[100px_repeat(5,minmax(60px,1fr))] gap-3 mb-3 items-center">
          <div className="font-bold text-slate-700 text-sm truncate">OD (Right)</div>
          <input type="number" step="any" placeholder="SPH" {...register(`rightEye.sphere`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
          <input type="number" step="any" placeholder="CYL" {...register(`rightEye.cylinder`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
          <input type="number" step="any" placeholder="AXIS" {...register(`rightEye.axis`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
          <input type="number" step="any" placeholder="ADD" {...register(`rightEye.add`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
          <input type="number" step="any" placeholder="PD" {...register(`rightEye.pd`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
        </div>

        <div className="grid grid-cols-[100px_repeat(5,minmax(60px,1fr))] gap-3 mb-3 items-center">
          <div className="font-bold text-slate-700 text-sm truncate">OS (Left)</div>
          <input type="number" step="any" placeholder="SPH" {...register(`leftEye.sphere`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
          <input type="number" step="any" placeholder="CYL" {...register(`leftEye.cylinder`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
          <input type="number" step="any" placeholder="AXIS" {...register(`leftEye.axis`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
          <input type="number" step="any" placeholder="ADD" {...register(`leftEye.add`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
          <input type="number" step="any" placeholder="PD" {...register(`leftEye.pd`, { valueAsNumber: true })} onKeyDown={handleKeyDown} className="w-full border border-slate-300 rounded-md p-2 text-center text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700 mb-1">Doctor Name</label>
          <input type="text" placeholder="Optometrist Name" {...register('doctorName')} onKeyDown={handleKeyDown} className={`border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 transition-colors ${errors.doctorName ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`} />
          {errors.doctorName && <span className="text-red-500 text-xs mt-1 font-medium">{errors.doctorName.message}</span>}
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
          <input type="date" {...register('expiryDate')} onKeyDown={handleKeyDown} className={`border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 transition-colors ${errors.expiryDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`} />
          {errors.expiryDate && <span className="text-red-500 text-xs mt-1 font-medium">{errors.expiryDate.message}</span>}
        </div>
        
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
          <input type="text" placeholder="Any additional instructions..." {...register('notes')} onKeyDown={handleKeyDown} className="border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-all active:scale-[0.98]">
          Save Prescription
        </button>
      </div>
    </form>
  );
}
