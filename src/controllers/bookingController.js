import bookingService from "../services/bookingService";

let handleGetAllFields = async (req, res) => {
  let priceData = await bookingService.getAllFields();
  return res.status(200).json(priceData);
};

let handleGetAllServices = async (req, res) => {
  let serviceData = await bookingService.getAllServices();
  return res.status(200).json(serviceData);
};

let handleGetAllSchedules = async (req, res) => {
  let fieldId = req.query.field_id || req.body.field_id || null;
  let date = req.query.date || req.body.date || null;
  let schedules = await bookingService.getAllSchedules(fieldId, date);

  return res.status(200).json({
    errCode: 0,
    errMessage: "OK",
    schedules,
  });
};

let handleAddNewBooking = async (req, res) => {
  if (!req.body.user_id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Thiếu thông tin user!",
    });
  }
  let message = await bookingService.addNewBooking(req.body);
  return res.status(200).json(message);
};

let handleAddDetailBooking = async (req, res) => {
  if (!req.body.booking_id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Thiếu thông tin chi tiết hóa đơn!",
    });
  }
  let message = await bookingService.addDetailBooking(req.body);
  return res.status(200).json(message);
};

let handleAddNewServiceBooking = async (req, res) => {
  if (!req.body.booking_detail_id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Thiếu thông tin chi tiết hóa đơn đặt sân!",
    });
  }
  let message = await bookingService.addNewServiceBooking(req.body);
  return res.status(200).json(message);
};

let handleAddServiceBookingDetail = async (req, res) => {
  if (!req.body.service_booking_id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Thiếu thông tin chi tiết hóa đơn dịch vụ!",
    });
  }
  let message = await bookingService.addServiceBookingDetail(req.body);
  return res.status(200).json(message);
};

const handleGetBookingHistory = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(200).json({
        errCode: 1,
        errMessage: "Thiếu tham số userId!",
      });
    }
    const data = await bookingService.getBookingHistoryByUserId(userId);
    return res.status(200).json(data);
  } catch (e) {
    console.error("Lỗi khi lấy lịch sử đặt sân:", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Lỗi từ server.",
    });
  }
};

module.exports = {
  handleGetAllFields,
  handleGetAllServices,
  handleGetAllSchedules,
  handleAddNewBooking,
  handleAddDetailBooking,
  handleAddNewServiceBooking,
  handleAddServiceBookingDetail,
  handleGetBookingHistory,
};
