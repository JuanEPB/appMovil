import AsyncStorage from "@react-native-async-storage/async-storage";
import { Categoria, DocumentoBase, Medicamento, Proveedor, VentaData } from "../interfaces/interface";

const DB_KEY = "pharma_local_db";

type LocalDb = {
  medicamentos: Medicamento[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  documentos: DocumentoBase[];
  ventas: VentaData[];
};

const categorias: Categoria[] = [
  { id: 1, nombre: "Analgesicos" },
  { id: 2, nombre: "Antibioticos" },
  { id: 3, nombre: "Vitaminas" },
  { id: 4, nombre: "Dermatologia" },
];

const proveedores: Proveedor[] = [
  { id: 1, nombre: "Distribuidora Norte", contacto: "ventas@norte.demo", direccion: "Av. Central 120" },
  { id: 2, nombre: "Farmaceutica Sol", contacto: "contacto@sol.demo", direccion: "Calle Salud 45" },
];

const medicamentos: Medicamento[] = [
  {
    id: 1,
    nombre: "Paracetamol 500 mg",
    lote: "PAR-2401",
    caducidad: "2027-03-20",
    proveedor: proveedores[0],
    stock: 24,
    precio: 35,
    categoria: categorias[0],
  },
  {
    id: 2,
    nombre: "Amoxicilina 500 mg",
    lote: "AMX-1102",
    caducidad: "2026-09-15",
    proveedor: proveedores[1],
    stock: 4,
    precio: 120,
    categoria: categorias[1],
  },
  {
    id: 3,
    nombre: "Vitamina C 1 g",
    lote: "VIT-7720",
    caducidad: "2028-01-10",
    proveedor: proveedores[0],
    stock: 38,
    precio: 89,
    categoria: categorias[2],
  },
  {
    id: 4,
    nombre: "Ibuprofeno 400 mg",
    lote: "IBU-0891",
    caducidad: "2026-08-05",
    proveedor: proveedores[1],
    stock: 0,
    precio: 48,
    categoria: categorias[0],
  },
];

const ventas: VentaData[] = [
  {
    _id: "venta-demo-001",
    usuario: {
      id: 1,
      nombre: "Admin",
      apellido: "Demo",
      rol: "Administrador",
      email: "admin@pharmacontrol.demo",
    },
    fecha: new Date().toISOString(),
    total: 155,
    detalles: [
      { id: 1, medicamento: medicamentos[0], cantidad: 1, precioUnitario: 35, total: 35 },
      { id: 2, medicamento: medicamentos[1], cantidad: 1, precioUnitario: 120, total: 120 },
    ],
  },
];

const documentos: DocumentoBase[] = [
  {
    _id: "venta-demo-001",
    filename: "venta_demo_001.json",
    mimetype: "application/json",
    descripcion: "Venta demo",
    generadoPor: "Sistema",
    tipoReporte: "venta",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "reporte-demo-001",
    filename: "reporte_inventario_demo.pdf",
    mimetype: "application/pdf",
    descripcion: "Reporte local de inventario",
    generadoPor: "IA",
    tipoReporte: "IA",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedDb: LocalDb = { medicamentos, categorias, proveedores, documentos, ventas };

const readDb = async (): Promise<LocalDb> => {
  const stored = await AsyncStorage.getItem(DB_KEY);
  if (stored) return JSON.parse(stored);
  await AsyncStorage.setItem(DB_KEY, JSON.stringify(seedDb));
  return seedDb;
};

const writeDb = async (db: LocalDb) => AsyncStorage.setItem(DB_KEY, JSON.stringify(db));

export const isDemoToken = (token?: string | null) => Boolean(token?.includes(".demo"));

export const localDb = {
  async getMedicamentos() {
    return (await readDb()).medicamentos;
  },
  async getCategorias() {
    return (await readDb()).categorias;
  },
  async getProveedores() {
    return (await readDb()).proveedores;
  },
  async createMedicamento(data: any) {
    const db = await readDb();
    const categoria = db.categorias.find((item) => item.id === Number(data.categoriaId)) ?? db.categorias[0];
    const proveedor = db.proveedores.find((item) => item.id === Number(data.proveedorId)) ?? db.proveedores[0];
    const medicamento: Medicamento = {
      id: Date.now(),
      nombre: data.nombre,
      lote: data.lote,
      caducidad: data.caducidad,
      stock: Number(data.stock || 0),
      precio: Number(data.precio || 0),
      categoria,
      proveedor,
    };
    db.medicamentos = [medicamento, ...db.medicamentos];
    await writeDb(db);
    return medicamento;
  },
  async getStats() {
    const meds = (await readDb()).medicamentos;
    const today = new Date();
    const soon = new Date();
    soon.setDate(today.getDate() + 90);
    const porCaducar = meds.filter((med) => {
      const expiry = new Date(med.caducidad);
      return expiry >= today && expiry <= soon;
    }).length;
    const caducados = meds.filter((med) => new Date(med.caducidad) < today).length;
    const porCategoria = meds.reduce<Record<string, number>>((acc, med) => {
      const name = med.categoria?.nombre ?? "Sin categoria";
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {});

    return { total: meds.length, porCaducar, caducados, porCategoria };
  },
  async getDocuments() {
    const db = await readDb();
    return { documentos: db.documentos, ventas: db.ventas };
  },
};
