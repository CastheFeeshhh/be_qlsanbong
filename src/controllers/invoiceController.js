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

module.exports = {
  handleGetAllInvoices,
  handleGetAllAssetInvoices,
};
