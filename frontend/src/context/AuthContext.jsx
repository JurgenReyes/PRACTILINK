import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

function decodificarToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

// Si el token guardado ya expiró (según su propio campo "exp"), lo tratamos
// como si no existiera, en vez de mostrar la app "como logueada" hasta que
// la primera petición al backend falle.
function tokenVigente(payload) {
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

export function AuthProvider({ children }) {
  const tokenGuardado = localStorage.getItem("token");
  const payloadGuardado = tokenGuardado ? decodificarToken(tokenGuardado) : null;
  const sesionValida = tokenVigente(payloadGuardado);

  if (tokenGuardado && !sesionValida) {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
  }

  const [rol, setRol] = useState(sesionValida ? localStorage.getItem("rol") : null);
  const [idUsuario, setIdUsuario] = useState(sesionValida ? payloadGuardado?.id_usuario : null);

  async function login(correo, password) {
    const { data } = await api.post("/auth/login", { correo, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("rol", data.rol);
    setRol(data.rol);
    setIdUsuario(decodificarToken(data.token)?.id_usuario);
    return data.rol;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    setRol(null);
    setIdUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ rol, idUsuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
