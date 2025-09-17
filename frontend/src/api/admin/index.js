
export class AdminAPI {
  constructor(httpClient) {
    this.api = httpClient;
  }

  getUsers(params = {}) {
    return this.api.get('/users', { params });
  }

  getUser(id) {
    return this.api.get(`/users/${id}`);
  }

  createUser(data) {
    return this.api.post('/users', data);
  }

  updateUser(id, data) {
    return this.api.put(`/users/${id}`, data);
  }

  deleteUser(id) {
    return this.api.delete(`/users/${id}`);
  }
}