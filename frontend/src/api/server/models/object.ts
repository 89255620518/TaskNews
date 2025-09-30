interface PropertyAttributes {
  id: number;
  title: string;
  description: string;
  type: "apartment" | "house" | "commercial" | "land";
  status: "available" | "rented" | "sold" | "maintenance";
  transactionType: "rent" | "sale" | "both";
  price: number;
  rentPrice?: number;
  area: number;
  rooms?: number;
  address: string;
  city: string;
  district?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  images: string[];
  ownerId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class Property implements PropertyAttributes {
  public id: number;
  public title: string;
  public description: string;
  public type: "apartment" | "house" | "commercial" | "land";
  public status: "available" | "rented" | "sold" | "maintenance";
  public transactionType: "rent" | "sale" | "both";
  public price: number;
  public rentPrice?: number;
  public area: number;
  public rooms?: number;
  public address: string;
  public city: string;
  public district?: string;
  public coordinates?: { lat: number; lng: number };
  public amenities: string[];
  public images: string[];
  public ownerId: number;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  private static storageKey = 'properties';
  private static currentId = 1;
  private static initialized = false;

  constructor(attributes: Partial<PropertyAttributes> = {}) {
    this.id = attributes.id || 0;
    this.title = attributes.title || '';
    this.description = attributes.description || '';
    this.type = attributes.type || 'apartment';
    this.status = attributes.status || 'available';
    this.transactionType = attributes.transactionType || 'both';
    this.price = attributes.price || 0;
    this.rentPrice = attributes.rentPrice;
    this.area = attributes.area || 0;
    this.rooms = attributes.rooms;
    this.address = attributes.address || '';
    this.city = attributes.city || '';
    this.district = attributes.district;
    this.coordinates = attributes.coordinates;
    this.amenities = attributes.amenities || [];
    this.images = attributes.images || [];
    this.ownerId = attributes.ownerId || 0;
    this.isActive = attributes.isActive !== undefined ? attributes.isActive : true;
    this.createdAt = attributes.createdAt || new Date();
    this.updatedAt = attributes.updatedAt || new Date();
    
    Property.ensureInitialized();
  }

  private static ensureInitialized(): void {
    if (!this.initialized) {
      this.initializeId();
      this.initialized = true;
    }
  }

  private static initializeId(): void {
    const properties = this.getPropertiesFromStorage();
    const maxId = properties.reduce((max, property) => Math.max(max, property.id), 0);
    this.currentId = maxId + 1;
  }

  private static getPropertiesFromStorage(): Property[] {
    if (typeof window === 'undefined') {
      return [];
    }
    
    try {
      const propertiesJson = localStorage.getItem(this.storageKey);
      if (!propertiesJson) return [];
      
      const propertiesData = JSON.parse(propertiesJson);
      return propertiesData.map((propertyData: any) => new Property({
        ...propertyData,
        coordinates: propertyData.coordinates || undefined,
        createdAt: new Date(propertyData.createdAt),
        updatedAt: new Date(propertyData.updatedAt)
      }));
    } catch (error) {
      console.error('Error reading properties from localStorage:', error);
      return [];
    }
  }

  private static savePropertiesToStorage(properties: Property[]): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(properties));
      const maxId = properties.reduce((max, property) => Math.max(max, property.id), 0);
      this.currentId = maxId + 1;
    } catch (error) {
      console.error('Error saving properties to localStorage:', error);
    }
  }

  public async save(): Promise<this> {
    Property.ensureInitialized();
    const properties = Property.getPropertiesFromStorage();
    
    if (this.id) {
      const index = properties.findIndex(p => p.id === this.id);
      if (index !== -1) {
        this.updatedAt = new Date();
        properties[index] = this;
      } else {
        throw new Error('Property not found');
      }
    } else {
      this.id = Property.currentId++;
      this.createdAt = new Date();
      this.updatedAt = new Date();
      properties.push(this);
    }
    
    Property.savePropertiesToStorage(properties);
    return this;
  }

  public async destroy(): Promise<void> {
    Property.ensureInitialized();
    const properties = Property.getPropertiesFromStorage();
    const filteredProperties = properties.filter(p => p.id !== this.id);
    Property.savePropertiesToStorage(filteredProperties);
  }

  public async update(attributes: Partial<PropertyAttributes>): Promise<this> {
    Object.assign(this, attributes);
    this.updatedAt = new Date();
    return this.save();
  }

  public async changeStatus(newStatus: PropertyAttributes["status"]): Promise<this> {
    this.status = newStatus;
    return this.save();
  }

  public isAvailableForRent(): boolean {
    return this.isActive && 
           this.status === 'available' && 
           (this.transactionType === 'rent' || this.transactionType === 'both') &&
           this.rentPrice !== undefined;
  }

  public isAvailableForSale(): boolean {
    return this.isActive && 
           this.status === 'available' && 
           (this.transactionType === 'sale' || this.transactionType === 'both');
  }

  public toJSON(): any {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      type: this.type,
      status: this.status,
      transactionType: this.transactionType,
      price: this.price,
      rentPrice: this.rentPrice,
      area: this.area,
      rooms: this.rooms,
      address: this.address,
      city: this.city,
      district: this.district,
      coordinates: this.coordinates,
      amenities: this.amenities,
      images: this.images,
      ownerId: this.ownerId,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isAvailableForRent: this.isAvailableForRent(),
      isAvailableForSale: this.isAvailableForSale()
    };
  }

  static async findOne(options: { where: any }): Promise<Property | null> {
    this.ensureInitialized();
    const properties = this.getPropertiesFromStorage();
    const propertyData = properties.find(property => {
      return Object.keys(options.where).every(key => {
        const propertyValue = property[key as keyof Property];
        const searchValue = options.where[key];
        
        // Специальная обработка для массива amenities
        if (key === 'amenities' && Array.isArray(searchValue)) {
          return searchValue.every(amenity => 
            (propertyValue as string[]).includes(amenity)
          );
        }
        
        return propertyValue === searchValue;
      });
    });
    
    return propertyData ? new Property(propertyData) : null;
  }

  static async findByPk(id: number): Promise<Property | null> {
    this.ensureInitialized();
    const properties = this.getPropertiesFromStorage();
    const propertyData = properties.find(property => property.id === id);
    return propertyData ? new Property(propertyData) : null;
  }

  static async findAndCountAll(options: any = {}): Promise<{ count: number; rows: Property[] }> {
    this.ensureInitialized();
    let properties = this.getPropertiesFromStorage();
    
    if (options.where) {
      properties = properties.filter(property => {
        return Object.keys(options.where).every(key => {
          const propertyValue = property[key as keyof Property];
          const searchValue = options.where[key];
          
          if (key === 'minPrice') {
            return property.price >= searchValue;
          }
          if (key === 'maxPrice') {
            return property.price <= searchValue;
          }
          if (key === 'minArea') {
            return property.area >= searchValue;
          }
          if (key === 'maxArea') {
            return property.area <= searchValue;
          }
          if (key === 'type' && Array.isArray(searchValue)) {
            return searchValue.includes(property.type);
          }
          if (key === 'amenities' && Array.isArray(searchValue)) {
            return searchValue.every(amenity => 
              property.amenities.includes(amenity)
            );
          }
          if (key === 'city') {
            return property.city.toLowerCase().includes(searchValue.toLowerCase());
          }
          if (key === 'isActive') {
            return property.isActive === searchValue;
          }
          
          return propertyValue === searchValue;
        });
      });
    }
    
    if (options.order) {
      const [field, direction] = options.order[0];
      properties.sort((a, b) => {
        const aVal = a[field as keyof Property];
        const bVal = b[field as keyof Property];
        
        if (aVal instanceof Date && bVal instanceof Date) {
          return direction === 'DESC' ? bVal.getTime() - aVal.getTime() : aVal.getTime() - bVal.getTime();
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return direction === 'DESC' ? bVal - aVal : aVal - bVal;
        }
        
        if (direction === 'DESC') {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }
    
    const totalCount = properties.length;
    
    if (options.limit || options.offset) {
      const limit = options.limit || properties.length;
      const offset = options.offset || 0;
      properties = properties.slice(offset, offset + limit);
    }
    
    return {
      count: totalCount,
      rows: properties
    };
  }

  static async create(attributes: Partial<PropertyAttributes>): Promise<Property> {
    this.ensureInitialized();
    const property = new Property(attributes);
    
    if (!property.title || property.title.trim().length === 0) {
      throw new Error('Property title is required');
    }
    
    if (property.price <= 0) {
      throw new Error('Property price must be greater than 0');
    }
    
    if (property.area <= 0) {
      throw new Error('Property area must be greater than 0');
    }
    
    if (!property.address || property.address.trim().length === 0) {
      throw new Error('Property address is required');
    }
    
    if (!property.city || property.city.trim().length === 0) {
      throw new Error('Property city is required');
    }
    
    if (property.ownerId <= 0) {
      throw new Error('Valid ownerId is required');
    }
    
    if (property.transactionType === 'rent' && !property.rentPrice) {
      throw new Error('Rent price is required for rental properties');
    }
    
    if (property.transactionType === 'sale' && property.rentPrice) {
      property.rentPrice = undefined;
    }
    
    return property.save();
  }

  static async findByOwner(ownerId: number): Promise<Property[]> {
    const result = await this.findAndCountAll({ where: { ownerId } });
    return result.rows;
  }

  static async findAvailableForRent(): Promise<Property[]> {
    const properties = this.getPropertiesFromStorage();
    return properties.filter(property => property.isAvailableForRent());
  }

  static async findAvailableForSale(): Promise<Property[]> {
    const properties = this.getPropertiesFromStorage();
    return properties.filter(property => property.isAvailableForSale());
  }

  static async findByCity(city: string): Promise<Property[]> {
    const result = await this.findAndCountAll({ 
      where: { 
        city: city,
        isActive: true 
      } 
    });
    return result.rows;
  }

  static async searchProperties(filters: {
    city?: string;
    type?: string[];
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    rooms?: number;
    amenities?: string[];
  }): Promise<Property[]> {
    const where: any = { isActive: true };
    
    if (filters.city) where.city = filters.city;
    if (filters.type) where.type = filters.type;
    if (filters.minPrice) where.minPrice = filters.minPrice;
    if (filters.maxPrice) where.maxPrice = filters.maxPrice;
    if (filters.minArea) where.minArea = filters.minArea;
    if (filters.maxArea) where.maxArea = filters.maxArea;
    if (filters.rooms) where.rooms = filters.rooms;
    if (filters.amenities) where.amenities = filters.amenities;
    
    const result = await this.findAndCountAll({ where });
    return result.rows;
  }
}

const initializePropertyModel = () => {
  return Property;
};

export { initializePropertyModel, Property };
export type { PropertyAttributes };
