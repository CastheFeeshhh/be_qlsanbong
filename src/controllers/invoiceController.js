import invoiceService from "../services/invoiceService";

const handleGetAllInvoices = async (req, res) => {
  try {
    let data = await invoiceService.getAllInvoices();
    return res.status(200).json(data);
  } catch (e) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

const handleGetAllAssetInvoices = async (req, res) => {
  try {
    let data = await invoiceService.getAllAssetInvoices();
    return res.status(200).json(data);
  } catch (e) {
    console.error("Lỗi khi lấy danh sách hóa đơn nhập hàng:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

let handleGetInvoiceDetails = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc: id",
      });
    }
    let data = await invoiceService.getInvoiceDetails(req.query.id);
    return res.status(200).json(data);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server...",
    });
  }
};

module.exports = {
  handleGetAllInvoices,
  handleGetAllAssetInvoices,
  handleGetInvoiceDetails,
};
