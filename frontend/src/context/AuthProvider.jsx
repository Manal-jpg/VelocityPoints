import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginUser, fetchCurrentUser } from "../api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);

  const getAvailableRoles = (u) => {
    const base = Array.isArray(u?.roles)
      ? u.roles
      : u?.role
      ? [u.role]
      : [];
    const set = new Set(base.map((r) => String(r || "").toLowerCase()));
    // add lower-level interfaces
    if (set.has("superuser")) {
      set.add("manager");
      set.add("cashier");
      set.add("regular");
    }
    if (set.has("manager")) {
      set.add("cashier");
      set.add("regular");
    }
    if (set.has("cashier")) {
      set.add("regular");
    }
    if (set.size === 0) set.add("regular");
    return Array.from(set);
  };

  const deriveActiveRole = (u) => {
    const roles = getAvailableRoles(u);
    const saved = localStorage.getItem("activeInterface");
    if (saved && roles.includes(saved)) return saved;
    // priority: superuser > manager > cashier > regular
    if (roles.includes("superuser")) return "superuser";
    if (roles.includes("manager")) return "manager";
    if (roles.includes("cashier")) return "cashier";
    if (roles.length) return roles[0];
    return null;
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await fetchCurrentUser();
        setUser(me);
        const avail = getAvailableRoles(me);
        setAvailableRoles(avail);
        setActiveRole(deriveActiveRole(me));
        localStorage.setItem("authUserProfile", JSON.stringify(me));
      } catch (e) {
        console.error(e);
        localStorage.removeItem("authToken");
        setUser(null);
        setActiveRole(null);
        setAvailableRoles([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async ({ utorid, password }) => {
    setError(null);
    try {
      const { token } = await loginUser({ utorid, password });
      localStorage.setItem("authToken", token);

      const me = await fetchCurrentUser();
      setUser(me);
      const avail = getAvailableRoles(me);
      setAvailableRoles(avail);
      setActiveRole(deriveActiveRole(me));
      localStorage.setItem("authUserProfile", JSON.stringify(me));
    } catch (e) {
      console.error(e);
      setError("Login failed. Check your UTORid or password.");
      throw e;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setActiveRole(null);
    setAvailableRoles([]);
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem("authUserProfile", JSON.stringify(user));
    }
  }, [user]);

  const switchInterface = (role) => {
    if (!user) return;
    const lower = String(role || "").toLowerCase();
    if (availableRoles.includes(lower)) {
      setActiveRole(lower);
      localStorage.setItem("activeInterface", lower);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    setUser,
    activeRole,
    availableRoles,
    switchInterface,
  };

  // the value object is passed down to all the children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
