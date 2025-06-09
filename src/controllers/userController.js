import userService from "../services/userService";
import { generateAccessToken } from "../utils/jwtUtils";

let handleLogin = async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(500).json({
      errCode: 1,
      message: "Vui lòng nhập đầy đủ thông tin!",
    });
  }

  let userData = await userService.handleUserLogin(email, password);
  return res.status(200).json({
    errCode: userData.errCode,
    message: userData.errMessage,
    token: userData.token,
    user: userData.user ? userData.user : {},
  });
};

let handleRegister = async (req, res) => {
  let message = await userService.registerUser(req.body);
  return res.status(200).json(message);
};

let handleForgotPassword = async (req, res) => {
  let email = req.body.email;

  if (!email) {
    return res.status(400).json({
      errCode: 1,
      message: "Missing required parameter: email",
    });
  }

  let message = await userService.sendForgotPasswordEmail(email);
  return res.status(200).json(message);
};

let handleChangePassword = async (req, res) => {
  try {
    const userIdFromToken = req.user.user_id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Vui lòng nhập đầy đủ mật khẩu cũ và mới.",
      });
    }

    let response = await userService.handleChangePassword({
      userId: userIdFromToken,
      oldPassword: oldPassword,
      newPassword: newPassword,
    });

    return res.status(200).json(response);
  } catch (e) {
    console.error("Lỗi khi đổi mật khẩu:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server",
    });
  }
};

let handleVerifyResetToken = async (req, res) => {
  try {
    let token = req.query.token;
    let email = req.query.email;

    if (!token || !email) {
      return res.status(400).json({
        errCode: 1,
        message: "Missing token or email parameter",
      });
    }

    let response = await userService.verifyResetToken(token, email);
    return res.status(200).json(response);
  } catch (e) {
    console.error("Error in handleVerifyResetToken controller:", e);
    return res.status(500).json({
      errCode: -1,
      message: "Internal server error",
    });
  }
};

let handleResetPassword = async (req, res) => {
  try {
    let { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        errCode: 1,
        message: "Missing email, token, or newPassword",
      });
    }

    let response = await userService.resetUserPassword(
      email,
      token,
      newPassword
    );
    return res.status(200).json(response);
  } catch (e) {
    console.error("Error in handleResetPassword controller:", e);
    return res.status(500).json({
      errCode: -1,
      message: "Internal server error",
    });
  }
};

let handleGoogleCallback = (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect("http://localhost:3000/login?error=auth_failed");
    }

    const accessToken = generateAccessToken(user);

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      maxAge: 3600000,
      secure: process.env.NODE_ENV === "production",
    });

    res.redirect("http://localhost:3000/home");
  } catch (error) {
    console.error("Error in handleGoogleCallback:", error);
    return res.redirect(
      "http://localhost:3000/login?error=internal_server_error"
    );
  }
};

let handleGetAllUsers = async (req, res) => {
  let id = req.query.id || req.body.id;
  if (!id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters",
      users: [],
    });
  }

  let users = await userService.getAllUsers(id);

  return res.status(200).json({
    errCode: 0,
    errMessage: "OK",
    users,
  });
};

let handleGetAllAdmins = async (req, res) => {
  let users = await userService.getAllAdmins();
  return res.status(200).json({
    errCode: 0,
    errMessage: "OK",
    users,
  });
};

let handleGetAllStaffs = async (req, res) => {
  let users = await userService.getAllStaffs();

  return res.status(200).json({
    errCode: 0,
    errMessage: "OK",
    users,
  });
};

let handleGetAllCustomers = async (req, res) => {
  let users = await userService.getAllCustomers();

  return res.status(200).json({
    errCode: 0,
    errMessage: "OK",
    users,
  });
};

let handleCreateNewUser = async (req, res) => {
  let message = await userService.createNewUser(req.body);
  return res.status(200).json(message);
};

let handleDeleteUser = async (req, res) => {
  if (!req.body.user_id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters!",
    });
  }
  let message = await userService.deleteUser(req.body.user_id);
  return res.status(200).json(message);
};

let handleEditUser = async (req, res) => {
  let data = req.body;
  let message = await userService.updateUserData(data);
  return res.status(200).json(message);
};

module.exports = {
  handleLogin,
  handleRegister,
  handleForgotPassword,
  handleChangePassword,
  handleVerifyResetToken,
  handleResetPassword,
  handleGoogleCallback,
  handleGetAllUsers,
  handleGetAllAdmins,
  handleGetAllStaffs,
  handleGetAllCustomers,
  handleCreateNewUser,
  handleEditUser,
  handleDeleteUser,
};
