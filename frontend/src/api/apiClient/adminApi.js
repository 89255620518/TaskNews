export class AdminAPI {
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