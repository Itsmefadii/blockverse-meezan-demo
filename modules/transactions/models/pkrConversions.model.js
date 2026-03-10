import { DataTypes } from "sequelize";
import sequelize from "../../../config/db.js";

export const PkrConversions = sequelize.define(
  "PkrConversions",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    walletAddress: DataTypes.STRING,
    usdcAmount: DataTypes.DECIMAL,
    pkrAmount: DataTypes.DECIMAL,
    userId: DataTypes.INTEGER,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  },
);
