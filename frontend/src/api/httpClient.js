export class HttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.interceptors = {
      request: [],
      response: []
    };
  }

  async _handleRequest(url, options) {
    // Применяем interceptors запроса
    let request = { url, options };
    for (const interceptor of this.interceptors.request) {
      request = await interceptor(request);
    }

    try {
      const response = await fetch(`${this.baseURL}${request.url}`, request.options);

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = {};
      }

      // Обработка 401 ошибки и невалидного токена
      if (response.status === 401) {
        if (data.detail === "Недопустимый токен.") {
          localStorage.removeItem('token');
          window.location.href = '/login?session_expired=true';
          return Promise.reject('Invalid token');
        }
        return Promise.reject('Unauthorized');
      }

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.response = {
          status: response.status,
          data: data
        };
        throw error;
      }

      // Применяем interceptors ответа
      for (const interceptor of this.interceptors.response) {
        data = await interceptor(data);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  get(url) {
    return this._handleRequest(url, {
      method: 'GET',
      headers: this._getHeaders()
    });
  }

  post(url, data) {
    return this._handleRequest(url, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(data)
    });
  }

  put(url, data) {
    return this._handleRequest(url, {
      method: 'PUT',
      headers: this._getHeaders(),
      body: JSON.stringify(data)
    });
  }

  patch(url, data) {
    return this._handleRequest(url, {
      method: 'PATCH',
      headers: this._getHeaders(),
      body: JSON.stringify(data)
    });
  }

  delete(url) {
    return this._handleRequest(url, {
      method: 'DELETE',
      headers: this._getHeaders()
    });
  }

  _getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    return headers;
  }
}

export default HttpClient;