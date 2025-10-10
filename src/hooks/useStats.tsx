
import { useEffect, useState } from 'react';
import { getMedicamentosStats } from '../api/apiPharma';

interface StatsResponse {
  total: number;
  porCaducar: number;
  caducados: number;
  porCategoria: Record<string, number>;
}

export const useStats = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMedicamentosStats();
      setStats(data);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      setError('No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};
