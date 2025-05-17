"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserPosition extends Model {
    static associate(models) {}
  }

  UserPosition.init(
    {
      position_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "UserPosition",
      tableName: "USER_POSITION",
      timestamps: false,
    }
  );
  return UserPosition;
};
