"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FieldBookingDetail extends Model {
    static associate(models) {
      FieldBookingDetail.belongsTo(models.FieldBooking, {
        foreignKey: "booking_id",
        as: "FieldBooking",
      });
      FieldBookingDetail.belongsTo(models.Field, {
        foreignKey: "field_id",
        as: "Field",
      });
      FieldBookingDetail.hasMany(models.ServiceBooking, {
        foreignKey: "booking_detail_id",
        as: "ServiceBookings",
      });
      FieldBookingDetail.hasMany(models.AssetUsage, {
        foreignKey: "booking_detail_id",
        as: "AssetUsages",
      });
    }
  }
  FieldBookingDetail.init(
    {
      booking_detail_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      booking_id: DataTypes.INTEGER,
      field_id: DataTypes.INTEGER,
      date: DataTypes.DATE,
      start_time: DataTypes.TIME,
      end_time: DataTypes.TIME,
      team_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      captain_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      booking_phone: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "FieldBookingDetail",
      tableName: "FIELD_BOOKING_DETAIL",
      timestamps: false,
    }
  );
  return FieldBookingDetail;
};
