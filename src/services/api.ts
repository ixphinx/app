import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config/firebase';

// Crear instancia de axios sin interceptor global
// El token se pasará explícitamente en cada llamada
export function createApiClient(getToken: () => Promise<string | null>): AxiosInstance {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para agregar token de autenticación
  api.interceptors.request.use(
    async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  return api;
}

// Instancia por defecto (se inicializará con el token getter)
let apiInstance: AxiosInstance | null = null;

export function initializeApi(getToken: () => Promise<string | null>) {
  apiInstance = createApiClient(getToken);
}

function getApi(): AxiosInstance {
  if (!apiInstance) {
    throw new Error('API no inicializada. Llama a initializeApi primero.');
  }
  return apiInstance;
}

export interface Race {
  id: string;
  name: string;
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  startTime: string | null;
  endTime: string | null;
  participants: string[];
}

export interface CreateRaceDto {
  name: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  participants?: string[];
}

export interface RaceResult {
  userId: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  avgSpeed: number | null;
}

export const raceApi = {
  getAll: async (): Promise<Race[]> => {
    const response = await getApi().get('/races');
    return response.data;
  },

  getById: async (id: string): Promise<Race> => {
    const response = await getApi().get(`/races/${id}`);
    return response.data;
  },

  create: async (data: CreateRaceDto): Promise<Race> => {
    const response = await getApi().post('/races', data);
    return response.data;
  },

  start: async (id: string, lat: number, lng: number): Promise<any> => {
    const response = await getApi().post(`/races/${id}/start`, { lat, lng });
    return response.data;
  },

  end: async (id: string, lat: number, lng: number): Promise<any> => {
    const response = await getApi().post(`/races/${id}/end`, { lat, lng });
    return response.data;
  },

  getResults: async (id: string): Promise<RaceResult[]> => {
    const response = await getApi().get(`/races/${id}/results`);
    return response.data;
  },

  getUserRaces: async (): Promise<Race[]> => {
    const response = await getApi().get('/users/me/races');
    return response.data;
  },
};

