export class UsersAPI {
  constructor(httpClient) {
    this.api = httpClient;
  }

  register(data) {
    return this.api.post('/users/', data);
  }

  login(credentials) {
    return this.api.post('/auth/token/login/', credentials);
  }

  logout() {
    return this.api.post('/auth/token/logout/');
  }

  getMe() {
    return this.api.get('/users/me/');
  }

  updateMe(data) {
    return this.api.put('/users/me/', data);
  }
}