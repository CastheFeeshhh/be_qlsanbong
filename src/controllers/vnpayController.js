const db = require("../models/index");
const vnpayService = require("../services/vnpayService");
const assetService = require("../services/assetService");

const createVnpayPayment = async (req, res) => {
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
  try {
    let verifyResult = vnpayService.verifyIpn(req.query);

    if (verifyResult.isValid) {
      let vnp_Params = verifyResult.data;
      let vnpTxnRefFromVnpay = vnp_Params["vnp_TxnRef"];
      let rspCode = vnp_Params["vnp_ResponseCode"];
      let amountFromVnpay = parseInt(vnp_Params["vnp_Amount"]) / 100;
      let vnp_TransactionNo = vnp_Params["vnp_TransactionNo"];

      const originalBookingIdStr = vnpTxnRefFromVnpay
        ? vnpTxnRefFromVnpay.split("_")[0]
        : null;
      const originalBookingId = originalBookingIdStr
        ? parseInt(originalBookingIdStr)
        : null;

      if (!originalBookingId || isNaN(originalBookingId)) {
        return res.status(200).json({
          RspCode: "01",
          Message: "Order not found (invalid TxnRef format)",
        });
      }

      let booking = await db.FieldBooking.findOne({
        where: { booking_id: originalBookingId },
      });

      if (!booking) {
        return res
          .status(200)
          .json({ RspCode: "01", Message: "Order not found" });
      }

      if (booking.status !== "Đang chờ") {
        if (rspCode === "00" && booking.status === "Đã xác nhận") {
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

      if (parseFloat(booking.price_estimate) !== amountFromVnpay) {
        return res
          .status(200)
          .json({ RspCode: "04", Message: "Invalid Amount" });
      }

      if (rspCode === "00") {
        const transaction = await db.sequelize.transaction();
        try {
          await db.FieldBooking.update(
            { status: "Đã xác nhận" },
            {
              where: { booking_id: booking.booking_id },
              transaction: transaction,
            }
          );

          await db.TotalInvoice.create(
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

          await assetService.updateAssetUsageAndInventory(
            booking.booking_id,
            transaction
          );

          await transaction.commit();
          return res
            .status(200)
            .json({ RspCode: "00", Message: "Confirm Success" });
        } catch (dbError) {
          await transaction.rollback();
          console.error(
            "LỖI DB trong quá trình xử lý IPN (rspCode 00):",
            dbError
          );
          return res.status(200).json({
            RspCode: "00",
            Message: "Confirm Success (but internal processing error, logged)",
          });
        }
      } else {
        return res.status(200).json({
          RspCode: "00",
          Message: "Confirm Success (transaction not successful at VNPAY)",
        });
      }
    } else {
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Invalid Signature" });
    }
  } catch (error) {
    console.error("LỖI không xác định trong handleVnpayIPN:", error);
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
      resultCodeForFrontend = "97";
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
