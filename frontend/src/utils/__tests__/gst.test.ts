import { describe, it, expect } from 'vitest';
import { calculateGST } from '../gst';

describe('gst utils', () => {
  it('should calculate 18% GST correctly', () => {
    const result = calculateGST(100, 18);
    expect(result.taxAmount).toBe(18);
    expect(result.totalPrice).toBe(118);
  });

  it('should handle zero tax rate', () => {
    const result = calculateGST(100, 0);
    expect(result.taxAmount).toBe(0);
    expect(result.totalPrice).toBe(100);
  });

  it('should handle zero price', () => {
    const result = calculateGST(0, 18);
    expect(result.taxAmount).toBe(0);
    expect(result.totalPrice).toBe(0);
  });

  it('should calculate decimal prices correctly', () => {
    const result = calculateGST(99.99, 5);
    expect(result.taxAmount).toBeCloseTo(5.00);
    expect(result.totalPrice).toBeCloseTo(104.99);
  });
});
