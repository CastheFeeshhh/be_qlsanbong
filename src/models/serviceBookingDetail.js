"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceBookingDetail extends Model {
    static associate(models) {
      ServiceBookingDetail.belongsTo(models.ServiceBooking, {
        foreignKey: "service_booking_id",
        as: "ServiceBooking",
      });
      ServiceBookingDetail.belongsTo(models.Service, {
        foreignKey: "service_id",
        as: "Service",
      });
      ServiceBookingDetail.hasOne(models.AssetUsage, {
        foreignKey: "service_booking_detail_id",
      });
    }
  }
  ServiceBookingDetail.init(
    {
      detail_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      service_booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "ServiceBookingDetail",
      tableName: "SERVICE_BOOKING_DETAIL",
      timestamps: false,
    }
  );
  return ServiceBookingDetail;
};
