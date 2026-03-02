import { DataTypes } from "sequelize";
import sequelize from "../../../config/db.js";

export const Banks = sequelize.define(
  "Banks",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bankName: DataTypes.STRING,  },
  {
    freezeTableName: true,
  }
);
