import { DataTypes } from "sequelize";
import sequelize from "../../../config/db.js";

export const BankCostumerDummy = sequelize.define(
  "BankCostumerDummy",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    costumerName: DataTypes.STRING,
    walletAddress: DataTypes.STRING,
    bankId: DataTypes.INTEGER  
},
  {
    freezeTableName: true,
  }
);
