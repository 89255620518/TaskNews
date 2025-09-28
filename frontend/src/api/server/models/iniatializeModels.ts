import { initializeUserModel } from "./User";

export const initializeModels = () => {
  const UserModel = initializeUserModel();

  const models = {
    User: UserModel
  };

  return models;
};

export type Models = ReturnType<typeof initializeModels>;