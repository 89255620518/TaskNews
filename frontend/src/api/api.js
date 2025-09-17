import HttpClient from './httpClient';
import { GoodsAPI } from './goods';
import { UsersAPI } from './users';
import { AdminAPI } from './admin';

const BASE_URL = 'https://dali-khinkali.ru/api';
// const BASE_URL = 'http://127.0.0.1:8000/api';

// Создаем экземпляр HTTP клиента
const httpClient = new HttpClient(BASE_URL);

// Добавляем интерсепторы (пример)
httpClient.addRequestInterceptor(async (request) => {
  console.log('Отправка запроса:', request);
  return request;
});

httpClient.addResponseInterceptor(async (response) => {
  console.log('Получен ответ:', response);
  return response;
});

// Инициализируем API модули
export const api = {
  goods: new GoodsAPI(httpClient),
  users: new UsersAPI(httpClient),
  admin: new AdminAPI(httpClient)
};

// Экспортируем для прямого доступа к HTTP клиенту
export { httpClient };