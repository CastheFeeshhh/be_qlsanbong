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

module.exports = {
  handleGetAllAssets,
};
