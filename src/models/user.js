"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: "role_id" });
      User.belongsTo(models.UserPosition, { foreignKey: "position_id" });
      User.hasMany(models.FieldBooking, { foreignKey: "user_id" });
      User.hasMany(models.News, { foreignKey: "author_id" });
    }
  }
  User.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      address: DataTypes.TEXT,
      gender: {
        type: DataTypes.ENUM("Male", "Female"),
      },
      phone: DataTypes.STRING,
      avatar: DataTypes.STRING,
      role_id: DataTypes.INTEGER,
      position_id: DataTypes.INTEGER,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "USER",
      timestamps: false,
    }
  );
  return User;
};
