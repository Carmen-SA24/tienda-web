// Página de administración - Gestión de productos
// Muestra listado de productos con opciones para crear, editar y eliminar
"use client";

import { useState, useEffect, useCallback } from "react";
import { getProductos, createProducto, updateProducto, deleteProducto } from "@/lib/api";
import Navbar from "@/components/Navbar";
import type { Producto } from "@/lib/api";
import styles from "./admin.module.css";

// Estado inicial del formulario
const formVacio = {
  nombre: "",
  descripcion: "",
  precio: "",
  imagen: "",
  stock: "",
  disponible: true,
};

export default function AdminPage() {
  // Estado para productos, carga y error
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado del formulario y modal
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [form, setForm] = useState(formVacio);
  const [guardando, setGuardando] = useState(false);

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
   * Abre el formulario para crear un nuevo producto
   */
  const handleNuevo = () => {
    setEditando(null);
    setForm(formVacio);
    setMostrarForm(true);
  };

  /**
   * Abre el formulario para editar un producto existente
   * @param producto - Producto a editar
   */
  const handleEditar = (producto: Producto) => {
    setEditando(producto.id);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: String(producto.precio),
      imagen: producto.imagen || "",
      stock: String(producto.stock),
      disponible: producto.disponible,
    });
    setMostrarForm(true);
  };

  /**
   * Actualiza un campo del formulario
   * @param campo - Nombre del campo
   * @param valor - Nuevo valor
   */
  const handleChange = (campo: string, valor: string | boolean) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  /**
   * Guarda el producto (crea o actualiza según corresponda)
   */
  const handleGuardar = async () => {
    setGuardando(true);
    setError("");
    try {
      const datos = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        imagen: form.imagen,
        stock: Number(form.stock),
        disponible: form.disponible,
      };

      if (editando !== null) {
        // Actualizar producto existente
        const actualizado = await updateProducto(editando, datos);
        setProductos((prev) =>
          prev.map((p) => (p.id === editando ? actualizado : p))
        );
      } else {
        // Crear nuevo producto
        const creado = await createProducto(datos);
        setProductos((prev) => [...prev, creado]);
      }

      // Cerrar formulario
      setMostrarForm(false);
      setEditando(null);
      setForm(formVacio);
    } catch (err) {
      setError("Error al guardar el producto.");
      console.error("Error al guardar:", err);
    } finally {
      setGuardando(false);
    }
  };

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
        <div className={styles.header}>
          <div>
            <h1 className={styles.titulo}>Panel de administración</h1>
            <p className={styles.subtitulo}>Gestiona los productos de la tienda</p>
          </div>
          <button className={styles.btnNuevo} onClick={handleNuevo}>
            + Nuevo producto
          </button>
        </div>

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
                      <button
                        className={styles.btnEditar}
                        onClick={() => handleEditar(producto)}
                      >
                        Editar
                      </button>
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

        {/* Modal del formulario crear/editar */}
        {mostrarForm && (
          <div className={styles.overlay} onClick={() => setMostrarForm(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitulo}>
                {editando ? "Editar producto" : "Nuevo producto"}
              </h2>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  placeholder="Nombre del producto"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descripción</label>
                <textarea
                  className={styles.formTextarea}
                  value={form.descripcion}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Precio (€)</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.precio}
                    onChange={(e) => handleChange("precio", e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Stock</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>URL de la imagen</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={form.imagen}
                  onChange={(e) => handleChange("imagen", e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className={styles.formCheckbox}>
                <input
                  type="checkbox"
                  id="disponible"
                  checked={form.disponible}
                  onChange={(e) => handleChange("disponible", e.target.checked)}
                />
                <label htmlFor="disponible">Producto disponible</label>
              </div>

              <div className={styles.formAcciones}>
                <button
                  className={styles.btnCancelar}
                  onClick={() => setMostrarForm(false)}
                >
                  Cancelar
                </button>
                <button
                  className={styles.btnGuardar}
                  onClick={handleGuardar}
                  disabled={guardando || !form.nombre || !form.precio}
                >
                  {guardando
                    ? "Guardando..."
                    : editando
                      ? "Actualizar"
                      : "Crear producto"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
