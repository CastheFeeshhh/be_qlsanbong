"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {}
  }

  Supplier.init(
    {
      supplier_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.TEXT,
      description: DataTypes.TEXT,
      created_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Supplier",
      tableName: "SUPPLIER",
      timestamps: false,
    }
  );
  return Supplier;
};
