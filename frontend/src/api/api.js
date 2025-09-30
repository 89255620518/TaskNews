import HttpClient from './httpClient/httpClient';
import { UsersAPI } from './authApi/userApi';
import { AdminAPI } from './authApi/adminApi';
import { AuthAPI } from './authApi/authApi';

const BASE_URL = 'http://127.0.0.1:3000';

const httpClient = new HttpClient(BASE_URL);

httpClient.addRequestInterceptor(async (request) => {
  console.log('📤 Request:', request.method, request.url);
  return request;
});

httpClient.addResponseInterceptor(async (response) => {
  console.log('📥 Response:', response);
  return response;
});

httpClient.addRequestInterceptor(async (request) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    request.options.headers = {
      ...request.options.headers,
      'Authorization': `Bearer ${accessToken}`
    };
  }
  return request;
});

httpClient.addResponseInterceptor(async (response) => {
  if (response.data && response.data.message && response.data.message.includes('Не авторизован')) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.warn('Авторизация истекла, перенаправляем на логин');
  }
  return response;
});

export const api = {
  auth: new AuthAPI(httpClient),
  users: new UsersAPI(httpClient),
  admin: new AdminAPI(httpClient),
  httpClient
};

export const initializeMockData = async () => {
  try {
    console.log('✅ Данные инициализированы');
    
    const loginResult = await api.auth.login({
      email: 'admin@example.com',
      password: 'password'
    });

    if (loginResult.data.accessToken) {
      localStorage.setItem('accessToken', loginResult.data.accessToken);
      localStorage.setItem('refreshToken', loginResult.data.refreshToken);
      console.log('✅ Авторизован как администратор');
    }
  } catch (error) {
    console.log('ℹ️ Данные уже существуют или ошибка авторизации');
  }
};

export default api;