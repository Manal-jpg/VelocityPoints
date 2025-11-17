import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import { useAuth } from "./hooks/useAuth";

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

export default function App() {
  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        {/* <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
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
        path="/cashier"
        element={
          <ProtectedRoute>
            <Cashier />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/promotions"
        element={
          <ProtectedRoute>
            <Promotions />
          </ProtectedRoute>
        }
      />

      <Route path="/manager/users" element={<ManagerUsers />} />
      <Route path="/manager/transactions" element={<ManagerTransactions />} /> */}
      </Routes>
    </>
  );
}
