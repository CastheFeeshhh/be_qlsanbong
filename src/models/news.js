"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    static associate(models) {
      News.belongsTo(models.User, { foreignKey: "author_id" });
    }
  }
  News.init(
    {
      news_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: DataTypes.STRING,
      summary: DataTypes.TEXT,
      content: DataTypes.TEXT("long"),
      media_url: DataTypes.STRING,
      author_id: DataTypes.INTEGER,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
      updated_at: DataTypes.DATE,
      is_published: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "News",
      tableName: "NEWS",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return News;
};
