import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px", display: "flex", gap: "20px" }}>
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
      {/* <Link to="/profile">Profile</Link>
      <Link to="/transactions">Transactions</Link>
      <Link to="/cashier">Cashier</Link>
      <Link to="/events">Events</Link>
      <Link to="/promotions">Promotions</Link>
      <Link to="/manager/users">Manager – Users</Link>
      <Link to="/manager/transactions">Manager – Transactions</Link> */}
    </nav>
  );
}
