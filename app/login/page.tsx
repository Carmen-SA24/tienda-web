// Página de inicio de sesión
// Permite al usuario autenticarse con email y contraseña
// Al iniciar sesión guarda el token JWT en localStorage y redirige al catálogo
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Estado de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Actualiza el estado cuando el usuario escribe en un campo
   * @param field - Nombre del campo a actualizar
   * @returns Manejador de evento onChange
   */
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  /**
   * Envía el formulario de inicio de sesión
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Llamar a la API de login
      const data = await login(formData);

      // Guardar token y datos del usuario en localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirigir al catálogo
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Iniciar sesión</h1>
        <p className={styles.authSubtitle}>
          Accede a tu cuenta para gestionar tu carrito
        </p>

        {/* Mensaje de error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Formulario de login */}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange("email")}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange("password")}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Enlace a registro */}
        <div className={styles.registerLink}>
          ¿No tienes cuenta? <a href="/registro">Regístrate</a>
        </div>
      </div>
    </div>
  );
}
