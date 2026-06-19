import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background p-6 text-center">
          <Card className="max-w-sm border-0 py-0 shadow-sm ring-border/80">
            <CardContent className="px-6 py-8">
              <p className="text-lg font-bold text-foreground">
                Algo deu errado ao carregar o app
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {this.state.error.message}
              </p>
              <Button
                type="button"
                variant="papufy"
                size="cta"
                className="mt-6"
                onClick={() => window.location.reload()}
              >
                Recarregar página
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
