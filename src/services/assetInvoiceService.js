import db from "../models/index";
import { Sequelize } from "sequelize";

const createAssetInvoice = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { supplier_id, invoice_date, note, details } = data;

      if (
        !supplier_id ||
        !invoice_date ||
        !details ||
        !Array.isArray(details) ||
        details.length === 0
      ) {
        resolve({
          errCode: 1,
          errMessage:
            "Thiếu thông tin bắt buộc: nhà cung cấp, ngày hoặc chi tiết hàng hóa.",
        });
        return;
      }

      const t = await db.sequelize.transaction();

      try {
        const newInvoice = await db.AssetInvoice.create(
          {
            supplier_id: supplier_id,
            invoice_date: invoice_date,
            note: note,
            total_amount: 0,
          },
          { transaction: t }
        );

        const assetInvoiceId = newInvoice.asset_invoice_id;

        for (const detail of details) {
          await db.AssetInvoiceDetail.create(
            {
              asset_invoice_id: assetInvoiceId,
              asset_id: detail.asset_id,
              quantity: detail.quantity,
              price: detail.price,
              note: detail.note,
            },
            { transaction: t }
          );
          await db.AssetInventory.increment(
            { current_quantity: detail.quantity },
            { where: { asset_id: detail.asset_id }, transaction: t }
          );
        }

        await t.commit();

        resolve({
          errCode: 0,
          errMessage: "Tạo phiếu nhập hàng thành công!",
        });
      } catch (e) {
        await t.rollback();
        reject(e);
      }
    } catch (e) {
      reject(e);
    }
  });
};

const getAssetInvoiceById = (invoiceId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!invoiceId) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu ID hóa đơn!",
        });
        return;
      }
      let invoice = await db.AssetInvoice.findOne({
        where: { asset_invoice_id: invoiceId },
        include: [
          {
            model: db.Supplier,
            as: "Supplier",
            attributes: ["name", "phone", "address"],
          },
          {
            model: db.AssetInvoiceDetail,
            as: "AssetInvoiceDetails",
            attributes: ["quantity", "price", "note"],
            include: [
              {
                model: db.Asset,
                as: "Asset",
                attributes: ["name"],
              },
            ],
          },
        ],
        raw: false,
        nest: true,
      });

      if (invoice) {
        resolve({
          errCode: 0,
          data: invoice,
        });
      } else {
        resolve({
          errCode: 2,
          errMessage: "Không tìm thấy hóa đơn.",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createAssetInvoice,
  getAssetInvoiceById,
};
