import { DataTypes } from "sequelize";
import sequelize from "../../../config/db.js";

export const BankKyc = sequelize.define(
    "bank_kyc",
     {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },

      nic_no: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },

      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },

      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      nic_picture: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

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
    }
);