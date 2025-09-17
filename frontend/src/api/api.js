import HttpClient from './httpClient';
import { UsersAPI } from './users';
import { AdminAPI } from './admin';

const BASE_URL = 'http://127.0.0.1:8000/api';

const httpClient = new HttpClient(BASE_URL);

httpClient.addRequestInterceptor(async (request) => {
  console.log('Отправка запроса:', request);
  return request;
});

httpClient.addResponseInterceptor(async (response) => {
  console.log('Получен ответ:', response);
  return response;
});

export const api = {
  users: new UsersAPI(httpClient),
  admin: new AdminAPI(httpClient)
};

export { httpClient };