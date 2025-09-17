import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import bcrypt from "bcryptjs";

interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  role: "user" | "admin";
  phoneNumber: string;
}

interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "role" | "phoneNumber"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public password!: string;
  public email!: string;
  public role!: "user" | "admin";
  public phoneNumber!: string;

  public async comparePassword(password: string): Promise<boolean> {
    if (!password || !this.password) {
      console.log("No password provided or user password is empty");
      return false;
    }
    console.log(`Comparing: input='${password}', stored='${this.password}'`);
    try {
      const result = await bcrypt.compare(password, this.password);
      console.log("Comparison result:", result);
      return result;
    } catch (error) {
      console.error("Password comparison error:", error);
      return false;
    }
  }

  static validatePhoneNumber(phone: string): boolean {
    // Удаляем все нецифровые символы
    const cleaned = phone.replace(/\D/g, '');
    
    // Допустимые форматы:
    // - 7XXXXXXXXXX (11 цифр, начинается с 7)
    // - 8XXXXXXXXXX (11 цифр, начинается с 8 - преобразуется в 7)
    // - XXXXXXXXXX (10 цифр)
    return /^([78]\d{10}|\d{10})$/.test(cleaned);
  }

  static normalizePhoneNumber(phone: string): string {
    if (!phone) return phone;
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11 && (cleaned.startsWith('7') || cleaned.startsWith('8'))) {
      return `7${cleaned.substring(1)}`; // Сохраняем как 7XXXXXXXXXX
    }
    
    if (cleaned.length === 10) {
      return cleaned; // Сохраняем как XXXXXXXXXX
    }
    
    throw new Error("Invalid phone number format");
  }

  static async hashPassword(user: User) {
    if (user.changed("password")) {
      if (user.password.startsWith("$2a$")) {
        return;
      }

      try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      } catch (error) {
        console.error("Password hashing error:", error);
        throw error;
      }
    }
  }

  static associate(models: any) {
    // Ассоциации можно добавить здесь при необходимости
  }
}

const initializeUserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [6, 100],
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isPhoneNumber(value: string) {
            if (value && !User.validatePhoneNumber(value)) {
              throw new Error(
                "Номер телефона должен быть в формате 7XXXXXXXXXX или XXXXXXXXXX (10 цифр)"
              );
            }
          },
        },
        field: "phone_number",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          await User.hashPassword(user);
          if (!user.role) user.role = "user";
          if (user.phoneNumber) {
            user.phoneNumber = User.normalizePhoneNumber(user.phoneNumber);
          }
        },
        beforeUpdate: async (user) => {
          await User.hashPassword(user);
          if (user.changed("phoneNumber") && user.phoneNumber) {
            user.phoneNumber = User.normalizePhoneNumber(user.phoneNumber);
          }
        },
      },
    }
  );

  return User;
};

export { initializeUserModel, User };