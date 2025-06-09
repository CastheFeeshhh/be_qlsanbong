import { where } from "sequelize";
import db from "../models/index";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
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
            "gender",
            "phone",
            "address",
            "avatar",
            "created_at",
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
            userData.errMessage = "Mật khẩu không chính xác!";
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = `Người dùng không tồn tại!`;
        }
      } else {
        userData.errCode = 1;
        userData.errMessage = `Email của bạn không tồn tại!`;
      }
      resolve(userData);
    } catch (e) {
      reject(e);
    }
  });
};

let registerUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let check = await checkUserEmail(data.email);
      if (check === true) {
        resolve({
          errCode: 1,
          errMessage: "Email đã tồn tại. Vui lòng chọn email khác!!",
        });
      } else if (
        data.email === null ||
        data.password === null ||
        data.first_name === null ||
        data.last_name === null ||
        data.address === null ||
        data.gender === null ||
        data.phone === null
      ) {
        resolve({
          errCode: 1,
          errMessage: "Vui lòng nhập đầy đủ thông tin!",
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
          role_id: 3,
          position_id: 1,
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

let sendForgotPasswordEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("--- sendForgotPasswordEmail ---");
      console.log("Request to send email for:", email);

      let user = await db.User.findOne({
        where: { email: email },
        raw: true,
      });

      if (!user) {
        console.log("Email not found in system:", email);
        resolve({
          errCode: 1,
          message: "Email không tồn tại trong hệ thống!.",
        });
        return;
      }

      const resetToken = uuidv4();
      const resetTokenExpires = Date.now() + 3600000;
      console.log("Generated resetToken:", resetToken);
      console.log("Generated resetTokenExpires (ms):", resetTokenExpires);
      console.log(
        "Generated resetTokenExpires (Date):",
        new Date(resetTokenExpires)
      );

      await db.User.update(
        {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpires,
        },
        {
          where: { user_id: user.user_id },
        }
      );
      console.log("User updated in DB with new token and expiry.");

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_APP_USERNAME,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });
      console.log(
        "Nodemailer transporter created with user:",
        process.env.EMAIL_APP_USERNAME
      );

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
      console.log("Reset URL generated:", resetUrl);

      let mailOptions = {
        from: process.env.EMAIL_APP_USERNAME,
        to: email,
        subject: "Yêu cầu đặt lại mật khẩu của bạn",
        html: `
                    <h3>Xin chào ${user.first_name || user.email},</h3>
                    <p>Bạn nhận được email này vì bạn (hoặc ai đó khác) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                    <p>Vui lòng nhấp vào liên kết sau để đặt lại mật khẩu của bạn:</p>
                    <a href="${resetUrl}" target="_blank">Đặt lại mật khẩu</a>
                    <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.</p>
                    <br/>
                    <p>Trân trọng,</p>
                    <p>Đội ngũ hỗ trợ của chúng tôi</p>
                `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully to:", email);

      resolve({
        errCode: 0,
        message:
          "Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến (bao gồm cả thư mục spam).",
      });
    } catch (e) {
      console.error("Error in sendForgotPasswordEmail service: ", e);
      reject({
        errCode: -1,
        message: "Lỗi hệ thống. Vui lòng thử lại sau.",
      });
    }
  });
};

