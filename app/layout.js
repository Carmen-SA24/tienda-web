// Layout raíz de la aplicación Tienda Virtual
// Define la estructura HTML base, metadatos y estilos globales
import "./globals.css";

export const metadata = {
  title: "Tienda Virtual",
  description: "Tienda online con catálogo de productos y carrito de compra",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
