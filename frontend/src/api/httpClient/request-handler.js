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
      '/api/profile': { method: 'PUT', handler: (data) => this.httpClient.userManager.handleUpdateProfile(data) },
      
      '/api/properties': { 
        method: 'GET', 
        handler: (data) => this._handleGetAllProperties(data),
        POST: { method: 'POST', handler: (data) => this._handleCreateProperty(data) }
      },
      '/api/properties/stats': { 
        method: 'GET', 
        handler: (data) => this._handleGetPropertiesStats(data)
      },
      '/api/properties/search': { 
        method: 'GET', 
        handler: (data) => this._handleSearchProperties(data)
      },
      '/api/properties/rent': { 
        method: 'GET', 
        handler: (data) => this._handleGetAvailableForRent(data)
      },
      '/api/properties/sale': { 
        method: 'GET', 
        handler: (data) => this._handleGetAvailableForSale(data)
      },
      '/api/properties/owner': { 
        method: 'GET', 
        handler: (data) => this._handleGetPropertiesByOwner(data)
      },
      '/api/properties/:id': { 
        method: 'GET', 
        handler: (data) => this._handleGetPropertyById(data),
        PUT: { method: 'PUT', handler: (data) => this._handleUpdateProperty(data) },
        DELETE: { method: 'DELETE', handler: (data) => this._handleDeleteProperty(data) }
      },
      '/api/properties/:id/status': { 
        method: 'PATCH', 
        handler: (data) => this._handleChangePropertyStatus(data)
      },
      '/api/properties/:id/restore': { 
        method: 'PATCH', 
        handler: (data) => this._handleRestoreProperty(data)
      },
      '/api/properties/:id/destroy': { 
        method: 'DELETE', 
        handler: (data) => this._handleDestroyProperty(data)
      }
    };

    const path = url.replace(this.httpClient.baseURL, '');
    const cleanPath = path.split('?')[0];
    
    if (routes[cleanPath]) {
      const route = routes[cleanPath];
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
        const match = cleanPath.match(pattern);
        
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
    const urlParts = urlWithoutBase.split('?')[0].split('/').filter(seg => seg);
    
    urlParts.forEach((segment) => {
      if (segment.match(/^\d+$/)) {
        params.id = segment;
      }
    });

    const queryString = url.split('?')[1];
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      for (const [key, value] of searchParams) {
        params[key] = value;
      }
    }

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

  async _handleGetAllProperties(data) {
    try {
      const filters = { ...data };
      delete filters.headers;
      
      return await this.httpClient.propertyManager.getAllProperties(filters);
    } catch (error) {
      console.error('Ошибка получения объектов:', error);
      throw error;
    }
  }

  async _handleGetPropertyById(data) {
    try {
      return await this.httpClient.propertyManager.getPropertyById(data.id);
    } catch (error) {
      console.error('Ошибка получения объекта:', error);
      throw error;
    }
  }

  async _handleCreateProperty(data) {
    try {
      const propertyData = { ...data };
      delete propertyData.headers;
      
      return await this.httpClient.propertyManager.createProperty(propertyData);
    } catch (error) {
      console.error('Ошибка создания объекта:', error);
      throw error;
    }
  }

  async _handleUpdateProperty(data) {
    try {
      const propertyData = { ...data };
      delete propertyData.id;
      delete propertyData.headers;
      
      return await this.httpClient.propertyManager.updateProperty(data.id, propertyData);
    } catch (error) {
      console.error('Ошибка обновления объекта:', error);
      throw error;
    }
  }

  async _handleDeleteProperty(data) {
    try {
      return await this.httpClient.propertyManager.deleteProperty(data.id);
    } catch (error) {
      console.error('Ошибка удаления объекта:', error);
      throw error;
    }
  }

  async _handleDestroyProperty(data) {
    try {
      return await this.httpClient.propertyManager.destroyProperty(data.id);
    } catch (error) {
      console.error('Ошибка полного удаления объекта:', error);
      throw error;
    }
  }

  async _handleChangePropertyStatus(data) {
    try {
      return await this.httpClient.propertyManager.changePropertyStatus(data.id, data.status);
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      throw error;
    }
  }

  async _handleRestoreProperty(data) {
    try {
      return await this.httpClient.propertyManager.restoreProperty(data.id);
    } catch (error) {
      console.error('Ошибка восстановления объекта:', error);
      throw error;
    }
  }

  async _handleGetPropertiesStats(data) {
    try {
      return await this.httpClient.propertyManager.getPropertiesStats(data.ownerId);
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      throw error;
    }
  }

  async _handleSearchProperties(data) {
    try {
      const filters = { ...data };
      delete filters.headers;
      
      return await this.httpClient.propertyManager.searchProperties(filters);
    } catch (error) {
      console.error('Ошибка поиска объектов:', error);
      throw error;
    }
  }

  async _handleGetAvailableForRent(data) {
    try {
      const options = { ...data };
      delete options.headers;
      
      return await this.httpClient.propertyManager.getAvailableForRent(options);
    } catch (error) {
      console.error('Ошибка получения объектов для аренды:', error);
      throw error;
    }
  }

  async _handleGetAvailableForSale(data) {
    try {
      const options = { ...data };
      delete options.headers;
      
      return await this.httpClient.propertyManager.getAvailableForSale(options);
    } catch (error) {
      console.error('Ошибка получения объектов для продажи:', error);
      throw error;
    }
  }

  async _handleGetPropertiesByOwner(data) {
    try {
      const options = { ...data };
      delete options.ownerId;
      delete options.headers;
      
      return await this.httpClient.propertyManager.getPropertiesByOwner(data.ownerId, options);
    } catch (error) {
      console.error('Ошибка получения объектов владельца:', error);
      throw error;
    }
  }
}