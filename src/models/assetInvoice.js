"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AssetInvoice extends Model {
    static associate(models) {
      AssetInvoice.belongsTo(models.Supplier, { foreignKey: "supplier_id" });
      AssetInvoice.hasMany(models.AssetInvoiceDetail, {
        foreignKey: "asset_invoice_id",
      });
    }
  }
  AssetInvoice.init(
    {
      asset_invoice_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      supplier_id: DataTypes.INTEGER,
      invoice_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "invoice_date",
      },
      total_amount: DataTypes.DECIMAL(12, 2),
      note: DataTypes.TEXT,
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
