import jwt from "jsonwebtoken";
require("dotenv").config();

const createJWT = (payload) => {
  try {
    let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    return token;
  } catch (e) {
    console.error("Error creating JWT:", e);
    return null;
  }
};

const checkUserJWT = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({
      errCode: 1,
      message: "Bạn chưa đăng nhập hoặc token không hợp lệ!",
    });
  }

  try {
    let decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({
      errCode: 2,
      message: "Phiên đăng nhập hết hạn hoặc token không hợp lệ!",
    });
  }
};

const checkUserPermission = (allowedRoleIds) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleId) {
      // Chú ý: roleId trong JWT payload là roleId, không phải role_id
      return res.status(403).json({
        errCode: 3,
        message: "Không tìm thấy thông tin quyền của người dùng!",
      });
    }

    const userRoleId = req.user.roleId;

    if (allowedRoleIds.includes(userRoleId)) {
      next();
    } else {
      return res.status(403).json({
        errCode: 4,
        message: "Bạn không có quyền truy cập chức năng này!",
      });
    }
  };
};

// Đã thay đổi cách export
export { createJWT, checkUserJWT, checkUserPermission };
