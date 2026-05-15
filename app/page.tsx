// Página principal - Catálogo de productos
// Muestra todos los productos disponibles con opción de búsqueda
"use client";

import { useState, useEffect, useCallback } from "react";
import { getProductos } from "@/lib/api";
import Navbar from "@/components/Navbar";
import type { Producto } from "@/lib/api";

export default function Home() {
  // Estado para productos, búsqueda y carga
  const [productos, setProductos] = useState<Producto[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  /**
   * Obtiene los productos desde la API
   * Se ejecuta al montar el componente y cuando cambia la búsqueda
   */
  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProductos(query);
      setProductos(data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Cargar productos al iniciar y cuando cambie la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductos();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timer);
  }, [fetchProductos]);

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Catálogo de productos</h1>

        {/* Barra de búsqueda */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Estado de carga */}
        {loading && <div className="loading">Cargando productos...</div>}

        {/* Lista de productos */}
        {!loading && (
          <div className="productos-grid">
            {productos.length === 0 ? (
              <p>No se encontraron productos.</p>
            ) : (
              productos.map((producto) => (
                <div key={producto.id} className="producto-card">
                  {producto.imagen && (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="producto-imagen"
                    />
                  )}
                  <div className="producto-info">
                    <h3>{producto.nombre}</h3>
                    <p className="producto-descripcion">{producto.descripcion}</p>
                    <p className="producto-precio">
                      {Number(producto.precio).toFixed(2)} €
                    </p>
                    <p className="producto-stock">
                      {producto.stock > 0
                        ? `${producto.stock} unidades`
                        : "Sin stock"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
