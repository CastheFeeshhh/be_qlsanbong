import serviceServices from "../services/serviceServices";

let handleCreateNewService = async (req, res) => {
  try {
    let message = await serviceServices.createNewService(req.body);
    return res.status(200).json(message);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

let handleEditService = async (req, res) => {
  try {
    let data = await serviceServices.updateServiceData(req.body);
    return res.status(200).json(data);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

let handleDeleteService = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Thiếu id dịch vụ!",
      });
    }
    let message = await serviceServices.deleteService(req.body.id);
    return res.status(200).json(message);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

module.exports = {
  handleCreateNewService,
  handleEditService,
  handleDeleteService,
};
