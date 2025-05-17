import bcrypt from "bcryptjs";
import db from "../models/index";
import { raw } from "body-parser";
const salt = bcrypt.genSaltSync(10);

let createNewUser = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPasswordFromBcrypt = await hashUserPassword(data.password);
      await db.User.create({
        email: data.email,
        password: hashPasswordFromBcrypt,
        first_name: data.first_name,
        last_name: data.last_name,
        address: data.address,
        gender: data.gender === "1" ? "Nam" : "Nữ",
        phone: data.phone,
        avatar: "",
        role_id: data.roleId,
        position_id: 1,
      });
      resolve("Create new user successfully!");
    } catch (e) {
      reject(e);
    }
  });
};

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

let getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = db.User.findAll({
        raw: true,
      });
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let getUserInfoById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({ where: { user_id: userId } });

      if (user) {
        resolve(user);
      } else {
        resolve({});
      }
    } catch (e) {
      reject(e);
    }
  });
};

let updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { user_id: data.id },
        raw: false,
      });
      if (user) {
        user.first_name = data.first_name;
        user.last_name = data.last_name;
        user.address = data.address;
        await user.save();
        resolve();
      } else {
        resolve();
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteUserById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { user_id: userId },
        raw: false,
      });

      if (user) {
        await user.destroy();
      }

      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createNewUser,
  getAllUser,
  getUserInfoById,
  updateUserData,
  deleteUserById,
};
