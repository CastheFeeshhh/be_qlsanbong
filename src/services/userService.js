import { where } from "sequelize";
import db from "../models/index";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPassword = await bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (e) {
      reject(e);
    }
  });
};

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};

      let isExist = await checkUserEmail(email);
      if (isExist) {
        let user = await db.User.findOne({
          attributes: [
            "user_id",
            "email",
            "password",
            "role_id",
            "position_id",
            "first_name",
            "last_name",
          ],
          where: { email: email },
          raw: true,
        });
        if (user) {
          let check = await bcrypt.compareSync(password, user.password);
          if (check) {
            delete user.password;
            const token = jwt.sign(
              {
                user_id: user.user_id,
                role_id: user.role_id,
                email: user.email,
              },
              process.env.JWT_SECRET,
              { expiresIn: "1d" }
            );

            userData.errCode = 0;
            userData.errMessage = "OK";
            userData.token = token;
            userData.user = user;
          } else {
            userData.errCode = 3;
            userData.errMessage = "Wrong password!";
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = `User not found!`;
        }
      } else {
        userData.errCode = 1;
        userData.errMessage = `Your email isn't exist. Pls try again!`;
      }
      resolve(userData);
    } catch (e) {
      reject(e);
    }
  });
};

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: userEmail },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllUsers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = "";
      if (userId === "ALL") {
        users = await db.User.findAll({
          attributes: {
            exclude: ["password"],
          },
        });
      }
      if (userId && userId !== "ALL") {
        users = await db.User.findOne({
          where: { user_id: userId },
          attributes: {
            exclude: ["password"],
          },
        });
      }
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let getAllCustomers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = "";
      if (userId === "ALL") {
        users = await db.User.findAll({
          where: { role_id: 3 },
          attributes: {
            exclude: ["password"],
          },
        });
      }
      if (userId && userId !== "ALL") {
        users = await db.User.findOne({
          where: { user_id: userId, role_id: 3 },
          attributes: {
            exclude: ["password"],
          },
        });
      }
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let check = await checkUserEmail(data.email);
      if (check === true) {
        resolve({
          errCode: 1,
          errMessage: "Your email is already in used. Pls try another email!!",
        });
      } else if (
        data.email === null ||
        data.password === null ||
        data.first_name === null ||
        data.last_name === null ||
        data.address === null ||
        data.gender === null ||
        data.gender === null
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        let hashPasswordFromBcrypt = await hashUserPassword(data.password);
        await db.User.create({
          email: data.email,
          password: hashPasswordFromBcrypt,
          first_name: data.first_name,
          last_name: data.last_name,
          address: data.address,
          gender: data.gender,
          phone: data.phone,
          role_id: data.role_id,
          position_id: data.position_id,
        });
        resolve({
          errCode: 0,
          message: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let foundUser = await db.User.findOne({
        where: { user_id: userId },
      });
      if (!foundUser) {
        resolve({
          errCode: 2,
          errMessage: `User isn't exist!`,
        });
      }

      await db.User.destroy({
        where: { user_id: userId },
      });

      resolve({
        errCode: 0,
        errMessage: `User is deleted successfully!`,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.user_id) {
        resolve({
          errCode: 2,
          errMessage: "Missing input data",
        });
      }
      let user = await db.User.findOne({ where: { user_id: data.user_id } });
      if (user) {
        await db.User.update(
          {
            first_name: data.first_name,
            last_name: data.last_name,
            address: data.address,
          },
          { where: { user_id: data.user_id } }
        );
        resolve({
          errCode: 0,
          message: `Update user successfully!`,
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "Users not found",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  handleUserLogin,
  getAllUsers,
  getAllCustomers,
  createNewUser,
  deleteUser,
  updateUserData,
};
