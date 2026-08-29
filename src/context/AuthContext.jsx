import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, register as registerApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check both storages - localStorage means "remember me"
  // was checked, sessionStorage means it wasn't (cleared when tab closes).
  useEffect(() => {
    const store = localStorage.getItem("syncboard_token") ? localStorage : sessionStorage;
    const savedToken = store.getItem("syncboard_token");
    const savedUser = store.getItem("syncboard_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  function saveSession(data, remember) {
    const store = remember ? localStorage : sessionStorage;
    store.setItem("syncboard_token", data.token);
    store.setItem("syncboard_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function login(email, password, remember = true) {
    const data = await loginApi(email, password);
    saveSession(data, remember);
  }

  async function register(name, email, password, remember = true) {
    const data = await registerApi(name, email, password);
    saveSession(data, remember);
  }

  function logout() {
    localStorage.removeItem("syncboard_token");
    localStorage.removeItem("syncboard_user");
    sessionStorage.removeItem("syncboard_token");
    sessionStorage.removeItem("syncboard_user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}