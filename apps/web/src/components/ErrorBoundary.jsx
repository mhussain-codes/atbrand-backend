import React from 'react';
import { RotateCw, Home, AlertCircle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AT BRAND ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center text-[#1C3A2B]">
          <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1C3A2B]">Kuch Masla Aa Gaya Hai</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Page load hone mein waqti masla aya hai. Baraye meharbani page refresh karein ya homepage par jayein.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1C3A2B] px-5 py-2.5 text-xs font-bold text-white shadow hover:opacity-90 transition"
              >
                <RotateCw className="h-4 w-4" />
                <span>Page Refresh Karein</span>
              </button>

              <button
                type="button"
                onClick={this.handleHome}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <Home className="h-4 w-4" />
                <span>Home Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
