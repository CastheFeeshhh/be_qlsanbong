const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("QuanLySanBong", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
  port: 3307,
  logging: false,
});

let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = connectDB;
