"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    static associate(models) {}
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
      content: DataTypes.TEXT,
      media_url: DataTypes.STRING,
      created_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "News",
      tableName: "NEWS",
      timestamps: false,
    }
  );
  return News;
};
