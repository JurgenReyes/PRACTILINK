import { Component } from "react";

// Si cualquier pantalla de la app truena con un error de JavaScript no
// controlado, React desmonta todo el árbol y deja una pantalla en blanco
// sin ninguna pista visible (el error solo queda en la consola). Este
// Error Boundary evita eso: atrapa el error y muestra un mensaje utilizable
// en vez de una pantalla vacía.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Queda igual visible en la consola para depurar, como antes.
    console.error("Error no controlado en la aplicación:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--color-bg, #F3F4F6)" }}>
          <div className="card" style={{ maxWidth: 440, textAlign: "center" }}>
            <h2 style={{ marginTop: 0 }}>Algo salió mal</h2>
            <p style={{ color: "var(--color-ink-soft, #6B7280)", fontSize: 14 }}>
              Ocurrió un error inesperado en esta pantalla. Intenta recargar la página;
              si el problema sigue, avísale al equipo de soporte con el mensaje de abajo.
            </p>
            <p style={{ fontSize: 12, color: "var(--color-danger, #EF4444)", background: "#FBEAE8", padding: 10, borderRadius: 8, wordBreak: "break-word" }}>
              {this.state.error.message}
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
