import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

// Temporarily suppress console.error during the test to keep output clean
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

// A component that intentionally throws an error
const BuggyComponent = () => {
  throw new Error('Test rendering error');
  return <div>Never reached</div>;
};

// A component that throws an error only when a button is clicked (event handler)
// Wait, ErrorBoundary in React 18+ only catches rendering errors, not event handlers.
// So we test the rendering error.

describe('ErrorBoundary', () => {
  it('catches rendering errors and displays fallback UI', () => {
    render(
      <ErrorBoundary name="TestComponent">
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong in TestComponent')).toBeInTheDocument();
    expect(screen.getByText('Test rendering error')).toBeInTheDocument();
  });

  it('allows retrying after an error', () => {
    let shouldThrow = true;
    
    const RetryableBuggyComponent = () => {
      if (shouldThrow) {
        throw new Error('Initial crash');
      }
      return <div>Success!</div>;
    };

    render(
      <ErrorBoundary name="RetryComponent">
        <RetryableBuggyComponent />
      </ErrorBoundary>
    );

    // Verify it crashed
    expect(screen.getByText('Something went wrong in RetryComponent')).toBeInTheDocument();

    // Fix the bug and click retry
    shouldThrow = false;
    fireEvent.click(screen.getByText('Retry'));

    // Verify it recovered
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
});
