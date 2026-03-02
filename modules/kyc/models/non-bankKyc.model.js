import { DataTypes } from "sequelize";
import sequelize from "../../../config/db.js";

export const NonBank_kyc = sequelize.define(
  "non_bank_kyc",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      unique: true,
      allowNull: false,
    },

    wallet_address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      
      isKYC: DataTypes.INTEGER,
  },
  {
    freezeTableName: true,
    timestamps: true,
  },
);
