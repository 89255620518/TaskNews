import { Property, PropertyAttributes } from '../models/object';

class PropertyController {

  async createProperty(propertyData: Partial<PropertyAttributes>): Promise<{ success: boolean; property?: Property; error?: string }> {
    try {
      if (!propertyData.title || propertyData.title.trim().length === 0) {
        return { success: false, error: 'Название объекта обязательно' };
      }

      if (!propertyData.description || propertyData.description.trim().length === 0) {
        return { success: false, error: 'Описание объекта обязательно' };
      }

      if (!propertyData.address || propertyData.address.trim().length === 0) {
        return { success: false, error: 'Адрес объекта обязателен' };
      }

      if (!propertyData.city || propertyData.city.trim().length === 0) {
        return { success: false, error: 'Город обязателен' };
      }

      if (!propertyData.ownerId || propertyData.ownerId <= 0) {
        return { success: false, error: 'Владелец объекта обязателен' };
      }

      if (!propertyData.price || propertyData.price <= 0) {
        return { success: false, error: 'Цена должна быть больше 0' };
      }

      if (!propertyData.area || propertyData.area <= 0) {
        return { success: false, error: 'Площадь должна быть больше 0' };
      }

      if (propertyData.transactionType === 'rent' && (!propertyData.rentPrice || propertyData.rentPrice <= 0)) {
        return { success: false, error: 'Для аренды указана некорректная цена' };
      }

      if (propertyData.transactionType === 'sale' && propertyData.rentPrice) {
        propertyData.rentPrice = undefined;
      }

      const property = await Property.create(propertyData);
      
      return {
        success: true,
        property
      };
    } catch (error) {
      console.error('Error creating property:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при создании объекта'
      };
    }
  }

  async getPropertyById(id: number): Promise<{ success: boolean; property?: Property; error?: string }> {
    try {
      if (!id || id <= 0) {
        return { success: false, error: 'Некорректный ID объекта' };
      }

      const property = await Property.findByPk(id);
      
      if (!property) {
        return { success: false, error: 'Объект не найден' };
      }

      if (!property.isActive) {
        return { success: false, error: 'Объект неактивен' };
      }

      return {
        success: true,
        property
      };
    } catch (error) {
      console.error('Error getting property by ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при получении объекта'
      };
    }
  }

  async getAllProperties(options: {
    page?: number;
    limit?: number;
    where?: any;
    order?: any;
  } = {}): Promise<{ success: boolean; properties?: Property[]; total?: number; error?: string }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      const findOptions: any = {
        where: { isActive: true, ...options.where },
        limit,
        offset
      };

      if (options.order) {
        findOptions.order = options.order;
      }

      const result = await Property.findAndCountAll(findOptions);
      