let verifyResetToken = (token, email) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("--- verifyResetToken ---");
      console.log("Attempting to verify token:", token, "for email:", email);
      console.log("Current server time (Date.now()):", Date.now());
      console.log("Current server time (new Date()):", new Date());

      let user = await db.User.findOne({
        where: {
          email: email,
          resetPasswordToken: token,
          resetPasswordExpires: { [db.Sequelize.Op.gt]: Date.now() },
        },
        raw: true,
      });

      if (!user) {
        console.log(
          "Verification failed: User not found, token invalid, or token expired."
        );
        const potentialUser = await db.User.findOne({
          where: { email: email },
          raw: true,
        });
        if (!potentialUser) {
          console.log("Reason: Email not found in DB.");
        } else {
          console.log("User found by email, checking token/expiry...");
          console.log("DB Token:", potentialUser.resetPasswordToken);
          console.log("DB Expires (raw):", potentialUser.resetPasswordExpires);
          console.log(
            "DB Expires (ms):",
            new Date(potentialUser.resetPasswordExpires).getTime()
          );
          console.log(
            "Is token matched?",
            potentialUser.resetPasswordToken === token
          );
          console.log(
            "Is expired?",
            new Date(potentialUser.resetPasswordExpires).getTime() <= Date.now()
          );
        }

        resolve({
          errCode: 1,
          message: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
        });
        return;
      }

      console.log("Token verification successful for user:", user.email);
      resolve({
        errCode: 0,
        message: "Token hợp lệ. Vui lòng nhập mật khẩu mới.",
        userEmail: email,
      });
    } catch (e) {
      console.error("Error in verifyResetToken service:", e);
      reject({
        errCode: -1,
        message: "Lỗi hệ thống. Vui lòng thử lại sau.",
      });
    }
  });
};

let resetUserPassword = (email, token, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: {
          email: email,
          resetPasswordToken: token,
          resetPasswordExpires: { [db.Sequelize.Op.gt]: Date.now() },
        },
        raw: true,
      });

      if (!user) {
        resolve({
          errCode: 1,
          message: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
        });
        return;
      }

      let hashPasswordFromBcrypt = await hashUserPassword(newPassword);

      await db.User.update(
        {
          password: hashPasswordFromBcrypt,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
        {
          where: { user_id: user.user_id },
        }
      );

      resolve({
        errCode: 0,
        message: "Đặt lại mật khẩu thành công!",
      });
    } catch (e) {
      console.error("Error in resetUserPassword service:", e);
      reject({
        errCode: -1,
        message: "Lỗi hệ thống. Vui lòng thử lại sau.",
      });
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

let getAllAdmins = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = "";
      users = await db.User.findAll({
        where: { role_id: 1 },
        attributes: {
          exclude: ["password"],
        },
      });
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let getAllStaffs = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = "";
      users = await db.User.findAll({
        where: { role_id: 2 },
        attributes: {
          exclude: ["password"],
        },
      });
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let getAllCustomers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = "";
      users = await db.User.findAll({
        where: { role_id: 3 },
        attributes: {
          exclude: ["password"],
        },
      });
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
          errMessage: "Email đã tồn tại. Vui lòng chọn email khác!!",
        });
      } else if (
        data.email === null ||
        data.password === null ||
        data.first_name === null ||
        data.last_name === null ||
        data.address === null ||
        data.phone === null
      ) {
        resolve({
          errCode: 1,
          errMessage: "Vui lòng nhập đầy đủ thông tin!",
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
          errMessage: "Thiếu dữ liệu đầu vào",
        });
      }
      let user = await db.User.findOne({ where: { user_id: data.user_id } });
      if (user) {
        await db.User.update(
          {
            first_name: data.first_name,
            last_name: data.last_name,
            address: data.address,
            gender: data.gender,
            phone: data.phone,
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

const handleChangePassword = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId || !data.oldPassword || !data.newPassword) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu các tham số bắt buộc!",
        });
        return;
      }

      let user = await db.User.findOne({
        where: { user_id: data.userId },
        raw: false,
      });

      if (!user) {
        resolve({
          errCode: 2,
          errMessage: "Không tìm thấy người dùng.",
        });
        return;
      }

      let check = await bcrypt.compareSync(data.oldPassword, user.password);
      if (check) {
        user.password = await hashUserPassword(data.newPassword);
        await user.save();
        resolve({
          errCode: 0,
          errMessage: "Đổi mật khẩu thành công!",
        });
      } else {
        resolve({
          errCode: 3,
          errMessage: "Mật khẩu cũ không chính xác.",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  handleUserLogin,
  registerUser,
  sendForgotPasswordEmail,
  verifyResetToken,
  resetUserPassword,
  getAllUsers,
  getAllAdmins,
  getAllStaffs,
  getAllCustomers,
  createNewUser,
  deleteUser,
  updateUserData,
  handleChangePassword,
};
