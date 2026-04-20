import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200 rounded-2xl border border-red-200 dark:border-red-800 m-4">
            <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
            <p className="text-sm font-mono bg-red-100 dark:bg-red-900/50 p-3 rounded-xl overflow-x-auto">
              {this.state.error?.toString()}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
