import axios from "axios";
import { DEFAULT_NEURAL_API_URL, getNeuralApiUrl } from "../utils/appSettings";

export const PHARMA_NEURAL_URL =
  DEFAULT_NEURAL_API_URL;

export const apiNeural = axios.create({
  baseURL: PHARMA_NEURAL_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiNeural.interceptors.request.use(async (config) => {
  config.baseURL = await getNeuralApiUrl();
  return config;
});

export const getCurrentNeuralApiUrl = getNeuralApiUrl;

export const checkNeuralApiStatus = async () => {
  const response = await apiNeural.get("/perfil", {
    timeout: 6000,
  });

  return response.data;
};

export const syncAppSale = async (venta: unknown, farmacia: unknown) => {
  const response = await apiNeural.post("/ventas/sincronizar", {
    venta,
    farmacia,
  });

  return response.data;
};

export const getSyncedAppSales = async (limite = 20) => {
  const response = await apiNeural.get("/ventas/sincronizadas", {
    params: {
      limite,
    },
  });

  return response.data;
};

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

export const sendVoiceTranscript = async (
  transcripcion: string,
  sesionId = "app-movil-voz",
) => {
  const response = await apiNeural.post("/voz/transcripcion", {
    transcripcion,
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

export const getAppProfile = async () => {
  const response = await apiNeural.get("/perfil");

  return response.data;
};

export const getSaleTicketPdfUrl = (ventaId: string | number) =>
  `${PHARMA_NEURAL_URL}/ventas/${ventaId}/ticket.pdf`;

export const getSaleTicketPdfUrlAsync = async (ventaId: string | number) =>
  `${await getNeuralApiUrl()}/ventas/${ventaId}/ticket.pdf`;

export const getLowStockReportPdfUrl = () =>
  `${PHARMA_NEURAL_URL}/inventario/alertas/reporte-bajo-stock.pdf`;

export const getLowStockReportPdfUrlAsync = async () =>
  `${await getNeuralApiUrl()}/inventario/alertas/reporte-bajo-stock.pdf`;

export const getAIPredictionHistory = async (limite = 20) => {
  const response = await apiNeural.get("/perfil/ia/predicciones", {
    params: {
      limite,
    },
  });

  return response.data;
};

export const getAIActionHistory = async (limite = 20) => {
  const response = await apiNeural.get("/perfil/ia/acciones", {
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
