"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      Service.hasMany(models.ServiceBookingDetail, {
        foreignKey: "service_id",
      });
    }
  }
  Service.init(
    {
      service_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      price: DataTypes.DECIMAL(10, 2),
      description: DataTypes.TEXT,
      type: DataTypes.ENUM("Thuê", "Mua"),
    },
    {
      sequelize,
      modelName: "Service",
      tableName: "SERVICE",
      timestamps: false,
    }
  );
  return Service;
};
