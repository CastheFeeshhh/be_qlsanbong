const db = require("../models/index");
const vnpayService = require("../services/vnpayService");

const createVnpayPayment = async (req, res) => {
  console.log("1");
  try {
    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let { bookingId, amount, orderInfo } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Thiếu thông tin bookingId hoặc amount.",
      });
    }

    let vnpTxnRef = `${bookingId}_${Date.now()}`;
    let orderDescription =
      orderInfo || `Thanh toan cho don dat san #${bookingId}`;

    let payUrl = vnpayService.createPaymentUrl(
      amount,
      orderDescription,
      vnpTxnRef,
      ipAddr
    );

    return res.status(200).json({
      errCode: 0,
      errMessage: "VNPAY URL created successfully",
      payUrl: payUrl,
      vnpTxnRefGenerated: vnpTxnRef,
    });
  } catch (error) {
    console.error("Error in createVnpayPayment:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error during VNPAY payment creation.",
      details: error.message,
    });
  }
};

const handleVnpayIPN = async (req, res) => {
  console.log("===================================");
  console.log("Bắt đầu xử lý VNPAY IPN:", new Date().toISOString());
  console.log("IPN Query Params nhận được:", req.query);

  try {
    let verifyResult = vnpayService.verifyIpn(req.query);
    console.log("Kết quả xác thực chữ ký (verifyResult):", verifyResult);

    if (verifyResult.isValid) {
      console.log("Chữ ký IPN HỢP LỆ.");
      let vnp_Params = verifyResult.data;
      let vnpTxnRefFromVnpay = vnp_Params["vnp_TxnRef"];
      let rspCode = vnp_Params["vnp_ResponseCode"];
      let amountFromVnpay = parseInt(vnp_Params["vnp_Amount"]) / 100;
      let vnp_TransactionNo = vnp_Params["vnp_TransactionNo"];

      console.log("vnp_TxnRef từ VNPAY:", vnpTxnRefFromVnpay);
      console.log("Mã kết quả (rspCode) từ VNPAY:", rspCode);
      console.log(
        "Số tiền (amountFromVnpay) từ VNPAY (đã chia 100):",
        amountFromVnpay
      );
      console.log("Mã giao dịch VNPAY (vnp_TransactionNo):", vnp_TransactionNo);

      const originalBookingIdStr = vnpTxnRefFromVnpay
        ? vnpTxnRefFromVnpay.split("_")[0]
        : null;
      const originalBookingId = originalBookingIdStr
        ? parseInt(originalBookingIdStr)
        : null;
      console.log("originalBookingId đã tách được:", originalBookingId);

      if (!originalBookingId || isNaN(originalBookingId)) {
        console.error(
          "LỖI: Không thể tách originalBookingId hoặc ID không hợp lệ từ vnp_TxnRef:",
          vnpTxnRefFromVnpay
        );
        return res.status(200).json({
          RspCode: "01",
          Message: "Order not found (invalid TxnRef format)",
        });
      }

      console.log(`Đang tìm FieldBooking với booking_id: ${originalBookingId}`);
      let booking = await db.FieldBooking.findOne({
        where: { booking_id: originalBookingId },
      });

      if (!booking) {
        console.error(
          "LỖI: Không tìm thấy FieldBooking cho booking_id:",
          originalBookingId
        );
        return res
          .status(200)
          .json({ RspCode: "01", Message: "Order not found" });
      }
      console.log(
        "Đã tìm thấy FieldBooking:",
        JSON.stringify(booking, null, 2)
      );

      if (booking.status !== "Đang chờ") {
        console.warn(
          `LƯU Ý: FieldBooking (ID: ${booking.booking_id}) không ở trạng thái 'Đang chờ'. Trạng thái hiện tại: ${booking.status}. Mã VNPAY rspCode: ${rspCode}`
        );
        if (rspCode === "00" && booking.status === "Đã xác nhận") {
          console.log(
            "IPN có thể lặp lại cho đơn hàng đã được xác nhận. Bỏ qua cập nhật."
          );
          return res.status(200).json({
            RspCode: "00",
            Message: "Confirm Success (Order already confirmed)",
          });
        }
        return res.status(200).json({
          RspCode: "02",
          Message: "Order already confirmed or in invalid state",
        });
      }
      console.log("Trạng thái FieldBooking là 'Đang chờ'. Tiếp tục...");

      if (parseFloat(booking.price_estimate) !== amountFromVnpay) {
        console.error(
          `LỖI: Số tiền không khớp cho booking_id: ${booking.booking_id}. Dự kiến: ${booking.price_estimate}, VNPAY báo: ${amountFromVnpay}`
        );
        return res
          .status(200)
          .json({ RspCode: "04", Message: "Invalid Amount" });
      }
      console.log("Số tiền khớp. Tiếp tục...");

      if (rspCode === "00") {
        console.log(
          "VNPAY báo giao dịch THÀNH CÔNG (rspCode === '00'). Bắt đầu cập nhật CSDL."
        );
        const transaction = await db.sequelize.transaction();
        console.log("Đã bắt đầu Database Transaction.");
        try {
          console.log(
            `Đang cập nhật FieldBooking ID: ${booking.booking_id} thành status: 'Đã xác nhận'`
          );
          await db.FieldBooking.update(
            { status: "Đã xác nhận" },
            {
              where: { booking_id: booking.booking_id },
              transaction: transaction,
            }
          );
          console.log("Cập nhật FieldBooking thành công.");

          console.log(
            `Đang tạo mới TotalInvoice cho booking_id: ${booking.booking_id}`
          );
          const newInvoice = await db.TotalInvoice.create(
            {
              booking_id: booking.booking_id,
              total_price: amountFromVnpay,
              payment_method: "VNPAY",
              paid_at: new Date(),
              vnp_txn_ref: vnp_TransactionNo,
              discount: booking.discount || 0,
            },
            { transaction: transaction }
          );
          console.log(
            "Tạo mới TotalInvoice thành công:",
            JSON.stringify(newInvoice, null, 2)
          );

          await transaction.commit();
          console.log("Đã COMMIT Database Transaction.");
          console.log("===================================");
          return res
            .status(200)
            .json({ RspCode: "00", Message: "Confirm Success" });
        } catch (dbError) {
          await transaction.rollback();
          console.error(
            "LỖI DB trong quá trình xử lý IPN (rspCode 00):",
            dbError
          );
          console.log("Đã ROLLBACK Database Transaction do lỗi.");
          console.log("===================================");
          return res.status(200).json({
            RspCode: "00",
            Message: "Confirm Success (but internal processing error, logged)",
          });
        }
      } else {
        console.log(
          `VNPAY báo giao dịch KHÔNG THÀNH CÔNG (rspCode: ${rspCode}). Booking ID: ${booking.booking_id}.`
        );
        // Cân nhắc cập nhật status của booking thành 'Thanh toán thất bại' nếu bạn có trạng thái đó
        // Ví dụ:
        // await db.FieldBooking.update(
        //   { status: "Thanh toán thất bại" },
        //   { where: { booking_id: booking.booking_id } }
        // );
        // console.log("Đã cập nhật FieldBooking status thành 'Thanh toán thất bại'.");
        console.log("===================================");
        return res.status(200).json({
          RspCode: "00",
          Message: "Confirm Success (transaction not successful at VNPAY)",
        });
      }
    } else {
      console.error("LỖI: Chữ ký IPN KHÔNG HỢP LỆ.", req.query);
      console.log("===================================");
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Invalid Signature" });
    }
  } catch (error) {
    console.error("LỖI không xác định trong handleVnpayIPN:", error);
    console.log("===================================");
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

const handleVnpayReturn = async (req, res) => {
  let vnp_Params = req.query;
  let frontendReturnUrl = vnpayService.vnpayConfig.returnUrl;
  let paymentStatusForFrontend = "failed";
  let resultCodeForFrontend = vnp_Params["vnp_ResponseCode"] || "99";
  let vnpTxnRefForFrontend = vnp_Params["vnp_TxnRef"] || "";

  try {
    let verifyResult = vnpayService.verifyReturn(vnp_Params);

    if (verifyResult.isValid) {
      if (resultCodeForFrontend === "00") {
        paymentStatusForFrontend = "success";
        const originalBookingIdStr = vnpTxnRefForFrontend.split("_")[0];
        const originalBookingId = parseInt(originalBookingIdStr);
        if (!isNaN(originalBookingId)) {
          const booking = await db.FieldBooking.findOne({
            where: { booking_id: originalBookingId },
            attributes: ["status"],
          });
          if (booking) {
            if (booking.status === "Đã xác nhận") {
              paymentStatusForFrontend = "success";
            } else if (booking.status === "Đang chờ") {
              paymentStatusForFrontend = "pending_confirmation";
            }
          }
        }
      }
    } else {
      resultCodeForFrontend = "97"; // Lỗi chữ ký không hợp lệ
      console.warn("Invalid VNPAY Return Signature:", vnp_Params);
    }
  } catch (error) {
    console.error("Error in handleVnpayReturn:", error);
    resultCodeForFrontend = "99";
  } finally {
    const redirectUrl = `${frontendReturnUrl}?vnp_txn_ref=${encodeURIComponent(
      vnpTxnRefForFrontend
    )}&paymentStatus=${paymentStatusForFrontend}&resultCode=${resultCodeForFrontend}`;
    return res.redirect(redirectUrl);
  }
};

module.exports = {
  createVnpayPayment,
  handleVnpayIPN,
  handleVnpayReturn,
};
