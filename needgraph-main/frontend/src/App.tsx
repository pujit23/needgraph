import React, { Suspense, lazy, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0A0A0F] text-[#F0F0F5] p-6">
          <div className="bg-[#111118] border border-[#1E1E2E] p-8 rounded-xl max-w-md w-full text-center shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-[#E05555]">Something went wrong</h2>
            <p className="text-[#8A8A9A] text-sm mb-6">{this.state.error?.message}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); }}
              className="px-4 py-2 bg-[#6C63FF] hover:bg-[#5a52d9] text-white rounded-md text-sm font-medium transition-colors mr-2"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#1E1E2E] hover:bg-[#2A2A40] text-[#F0F0F5] rounded-md text-sm font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Page Skeleton
const PageSkeleton = () => (
  <div className="p-6 space-y-6 w-full h-full">
    <div className="flex items-center justify-between">
      <div className="w-48 h-8 skeleton"></div>
      <div className="w-32 h-4 skeleton"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="h-32 skeleton"></div>
      <div className="h-32 skeleton"></div>
      <div className="h-32 skeleton"></div>
      <div className="h-32 skeleton"></div>
    </div>
    <div className="h-96 skeleton w-full"></div>
  </div>
);

// Lazy Loaded Pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NeedMap = lazy(() => import('./pages/NeedMap'));
const GraphExplorer = lazy(() => import('./pages/GraphExplorer'));
const Volunteers = lazy(() => import('./pages/Volunteers'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Reports = lazy(() => import('./pages/Reports'));
const Submit = lazy(() => import('./pages/Submit'));
const Settings = lazy(() => import('./pages/Settings'));
const CrisisSimulator = lazy(() => import('./pages/CrisisSimulator'));
const Analytics = lazy(() => import('./pages/Analytics'));
const NGODirectory = lazy(() => import('./pages/NGODirectory'));
const Resources = lazy(() => import('./pages/Resources'));

function TitleUpdater() {
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    let pageTitle = 'NeedGraph';
    
    switch (path) {
      case '/': pageTitle = 'Welcome'; break;
      case '/login': pageTitle = 'Sign In'; break;
      case '/register': pageTitle = 'Create Account'; break;
      case '/dashboard': pageTitle = 'Dashboard'; break;
      case '/dashboard/map': pageTitle = 'Need Map'; break;
      case '/graph': pageTitle = 'Graph Explorer'; break;
      case '/volunteers': pageTitle = 'Volunteers'; break;
      case '/alerts': pageTitle = 'Alerts'; break;
      case '/reports': pageTitle = 'Reports'; break;
      case '/submit': pageTitle = 'Submit Need'; break;
      case '/settings': pageTitle = 'Settings'; break;
      case '/simulator': pageTitle = 'Crisis Simulator'; break;
      case '/analytics': pageTitle = 'Analytics'; break;
      case '/ngo-directory': pageTitle = 'NGO Directory'; break;
      case '/resources': pageTitle = 'Resources'; break;
      default: break;
    }

    document.title = `${pageTitle} — NeedGraph`;
  }, [location.pathname]);

  return null;
}


export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <TitleUpdater />
          <Suspense fallback={
            <div className="flex h-screen w-screen bg-[#0A0A0F]">
              <div className="w-[220px] bg-[#0D0D14] border-r border-[#1E1E2E] flex-shrink-0">
                <div className="h-full skeleton opacity-50"></div>
              </div>
              <div className="flex-1 overflow-hidden">
                <PageSkeleton />
              </div>
            </div>
          }>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected dashboard routes */}
              <Route element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/map" element={<NeedMap />} />
                <Route path="/graph" element={<GraphExplorer />} />
                <Route path="/volunteers" element={<Volunteers />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/simulator" element={<CrisisSimulator />} />
                <Route path="/ngo-directory" element={<NGODirectory />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/submit" element={<Submit />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#111118', color: '#F0F0F5', border: '1px solid #1E1E2E' } }} />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
