import { createSlice } from "@reduxjs/toolkit";
import api from "../api/client";

const notificacionesSlice = createSlice({
  name: "notificaciones",
  initialState: { items: [] },
  reducers: {
    notificacionesRecibidas(state, action) {
      state.items = action.payload;
    },
  },
});

export const { notificacionesRecibidas } = notificacionesSlice.actions;
export default notificacionesSlice.reducer;

// Selector derivado: cualquier componente puede leer solo el contador de no
// leídas sin tener que recalcularlo por su cuenta.
export const seleccionarNoLeidas = (state) => state.notificaciones.items.filter((n) => !n.leido).length;

export function cargarNotificaciones() {
  return async (dispatch) => {
    try {
      const { data } = await api.get("/notificaciones");
      dispatch(notificacionesRecibidas(data));
    } catch {
      /* silencioso: la persona puede no tener sesión iniciada todavía */
    }
  };
}

export function marcarTodasLeidas() {
  return async (dispatch) => {
    await api.put("/notificaciones/marcar-todas");
    dispatch(cargarNotificaciones());
  };
}
