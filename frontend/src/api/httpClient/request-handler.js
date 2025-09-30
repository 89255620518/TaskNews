export class RequestHandler {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  _mapUrlToController(url, method) {
    const routes = {
      '/api/register': { method: 'POST', handler: (data) => this.httpClient.authManager.handleRegister(data) },
      '/api/login': { method: 'POST', handler: (data) => this.httpClient.authManager.handleLogin(data) },
      '/api/refresh': { method: 'POST', handler: (data) => this.httpClient.authManager.handleRefresh(data) },
      '/api/logout': { method: 'POST', handler: () => this.httpClient.authManager.handleLogout() },
      '/api/me': { method: 'GET', handler: (data) => this.httpClient.authManager.handleGetCurrentUser(data) },
      
      '/api/users': { 
        method: 'GET', 
        handler: (data) => this.httpClient.userManager.handleGetAllUsers(data),
        POST: { method: 'POST', handler: (data) => this.httpClient.userManager.handleCreateUser(data) }
      },
      '/api/users/:id': { 
        method: 'GET', 
        handler: (data) => this.httpClient.userManager.handleGetUserById(data),
        PUT: { method: 'PUT', handler: (data) => this.httpClient.userManager.handleUpdateUser(data) },
        DELETE: { method: 'DELETE', handler: (data) => this.httpClient.userManager.handleDeleteUser(data) }
      },
      '/api/users/:id/role': { method: 'PATCH', handler: (data) => this.httpClient.userManager.handleUpdateUserRole(data) },
      
      '/api/profile': { method: 'PUT', handler: (data) => this.httpClient.userManager.handleUpdateProfile(data) }
    };

    const path = url.replace(this.httpClient.baseURL, '');
    
    if (routes[path]) {
      const route = routes[path];
      if (route[method]) {
        return route[method].handler;
      }
      if (route.method === method) {
        return route.handler;
      }
    }

    for (const [routePath, routeConfig] of Object.entries(routes)) {
      if (routePath.includes(':')) {
        const pattern = new RegExp('^' + routePath.replace(/:\w+/g, '(\\w+)') + '$');
        const match = path.match(pattern);
        
        if (match) {
          const route = routeConfig;
          if (route[method]) {
            return (data) => route[method].handler({ ...data, id: match[1] });
          }
          if (route.method === method) {
            return (data) => route.handler({ ...data, id: match[1] });
          }
        }
      }
    }

    return null;
  }

  _extractUrlParams(url) {
    const params = {};
    const urlWithoutBase = url.replace(this.httpClient.baseURL, '');
    const segments = urlWithoutBase.split('/').filter(seg => seg);
    
    segments.forEach((segment, index) => {
      if (segment.match(/^\d+$/)) {
        params.id = segment;
      }
      if (segment === 'role' && segments[index - 1] && segments[index - 1].match(/^\d+$/)) {
        params.id = segments[index - 1];
      }
    });

    return params;
  }

  async handleRequest(url, options) {
    const method = options.method;
    const handler = this._mapUrlToController(url, method);

    if (!handler) {
      throw new Error(`Route not found: ${method} ${url}`);
    }

    let bodyData = {};
    if (options.body) {
      try {
        bodyData = JSON.parse(options.body);
      } catch (e) {
        console.warn('Failed to parse request body:', e);
      }
    }

    const urlParams = this._extractUrlParams(url);
    
    const controllerData = {
      ...bodyData,
      ...urlParams,
      headers: options.headers
    };

    return await handler(controllerData);
  }
}