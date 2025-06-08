"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FieldBooking extends Model {
    static associate(models) {
      FieldBooking.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "User",
      });
      FieldBooking.hasMany(models.FieldBookingDetail, {
        foreignKey: "booking_id",
        as: "FieldBookingDetail",
      });
      FieldBooking.hasOne(models.TotalInvoice, {
        foreignKey: "booking_id",
        as: "TotalInvoice",
      });
    }
  }
  FieldBooking.init(
    {
      booking_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: DataTypes.INTEGER,
      status: DataTypes.ENUM("Đang chờ", "Đã xác nhận", "Đã hủy"),
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
      price_estimate: DataTypes.DECIMAL(12, 2),
    },
    {
      sequelize,
      modelName: "FieldBooking",
      tableName: "FIELD_BOOKING",
      timestamps: false,
    }
  );
  return FieldBooking;
};
