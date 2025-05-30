const db = require("../models/index");
const vnpayService = require("../services/vnpayService");

const createVnpayPayment = async (req, res) => {
  try {
    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let { invoiceId, amount, orderInfo } = req.body;
    let vnpTxnRef = `${invoiceId}_${Date.now()}`;

    let orderDescription = orderInfo || `Thanh toan hoa don #${invoiceId}`;

    let payUrl = vnpayService.createPaymentUrl(
      amount,
      orderDescription,
      vnpTxnRef,
      ipAddr
    );

    await db.TotalInvoice.update(
      {
        payment_method: "VNPAY",
        vnp_txn_ref: vnpTxnRef,
      },
      {
        where: { invoice_id: invoiceId },
      }
    );

    return res.status(200).json({
      errCode: 0,
      errMessage: "VNPAY URL created successfully",
      payUrl: payUrl,
    });
  } catch (error) {
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
      let amountFromVnpay = vnp_Params["vnp_Amount"] / 100;
      let vnp_TransactionNo = vnp_Params["vnp_TransactionNo"];

      let invoice = await db.TotalInvoice.findOne({
        where: { vnp_txn_ref: vnpTxnRefFromVnpay },
      });

      if (!invoice) {
        return res
          .status(200)
          .json({ RspCode: "01", Message: "Order not found" });
      }

      let booking = await db.FieldBooking.findOne({
        where: { booking_id: invoice.booking_id },
      });

      if (!booking) {
        return res
          .status(200)
          .json({ RspCode: "01", Message: "Order not found" });
      }

      if (booking.status !== "Đang chờ") {
        return res.status(200).json({
          RspCode: "02",
          Message: "Order already confirmed or invalid status",
        });
      }

      if (invoice.total_price !== amountFromVnpay) {
        return res
          .status(200)
          .json({ RspCode: "04", Message: "Invalid Amount" });
      }

      if (rspCode === "00") {
        await db.FieldBooking.update(
          { status: "Đã xác nhận" },
          { where: { booking_id: booking.booking_id } }
        );
        await db.TotalInvoice.update(
          {
            paid_at: new Date(),
            payment_status: "paid",
            vnp_transaction_no: vnp_TransactionNo,
          },
          { where: { invoice_id: invoice.invoice_id } }
        );
        return res
          .status(200)
          .json({ RspCode: "00", Message: "Confirm Success" });
      } else {
        await db.TotalInvoice.update(
          {
            payment_status: "failed",
            vnp_transaction_no: vnp_TransactionNo,
            vnp_response_code: rspCode,
          },
          { where: { invoice_id: invoice.invoice_id } }
        );
        return res
          .status(200)
          .json({ RspCode: "00", Message: "Confirm Success" });
      }
    } else {
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Invalid Signature" });
    }
  } catch (error) {
    return res.status(500).json({ RspCode: "99", Message: "Unknown error" });
  }
};

const handleVnpayReturn = async (req, res) => {
  try {
    let verifyResult = vnpayService.verifyReturn(req.query);

    let vnp_Params = verifyResult.data;
    let vnpTxnRefFromVnpay = vnp_Params["vnp_TxnRef"];
    let resultCode = vnp_Params["vnp_ResponseCode"];
    let paymentStatus = "failed";

    if (verifyResult.isValid) {
      let invoice = await db.TotalInvoice.findOne({
        where: { vnp_txn_ref: vnpTxnRefFromVnpay },
      });

      if (invoice) {
        let booking = await db.FieldBooking.findOne({
          where: { booking_id: invoice.booking_id },
        });

        if (booking) {
          if (booking.status === "Đã xác nhận" && resultCode === "00") {
            paymentStatus = "success";
          } else if (booking.status === "Đang chờ" && resultCode !== "00") {
            paymentStatus = "failed";
          } else if (booking.status === "Đang chờ" && resultCode === "00") {
            paymentStatus = "pending_confirmation";
          } else if (booking.status === "Đã hủy" && resultCode !== "00") {
            paymentStatus = "failed";
          }
        }
      }

      let frontendReturnUrl = vnpayService.vnpayConfig.returnUrl;
      let redirectUrl = `${frontendReturnUrl}?vnp_txn_ref=${vnpTxnRefFromVnpay}&paymentStatus=${paymentStatus}&resultCode=${resultCode}`;

      return res.redirect(redirectUrl);
    } else {
      let frontendReturnUrl = vnpayService.vnpayConfig.returnUrl;
      let redirectUrl = `${frontendReturnUrl}?vnp_txn_ref=${
        vnp_Params["vnp_TxnRef"] || ""
      }&paymentStatus=failed&resultCode=97`;
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    let frontendReturnUrl = vnpayService.vnpayConfig.returnUrl;
    let redirectUrl = `${frontendReturnUrl}?vnp_txn_ref=${
      req.query.vnp_TxnRef || ""
    }&paymentStatus=failed&resultCode=99`;
    return res.redirect(redirectUrl);
  }
};

module.exports = {
  createVnpayPayment,
  handleVnpayIPN,
  handleVnpayReturn,
};