      return {
        success: true,
        properties: result.rows,
        total: result.count
      };
    } catch (error) {
      console.error('Error getting all properties:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при получении объектов'
      };
    }
  }

  async updateProperty(id: number, updateData: Partial<PropertyAttributes>): Promise<{ success: boolean; property?: Property; error?: string }> {
    try {
      if (!id || id <= 0) {
        return { success: false, error: 'Некорректный ID объекта' };
      }

      const currentProperty = await Property.findByPk(id);
      if (!currentProperty) {
        return { success: false, error: 'Объект не найден' };
      }

      if (updateData.title !== undefined && updateData.title.trim().length === 0) {
        return { success: false, error: 'Название не может быть пустым' };
      }

      if (updateData.description !== undefined && updateData.description.trim().length === 0) {
        return { success: false, error: 'Описание не может быть пустым' };
      }

      if (updateData.address !== undefined && updateData.address.trim().length === 0) {
        return { success: false, error: 'Адрес не может быть пустым' };
      }

      if (updateData.city !== undefined && updateData.city.trim().length === 0) {
        return { success: false, error: 'Город не может быть пустым' };
      }

      if (updateData.price !== undefined && updateData.price <= 0) {
        return { success: false, error: 'Цена должна быть больше 0' };
      }

      if (updateData.area !== undefined && updateData.area <= 0) {
        return { success: false, error: 'Площадь должна быть больше 0' };
      }

      if (updateData.transactionType === 'rent' && (!updateData.rentPrice || updateData.rentPrice <= 0)) {
        return { success: false, error: 'Для аренды указана некорректная цена' };
      }

      if (updateData.transactionType === 'sale') {
        updateData.rentPrice = undefined;
      }

      const updatedProperty = await currentProperty.update(updateData);
      
      return {
        success: true,
        property: updatedProperty
      };
    } catch (error) {
      console.error('Error updating property:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при обновлении объекта'
      };
    }
  }

  async deleteProperty(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      if (!id || id <= 0) {
        return { success: false, error: 'Некорректный ID объекта' };
      }

      const property = await Property.findByPk(id);
      if (!property) {
        return { success: false, error: 'Объект не найден' };
      }

      await property.update({ isActive: false });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting property:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при удалении объекта'
      };
    }
  }

  async destroyProperty(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      if (!id || id <= 0) {
        return { success: false, error: 'Некорректный ID объекта' };
      }

      const property = await Property.findByPk(id);
      if (!property) {
        return { success: false, error: 'Объект не найден' };
      }

      await property.destroy();
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error destroying property:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при полном удалении объекта'
      };
    }
  }

  async changePropertyStatus(id: number, status: PropertyAttributes["status"]): Promise<{ success: boolean; property?: Property; error?: string }> {
    try {
      if (!id || id <= 0) {
        return { success: false, error: 'Некорректный ID объекта' };
      }

      const property = await Property.findByPk(id);
      if (!property) {
        return { success: false, error: 'Объект не найден' };
      }

      const updatedProperty = await property.changeStatus(status);
      
      return {
        success: true,
        property: updatedProperty
      };
    } catch (error) {
      console.error('Error changing property status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при изменении статуса объекта'
      };
    }
  }

  async getPropertiesByOwner(ownerId: number, options: {
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  } = {}): Promise<{ success: boolean; properties?: Property[]; total?: number; error?: string }> {
    try {
      if (!ownerId || ownerId <= 0) {
        return { success: false, error: 'Некорректный ID владельца' };
      }

      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      const where: any = { ownerId };
      if (!options.includeInactive) {
        where.isActive = true;
      }

      const properties = await Property.findByOwner(ownerId);
      
      const paginatedProperties = properties.slice(offset, offset + limit);
      
      return {
        success: true,
        properties: paginatedProperties,
        total: properties.length
      };
    } catch (error) {
      console.error('Error getting properties by owner:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при получении объектов владельца'
      };
    }
  }

  async searchProperties(filters: {
    city?: string;
    type?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRentPrice?: number;
    maxRentPrice?: number;
    minArea?: number;
    maxArea?: number;
    rooms?: number;
    amenities?: string[];
    transactionType?: 'rent' | 'sale' | 'both';
    page?: number;
    limit?: number;
  } = {}): Promise<{ success: boolean; properties?: Property[]; total?: number; error?: string }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;

      const searchFilters: any = {};

      if (filters.city) {
        searchFilters.city = filters.city;
      }

      if (filters.type && filters.type.length > 0) {
        searchFilters.type = filters.type;
      }

      if (filters.minPrice !== undefined) {
        searchFilters.minPrice = filters.minPrice;
      }

      if (filters.maxPrice !== undefined) {
        searchFilters.maxPrice = filters.maxPrice;
      }

      if (filters.minArea !== undefined) {
        searchFilters.minArea = filters.minArea;
      }

      if (filters.maxArea !== undefined) {
        searchFilters.maxArea = filters.maxArea;
      }

      if (filters.rooms !== undefined) {
        searchFilters.rooms = filters.rooms;
      }

      if (filters.amenities && filters.amenities.length > 0) {
        searchFilters.amenities = filters.amenities;
      }

      if (filters.transactionType) {
        searchFilters.transactionType = filters.transactionType;
      }

      let properties = await Property.searchProperties(searchFilters);

      if (filters.minRentPrice !== undefined || filters.maxRentPrice !== undefined) {
        properties = properties.filter(property => {
          if (!property.rentPrice) return false;
          
          if (filters.minRentPrice !== undefined && property.rentPrice < filters.minRentPrice!) {
            return false;
          }
          
          if (filters.maxRentPrice !== undefined && property.rentPrice > filters.maxRentPrice!) {
            return false;
          }
          
          return true;
        });
      }

      const total = properties.length;
      const paginatedProperties = properties.slice(offset, offset + limit);

      return {
        success: true,
        properties: paginatedProperties,
        total
      };
    } catch (error) {
      console.error('Error searching properties:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при поиске объектов'
      };
    }
  }

  async getAvailableForRent(options: {
    page?: number;
    limit?: number;
    city?: string;
  } = {}): Promise<{ success: boolean; properties?: Property[]; total?: number; error?: string }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      const where: any = { 
        isActive: true,
        status: 'available'
      };

      if (options.city) {
        where.city = options.city;
      }

      const allProperties = await Property.findAvailableForRent();
      
      let filteredProperties = allProperties;
      if (options.city) {
        filteredProperties = allProperties.filter(property => 
          property.city.toLowerCase().includes(options.city!.toLowerCase())
        );
      }

      const total = filteredProperties.length;
      const paginatedProperties = filteredProperties.slice(offset, offset + limit);

      return {
        success: true,
        properties: paginatedProperties,
        total
      };
    } catch (error) {
      console.error('Error getting available for rent properties:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при получении объектов для аренды'
      };
    }
  }

  async getAvailableForSale(options: {
    page?: number;
    limit?: number;
    city?: string;
  } = {}): Promise<{ success: boolean; properties?: Property[]; total?: number; error?: string }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      const where: any = { 
        isActive: true,
        status: 'available'
      };

      if (options.city) {
        where.city = options.city;
      }

      const allProperties = await Property.findAvailableForSale();
      
      let filteredProperties = allProperties;
      if (options.city) {
        filteredProperties = allProperties.filter(property => 
          property.city.toLowerCase().includes(options.city!.toLowerCase())
        );
      }

      const total = filteredProperties.length;
      const paginatedProperties = filteredProperties.slice(offset, offset + limit);

      return {
        success: true,
        properties: paginatedProperties,
        total
      };
    } catch (error) {
      console.error('Error getting available for sale properties:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при получении объектов для покупки'
      };
    }
  }

  async restoreProperty(id: number): Promise<{ success: boolean; property?: Property; error?: string }> {
    try {
      if (!id || id <= 0) {
        return { success: false, error: 'Некорректный ID объекта' };
      }

      const property = await Property.findByPk(id);
      if (!property) {
        return { success: false, error: 'Объект не найден' };
      }

      const updatedProperty = await property.update({ isActive: true });
      
      return {
        success: true,
        property: updatedProperty
      };
    } catch (error) {
      console.error('Error restoring property:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при восстановлении объекта'
      };
    }
  }

  async getPropertiesStats(ownerId?: number): Promise<{ 
    success: boolean; 
    stats?: { 
      total: number;
      available: number;
      rented: number;
      sold: number;
      maintenance: number;
      forRent: number;
      forSale: number;
      forBoth: number;
    }; 
    error?: string 
  }> {
    try {
      const properties = await Property.findAndCountAll({
        where: ownerId ? { ownerId, isActive: true } : { isActive: true }
      });

      const stats = {
        total: properties.count,
        available: properties.rows.filter(p => p.status === 'available').length,
        rented: properties.rows.filter(p => p.status === 'rented').length,
        sold: properties.rows.filter(p => p.status === 'sold').length,
        maintenance: properties.rows.filter(p => p.status === 'maintenance').length,
        forRent: properties.rows.filter(p => p.transactionType === 'rent').length,
        forSale: properties.rows.filter(p => p.transactionType === 'sale').length,
        forBoth: properties.rows.filter(p => p.transactionType === 'both').length
      };

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Error getting properties stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка при получении статистики'
      };
    }
  }
}

export const createProperty = PropertyController.prototype.createProperty;
export const getPropertyById = PropertyController.prototype.getPropertyById;
export const getAllProperties = PropertyController.prototype.getAllProperties;
export const updateProperty = PropertyController.prototype.updateProperty;
export const deleteProperty = PropertyController.prototype.deleteProperty;
export const destroyProperty = PropertyController.prototype.destroyProperty;
export const changePropertyStatus = PropertyController.prototype.changePropertyStatus;
export const getPropertiesByOwner = PropertyController.prototype.getPropertiesByOwner;
export const searchProperties = PropertyController.prototype.searchProperties;
export const getAvailableForRent = PropertyController.prototype.getAvailableForRent;
export const getAvailableForSale = PropertyController.prototype.getAvailableForSale;
export const restoreProperty = PropertyController.prototype.restoreProperty;
export const getPropertiesStats = PropertyController.prototype.getPropertiesStats;

const initializePropertyController = () => {
  return new PropertyController();
};

export { PropertyController, initializePropertyController };