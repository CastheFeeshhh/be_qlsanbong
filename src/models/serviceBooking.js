"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceBooking extends Model {
    static associate(models) {
      ServiceBooking.belongsTo(models.FieldBookingDetail, {
        foreignKey: "booking_detail_id",
      });
      ServiceBooking.hasMany(models.ServiceBookingDetail, {
        foreignKey: "service_booking_id",
      });
    }
  }
  ServiceBooking.init(
    {
      service_booking_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      booking_detail_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_service_price: DataTypes.DECIMAL(12, 2),
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
    },
    {
      sequelize,
      modelName: "ServiceBooking",
      tableName: "SERVICE_BOOKING",
      timestamps: false,
    }
  );
  return ServiceBooking;
};
