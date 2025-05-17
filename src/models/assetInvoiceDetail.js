"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AssetInvoiceDetail extends Model {
    static associate(models) {}
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
      price: DataTypes.DECIMAL,
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
