import React, { Component } from "react";
import { AlertTriangle, RefreshCw, Trash2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { ToastError } from "../services/ToastMsg";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener("unhandledrejection", this.handlePromiseRejection);
    window.addEventListener("error", this.handleGlobalError);
  }

  componentWillUnmount() {
    window.removeEventListener("unhandledrejection", this.handlePromiseRejection);
    window.removeEventListener("error", this.handleGlobalError);
  }

  handlePromiseRejection = (event) => {
    console.error("Unhandled promise rejection caught globally:", event.reason);
    const message = event.reason?.message || event.reason || "Unhandled asynchronous error occurred.";
    ToastError(`Asynchronous Error: ${message}`);
  };

  handleGlobalError = (event) => {
    // If it's a React render error, getDerivedStateFromError catches it.
    // We only log/notify here if it's a global window error outside React rendering.
    if (event.error && !this.state.hasError) {
      console.error("Global window error caught:", event.error);
      ToastError(`Application Error: ${event.error.message || "An unexpected error occurred."}`);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    window.location.reload();
  };

  handleClearCacheAndReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    } catch (e) {
      window.location.reload();
    }
  };

  handleCopyError = () => {
    const { error, errorInfo } = this.state;
    const errorDetails = `Error: ${error?.message}\n\nStack: ${error?.stack}\n\nComponent Stack: ${errorInfo?.componentStack}`;
    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300 ease-out scale-100">
            {/* Header section with dynamic gradient */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-white flex flex-col items-center text-center">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-md mb-4 animate-bounce">
                <AlertTriangle size={48} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
              <p className="text-red-100 max-w-md text-sm">
                An unexpected error occurred while loading this page. Our team has been notified.
              </p>
            </div>

            {/* Main content body */}
            <div className="p-8 space-y-6">
              {/* Short Error Message Block */}
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-sm font-semibold text-red-900">Error Details</p>
                <p className="text-sm text-red-700 font-mono mt-1 break-all">
                  {this.state.error?.toString() || "Unknown error"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl font-medium shadow-sm transition-all active:scale-[0.98]"
                >
                  <RefreshCw size={18} />
                  Reload Page
                </button>
                <button
                  onClick={this.handleClearCacheAndReset}
                  className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3 px-4 rounded-xl font-medium shadow-sm transition-all active:scale-[0.98]"
                >
                  <Trash2 size={18} className="text-slate-500" />
                  Clear Cache & Restart
                </button>
              </div>

              {/* Expandable Technical details */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => this.setState((prev) => ({ showDetails: !prev }))}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 text-slate-700 text-sm font-medium transition-all"
                >
                  <span className="flex items-center gap-2">
                    Show Diagnostic Information
                  </span>
                  {this.state.showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {this.state.showDetails && (
                  <div className="p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto space-y-4 border-t border-slate-100 relative max-h-[300px] scrollbar-thin">
                    <button
                      onClick={this.handleCopyError}
                      className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1.5"
                      title="Copy stack trace to clipboard"
                    >
                      {this.state.copied ? (
                        <>
                          <Check size={14} className="text-green-400" />
                          <span className="text-[10px] text-green-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>
                    <div className="pr-12">
                      <p className="font-bold text-red-400 mb-2">Error Stack:</p>
                      <pre className="whitespace-pre-wrap break-all select-all">
                        {this.state.error?.stack || "No stack trace available"}
                      </pre>
                      {this.state.errorInfo?.componentStack && (
                        <>
                          <p className="font-bold text-sky-400 mt-4 mb-2">Component Tree Stack:</p>
                          <pre className="whitespace-pre-wrap break-all select-all">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
