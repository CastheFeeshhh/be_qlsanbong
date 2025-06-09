import db from "../models/index";

const getAllInvoices = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let invoices = await db.TotalInvoice.findAll({
        include: [
          {
            model: db.FieldBooking,
            as: "FieldBooking",
            attributes: ["status"],
            include: [
              {
                model: db.User,
                as: "User",
                attributes: ["first_name", "last_name", "email"],
              },
            ],
          },
        ],
        order: [["paid_at", "DESC"]],
        raw: true,
        nest: true,
      });

      const formattedInvoices = invoices.map((invoice) => {
        return {
          invoice_id: invoice.invoice_id,
          booking_id: invoice.booking_id,
          discount: invoice.discount,
          total_price: invoice.total_price,
          payment_method: invoice.payment_method,
          paid_at: invoice.paid_at,
          vnp_txn_ref: invoice.vnp_txn_ref,
          status: invoice.FieldBooking.status,
          customer_name: `${invoice.FieldBooking.User.first_name} ${invoice.FieldBooking.User.last_name}`,
          customer_email: invoice.FieldBooking.User.email,
        };
      });

      resolve({
        errCode: 0,
        errMessage: "OK",
        invoices: formattedInvoices,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllAssetInvoices = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let assetInvoices = await db.AssetInvoice.findAll({
        include: [
          {
            model: db.Supplier,
            as: "Supplier",
            attributes: ["name"],
          },
          {
            model: db.AssetInvoiceDetail,
            as: "AssetInvoiceDetails",
            include: [
              {
                model: db.Asset,
                as: "Asset",
                attributes: ["name"],
              },
            ],
          },
        ],
        order: [["invoice_date", "DESC"]],
        raw: false,
        nest: false,
      });

      const formattedInvoices = assetInvoices.map((invoice) => {
        const plainInvoice = invoice.get({ plain: true });

        const detailsString = plainInvoice.AssetInvoiceDetails.map((detail) => {
          return `${detail.Asset.name} (SL: ${
            detail.quantity
          }, Đơn giá: ${parseFloat(detail.price).toLocaleString("vi-VN")})`;
        }).join("; ");

        return {
          asset_invoice_id: plainInvoice.asset_invoice_id,
          supplier_name: plainInvoice.Supplier.name,
          invoice_date: plainInvoice.invoice_date,
          total_amount: plainInvoice.total_amount,
          note: plainInvoice.note,
          details: detailsString,
        };
      });

      resolve({
        errCode: 0,
        errMessage: "OK",
        invoices: formattedInvoices,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getInvoiceDetails = (bookingId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!bookingId) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu booking_id!",
        });
        return;
      }

      let bookingDetails = await db.FieldBooking.findOne({
        where: { booking_id: bookingId },
        attributes: ["booking_id", "status", "created_at", "price_estimate"],
        include: [
          {
            model: db.FieldBookingDetail,
            as: "FieldBookingDetail",
            attributes: ["booking_detail_id", "date", "start_time", "end_time"],
            include: [
              {
                model: db.Field,
                as: "Field",
                attributes: ["field_name", "type"],
              },
              {
                model: db.ServiceBooking,
                as: "ServiceBookings",
                attributes: ["total_service_price"],
                include: [
                  {
                    model: db.ServiceBookingDetail,
                    as: "ServiceBookingDetails",
                    attributes: ["quantity", "note"],
                    include: [
                      {
                        model: db.Service,
                        as: "Service",
                        attributes: ["name", "price"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        raw: false,
        nest: false,
      });

      resolve({
        errCode: 0,
        errMessage: "OK",
        details: bookingDetails,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getAllInvoices,
  getAllAssetInvoices,
  getInvoiceDetails,
};
