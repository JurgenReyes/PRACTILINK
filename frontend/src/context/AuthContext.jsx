import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [rol, setRol] = useState(localStorage.getItem("rol"));

  async function login(correo, password) {
    const { data } = await api.post("/auth/login", { correo, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("rol", data.rol);
    setRol(data.rol);
    return data.rol;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    setRol(null);
  }

  return (
    <AuthContext.Provider value={{ rol, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
