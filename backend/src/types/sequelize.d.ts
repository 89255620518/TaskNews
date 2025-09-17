import { Model, ModelStatic, Sequelize } from "sequelize";

export interface AssociateModel extends ModelStatic<Model> {
  associate?: (models: { [key: string]: ModelStatic<Model> }) => void;
}
