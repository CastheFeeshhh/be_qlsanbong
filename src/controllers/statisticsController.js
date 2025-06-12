import statisticsService from "../services/statisticsService";

const handleGetRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu tham số startDate hoặc endDate!",
      });
    }
    const data = await statisticsService.getRevenueStatistics(
      startDate,
      endDate
    );
    return res.status(200).json(data);
  } catch (e) {
    console.error("Lỗi khi lấy dữ liệu thống kê:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

const handleGetBookingsStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu tham số startDate hoặc endDate!",
      });
    }
    const data = await statisticsService.getBookingsStatistics(
      startDate,
      endDate
    );
    return res.status(200).json(data);
  } catch (e) {
    console.error("Lỗi khi lấy dữ liệu thống kê phiếu đặt:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

module.exports = {
  handleGetRevenueStats,
  handleGetBookingsStats,
};
