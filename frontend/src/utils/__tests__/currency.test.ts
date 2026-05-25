import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../currency';

describe('currency utils', () => {
  it('should format positive amounts correctly', () => {
    const formatted = formatCurrency(1500.50);
    expect(formatted).toMatch(/1,500\.50/); // Depends on exact locale characters
  });

  it('should format zero correctly', () => {
    const formatted = formatCurrency(0);
    expect(formatted).toMatch(/0\.00/);
  });

  it('should format negative amounts correctly', () => {
    const formatted = formatCurrency(-500);
    expect(formatted).toMatch(/500\.00/);
    expect(formatted).toMatch(/-/);
  });
});
