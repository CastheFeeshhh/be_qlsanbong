"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Asset extends Model {
    static associate(models) {}
  }

  Asset.init(
    {
      asset_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Asset",
      tableName: "ASSET",
      timestamps: false,
    }
  );
  return Asset;
};
