"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TotalInvoice extends Model {
    static associate(models) {}
  }

  TotalInvoice.init(
    {
      invoice_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      booking_id: DataTypes.INTEGER,
      discount: DataTypes.DECIMAL,
      total_price: DataTypes.DECIMAL,
      payment_method: DataTypes.STRING,
      paid_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "TotalInvoice",
      tableName: "TOTAL_INVOICE",
      timestamps: false,
    }
  );
  return TotalInvoice;
};
