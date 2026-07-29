import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "pharma_offline_queue";

export type OfflineOperationType = "venta";

export type OfflineOperation = {
  id: string;
  type: OfflineOperationType;
  payload: unknown;
  createdAt: string;
  status: "pending" | "synced" | "failed";
};

const readQueue = async (): Promise<OfflineOperation[]> => {
  const stored = await AsyncStorage.getItem(QUEUE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeQueue = (queue: OfflineOperation[]) =>
  AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

export const offlineQueue = {
  async add(type: OfflineOperationType, payload: unknown) {
    const operation: OfflineOperation = {
      id: `${type}-${Date.now()}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    const queue = await readQueue();
    await writeQueue([operation, ...queue]);
    return operation;
  },

  async pending() {
    return (await readQueue()).filter((operation) => operation.status === "pending");
  },

  async count() {
    return (await this.pending()).length;
  },

  async clear() {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },
};
