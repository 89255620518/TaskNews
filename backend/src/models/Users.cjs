const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");


class User extends Model {
    async comparePassword(password) {
        if (!password || !this.password) {
            console.log("No password provided or user password is empty");
            return false;
        }
        console.log(`Comparing: input='${password}', stored='${this.password}'`)
        try {
            const result = await bcrypt.compare(password, this.password);
            console.log("Comparison result:", result);
            return result;
        } catch (error) {
            console.error("Password comparison error:", error);
            return false;
        }
    }

    static validatePhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return /^([78]\d{10}|\d{10})$/.test(cleaned);
    }

    static normalizePhoneNumber(phone) {
        if (!phone) return phone;

        const cleaned = phone.replace(/\D/g, '');

        if (cleaned.length === 11 && (cleaned.startsWith('7') || cleaned.startsWith('8'))) {
            return `7${cleaned.substring(1)}`;
        }

        if (cleaned.length === 10) {
            return `7${cleaned}`;
        }

        throw new Error("Invalid phone number format");
    }

    static async hashPassword(user) {
        if (user.changed("password")) {
            if (user.password.startsWith("$2a$")) {
                return;
            }

            try {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            } catch (error) {
                console.error("Password hashing error", error);
                throw error;
            }
        }
    }
}

const initializeUserModels = (sequelize) => {
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

            phoneNumber: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    isPhoneNumber(value) {
                        if (value && !User.validatePhoneNumber(value)) {
                            throw new Error(
                                "Номер телефона должен быть в формате 7XXXXXXXXXX или XXXXXXXXXX (10 цифр)"
                            );
                        }
                    },
                },
                field: "phone_number",
            },

            role: {
                type: DataTypes.ENUM("user", "admin"),
                allowNull: false,
                defaultValue: "user",
            },
        },

        {
            sequelize,
            modelName: "User",
            tableName: "users",
            timestamps: true, // Оставляем true для автоматического управления временными метками
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true,
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

module.exports = { User, initializeUserModels }