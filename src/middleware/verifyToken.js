import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          errCode: 403,
          errMessage: "Token is not valid!",
        });
      }

      req.user = decoded;
      next();
    });
  } else {
    return res.status(401).json({
      errCode: 401,
      errMessage: "You are not authenticated!",
    });
  }
};

module.exports = verifyToken;
