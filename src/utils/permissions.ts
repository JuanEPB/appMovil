import { User } from "../interfaces/interface";

const normalizeRole = (role?: string) =>
  String(role || "")
    .trim()
    .toLowerCase();

export const canManageInventory = (user?: User | null) => {
  const role = normalizeRole(user?.rol);
  return ["administrador", "admin", "inventario"].includes(role);
};

export const canRegisterSales = (user?: User | null) => {
  const role = normalizeRole(user?.rol);
  return ["administrador", "admin", "vendedor", "ventas"].includes(role);
};
