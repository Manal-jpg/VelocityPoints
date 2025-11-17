import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginUser, fetchCurrentUser } from "../api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (e) {
        console.error(e);
        localStorage.removeItem("authToken");
        setUser(null);
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
    } catch (e) {
      console.error(e);
      setError("Login failed. Check your UTORid or password.");
      throw e;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  const value = { user, loading, error, login, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
