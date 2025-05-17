"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FieldBooking extends Model {
    static associate(models) {}
  }

  FieldBooking.init(
    {
      booking_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: DataTypes.INTEGER,
      date_booking: DataTypes.DATEONLY,
      status: DataTypes.STRING,
      created_at: DataTypes.DATE,
      price_estimate: DataTypes.DECIMAL,
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
