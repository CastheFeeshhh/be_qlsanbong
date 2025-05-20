"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AssetInvoiceDetail extends Model {
    static associate(models) {
      AssetInvoiceDetail.belongsTo(models.AssetInvoice, {
        foreignKey: "asset_invoice_id",
      });
      AssetInvoiceDetail.belongsTo(models.Asset, { foreignKey: "asset_id" });
    }
  }
  AssetInvoiceDetail.init(
    {
      detail_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      asset_invoice_id: DataTypes.INTEGER,
      asset_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      price: DataTypes.DECIMAL(10, 2),
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "AssetInvoiceDetail",
      tableName: "ASSET_INVOICE_DETAIL",
      timestamps: false,
    }
  );
  return AssetInvoiceDetail;
};
