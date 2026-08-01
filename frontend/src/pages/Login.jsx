import { useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LARGO_CODIGO = 6;

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, verificar2FA } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sesionExpirada = params.get("expirada") === "1";

  // Si el backend pide 2FA (cuentas de administrador), guardamos el token
  // intermedio aquí y mostramos el formulario del código en vez del de
  // correo/contraseña.
  const [tokenPreAuth, setTokenPreAuth] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);
  const refsCasillas = useRef([]);

  function irADashboard(rol) {
    if (rol === "estudiante") navigate("/estudiante/inicio");
    else if (rol === "empresa") navigate("/empresa");
    else navigate("/admin");
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const resultado = await login(correo, password);
      if (resultado.requiere2fa) {
        setTokenPreAuth(resultado.tokenPreAuth);
      } else {
        irADashboard(resultado.rol);
      }
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo iniciar sesión");
    }
  }

  async function manejarVerificacion(e) {
    e.preventDefault();
    setError("");
    setVerificando(true);
    try {
      const rol = await verificar2FA(tokenPreAuth, codigo);
      irADashboard(rol);
    } catch (err) {
      setError(err.response?.data?.error || "Código inválido o expirado");
    } finally {
      setVerificando(false);
    }
  }

  function actualizarCasilla(indice, valor) {
    const digito = valor.replace(/\D/g, "").slice(-1);
    const nuevo = codigo.split("");
    nuevo[indice] = digito || "";
    const codigoNuevo = nuevo.join("").slice(0, LARGO_CODIGO);
    setCodigo(codigoNuevo);
    if (digito && indice < LARGO_CODIGO - 1) refsCasillas.current[indice + 1]?.focus();
  }

  function manejarTeclaCasilla(indice, e) {
    if (e.key === "Backspace" && !codigo[indice] && indice > 0) {
      refsCasillas.current[indice - 1]?.focus();
    }
  }

  function pegarCodigo(e) {
    const texto = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LARGO_CODIGO);
    if (!texto) return;
    e.preventDefault();
    setCodigo(texto);
    refsCasillas.current[Math.min(texto.length, LARGO_CODIGO - 1)]?.focus();
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-box">
        <div className="auth-brand">
          <img src="/logo2.png" alt="PractiLink" style={{ height: 90, width: "auto" }} />
        </div>

        {sesionExpirada && !error && (
          <div className="alert alert-error">Tu sesión expiró. Inicia sesión de nuevo para continuar.</div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        {!tokenPreAuth ? (
          <>
            <form onSubmit={manejarSubmit}>
              <div className="form-field">
                <label>Correo electrónico</label>
                <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <p style={{ textAlign: "right", marginTop: -8 }}>
                <Link to="/recuperar-password" style={{ fontSize: 12.5 }}>¿Olvidaste tu contraseña?</Link>
              </p>
              <button className="btn btn-primary btn-block" type="submit">Iniciar sesión</button>
            </form>
            <Link to="/registro" className="btn btn-accent btn-block" style={{ marginTop: 10 }}>Regístrate</Link>
          </>
        ) : (
          <form onSubmit={manejarVerificacion}>
            <div style={{ textAlign: "center", fontSize: 28, marginBottom: 4 }}>🔒</div>
            <p style={{ fontSize: 13.5, color: "var(--color-ink-soft)", marginTop: -4, textAlign: "center" }}>
              Por seguridad, las cuentas de administrador requieren verificación en dos pasos.
              Enviamos un código de 6 dígitos a <strong>{correo}</strong>. Vence en 10 minutos.
            </p>
            <div className="form-field">
              <label>Verificación en dos pasos (2FA)</label>
              <div style={{ fontSize: 12.5, color: "var(--color-ink-soft)", marginBottom: 8 }}>
                Ingresa el código de 6 dígitos enviado a tu correo o generado en tu app de autenticación.
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {Array.from({ length: LARGO_CODIGO }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (refsCasillas.current[i] = el)}
                    value={codigo[i] || ""}
                    onChange={(e) => actualizarCasilla(i, e.target.value)}
                    onKeyDown={(e) => manejarTeclaCasilla(i, e)}
                    onPaste={pegarCodigo}
                    inputMode="numeric"
                    maxLength={1}
                    autoFocus={i === 0}
                    className="otp-box"
                  />
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={verificando || codigo.length !== LARGO_CODIGO}>
              {verificando ? "Verificando…" : "Verificar e ingresar"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block"
              style={{ marginTop: 10 }}
              onClick={() => { setTokenPreAuth(null); setCodigo(""); setError(""); }}
            >
              Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
