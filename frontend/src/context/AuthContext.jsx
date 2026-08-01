// Este archivo se conserva en la misma ruta (src/context/AuthContext.jsx) por
// compatibilidad: todos los componentes que ya hacían
// `import { useAuth } from "../context/AuthContext"` siguen funcionando
// igual, sin tener que tocar cada uno, aunque el estado ya no vive en un
// React Context sino en el store de Redux (ver src/store/authSlice.js).
import { useDispatch, useSelector } from "react-redux";
import { login as loginThunk, verificar2FA as verificar2FAThunk, logout as logoutThunk } from "../store/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const { rol, idUsuario } = useSelector((state) => state.auth);

  return {
    rol,
    idUsuario,
    login: (correo, password) => dispatch(loginThunk(correo, password)),
    verificar2FA: (tokenPreAuth, codigo) => dispatch(verificar2FAThunk(tokenPreAuth, codigo)),
    logout: () => dispatch(logoutThunk()),
  };
}
