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

module.exports = {
  handleGetAllFields,
  handleGetAllServices,
  handleGetAllSchedules,
};
