import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import AccountInfo from "./pages/AccountInfo.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import ManagerUsers from "./pages/ManagerUsers.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Transactions from "./pages/Transactions.jsx";
import {useAuth} from "./hooks/useAuth";

// Events
import Events from "./pages/Events.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import EditEvent from "./pages/EditEvent.jsx";

// Promotions
import PromotionsUserPage from "./pages/PromotionsUserPage.jsx";
import PromotionsManagerListPage from "./pages/PromotionsManagerListPage.jsx";
import PromotionCreatePage from "./pages/PromotionCreatePage.jsx";
import PromotionDetailPage from "./pages/PromotionDetailPage.jsx";
import PromotionViewPage from "./pages/PromotionViewPage.jsx";

// Route wrappers
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function ManagerRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user || (user.role !== "manager" && user.role !== "superuser")) {
    return <Navigate to="/" replace />;
  }

    return children;
}

export default function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route path="/reset" element={<ResetPassword />} />

      {/* PROTECTED ROUTES */}
      <Route path="/" element={<Navigate to="/events" replace />} />

        <Route
            path="/transactions"
            element={
                <ProtectedRoute>
                    <Transactions />
                </ProtectedRoute>
            }
        />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountInfo />
          </ProtectedRoute>
        }
      />

      <Route
        path="/password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* EVENTS ROUTES */}
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/events/new"
        element={
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/events/:id"
        element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/events/:id/edit"
        element={
          <ProtectedRoute>
            <EditEvent />
          </ProtectedRoute>
        }
      />

      {/* PROMOTIONS ROUTES */}
      <Route
        path="/promotions"
        element={
          <ProtectedRoute>
            <PromotionsUserPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/promotions/:id/view"
        element={
          <ProtectedRoute>
            <PromotionViewPage />
          </ProtectedRoute>
        }
      />

      {/* MANAGER PROMOTIONS */}
      <Route
        path="/manager/promotions"
        element={
          <ManagerRoute>
            <PromotionsManagerListPage />
          </ManagerRoute>
        }
      />

      <Route
        path="/manager/promotions/create"
        element={
          <ManagerRoute>
            <PromotionCreatePage />
          </ManagerRoute>
        }
      />

      <Route
        path="/manager/promotions/:id"
        element={
          <ManagerRoute>
            <PromotionDetailPage />
          </ManagerRoute>
        }
      />

      {/* MANAGER USERS */}
      <Route
        path="/manager/users"
        element={
          <ManagerRoute>
            <ManagerUsers />
          </ManagerRoute>
        }
      />

      {/* CATCH ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
