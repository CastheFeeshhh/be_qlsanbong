"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AssetUsage extends Model {
    static associate(models) {
      AssetUsage.belongsTo(models.Asset, { foreignKey: "asset_id" });
      AssetUsage.belongsTo(models.ServiceBookingDetail, {
        foreignKey: "service_booking_detail_id",
      });
    }
  }
  AssetUsage.init(
    {
      usage_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      asset_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      service_booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity_used: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      used_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      returned_at: DataTypes.DATE,
      status: DataTypes.ENUM("Đang sử dụng", "Đã trả", "Hư hỏng", "Đã bán"),
    },
    {
      sequelize,
      modelName: "AssetUsage",
      tableName: "ASSET_USAGE",
      timestamps: false,
    }
  );
  return AssetUsage;
};
