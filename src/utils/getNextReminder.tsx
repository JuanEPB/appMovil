import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Recordatorio {
  fecha: string;
  descripcion: string;
}

// 🧠 Devuelve la toma más cercana (futura)
export async function getNextReminder(): Promise<Recordatorio | null> {
  try {
    const data = await AsyncStorage.getItem("tomas");
    if (!data) return null;

    const tomas: Recordatorio[] = JSON.parse(data);
    const ahora = new Date();

    // Filtra solo las fechas futuras
    const futuras = tomas
      .map((t) => ({ ...t, fecha: new Date(t.fecha) }))
      .filter((t) => t.fecha > ahora);

    if (futuras.length === 0) return null;

    // Ordena por fecha más próxima
    futuras.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    return {
      ...futuras[0],
      fecha: futuras[0].fecha.toISOString(),
    };
  } catch (e) {
    console.error("Error leyendo recordatorios:", e);
    return null;
  }
}
