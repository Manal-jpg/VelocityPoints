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

// Promotions pages
import PromotionsUserPage from "./pages/PromotionsUserPage.jsx";
import PromotionsManagerListPage from "./pages/PromotionsManagerListPage.jsx";
import PromotionCreatePage from "./pages/PromotionCreatePage.jsx";
import PromotionDetailPage from "./pages/PromotionDetailPage.jsx";
import PromotionViewPage from "./pages/PromotionViewPage.jsx"; // ⭐ NEW

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
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route path="/reset" element={<ResetPassword />} />

      {/* Protected pages */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

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

      {/* User Promotions list */}
      <Route
        path="/promotions"
        element={
          <ProtectedRoute>
            <PromotionsUserPage />
          </ProtectedRoute>
        }
      />

      {/* User READ-ONLY promotion details */}
      <Route
        path="/promotions/:id/view"
        element={
          <ProtectedRoute>
            <PromotionViewPage />
          </ProtectedRoute>
        }
      />

      {/* Removed user access to /promotions/:id EDIT PAGE
          This route remains ONLY for managers below
      */}

      {/* Manager-only routes */}
      <Route
        path="/manager/users"
        element={
          <ManagerRoute>
            <ManagerUsers />
          </ManagerRoute>
        }
      />

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

      {/* Manager edit page (unchanged) */}
      <Route
        path="/manager/promotions/:id"
        element={
          <ManagerRoute>
            <PromotionDetailPage />
          </ManagerRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
