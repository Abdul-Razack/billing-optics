import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.name} caught an error:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
          <h3>Something went wrong in {this.props.name}</h3>
          <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>{this.state.error?.message}</pre>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: '8px 16px', marginTop: '8px' }}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
