import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback" role="alert">
          <h1>ERROR: SYSTEM FAILURE DETECTED!</h1>
          <p>Please refresh or try again later. Error details logged to console.</p>
          <button type="button" className="manga-btn" onClick={() => window.location.reload()}>
            REBOOT SYSTEM
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
