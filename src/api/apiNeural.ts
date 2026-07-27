import axios from "axios";

export const PHARMA_NEURAL_URL =
  process.env.EXPO_PUBLIC_PHARMA_NEURAL_URL || "http://127.0.0.1:8000";

export const apiNeural = axios.create({
  baseURL: PHARMA_NEURAL_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendNeuralChatMessage = async (
  mensaje: string,
  sesionId = "app-movil",
) => {
  const response = await apiNeural.post("/chat", {
    mensaje,
    sesion_id: sesionId,
  });

  return response.data;
};

export const getPredictiveDashboard = async (limite = 10) => {
  const response = await apiNeural.get("/dashboard/predictivo", {
    params: {
      limite,
    },
  });

  return response.data;
};

export const getExecutiveReport = async (limite = 5) => {
  const response = await apiNeural.get("/reportes/ejecutivo", {
    params: {
      limite,
    },
  });

  return response.data;
};

export const getInventoryAnomalies = async (limite = 100) => {
  const response = await apiNeural.get("/inventario/anomalias", {
    params: {
      limite,
    },
  });

  return response.data;
};

export const getInventoryAlerts = async (limite = 100) => {
  const response = await apiNeural.get("/inventario/alertas", {
    params: {
      limite,
    },
  });

  return response.data;
};

export const getLowStockReport = async (limite = 100) => {
  const response = await apiNeural.get("/inventario/alertas/reporte-bajo-stock", {
    params: {
      limite,
    },
  });

  return response.data;
};

export const getAutomaticRecommendations = async (limite = 10) => {
  const response = await apiNeural.get("/recomendaciones", {
    params: {
      limite,
    },
  });

  return response.data;
};

export const runAutonomousAgentCycle = async (
  autorizarAcciones = false,
  sesionId = "app-movil",
) => {
  const response = await apiNeural.post("/agente/autonomo/ciclo", {
    autorizar_acciones: autorizarAcciones,
    sesion_id: sesionId,
  });

  return response.data;
};

export const sendLearningFeedback = async ({
  mensaje,
  respuesta,
  util,
  sesionId = "app-movil",
  intencion,
  correccion,
}: {
  mensaje: string;
  respuesta: string;
  util: boolean;
  sesionId?: string;
  intencion?: string;
  correccion?: string;
}) => {
  const response = await apiNeural.post("/aprendizaje/feedback", {
    mensaje,
    respuesta,
    util,
    sesion_id: sesionId,
    intencion,
    correccion,
  });

  return response.data;
};

export const getLearningEvents = async (
  estado = "pendiente_revision",
  limite = 100,
) => {
  const response = await apiNeural.get("/aprendizaje/eventos", {
    params: {
      estado,
      limite,
    },
  });

  return response.data;
};

export const reviewLearningEvent = async (
  eventId: string,
  estado: "aprobado_para_entrenamiento" | "rechazado" | "pendiente_revision",
) => {
  const response = await apiNeural.patch(`/aprendizaje/eventos/${eventId}`, {
    estado,
  });

  return response.data;
};
