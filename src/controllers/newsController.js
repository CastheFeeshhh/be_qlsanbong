import newsService from "../services/newsService";

const handleGetAllNews = async (req, res) => {
  try {
    const data = await newsService.getAllNews();
    return res.status(200).json(data);
  } catch (e) {
    console.error("Lỗi khi lấy danh sách tin tức:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

const handleGetNewsById = async (req, res) => {
  try {
    const newsId = req.query.id;
    if (!newsId) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu tham số id!",
      });
    }
    const data = await newsService.getNewsById(newsId);
    return res.status(200).json(data);
  } catch (e) {
    console.error("Lỗi khi lấy chi tiết tin tức:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

module.exports = {
  handleGetAllNews,
  handleGetNewsById,
};
