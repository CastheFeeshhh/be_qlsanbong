import supplierService from "../services/supplierService";

let handleGetAllSuppliers = async (req, res) => {
  let suppliers = await supplierService.getAllSuppliers();

  return res.status(200).json({
    errCode: 0,
    errMessage: "OK",
    suppliers,
  });
};

let handleCreateNewSupplier = async (req, res) => {
  try {
    let message = await supplierService.createNewSupplier(req.body);
    return res.status(200).json(message);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server",
    });
  }
};

let handleEditSupplier = async (req, res) => {
  try {
    let data = req.body;

    if (!data.supplier_id) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc!",
      });
    }

    let message = await supplierService.updateSupplier(data);
    return res.status(200).json(message);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server",
    });
  }
};

let handleDeleteSupplier = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc!",
      });
    }
    let message = await supplierService.deleteSupplier(req.body.id);
    return res.status(200).json(message);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server",
    });
  }
};

module.exports = {
  handleGetAllSuppliers,
  handleCreateNewSupplier,
  handleEditSupplier,
  handleDeleteSupplier,
};
