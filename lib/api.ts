// Utilidad para conectar con la API del backend NestJS
// Proporciona funciones para todas las operaciones CRUD y autenticación

// Tipos de datos
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  stock: number;
  disponible: boolean;
}

export interface CarritoItem {
  id: number;
  usuarioId: number;
  productoId: number;
  cantidad: number;
  fechaPago: string | null;
  pagado: boolean;
  producto: Producto;
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Obtiene el token JWT almacenado en localStorage
 * @returns Token JWT o null si no existe
 */
function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

/**
 * Realiza una petición fetch con autenticación JWT
 * @param endpoint - Ruta de la API (ej: /tienda/producto)
 * @param options - Opciones adicionales de fetch
 * @returns Respuesta parseada como JSON
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si la respuesta es 204 (sin contenido), devolver null
  if (res.status === 204) return null as T;

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
 * @param query - Término de búsqueda (opcional)
 * @returns Lista de productos
 */
export async function getProductos(query = ""): Promise<Producto[]> {
  const params = query ? `?query=${encodeURIComponent(query)}` : "";
  return fetchAPI<Producto[]>(`/tienda/producto${params}`);
}

/**
 * Obtiene un producto por su ID
 * @param id - ID del producto
 * @returns Producto encontrado
 */
export async function getProducto(id: number): Promise<Producto> {
  return fetchAPI<Producto>(`/tienda/producto/${id}`);
}

/**
 * Crea un nuevo producto (requiere autenticación admin)
 * @param producto - Datos del producto
 * @returns Producto creado
 */
export async function createProducto(producto: Partial<Producto>): Promise<Producto> {
  return fetchAPI<Producto>("/tienda/producto", {
    method: "POST",
    body: JSON.stringify(producto),
  });
}

/**
 * Actualiza un producto existente (requiere autenticación admin)
 * @param id - ID del producto
 * @param producto - Datos actualizados
 * @returns Producto actualizado
 */
export async function updateProducto(id: number, producto: Partial<Producto>): Promise<Producto> {
  return fetchAPI<Producto>(`/tienda/producto/${id}`, {
    method: "PUT",
    body: JSON.stringify(producto),
  });
}

/**
 * Elimina un producto (requiere autenticación admin)
 * @param id - ID del producto
 */
export async function deleteProducto(id: number): Promise<null> {
  return fetchAPI<null>(`/tienda/producto/${id}`, {
    method: "DELETE",
  });
}

// ============================================
// AUTENTICACIÓN
// ============================================

/**
 * Registra un nuevo usuario
 * @param data - Datos de registro (email, password, nombre)
 * @returns Token JWT y datos del usuario
 */
export async function register(data: { email: string; password: string; nombre: string }): Promise<LoginResponse> {
  return fetchAPI<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Inicia sesión
 * @param data - Credenciales (email, password)
 * @returns Token JWT y datos del usuario
 */
export async function login(data: { email: string; password: string }): Promise<LoginResponse> {
  return fetchAPI<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Obtiene el perfil del usuario autenticado
 * @returns Datos del usuario
 */
export async function getProfile(): Promise<User> {
  return fetchAPI<User>("/user/profile");
}

// ============================================
// CARRITO
// ============================================

/**
 * Obtiene el carrito del usuario autenticado
 * @returns Items del carrito
 */
export async function getCarrito(): Promise<CarritoItem[]> {
  return fetchAPI<CarritoItem[]>("/tienda/carrito/mio");
}

/**
 * Añade un producto al carrito
 * @param data - { productoId, cantidad }
 * @returns Item del carrito creado
 */
export async function addToCarrito(data: { productoId: number; cantidad?: number }): Promise<CarritoItem> {
  return fetchAPI<CarritoItem>("/tienda/carrito", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Actualiza la cantidad de un item del carrito
 * @param id - ID del item del carrito
 * @param data - { cantidad }
 * @returns Item actualizado
 */
export async function updateCarritoItem(id: number, data: { cantidad: number }): Promise<CarritoItem> {
  return fetchAPI<CarritoItem>(`/tienda/carrito/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Elimina un item del carrito
 * @param id - ID del item del carrito
 */
export async function removeCarritoItem(id: number): Promise<null> {
  return fetchAPI<null>(`/tienda/carrito/${id}`, {
    method: "DELETE",
  });
}

/**
 * Realiza el pago del carrito (marca como pagado)
 * @returns Resultado del pago
 */
export async function pagarCarrito(): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>("/tienda/carrito/pagar", {
    method: "POST",
  });
}
