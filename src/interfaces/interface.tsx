export interface LoginParams {
  email: string;
  contraseña: string;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

export interface DocumentoBase {
  _id: string;
  filename: string;
  mimetype: string;
  descripcion: string;
  generadoPor: string;
  tipoReporte: string; // "venta" | "IA" | "reporte"
  createdAt: string;
  updatedAt: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  direccion: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Medicamento {
  id: number;
  nombre: string;
  lote: string;
  caducidad: string;
  proveedor: Proveedor;
  stock: number;
  precio: number;
  categoria: Categoria;
}

export interface DetalleVenta {
  id: number;
  medicamento: Medicamento;
  cantidad: number;
  precioUnitario: number;
}

export interface UsuarioVenta {
  id: number;
  nombre: string;
  apellido: string;
  rol: string;
  email: string;
}

export interface VentaData {
  _id: string;
  usuario: UsuarioVenta;
  fecha: string;
  total: number;
  detalles: DetalleVenta[];
}
