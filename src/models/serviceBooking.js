"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ServiceBooking extends Model {
    static associate(models) {}
  }

  ServiceBooking.init(
    {
      service_booking_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      booking_id: DataTypes.INTEGER,
      service_id: DataTypes.INTEGER,
      amount: DataTypes.INTEGER,
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
