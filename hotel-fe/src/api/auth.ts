import { User } from '../types/auth';

const API_BASE_URL = '/api';
const TOKEN_KEY = 'hotel_token';

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Đăng nhập thất bại');
  }
  const data = await response.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};

export const register = async (email: string, password: string, fullName: string, phone: string): Promise<{ user: User; token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName, phone }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Đăng ký thất bại');
  }
  const data = await response.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  const data = await response.json();
  return data.user;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);