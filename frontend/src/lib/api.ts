import axios from 'axios';
import type { 
  LoginCredentials, 
  RegisterData, 
  TokenResponse, 
  User, 
  Contact,
  ContactCreate,
  PhoneCreate 
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post<TokenResponse>(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          );

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await api.post('/auth/logout', { refresh_token: refreshToken });
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/users/me');
    return response.data;
  },
};

// Contacts API
export const contactsAPI = {
  getAll: async (): Promise<Contact[]> => {
    const response = await api.get<Contact[]>('/contacts/');
    return response.data;
  },

  getById: async (id: string): Promise<Contact> => {
    const response = await api.get<Contact>(`/contacts/${id}`);
    return response.data;
  },

  create: async (contact: ContactCreate): Promise<Contact> => {
    const response = await api.post<Contact>('/contacts/', contact);
    return response.data;
  },

  update: async (id: string, contact: Partial<Contact>): Promise<Contact> => {
    const response = await api.put<Contact>(`/contacts/${id}`, contact);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },
};

// Phones API
export const phonesAPI = {
  create: async (phone: PhoneCreate) => {
    const response = await api.post('/phones/', phone);
    return response.data;
  },

  update: async (id: string, phone: Partial<PhoneCreate>) => {
    const response = await api.put(`/phones/${id}`, phone);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/phones/${id}`);
  },
};

export default api;
