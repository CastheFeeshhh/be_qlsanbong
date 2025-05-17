"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Field extends Model {
    static associate(models) {}
  }

  Field.init(
    {
      field_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      field_name: DataTypes.STRING,
      price_per_minute: DataTypes.DECIMAL,
      type: DataTypes.STRING,
      description: DataTypes.TEXT,
      status: DataTypes.STRING,
      image: DataTypes.STRING,
      created_at: DataTypes.DATE,
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
