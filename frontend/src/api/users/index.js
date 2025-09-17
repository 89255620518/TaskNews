
export class UsersAPI {
  constructor(httpClient) {
    this.api = httpClient;
  }

  register(data) {
    return this.api.post('/register', data);
  }

  login(credentials) {
    return this.api.post('/login', credentials);
  }

  logout() {
    return this.api.post('/logout');
  }

  getMe() {
    return this.api.get('/profile');
  }

  updateMe(data) {
    return this.api.put('/profile', data);
  }

  getActivity() {
    return this.api.get('/activity');
  }

  refreshToken() {
    return this.api.post('/refresh');
  }
}