import { initializeUserModel, User } from "./User";
import { createRequire } from "module";


const requires = createRequire(import.meta.url);
const { sequelize } = requires("../config/config.cjs"); 

export const initializeModels = () => {
  initializeUserModel(sequelize);

  const models = {
    User
  };

  Object.values(models).forEach((model: any) => {
    if (model.associate) {
      model.associate(models);
    }
  });

  return models;
};

export type Models = ReturnType<typeof initializeModels>;
