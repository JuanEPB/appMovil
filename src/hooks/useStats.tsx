import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import { getMedicamentosStats, getVentasStats } from "../api/apiPharma";
import { isDemoToken, localDb } from "../data/localDb";
import { checkConnection } from "../utils/network";

interface StatsResponse {
  total: number;
  porCaducar: number;
  caducados: number;
  porCategoria: Record<string, number>;
  bajoStock?: number;
  agotados?: number;
  valorInventario?: number;
  ventasHoy?: number;
  ingresosHoy?: number;
  gananciasHoy?: number;
  alertasActivas?: number;
  productosMasVendidos?: Array<{
    nombre: string;
    cantidad: number;
    total?: number;
  }>;
}

export const useStats = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");

      if (isDemoToken(token)) {
        setStats(await localDb.getStats());
        return;
      }

      const online = await checkConnection();
      if (!online) {
        throw new Error(
          "Sin conexion a internet. Intenta nuevamente cuando recuperes senal.",
        );
      }

      const [inventoryStats, salesStats] = await Promise.all([
        getMedicamentosStats(),
        getVentasStats().catch(() => ({})),
      ]);

      setStats({
        ...inventoryStats,
        ventasHoy: salesStats.ventasHoy ?? salesStats.ventas_hoy ?? 0,
        ingresosHoy: salesStats.ingresosHoy ?? salesStats.ingresos_hoy ?? 0,
        gananciasHoy:
          salesStats.gananciasHoy ??
          salesStats.ganancias_hoy ??
          salesStats.ingresosHoy ??
          salesStats.ingresos_hoy ??
          0,
        productosMasVendidos:
          salesStats.productosMasVendidos ??
          salesStats.productos_mas_vendidos ??
          [],
        alertasActivas:
          inventoryStats.alertasActivas ??
          inventoryStats.alertas_activas ??
          Number(inventoryStats.bajoStock ?? 0) +
            Number(inventoryStats.agotados ?? 0) +
            Number(inventoryStats.porCaducar ?? 0) +
            Number(inventoryStats.caducados ?? 0),
      });
    } catch (err) {
      console.error("Error al obtener estadisticas:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las estadisticas",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};
