import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

//  Catches errors thrown while loading lazy route chunks.

export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const isChunkError =
      /Loading chunk|Failed to fetch dynamically imported module|importing a module script failed/i.test(
        message
      );

    if (isChunkError && !sessionStorage.getItem("chunk-reloaded")) {
      sessionStorage.setItem("chunk-reloaded", "1");
      window.location.reload();
    }
  }

  private handleRetry = () => {
    sessionStorage.removeItem("chunk-reloaded");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-gray px-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-brand-dark">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-gray-500">
            We couldn't load this page. This can happen after an update — please
            reload to get the latest version.
          </p>
          <button
            onClick={this.handleRetry}
            className="rounded-lg bg-brand-yellow px-6 py-2.5 text-sm font-bold text-brand-dark transition hover:bg-brand-yellow-dark"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
