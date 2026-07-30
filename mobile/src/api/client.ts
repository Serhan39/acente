import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Geliştirme ortamında kendi backend adresinizi buraya yazın.
// Fiziksel telefon/emülatörden erişim için bilgisayarınızın yerel ağ IP'sini kullanın
// (örn. http://192.168.1.20:4000/api). "localhost" telefondan erişilemez.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "acente_auth_token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export async function getStoredToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setStoredToken(token: string | null) {
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

apiClient.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiErrorResponse {
  message: string;
  details?: unknown;
}

export function getErrorMessage(error: unknown, fallback = "Bir hata oluştu, tekrar deneyin"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) return data.message;
    if (error.message === "Network Error") {
      return "Sunucuya bağlanılamadı. İnternet bağlantınızı ve sunucu adresini kontrol edin.";
    }
  }
  return fallback;
}
