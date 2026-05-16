// Página del carrito de compra
// Muestra los productos añadidos, permite modificar cantidades, eliminar items y pagar
"use client";

import { useState, useEffect, useCallback } from "react";
import { getCarrito, updateCarritoItem, removeCarritoItem, pagarCarrito } from "@/lib/api";
import Navbar from "@/components/Navbar";
import type { CarritoItem } from "@/lib/api";
import styles from "./carrito.module.css";

export default function CarritoPage() {
  // Estado para items del carrito, carga, error y mensaje de éxito
  const [items, setItems] = useState<CarritoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [pagando, setPagando] = useState(false);

  /**
   * Obtiene los items del carrito desde la API
   */
  const fetchCarrito = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCarrito();
      setItems(data);
    } catch (err) {
      setError("Error al cargar el carrito. Asegúrate de haber iniciado sesión.");
      console.error("Error al cargar carrito:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar carrito al montar el componente
  useEffect(() => {
    fetchCarrito();
  }, [fetchCarrito]);

  /**
   * Actualiza la cantidad de un item del carrito
   * @param id - ID del item
   * @param cantidad - Nueva cantidad
   */
  const handleUpdateCantidad = async (id: number, cantidad: number) => {
    if (cantidad < 1) return;
    try {
      const updated = await updateCarritoItem(id, { cantidad });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, cantidad: updated.cantidad } : item))
      );
    } catch (err) {
      setError("Error al actualizar la cantidad.");
      console.error("Error al actualizar cantidad:", err);
    }
  };

  /**
   * Elimina un item del carrito
   * @param id - ID del item a eliminar
   */
  const handleRemove = async (id: number) => {
    try {
      await removeCarritoItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError("Error al eliminar el item del carrito.");
      console.error("Error al eliminar item:", err);
    }
  };

  /**
   * Procesa el pago del carrito
   */
  const handlePagar = async () => {
    setPagando(true);
    setError("");
    setExito("");
    try {
      const result = await pagarCarrito();
      setExito(result.message || "¡Pago realizado con éxito!");
      // Recargar carrito para mostrar vacío
      setTimeout(() => fetchCarrito(), 1500);
    } catch (err) {
      setError("Error al procesar el pago.");
      console.error("Error al pagar:", err);
    } finally {
      setPagando(false);
    }
  };

  // Calcular total del carrito
  const total = items.reduce(
    (sum, item) => sum + Number(item.producto.precio) * item.cantidad,
    0
  );

  return (
    <>
      <Navbar />
      <div className={styles.contenedor}>
        <h1 className={styles.titulo}>Tu carrito</h1>

        {/* Mensajes de error y éxito */}
        {error && <div className={styles.error}>{error}</div>}
        {exito && <div className={styles.exito}>{exito}</div>}

        {/* Estado de carga */}
        {loading && <div className={styles.cargando}>Cargando carrito...</div>}

        {/* Carrito vacío */}
        {!loading && items.length === 0 && !exito && (
          <div className={styles.vacio}>
            <p>Tu carrito está vacío.</p>
            <a href="/" className={styles.enlaceCatalogo}>
              Ver catálogo
            </a>
          </div>
        )}

        {/* Lista de items del carrito */}
        {!loading && items.length > 0 && (
          <>
            <div className={styles.lista}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  {/* Imagen del producto */}
                  {item.producto.imagen && (
                    <img
                      src={item.producto.imagen}
                      alt={item.producto.nombre}
                      className={styles.itemImagen}
                    />
                  )}

                  {/* Información del producto */}
                  <div className={styles.itemInfo}>
                    <div className={styles.itemNombre}>{item.producto.nombre}</div>
                    <div className={styles.itemPrecio}>
                      {Number(item.producto.precio).toFixed(2)} €
                    </div>
                    <div className={styles.itemSubtotal}>
                      Subtotal: {(Number(item.producto.precio) * item.cantidad).toFixed(2)} €
                    </div>
                  </div>

                  {/* Controles de cantidad */}
                  <div className={styles.controles}>
                    <button
                      className={styles.btnCantidad}
                      onClick={() => handleUpdateCantidad(item.id, item.cantidad - 1)}
                      disabled={item.cantidad <= 1}
                      aria-label="Reducir cantidad"
                    >
                      −
                    </button>
                    <span className={styles.cantidadValor}>{item.cantidad}</span>
                    <button
                      className={styles.btnCantidad}
                      onClick={() => handleUpdateCantidad(item.id, item.cantidad + 1)}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>

                    {/* Botón eliminar */}
                    <button
                      className={styles.btnEliminar}
                      onClick={() => handleRemove(item.id)}
                      aria-label="Eliminar item"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen y pago */}
            <div className={styles.resumen}>
              <h2 className={styles.resumenTitulo}>Resumen del pedido</h2>
              <div className={styles.filaResumen}>
                <span>Productos ({items.length})</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <div className={styles.filaResumenTotal}>
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <button
                className={styles.btnPagar}
                onClick={handlePagar}
                disabled={pagando}
              >
                {pagando ? "Procesando pago..." : "Pagar ahora"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
