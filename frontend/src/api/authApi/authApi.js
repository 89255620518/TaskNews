export class AuthAPI {
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