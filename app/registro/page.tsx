// Página de registro de usuario
// Permite crear una nueva cuenta con email, nombre y contraseña
// Al registrarse guarda el token JWT en localStorage y redirige al catálogo
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import styles from "./registro.module.css";

export default function RegistroPage() {
  const router = useRouter();

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre: "",
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
   * Envía el formulario de registro
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Llamar a la API de registro
      const data = await register(formData);

      // Guardar token y datos del usuario en localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirigir al catálogo
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Crear cuenta</h1>
        <p className={styles.authSubtitle}>
          Regístrate para poder comprar en la tienda
        </p>

        {/* Mensaje de error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Formulario de registro */}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="nombre" className={styles.label}>
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              className={styles.input}
              placeholder="Tu nombre"
              value={formData.nombre}
              onChange={handleChange("nombre")}
              required
            />
          </div>

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
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        {/* Enlace a inicio de sesión */}
        <div className={styles.loginLink}>
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
        </div>
      </div>
    </div>
  );
}
