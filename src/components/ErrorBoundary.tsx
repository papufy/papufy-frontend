import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Papufy render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#f5f5f5] p-6 text-center">
          <p className="text-lg font-bold text-papufy-text">
            Algo deu errado ao carregar o app
          </p>
          <p className="max-w-sm text-sm text-papufy-muted">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-11 rounded-xl bg-papufy-orange px-6 text-sm font-bold text-white active:scale-95"
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
