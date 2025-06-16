import assetInvoiceService from "../services/assetInvoiceService";

const handleCreateAssetInvoice = async (req, res) => {
  try {
    const data = req.body;
    if (
      !data.supplier_id ||
      !data.invoice_date ||
      !data.details ||
      data.details.length === 0
    ) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu thông tin bắt buộc!",
      });
    }
    const message = await assetInvoiceService.createAssetInvoice(data);
    return res.status(200).json(message);
  } catch (e) {
    console.error("Lỗi khi tạo hóa đơn nhập hàng:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

const handleGetAssetInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.query.id;
    if (!invoiceId) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu tham số id!",
      });
    }
    const data = await assetInvoiceService.getAssetInvoiceById(invoiceId);
    return res.status(200).json(data);
  } catch (e) {
    console.error("Lỗi khi lấy chi tiết hóa đơn nhập hàng:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

module.exports = {
  handleCreateAssetInvoice,
  handleGetAssetInvoiceById,
};
