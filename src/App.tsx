import { Routes, Route, Navigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import Sidebar from "./components/Navigation/Sidebar";
import BottomNav from "./components/Navigation/BottomNav";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SubscriptionRoute from "./components/auth/SubscriptionRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import GymDashboard from "./pages/GymDashboard";
import CoachManagement from "./pages/CoachManagement";
import MemberCRM from "./pages/MemberCRM";
import Calendar from "./pages/Calendar";
import FinancialOverview from "./pages/FinancialOverview";
import AnalyticsReports from "./pages/AnalyticsReports";
import Inbox from "./pages/Inbox";
import GymSettings from "./pages/GymSettings";
import CheckInTerminal from "./pages/CheckInTerminal";
import AccessLogs from "./pages/AccessLogs";
import Pricing from "./pages/Pricing";
import LocationAnalysis from "./pages/LocationAnalysis";
import Programming from "./pages/Programming";
import Leaderboard from "./pages/Leaderboard";
import Memberships from "./pages/Memberships";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: resolvedTheme === "dark"
          ? "url('/gradient-bg-dark.png')"
          : "url('/gradient-bg-light.png')"
      }}
    >
      <Sidebar />
      <main className="md:ml-16 pb-20 md:pb-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
      <BottomNav />
      <Toaster position="top-right" richColors />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />

      {/* Pricing - accessible without subscription */}
      <Route
        path="/pricing"
        element={
          <ProtectedRoute>
            <Pricing />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - require active subscription */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <GymDashboard />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coaches"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <CoachManagement />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <MemberCRM />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <Calendar />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financials"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <FinancialOverview />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <AnalyticsReports />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <Inbox />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <GymSettings />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/memberships"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <Memberships />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/access-logs"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <AccessLogs />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <Leaderboard />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/programming"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <Programming />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/location-analysis"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <AppLayout>
                <LocationAnalysis />
              </AppLayout>
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      {/* Check-in Terminal - No layout, full screen kiosk mode */}
      <Route
        path="/terminal"
        element={
          <ProtectedRoute>
            <CheckInTerminal />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
