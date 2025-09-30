import bcrypt from "bcryptjs";

interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  patronymic: string;
  password: string;
  email: string;
  role: "user" | "admin" | "manager" | "support";
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

class User implements UserAttributes {
  public id: number;
  public firstName: string;
  public lastName: string;
  public patronymic: string;
  public password: string;
  public email: string;
  public role: "user" | "admin" | "manager" | "support";
  public phoneNumber: string;
  public createdAt: Date;
  public updatedAt: Date;

  private static storageKey = 'users';
  private static currentId = 1;
  private static initialized = false;

  constructor(attributes: Partial<UserAttributes> = {}) {
    this.id = attributes.id || 0;
    this.firstName = attributes.firstName || '';
    this.lastName = attributes.lastName || '';
    this.patronymic = attributes.patronymic || '';
    this.password = attributes.password || '';
    this.email = attributes.email || '';
    this.role = attributes.role || 'user';
    this.phoneNumber = attributes.phoneNumber || '';
    this.createdAt = attributes.createdAt || new Date();
    this.updatedAt = attributes.updatedAt || new Date();
    
    User.ensureInitialized();
  }

  private static ensureInitialized(): void {
    if (!this.initialized) {
      this.initializeId();
      this.initialized = true;
    }
  }

  private static initializeId(): void {
    const users = this.getUsersFromStorage();
    const maxId = users.reduce((max, user) => Math.max(max, user.id), 0);
    this.currentId = maxId + 1;
  }

  private static getUsersFromStorage(): User[] {
    if (typeof window === 'undefined') {
      return [];
    }
    
    try {
      const usersJson = localStorage.getItem(this.storageKey);
      if (!usersJson) return [];
      
      const usersData = JSON.parse(usersJson);
      return usersData.map((userData: any) => new User({
        ...userData,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt)
      }));
    } catch (error) {
      console.error('Error reading users from localStorage:', error);
      return [];
    }
  }

  private static saveUsersToStorage(users: User[]): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      const maxId = users.reduce((max, user) => Math.max(max, user.id), 0);
      this.currentId = maxId + 1;
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  }

  public async comparePassword(password: string): Promise<boolean> {
    if (!password || !this.password) {
      return false;
    }
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      console.error("Password comparison error:", error);
      return false;
    }
  }

  public async save(): Promise<this> {
    User.ensureInitialized();
    const users = User.getUsersFromStorage();
    
    if (this.id) {
      const index = users.findIndex(u => u.id === this.id);
      if (index !== -1) {
        this.updatedAt = new Date();
        users[index] = this;
      } else {
        throw new Error('User not found');
      }
    } else {
      this.id = User.currentId++;
      this.createdAt = new Date();
      this.updatedAt = new Date();
      users.push(this);
    }
    
    User.saveUsersToStorage(users);
    return this;
  }

  public async destroy(): Promise<void> {
    User.ensureInitialized();
    const users = User.getUsersFromStorage();
    const filteredUsers = users.filter(u => u.id !== this.id);
    User.saveUsersToStorage(filteredUsers);
  }

  public async update(attributes: Partial<UserAttributes>): Promise<this> {
    Object.assign(this, attributes);
    this.updatedAt = new Date();
    return this.save();
  }

  public toJSON(): any {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      patronymic: this.patronymic,
      password: this.password,
      email: this.email,
      role: this.role,
      phoneNumber: this.phoneNumber,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  static async findOne(options: { where: any }): Promise<User | null> {
    this.ensureInitialized();
    const users = this.getUsersFromStorage();
    const userData = users.find(user => {
      return Object.keys(options.where).every(key => {
        const userValue = user[key as keyof User];
        const searchValue = options.where[key];
        return userValue === searchValue;
      });
    });
    
    return userData ? new User(userData) : null;
  }

  static async findByPk(id: number): Promise<User | null> {
    this.ensureInitialized();
    const users = this.getUsersFromStorage();
    const userData = users.find(user => user.id === id);
    return userData ? new User(userData) : null;
  }

  static async findAndCountAll(options: any = {}): Promise<{ count: number; rows: User[] }> {
    this.ensureInitialized();
    let users = this.getUsersFromStorage();
    
    if (options.order) {
      const [field, direction] = options.order[0];
      users.sort((a, b) => {
        const aVal = a[field as keyof User];
        const bVal = b[field as keyof User];
        
        if (aVal instanceof Date && bVal instanceof Date) {
          return direction === 'DESC' ? bVal.getTime() - aVal.getTime() : aVal.getTime() - bVal.getTime();
        }
        
        if (direction === 'DESC') {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }
    
    const totalCount = users.length;
    
    if (options.limit || options.offset) {
      const limit = options.limit || users.length;
      const offset = options.offset || 0;
      users = users.slice(offset, offset + limit);
    }
    
    return {
      count: totalCount,
      rows: users
    };
  }

  static async create(attributes: Partial<UserAttributes>): Promise<User> {
    this.ensureInitialized();
    const user = new User(attributes);
    
    if (user.password && !user.password.startsWith("$2a$")) {
      try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      } catch (error) {
        console.error("Password hashing error:", error);
        throw error;
      }
    }
    
    if (user.phoneNumber) {
      user.phoneNumber = User.normalizePhoneNumber(user.phoneNumber);
    }
    
    if (!user.role) user.role = "user";
    
    return user.save();
  }

  static validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return /^([78]\d{10}|\d{10})$/.test(cleaned);
  }

  static normalizePhoneNumber(phone: string): string {
    if (!phone) return phone;
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11 && (cleaned.startsWith('7') || cleaned.startsWith('8'))) {
      return `7${cleaned.substring(1)}`;
    }
    
    if (cleaned.length === 10) {
      return cleaned;
    }
    
    throw new Error("Invalid phone number format");
  }
}

const initializeUserModel = () => {
  return User;
};

export { initializeUserModel, User };