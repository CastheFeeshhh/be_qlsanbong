import fieldService from "../services/fieldService";

const handleCreateNewField = async (req, res) => {
  try {
    let message = await fieldService.createNewField(req.body);
    return res.status(200).json(message);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server",
    });
  }
};

const handleEditField = async (req, res) => {
  try {
    let data = req.body;
    if (!data.field_id) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc!",
      });
    }
    let message = await fieldService.updateField(data);
    return res.status(200).json(message);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server",
    });
  }
};

const handleDeleteField = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc!",
      });
    }
    let message = await fieldService.deleteField(req.body.id);
    return res.status(200).json(message);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server",
    });
  }
};

module.exports = {
  handleCreateNewField,
  handleEditField,
  handleDeleteField,
};
