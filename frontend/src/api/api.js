import HttpClient from './httpClient';

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
  const token = localStorage.getItem('token');
  if (token) {
    request.options.headers = {
      ...request.options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return request;
});

httpClient.addResponseInterceptor(async (response) => {
  if (response.data && response.data.message && response.data.message.includes('Не авторизован')) {
    localStorage.removeItem('token');
    console.warn('Авторизация истекла, перенаправляем на логин');
  }
  return response;
});

class UsersAPI {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/users${queryString ? `?${queryString}` : ''}`;
    return this.httpClient.get(url);
  }

  async getById(id) {
    return this.httpClient.get(`/api/users/${id}`);
  }

  async create(userData) {
    return this.httpClient.post('/api/users', userData);
  }

  async update(id, userData) {
    return this.httpClient.put(`/api/users/${id}`, userData);
  }

  async delete(id) {
    return this.httpClient.delete(`/api/users/${id}`);
  }

  async updateRole(id, role) {
    return this.httpClient.patch(`/api/users/${id}/role`, { role });
  }
}

class AuthAPI {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  async register(userData) {
    return this.httpClient.post('/api/register', userData);
  }

  async login(credentials) {
    return this.httpClient.post('/api/login', credentials);
  }

  async refresh() {
    return this.httpClient.post('/api/refresh');
  }

  async logout() {
    return this.httpClient.post('/api/logout');
  }

  async getCurrentUser() {
    return this.httpClient.get('/api/me');
  }

  async updateProfile(userData) {
    return this.httpClient.put('/api/profile', userData);
  }
}

class AdminAPI {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  async getUsers(params = {}) {
    return this.httpClient.get('/api/users', params);
  }

  async createUser(userData) {
    return this.httpClient.post('/api/users', userData);
  }

  async updateUserRole(id, role) {
    return this.httpClient.patch(`/api/users/${id}/role`, { role });
  }

  async deleteUser(id) {
    return this.httpClient.delete(`/api/users/${id}`);
  }
}

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
      localStorage.setItem('token', loginResult.data.accessToken);
      console.log('✅ Авторизован как администратор');
    }
  } catch (error) {
    console.log('ℹ️ Данные уже существуют или ошибка авторизации');
  }
};

export default api;