// src/services/vnpayService.js

const vnpayConfig = require("../config/vnpayConfig");
const moment = require("moment");
const crypto = require("crypto");
const qs = require("qs"); // Import thư viện qs

function sortObject(obj) {
  let sorted = {};
  let str = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(key);
    }
  }
  str.sort();
  for (let i = 0; i < str.length; i++) {
    sorted[str[i]] = obj[str[i]];
  }
  return sorted;
}

const vnpayService = {
  createPaymentUrl: function (amount, orderInfo, txnRef, customerIp) {
    let tmnCode = vnpayConfig.tmnCode;
    let secretKey = vnpayConfig.hashSecret;
    let vnpUrl = vnpayConfig.vnpUrl;
    let returnUrl = vnpayConfig.returnUrl;

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let locale = "vn";
    let currCode = "VND";

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Amount"] = amount * 100; // Số tiền cần nhân 100
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = txnRef;
    vnp_Params["vnp_OrderInfo"] = orderInfo;
    vnp_Params["vnp_OrderType"] = "billpayment";
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = customerIp;
    vnp_Params["vnp_CreateDate"] = createDate;
    vnp_Params["vnp_ExpireDate"] = moment(date)
      .add(15, "minutes")
      .format("YYYYMMDDHHmmss");

    vnp_Params = sortObject(vnp_Params);

    // Tạo chuỗi dữ liệu để hash: các tham số được mã hóa và nối bằng '&'
    // Không bao gồm secretKey trong chuỗi này
    let signData = Object.keys(vnp_Params)
      .map((key) => {
        let value = vnp_Params[key];
        // Mã hóa giá trị theo chuẩn URI và thay thế khoảng trắng bằng '+'
        return `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`;
      })
      .join("&");

    let hmac = crypto.createHmac("sha512", secretKey); // SecretKey dùng làm key cho HMAC
    let vnp_SecureHash = hmac
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    vnp_Params["vnp_SecureHash"] = vnp_SecureHash;

    // Tạo URL cuối cùng để chuyển hướng người dùng
    // Đảm bảo tất cả tham số trong URL đều được encodeURIComponent
    let finalVnpUrl = vnpUrl + "?" + qs.stringify(vnp_Params, { encode: true });

    return finalVnpUrl;
  },

  verifyIpn: function (queryParameters) {
    let vnp_Params = queryParameters;
    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = vnpayConfig.hashSecret;

    // Cách tạo signData để verify phải khớp với cách tạo khi gửi
    let signData = Object.keys(vnp_Params)
      .map((key) => {
        let value = vnp_Params[key];
        return `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`;
      })
      .join("&");

    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      return { isValid: true, data: vnp_Params };
    } else {
      return { isValid: false, data: vnp_Params };
    }
  },

  verifyReturn: function (queryParameters) {
    return this.verifyIpn(queryParameters);
  },
};

module.exports = vnpayService;
