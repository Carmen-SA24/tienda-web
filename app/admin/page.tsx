// Página de administración - Listado de productos
// Muestra todos los productos en una tabla con opciones para editar y eliminar
"use client";

import { useState, useEffect, useCallback } from "react";
import { getProductos, deleteProducto } from "@/lib/api";
import Navbar from "@/components/Navbar";
import type { Producto } from "@/lib/api";
import styles from "./admin.module.css";

export default function AdminPage() {
  // Estado para productos, carga y error
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Obtiene todos los productos desde la API
   */
  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (err) {
      setError("Error al cargar los productos. Asegúrate de tener permisos de administrador.");
      console.error("Error al cargar productos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  /**
   * Elimina un producto por su ID
   * @param id - ID del producto a eliminar
   * @param nombre - Nombre del producto para confirmación
   */
  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${nombre}"?`)) return;
    try {
      await deleteProducto(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError("Error al eliminar el producto.");
      console.error("Error al eliminar:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.contenedor}>
        <h1 className={styles.titulo}>Panel de administración</h1>
        <p className={styles.subtitulo}>Gestiona los productos de la tienda</p>

        {/* Mensaje de error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Estado de carga */}
        {loading && <div className={styles.cargando}>Cargando productos...</div>}

        {/* Tabla de productos */}
        {!loading && productos.length === 0 && (
          <div className={styles.vacio}>
            <p>No hay productos registrados.</p>
          </div>
        )}

        {!loading && productos.length > 0 && (
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.id}</td>
                  <td>{producto.nombre}</td>
                  <td className={styles.precioCol}>
                    {Number(producto.precio).toFixed(2)} €
                  </td>
                  <td className={styles.stockCol}>{producto.stock}</td>
                  <td>
                    <span className={producto.disponible ? styles.disponible : styles.agotado}>
                      {producto.disponible ? "Sí" : "No"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.acciones}>
                      <button className={styles.btnEditar}>Editar</button>
                      <button
                        className={styles.btnEliminar}
                        onClick={() => handleDelete(producto.id, producto.nombre)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
