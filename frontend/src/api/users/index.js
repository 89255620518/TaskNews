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

  sendOrder(data, token) {
    return this.api.post('/send-order/', data, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  sendPreorder(data, token) {
    return this.api.post('/send-preorder/', data, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  sendBanquet(data, token) {
    return this.api.post('/send-banquet/', data, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })
  }

  sendHookah(data, token) {
    return this.api.post('/send-hookah/', data, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  processPayment(data, token) {
    return this.api.post('/payment/', data, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  callTaxi(data, token) {
    return this.api.post('/send-taxi/', data, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
}