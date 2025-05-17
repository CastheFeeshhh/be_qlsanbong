"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AssetInvoice extends Model {
    static associate(models) {}
  }

  AssetInvoice.init(
    {
      asset_invoice_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      supplier_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "AssetInvoice",
      tableName: "ASSET_INVOICE",
      timestamps: false,
    }
  );
  return AssetInvoice;
};
