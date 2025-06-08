"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TotalInvoice extends Model {
    static associate(models) {
      TotalInvoice.belongsTo(models.FieldBooking, {
        foreignKey: "booking_id",
        as: "FieldBooking",
      });
    }
  }
  TotalInvoice.init(
    {
      invoice_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      booking_id: DataTypes.INTEGER,
      discount: DataTypes.DECIMAL(5, 2),
      total_price: DataTypes.DECIMAL(12, 2),
      payment_method: DataTypes.ENUM(
        "Trả sau bằng tiền mặt",
        "Qua thẻ tín dụng",
        "Qua chuyển khoản ngân hàng",
        "VNPAY"
      ),
      paid_at: DataTypes.DATE,
      vnp_txn_ref: {
        type: DataTypes.STRING,
        allowNull: true,
      },
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
