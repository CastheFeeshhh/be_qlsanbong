"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Field extends Model {
    static associate(models) {
      Field.hasMany(models.FieldBookingDetail, { foreignKey: "field_id" });
    }
  }
  Field.init(
    {
      field_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      field_name: DataTypes.STRING,
      price_per_minute: DataTypes.DECIMAL(12, 2),
      type: DataTypes.STRING,
      description: DataTypes.TEXT,
      status: DataTypes.ENUM("Trống", "Không khả dụng"),
      image: DataTypes.STRING,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
    },
    {
      sequelize,
      modelName: "Field",
      tableName: "FIELD",
      timestamps: false,
    }
  );
  return Field;
};
