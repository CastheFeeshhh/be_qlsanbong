"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FieldBookingDetail extends Model {
    static associate(models) {}
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
      date: DataTypes.DATEONLY,
      start_time: DataTypes.TIME,
      end_time: DataTypes.TIME,
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
