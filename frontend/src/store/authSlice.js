import { createSlice } from "@reduxjs/toolkit";
import api from "../api/client";

function decodificarToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

// Si el token guardado ya expiró (según su propio campo "exp"), lo tratamos
// como si no existiera, en vez de arrancar la app "como logueada" hasta que
// la primera petición al backend falle.
function tokenVigente(payload) {
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

const tokenGuardado = localStorage.getItem("token");
const payloadGuardado = tokenGuardado ? decodificarToken(tokenGuardado) : null;
const sesionValida = tokenVigente(payloadGuardado);
if (tokenGuardado && !sesionValida) {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
}

const initialState = {
  rol: sesionValida ? localStorage.getItem("rol") : null,
  idUsuario: sesionValida ? payloadGuardado?.id_usuario ?? null : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sesionEstablecida(state, action) {
      state.rol = action.payload.rol;
      state.idUsuario = action.payload.idUsuario;
    },
    sesionCerrada(state) {
      state.rol = null;
      state.idUsuario = null;
    },
  },
});

export const { sesionEstablecida, sesionCerrada } = authSlice.actions;
export default authSlice.reducer;

// ---------- Thunks: la lógica async vive aquí, no en los componentes ----------

// Cuentas de administrador: el backend no entrega el JWT de una vez, pide
// completar el segundo factor primero (ver verificar2FA más abajo).
export function login(correo, password) {
  return async (dispatch) => {
    const { data } = await api.post("/auth/login", { correo, password });

    if (data.requiere_2fa) {
      return { requiere2fa: true, tokenPreAuth: data.tokenPreAuth };
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("rol", data.rol);
    dispatch(sesionEstablecida({ rol: data.rol, idUsuario: decodificarToken(data.token)?.id_usuario }));
    return { rol: data.rol };
  };
}

export function verificar2FA(tokenPreAuth, codigo) {
  return async (dispatch) => {
    const { data } = await api.post("/auth/verificar-2fa", { tokenPreAuth, codigo });
    localStorage.setItem("token", data.token);
    localStorage.setItem("rol", data.rol);
    dispatch(sesionEstablecida({ rol: data.rol, idUsuario: decodificarToken(data.token)?.id_usuario }));
    return data.rol;
  };
}

export function logout() {
  return (dispatch) => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    dispatch(sesionCerrada());
  };
}
