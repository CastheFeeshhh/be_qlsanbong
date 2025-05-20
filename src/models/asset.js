"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Asset extends Model {
    static associate(models) {
      Asset.hasMany(models.AssetInvoiceDetail, { foreignKey: "asset_id" });
      Asset.hasMany(models.AssetInventory, { foreignKey: "asset_id" });
      Asset.hasMany(models.AssetUsage, { foreignKey: "asset_id" });
    }
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
      status: DataTypes.ENUM(
        "Đang sử dụng",
        "Đã bị hỏng",
        "Đang bảo trì",
        "Có sẵn"
      ),
      is_trackable: DataTypes.BOOLEAN,
      total_quantity: DataTypes.INTEGER,
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
