export class AdminAPI {
  constructor(httpClient) {
    this.api = httpClient;
  }

  // Управление пользователями
  getUsers(params = {}) {
    return this.api.get('/admin/users/', { params });
  }

  getUser(id) {
    return this.api.get(`/admin/users/${id}/`);
  }

  createUser(data) {
    return this.api.post('/admin/users/', data);
  }

  updateUser(id, data) {
    return this.api.put(`/admin/users/${id}/`, data);
  }

  deleteUser(id) {
    return this.api.delete(`/admin/users/${id}/`);
  }

  // Управление товарами
  getAllGoods() {
    return this.api.get('/admin/goods/');
  }

  // Статистика
  getStatistics() {
    return this.api.get('/admin/statistics/');
  }
}