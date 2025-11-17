import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  return (
    <>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/profile" element={<Profile />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/cashier" element={<Cashier />} />
      <Route path="/events" element={<Events />} />
      <Route path="/promotions" element={<Promotions />} />

      <Route path="/manager/users" element={<ManagerUsers />} />
      <Route path="/manager/transactions" element={<ManagerTransactions />} /> */}
      </Routes>
    </>
  );
}
