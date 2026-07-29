import { Medicamento, VentaData } from "../interfaces/interface";

export type InventoryAlertType =
  | "AGOTADO"
  | "BAJO_STOCK"
  | "CADUCADO"
  | "CADUCIDAD_PROXIMA"
  | "VENTA_ANORMAL";

export type InventoryAlert = {
  id: string | number;
  tipo: InventoryAlertType;
  estado: string;
  nombre: string;
  lote?: string;
  stock?: number;
  stock_minimo?: number;
  cantidad_recomendada?: number;
  dias_para_caducar?: number;
  recomendacion: string;
};

const LOW_STOCK_LIMIT = 5;
const EXPIRATION_WINDOW_DAYS = 90;

const daysUntil = (value?: string) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
};

export const buildInventoryAlerts = (
  medicamentos: Medicamento[],
  ventas: VentaData[] = [],
): InventoryAlert[] => {
  const alerts: InventoryAlert[] = [];

  medicamentos.forEach((med) => {
    const stock = Number(med.stock ?? 0);
    const days = daysUntil(med.caducidad);

    if (stock <= 0) {
      alerts.push({
        id: `${med.id}-agotado`,
        tipo: "AGOTADO",
        estado: "AGOTADO",
        nombre: med.nombre,
        lote: med.lote,
        stock,
        stock_minimo: LOW_STOCK_LIMIT,
        cantidad_recomendada: LOW_STOCK_LIMIT * 2,
        recomendacion: "Reabastecer antes de permitir nuevas ventas.",
      });
    } else if (stock < LOW_STOCK_LIMIT) {
      alerts.push({
        id: `${med.id}-bajo-stock`,
        tipo: "BAJO_STOCK",
        estado: stock <= 2 ? "CRITICO" : "PRECAUCION",
        nombre: med.nombre,
        lote: med.lote,
        stock,
        stock_minimo: LOW_STOCK_LIMIT,
        cantidad_recomendada: Math.max(LOW_STOCK_LIMIT * 2 - stock, LOW_STOCK_LIMIT),
        recomendacion: "Programar compra y confirmar disponibilidad con proveedor.",
      });
    }

    if (days !== null && days < 0) {
      alerts.push({
        id: `${med.id}-caducado`,
        tipo: "CADUCADO",
        estado: "CADUCADO",
        nombre: med.nombre,
        lote: med.lote,
        stock,
        dias_para_caducar: days,
        recomendacion: "Retirar del inventario y bloquear venta del lote.",
      });
    } else if (days !== null && days <= EXPIRATION_WINDOW_DAYS) {
      alerts.push({
        id: `${med.id}-caducidad`,
        tipo: "CADUCIDAD_PROXIMA",
        estado: days <= 30 ? "CRITICO" : "PRECAUCION",
        nombre: med.nombre,
        lote: med.lote,
        stock,
        dias_para_caducar: days,
        recomendacion: "Priorizar rotacion, promocion o devolucion con proveedor.",
      });
    }
  });

  const totals = ventas
    .map((venta) => Number(venta.total || 0))
    .filter((total) => total > 0);
  const average =
    totals.reduce((sum, total) => sum + total, 0) / Math.max(totals.length, 1);

  ventas
    .filter((venta) => Number(venta.total || 0) > average * 2)
    .slice(0, 5)
    .forEach((venta) => {
      alerts.push({
        id: `${venta._id}-venta-anormal`,
        tipo: "VENTA_ANORMAL",
        estado: "REVISION",
        nombre: `Venta ${venta._id}`,
        stock: venta.detalles?.reduce(
          (sum, item) => sum + Number(item.cantidad || 0),
          0,
        ),
        recomendacion: "Revisar ticket, usuario y cantidades vendidas.",
      });
    });

  return alerts;
};
