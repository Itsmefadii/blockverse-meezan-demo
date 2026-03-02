import { DataTypes } from "sequelize";
import sequelize from "../../../config/db.js";

export const TransactionHistory = sequelize.define(
  "TransactionHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fromWalletAddress: DataTypes.STRING,
    toWalletAddress: DataTypes.STRING,
    status: DataTypes.STRING,
    transHash: DataTypes.STRING,
    initiator: DataTypes.INTEGER,
    isAuthorized: DataTypes.BOOLEAN,
    amount: DataTypes.DECIMAL,
    toDisputeWallet: DataTypes.BOOLEAN,
    isDispute: DataTypes.BOOLEAN,
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
