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
    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
      <div style={{ width: '80px', fontWeight: 'bold', alignSelf: 'center' }}>{label}</div>
      <input type="number" step="any" placeholder="SPH" {...register(`${eye}.sphere`, { valueAsNumber: true })} onKeyDown={handleKeyDown} style={{ width: '60px' }} />
      <input type="number" step="any" placeholder="CYL" {...register(`${eye}.cylinder`, { valueAsNumber: true })} onKeyDown={handleKeyDown} style={{ width: '60px' }} />
      <input type="number" step="any" placeholder="AXIS" {...register(`${eye}.axis`, { valueAsNumber: true })} onKeyDown={handleKeyDown} style={{ width: '60px' }} />
      <input type="number" step="any" placeholder="ADD" {...register(`${eye}.add`, { valueAsNumber: true })} onKeyDown={handleKeyDown} style={{ width: '60px' }} />
      <input type="number" step="any" placeholder="PD" {...register(`${eye}.pd`, { valueAsNumber: true })} onKeyDown={handleKeyDown} style={{ width: '60px' }} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="prescription-grid" style={{ padding: '16px' }}>
      <h3>Prescription</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '80px' }}></div>
        <div style={{ width: '60px', fontSize: '12px', textAlign: 'center' }}>SPH</div>
        <div style={{ width: '60px', fontSize: '12px', textAlign: 'center' }}>CYL</div>
        <div style={{ width: '60px', fontSize: '12px', textAlign: 'center' }}>AXIS</div>
        <div style={{ width: '60px', fontSize: '12px', textAlign: 'center' }}>ADD</div>
        <div style={{ width: '60px', fontSize: '12px', textAlign: 'center' }}>PD</div>
      </div>
      
      {renderEyeRow('rightEye', 'OD (Right)')}
      {renderEyeRow('leftEye', 'OS (Left)')}

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <input type="text" placeholder="Doctor Name" {...register('doctorName')} onKeyDown={handleKeyDown} />
        {errors.doctorName && <span style={{ color: 'red' }}>{errors.doctorName.message}</span>}
        <input type="date" {...register('expiryDate')} onKeyDown={handleKeyDown} />
        {errors.expiryDate && <span style={{ color: 'red' }}>{errors.expiryDate.message}</span>}
        <input type="text" placeholder="Notes" {...register('notes')} onKeyDown={handleKeyDown} />
      </div>

      <button type="submit" style={{ marginTop: '16px', padding: '8px 16px' }}>Save Prescription</button>
    </form>
  );
}
