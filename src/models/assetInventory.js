"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AssetInventory extends Model {
    static associate(models) {
      AssetInventory.belongsTo(models.Asset, { foreignKey: "asset_id" });
    }
  }
  AssetInventory.init(
    {
      inventory_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      asset_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      current_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      min_quantity: DataTypes.INTEGER,
      last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "last_updated",
      },
    },
    {
      sequelize,
      modelName: "AssetInventory",
      tableName: "ASSET_INVENTORY",
      timestamps: true,
      createdAt: false,
      updatedAt: "last_updated",
    }
  );
  return AssetInventory;
};
