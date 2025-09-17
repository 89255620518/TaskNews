// api.js
import HttpClient from './httpClient';
import { UsersAPI } from './users';
import { AdminAPI } from './admin';

const BASE_URL = 'http://127.0.0.1:3001/api';

const httpClient = new HttpClient(BASE_URL);

// Добавляем интерцепторы для логирования
httpClient.addRequestInterceptor(async (request) => {
  console.log('Отправка запроса:', request);
  return request;
});

httpClient.addResponseInterceptor(async (response) => {
  console.log('Получен ответ:', response);
  return response;
});

// Интерцептор для автоматического добавления токена
httpClient.addRequestInterceptor(async (request) => {
  const token = localStorage.getItem('token');
  if (token) {
    request.options.headers = {
      ...request.options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return request;
});

// Интерцептор для обработки ошибок авторизации
httpClient.addResponseInterceptor(async (response) => {
  if (response.error && response.error === 'Invalid token') {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return response;
});

export const api = {
  users: new UsersAPI(httpClient),
  admin: new AdminAPI(httpClient)
};

export { httpClient };