import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config/firebase';
import auth from '@react-native-firebase/auth';

function createApiClient(): AxiosInstance {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor SIEMPRE obtiene token actualizado desde Firebase
  api.interceptors.request.use(
    async (config) => {
      const currentUser = auth().currentUser;

      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log("⚠️ No hay usuario logueado → sin token");
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return api;
}

// Instancia global
const apiInstance = createApiClient();

function getApi(): AxiosInstance {
  return apiInstance;
}

// -------- API ENDPOINTS --------

export interface Race {
  route: any;
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
    try {
      const response = await getApi().get('/users/me/races');
      return response.data;
    } catch (error) {
      console.error('❌ Error getting user races:', error);
      return [];
    }
  },
};
