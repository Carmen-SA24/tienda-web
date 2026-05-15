// Utilidad para conectar con la API del backend NestJS
// Proporciona funciones para todas las operaciones CRUD y autenticación

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Obtiene el token JWT almacenado en localStorage
 * @returns {string|null} Token JWT o null si no existe
 */
function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

/**
 * Realiza una petición fetch con autenticación JWT
 * @param {string} endpoint - Ruta de la API (ej: /tienda/producto)
 * @param {object} options - Opciones adicionales de fetch
 * @returns {Promise<object>} Respuesta parseada como JSON
 */
async function fetchAPI(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si la respuesta es 204 (sin contenido), devolver null
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || "Error en la petición");
  }

  return data;
}

// ============================================
// PRODUCTOS
// ============================================

/**
 * Obtiene todos los productos, opcionalmente filtrados por query
 * @param {string} query - Término de búsqueda (opcional)
 * @returns {Promise<Array>} Lista de productos
 */
export async function getProductos(query = "") {
  const params = query ? `?query=${encodeURIComponent(query)}` : "";
  return fetchAPI(`/tienda/producto${params}`);
}

/**
 * Obtiene un producto por su ID
 * @param {number} id - ID del producto
 * @returns {Promise<object>} Producto encontrado
 */
export async function getProducto(id) {
  return fetchAPI(`/tienda/producto/${id}`);
}

/**
 * Crea un nuevo producto (requiere autenticación admin)
 * @param {object} producto - Datos del producto
 * @returns {Promise<object>} Producto creado
 */
export async function createProducto(producto) {
  return fetchAPI("/tienda/producto", {
    method: "POST",
    body: JSON.stringify(producto),
  });
}

/**
 * Actualiza un producto existente (requiere autenticación admin)
 * @param {number} id - ID del producto
 * @param {object} producto - Datos actualizados
 * @returns {Promise<object>} Producto actualizado
 */
export async function updateProducto(id, producto) {
  return fetchAPI(`/tienda/producto/${id}`, {
    method: "PUT",
    body: JSON.stringify(producto),
  });
}

/**
 * Elimina un producto (requiere autenticación admin)
 * @param {number} id - ID del producto
 * @returns {Promise<null>}
 */
export async function deleteProducto(id) {
  return fetchAPI(`/tienda/producto/${id}`, {
    method: "DELETE",
  });
}

// ============================================
// AUTENTICACIÓN
// ============================================

/**
 * Registra un nuevo usuario
 * @param {object} data - Datos de registro (email, password, nombre)
 * @returns {Promise<object>} Token JWT y datos del usuario
 */
export async function register(data) {
  return fetchAPI("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Inicia sesión
 * @param {object} data - Credenciales (email, password)
 * @returns {Promise<object>} Token JWT y datos del usuario
 */
export async function login(data) {
  return fetchAPI("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Obtiene el perfil del usuario autenticado
 * @returns {Promise<object>} Datos del usuario
 */
export async function getProfile() {
  return fetchAPI("/user/profile");
}

// ============================================
// CARRITO
// ============================================

/**
 * Obtiene el carrito del usuario autenticado
 * @returns {Promise<Array>} Items del carrito
 */
export async function getCarrito() {
  return fetchAPI("/tienda/carrito/mio");
}

/**
 * Añade un producto al carrito
 * @param {object} data - { productoId, cantidad }
 * @returns {Promise<object>} Item del carrito creado
 */
export async function addToCarrito(data) {
  return fetchAPI("/tienda/carrito", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Actualiza la cantidad de un item del carrito
 * @param {number} id - ID del item del carrito
 * @param {object} data - { cantidad }
 * @returns {Promise<object>} Item actualizado
 */
export async function updateCarritoItem(id, data) {
  return fetchAPI(`/tienda/carrito/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Elimina un item del carrito
 * @param {number} id - ID del item del carrito
 * @returns {Promise<null>}
 */
export async function removeCarritoItem(id) {
  return fetchAPI(`/tienda/carrito/${id}`, {
    method: "DELETE",
  });
}

/**
 * Realiza el pago del carrito (marca como pagado)
 * @returns {Promise<object>} Resultado del pago
 */
export async function pagarCarrito() {
  return fetchAPI("/tienda/carrito/pagar", {
    method: "POST",
  });
}
