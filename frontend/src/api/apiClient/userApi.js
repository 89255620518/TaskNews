export class UsersAPI {
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