import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import AccountInfo from "./pages/AccountInfo.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import ManagerUsers from "./pages/ManagerUsers.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import { useAuth } from "./hooks/useAuth";
import Events from "./pages/Events.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";



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
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/reset" element={<ResetPassword />} />
        <Route
          path="/manager/users"
          element={
            <ProtectedRoute>
              <ManagerUsers />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
        
        <Route
          path="/manager/events/new"
          element={
            <ProtectedRoute>
            <CreateEvent />
        </ProtectedRoute>
  }
/>



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
