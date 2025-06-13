import assetService from "../services/assetService";

const handleGetAllAssets = async (req, res) => {
  try {
    let data = await assetService.getAllAssets();
    return res.status(200).json(data);
  } catch (e) {
    console.error("Lỗi khi lấy danh sách tài sản:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

const handleCreateNewAsset = async (req, res) => {
  try {
    let message = await assetService.createNewAsset(req.body);
    return res.status(200).json(message);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server",
    });
  }
};

const handleEditAsset = async (req, res) => {
  try {
    let data = req.body;
    if (!data.asset_id) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc!",
      });
    }
    let message = await assetService.updateAssetData(data);
    return res.status(200).json(message);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server",
    });
  }
};

const handleDeleteAsset = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu tham số bắt buộc!",
      });
    }
    let message = await assetService.deleteAsset(req.body.id);
    return res.status(200).json(message);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server",
    });
  }
};

module.exports = {
  handleGetAllAssets,
  handleCreateNewAsset,
  handleEditAsset,
  handleDeleteAsset,
};
