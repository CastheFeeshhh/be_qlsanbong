require("dotenv").config();

var vnpayConfig = {
  tmnCode: process.env.VNPAY_TMNCODE,
  hashSecret: process.env.VNPAY_HASHSECRET,
  vnpUrl: process.env.VNPAY_URL,
  returnUrl: process.env.VNPAY_RETURN_URL,
  ipnUrl: process.env.VNPAY_IPN_URL,
};

module.exports = vnpayConfig;
