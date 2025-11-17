import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, fetchCurrentUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // full user object
  const [loading, setLoading] = useState(true); // initial /users/me
  const [error, setError] = useState(null);

  // On first load, if token exists, fetch /users/me
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

  // Login: POST /auth/tokens -> save token -> GET /users/me
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
