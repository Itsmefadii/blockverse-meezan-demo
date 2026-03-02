import { DataTypes } from "sequelize";
import sequelize from "../../../config/db.js";

export const Beneficiaries = sequelize.define(
  "Beneficiaries",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: DataTypes.INTEGER,
    bankCostumerId: DataTypes.INTEGER,
    createdAt: DataTypes.TIME,
    updatedAt: DataTypes.TIME  
},
  {
    freezeTableName: true,
  }
);
