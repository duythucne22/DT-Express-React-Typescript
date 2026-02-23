import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import LoginPage from './app/auth/LoginPage';
import OrdersPage from './app/orders/OrdersPage';
import OrderDetailPage from './app/orders/OrderDetailPage';
import CreateOrderPage from './app/orders/CreateOrderPage';
import TrackingPage from './app/tracking/TrackingPage';
import CarriersPage from './app/carriers/CarriersPage';
import RoutingPage from './app/routing/RoutingPage';
import ReportsPage from './app/reports/ReportsPage';
import SettingsPage from './app/settings/SettingsPage';
import RequirePermission from './components/auth/RequirePermission';

// Placeholder pages for dashboard routes (to be implemented)
const DashboardHome = () => (
  <div className="text-slate-700">
    <h2 className="text-2xl font-semibold text-slate-900 mb-4">Dashboard</h2>
    <p className="text-slate-500">Dashboard content coming soon.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Public pages with Navbar + Footer */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <main><Home /></main>
              <Footer />
            </div>
          }
        />
        <Route
          path="/services"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <main><Services /></main>
              <Footer />
            </div>
          }
        />
        <Route
          path="/about"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <main><About /></main>
              <Footer />
            </div>
          }
        />
        <Route
          path="/contact"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <main><Contact /></main>
              <Footer />
            </div>
          }
        />
        <Route path="/track" element={<Navigate to="/dashboard/tracking" replace />} />

        {/* Auth routes  */}
        <Route path="/auth/login" element={
          <div className="min-h-screen bg-white">
              <Navbar />
              <main><LoginPage /></main>
              <Footer />
            </div>
        } />
        <Route path="/auth/signup" element={
          <div className="min-h-screen bg-white">
              <Navbar />
              <main><LoginPage /></main>
              <Footer />
            </div>
        } />
        {/* Dashboard routes (protected, with sidebar + header) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/create" element={<CreateOrderPage />} />
          <Route path="tracking" element={<TrackingPage />} />
          <Route path="carriers" element={<CarriersPage />} />
          <Route path="routing" element={<RoutingPage />} />
          <Route
            path="reports"
            element={
              <RequirePermission permission="canViewReports">
                <ReportsPage />
              </RequirePermission>
            }
          />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="/orders/:id" element={<DashboardLayout />}>
          <Route index element={<OrderDetailPage />} />
        </Route>

        <Route path="/orders" element={<DashboardLayout />}>
          <Route index element={<OrdersPage />} />
          <Route path="create" element={<CreateOrderPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
