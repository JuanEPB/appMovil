import AsyncStorage from "@react-native-async-storage/async-storage";
import { Categoria, DocumentoBase, Medicamento, Proveedor, VentaData } from "../interfaces/interface";
import { buildInventoryAlerts } from "../utils/inventoryAlerts";

const DB_KEY = "pharma_local_db";

type LocalDb = {
  medicamentos: Medicamento[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  documentos: DocumentoBase[];
  ventas: VentaData[];
};

type SaleItemInput = {
  medicamentoId: number;
  cantidad: number;
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

const getCategoriaNombre = (categoria: Medicamento["categoria"]) => {
  if (!categoria) return "Sin categoria";
  return typeof categoria === "string" ? categoria : categoria.nombre;
};

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
    const duplicate = db.medicamentos.some(
      (med) =>
        med.id !== Number(data.id) &&
        med.nombre.trim().toLowerCase() === String(data.nombre || "").trim().toLowerCase() &&
        med.lote.trim().toLowerCase() === String(data.lote || "").trim().toLowerCase(),
    );

    if (duplicate) {
      throw new Error("Ya existe un medicamento con el mismo nombre y lote.");
    }

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
  async updateMedicamento(id: number, data: any) {
    const db = await readDb();
    const duplicate = db.medicamentos.some(
      (med) =>
        med.id !== id &&
        med.nombre.trim().toLowerCase() === String(data.nombre || "").trim().toLowerCase() &&
        med.lote.trim().toLowerCase() === String(data.lote || "").trim().toLowerCase(),
    );

    if (duplicate) {
      throw new Error("Ya existe un medicamento con el mismo nombre y lote.");
    }

    const categoria = db.categorias.find((item) => item.id === Number(data.categoriaId)) ?? data.categoria;
    const proveedor = db.proveedores.find((item) => item.id === Number(data.proveedorId)) ?? data.proveedor;
    db.medicamentos = db.medicamentos.map((med) =>
      med.id === id
        ? {
            ...med,
            nombre: data.nombre ?? med.nombre,
            lote: data.lote ?? med.lote,
            caducidad: data.caducidad ?? med.caducidad,
            stock: Number(data.stock ?? med.stock),
            precio: Number(data.precio ?? med.precio),
            categoria: categoria ?? med.categoria,
            proveedor: proveedor ?? med.proveedor,
          }
        : med
    );
    await writeDb(db);
    return db.medicamentos.find((med) => med.id === id);
  },
  async deleteMedicamento(id: number) {
    const db = await readDb();
    db.medicamentos = db.medicamentos.filter((med) => med.id !== id);
    await writeDb(db);
  },
  async adjustStock(id: number, amount: number) {
    const db = await readDb();
    db.medicamentos = db.medicamentos.map((med) =>
      med.id === id ? { ...med, stock: Math.max(0, Number(med.stock || 0) + amount) } : med
    );
    await writeDb(db);
  },
  async createVenta(items: SaleItemInput[]) {
    const db = await readDb();
    const detalles = items
      .map((item, index) => {
        const med = db.medicamentos.find((current) => current.id === item.medicamentoId);
        if (!med || item.cantidad <= 0) return null;
        const cantidad = Math.min(item.cantidad, med.stock);
        return {
          id: Date.now() + index,
          medicamento: med,
          cantidad,
          precioUnitario: Number(med.precio || 0),
          total: cantidad * Number(med.precio || 0),
        };
      })
      .filter(Boolean) as VentaData["detalles"];

    if (!detalles.length) throw new Error("Selecciona al menos un medicamento con stock disponible");

    db.medicamentos = db.medicamentos.map((med) => {
      const sold = detalles.find((detail) => detail.medicamento.id === med.id);
      return sold ? { ...med, stock: Math.max(0, med.stock - sold.cantidad) } : med;
    });

    const venta: VentaData = {
      _id: `venta-${Date.now()}`,
      usuario: {
        id: 1,
        nombre: "Admin",
        apellido: "Demo",
        rol: "Administrador",
        email: "admin@pharmacontrol.demo",
      },
      fecha: new Date().toISOString(),
      total: detalles.reduce((sum, item) => sum + Number(item.total || 0), 0),
      detalles,
    };

    db.ventas = [venta, ...db.ventas];
    db.documentos = [
      {
        _id: venta._id,
        filename: `${venta._id}.json`,
        mimetype: "application/json",
        descripcion: "Ticket de venta",
        generadoPor: "Sistema",
        tipoReporte: "venta",
        createdAt: venta.fecha,
        updatedAt: venta.fecha,
      },
      ...db.documentos,
    ];
    await writeDb(db);
    return venta;
  },
  async getStats() {
    const db = await readDb();
    const meds = db.medicamentos;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const soon = new Date();
    soon.setDate(today.getDate() + 90);
    const porCaducar = meds.filter((med) => {
      const expiry = new Date(med.caducidad);
      return expiry >= today && expiry <= soon;
    }).length;
    const caducados = meds.filter((med) => new Date(med.caducidad) < today).length;
    const porCategoria = meds.reduce<Record<string, number>>((acc, med) => {
      const name = getCategoriaNombre(med.categoria);
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {});

    const bajoStock = meds.filter((med) => med.stock > 0 && med.stock < 5).length;
    const agotados = meds.filter((med) => med.stock <= 0).length;
    const valorInventario = meds.reduce((sum, med) => sum + Number(med.stock || 0) * Number(med.precio || 0), 0);
    const ventasHoy = db.ventas.filter((venta) => {
      const saleDate = new Date(venta.fecha);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
    const ingresosHoy = ventasHoy.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
    const gananciasHoy = ingresosHoy;
    const productosVendidos = db.ventas.reduce<Record<string, { nombre: string; cantidad: number; total: number }>>(
      (acc, venta) => {
        venta.detalles.forEach((detail) => {
          const key = String(detail.medicamento.id);
          acc[key] = acc[key] ?? {
            nombre: detail.medicamento.nombre,
            cantidad: 0,
            total: 0,
          };
          acc[key].cantidad += Number(detail.cantidad || 0);
          acc[key].total += Number(detail.total || 0);
        });
        return acc;
      },
      {},
    );
    const productosMasVendidos = Object.values(productosVendidos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
    const alertasActivas = buildInventoryAlerts(meds, db.ventas).length;

    return {
      total: meds.length,
      porCaducar,
      caducados,
      porCategoria,
      bajoStock,
      agotados,
      valorInventario,
      ventasHoy: ventasHoy.length,
      ingresosHoy,
      gananciasHoy,
      productosMasVendidos,
      alertasActivas,
    };
  },
  async getAlerts() {
    const db = await readDb();
    return buildInventoryAlerts(db.medicamentos, db.ventas);
  },
  async getVentas() {
    return (await readDb()).ventas;
  },
  async getDocuments() {
    const db = await readDb();
    return { documentos: db.documentos, ventas: db.ventas };
  },
};
