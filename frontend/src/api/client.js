import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

// Adjunta el JWT guardado tras el login a cada petición.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el backend responde 401 (token inválido, expirado o ausente), la sesión
// local ya no sirve de nada: se limpia y se manda a /login en vez de dejar
// a la persona viendo una pantalla protegida rota con errores por todos lados.
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      const teniaSesion = localStorage.getItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("rol");
      if (teniaSesion && window.location.pathname !== "/login") {
        window.location.href = "/login?expirada=1";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
