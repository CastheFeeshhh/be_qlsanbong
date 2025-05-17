"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FieldSchedule extends Model {
    static associate(models) {}
  }

  FieldSchedule.init(
    {
      schedule_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      field_id: DataTypes.INTEGER,
      date: DataTypes.DATEONLY,
      start_time: DataTypes.TIME,
      end_time: DataTypes.TIME,
      status: DataTypes.STRING,
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "FieldSchedule",
      tableName: "FIELD_SCHEDULE",
      timestamps: false,
    }
  );
  return FieldSchedule;
};
