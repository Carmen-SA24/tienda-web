// Componente Navbar - Barra de navegación principal
// Muestra enlaces según el estado de autenticación y rol del usuario
"use client";

import { useState, useEffect } from "react";
import { getProfile } from "@/lib/api";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Carga los datos del usuario al montar el componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Obtener perfil del usuario
      getProfile()
        .then((data) => setUser(data))
        .catch(() => {
          // Si el token no es válido, limpiar
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        });

      // Obtener conteo del carrito
      fetch("/api/tienda/carrito/mio", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCartCount(data.reduce((sum, item) => sum + item.cantidad, 0));
          }
        })
        .catch(() => {});
    }
  }, []);

  /**
   * Cierra la sesión del usuario
   * Elimina token y datos del localStorage
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <a href="/" className="navbar-brand">
        🛒 Tienda Virtual
      </a>
      <div className="navbar-links">
        <a href="/">Catálogo</a>

        {user ? (
          <>
            <a href="/carrito">
              Carrito
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </a>
            {user.rol === "admin" && <a href="/admin">Admin</a>}
            <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
              {user.nombre || user.email}
            </span>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </>
        ) : (
          <>
            <a href="/login">Iniciar sesión</a>
            <a href="/registro">Registrarse</a>
          </>
        )}
      </div>
    </nav>
  );
}
