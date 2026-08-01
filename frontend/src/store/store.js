import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import notificacionesReducer from "./notificacionesSlice";

// Estado global centralizado de la aplicación: sesión (rol/idUsuario) y
// notificaciones (contador de no leídas, visible en el navbar desde
// cualquier pantalla). Redux Toolkit ya incluye redux-thunk, por eso los
// slices exportan funciones async (thunks) en vez de necesitar middleware
// aparte.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    notificaciones: notificacionesReducer,
  },
});
