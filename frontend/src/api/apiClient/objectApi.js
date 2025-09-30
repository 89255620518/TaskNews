export class PropertyAPI {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  async createProperty(propertyData) {
    return this.httpClient.post('/api/properties', propertyData);
  }

  async getPropertyById(id) {
    return this.httpClient.get(`/api/properties/${id}`);
  }

  async getAllProperties(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `/api/properties?${queryParams}` : '/api/properties';
    return this.httpClient.get(url);
  }

  async updateProperty(id, propertyData) {
    return this.httpClient.put(`/api/properties/${id}`, propertyData);
  }

  async deleteProperty(id) {
    return this.httpClient.delete(`/api/properties/${id}`);
  }

  async destroyProperty(id) {
    return this.httpClient.delete(`/api/properties/${id}/destroy`);
  }

  async changePropertyStatus(id, status) {
    return this.httpClient.patch(`/api/properties/${id}/status`, { status });
  }

  async getPropertiesByOwner(ownerId, options = {}) {
    const queryParams = new URLSearchParams({ ownerId, ...options }).toString();
    return this.httpClient.get(`/api/properties/owner?${queryParams}`);
  }

  async searchProperties(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.httpClient.get(`/api/properties/search?${queryParams}`);
  }

  async getAvailableForRent(options = {}) {
    const queryParams = new URLSearchParams(options).toString();
    const url = queryParams ? `/api/properties/rent?${queryParams}` : '/api/properties/rent';
    return this.httpClient.get(url);
  }

  async getAvailableForSale(options = {}) {
    const queryParams = new URLSearchParams(options).toString();
    const url = queryParams ? `/api/properties/sale?${queryParams}` : '/api/properties/sale';
    return this.httpClient.get(url);
  }

  async restoreProperty(id) {
    return this.httpClient.patch(`/api/properties/${id}/restore`);
  }

  async getPropertiesStats(ownerId = null) {
    const url = ownerId ? `/api/properties/stats?ownerId=${ownerId}` : '/api/properties/stats';
    return this.httpClient.get(url);
  }
}