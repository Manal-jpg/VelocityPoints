// import { Navigate, Route, Routes } from "react-router-dom";

// import Home from "./pages/Home.jsx";
// import Login from "./pages/Login.jsx";
// import Profile from "./pages/Profile.jsx";
// import AccountInfo from "./pages/AccountInfo.jsx";
// import ChangePassword from "./pages/ChangePassword.jsx";
// import ManagerUsers from "./pages/ManagerUsers.jsx";
// import ResetPassword from "./pages/ResetPassword.jsx";
// import { useAuth } from "./hooks/useAuth";

// function PublicRoute({ children }) {
//   const { user, loading } = useAuth();

//   if (loading) return null;
//   if (user) return <Navigate to="/" replace />;

//   return children;
// }

// function ProtectedRoute({ children }) {
//   const { user, loading } = useAuth();

//   if (loading) return null;
//   if (!user) return <Navigate to="/login" replace />;

//   return children;
// }

// export default function App() {
//   return (
//     <>
//       <Routes>
//         <Route
//           path="/login"
//           element={
//             <PublicRoute>
//               <Login />
//             </PublicRoute>
//           }
//         />
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <Home />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/account"
//           element={
//             <ProtectedRoute>
//               <AccountInfo />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/password"
//           element={
//             <ProtectedRoute>
//               <ChangePassword />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/profile"
//           element={
//             <ProtectedRoute>
//               <Profile />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="/reset" element={<ResetPassword />} />
//         <Route
//           path="/manager/users"
//           element={
//             <ProtectedRoute>
//               <ManagerUsers />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="*" element={<Navigate to="/" replace />} />
//         {/* <Route
//           path="/profile"
//           element={
//             <ProtectedRoute>
//               <Profile />
//             </ProtectedRoute>
//           }
//         />
//       <Route
//         path="/transactions"
//         element={
//           <ProtectedRoute>
//             <Transactions />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/cashier"
//         element={
//           <ProtectedRoute>
//             <Cashier />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/events"
//         element={
//           <ProtectedRoute>
//             <Events />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/promotions"
//         element={
//           <ProtectedRoute>
//             <Promotions />
//           </ProtectedRoute>
//         }
//       />

//       <Route path="/manager/users" element={<ManagerUsers />} />
//       <Route path="/manager/transactions" element={<ManagerTransactions />} /> */}
//       </Routes>
//     </>
//   );
// }
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import AccountInfo from "./pages/AccountInfo.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import ManagerUsers from "./pages/ManagerUsers.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import { useAuth } from "./hooks/useAuth";

// Promotions pages
import PromotionsUserPage from "./pages/PromotionsUserPage.jsx";
import PromotionsManagerListPage from "./pages/PromotionsManagerListPage.jsx";
import PromotionCreatePage from "./pages/PromotionCreatePage.jsx";
import PromotionDetailPage from "./pages/PromotionDetailPage.jsx";

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

      {/* PROTECTED LAYOUT WITH SIDEBAR */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home /> {/* Home contains sidebar + <Outlet /> */}
          </ProtectedRoute>
        }
      >
        {/* Default content on the right when at "/" */}
        <Route index element={<div />} />

        {/* PROFILE / ACCOUNT / PASSWORD PAGES */}
        <Route path="profile" element={<Profile />} />
        <Route path="account" element={<AccountInfo />} />
        <Route path="password" element={<ChangePassword />} />

        {/* REGULAR USER PROMOTIONS (right of sidebar) */}
        <Route path="promotions" element={<PromotionsUserPage />} />

        {/* MANAGER PAGES (still inside layout) */}
        <Route
          path="manager/users"
          element={
            <ManagerRoute>
              <ManagerUsers />
            </ManagerRoute>
          }
        />
        <Route
          path="manager/promotions"
          element={
            <ManagerRoute>
              <PromotionsManagerListPage />
            </ManagerRoute>
          }
        />
        <Route
          path="manager/promotions/create"
          element={
            <ManagerRoute>
              <PromotionCreatePage />
            </ManagerRoute>
          }
        />
        <Route
          path="manager/promotions/:id"
          element={
            <ManagerRoute>
              <PromotionDetailPage />
            </ManagerRoute>
          }
        />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
