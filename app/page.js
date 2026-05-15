// Página principal - Catálogo de productos
// Muestra todos los productos disponibles con buscador
"use client";

import { useState, useEffect } from "react";
import { getProductos } from "@/lib/api";
import Navbar from "@/components/Navbar";

export default function Home() {
  // Estado para productos, búsqueda y carga
  const [productos, setProductos] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Carga los productos al montar el componente o al cambiar la búsqueda
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const data = await getProductos(query);
        setProductos(data);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce de 300ms para evitar llamadas excesivas

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Catálogo de Productos</h1>
        </div>

        {/* Buscador */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLoading(true);
            }}
          />
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="loading">Cargando productos...</div>
        ) : productos.length === 0 ? (
          <div className="loading">No se encontraron productos</div>
        ) : (
          <div className="productos-grid">
            {productos.map((producto) => (
              <div key={producto.id} className="producto-card">
                <h3>{producto.nombre}</h3>
                <p className="precio">{producto.precio} €</p>
                <p className="descripcion">{producto.descripcion}</p>
                <p className={`stock ${producto.disponible ? "disponible" : "agotado"}`}>
                  {producto.disponible ? "✅ En stock" : "❌ Agotado"}
                </p>
                <a
                  href={`/producto/${producto.id}`}
                  className="btn btn-primary btn-block"
                >
                  Ver detalle
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
