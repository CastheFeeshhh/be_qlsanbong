import { where } from "sequelize";
import db from "../models/index";

let getAllFields = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = db.Field.findAll();
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};

let getAllServices = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = db.Service.findAll();
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
};

let getAllSchedules = (fieldId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      let bookings = [];
      if (fieldId && date) {
        bookings = await db.FieldBookingDetail.findAll({
          where: {
            field_id: fieldId,
            date: date,
          },
          attributes: [
            "booking_detail_id",
            "booking_id",
            "field_id",
            "date",
            "start_time",
            "end_time",
            "team_name",
            "captain_name",
            "booking_phone",
          ],
          raw: true,
          order: [["start_time", "ASC"]],
        });
      } else {
        bookings = await db.FieldBookingDetail.findAll({
          attributes: [
            "booking_detail_id",
            "booking_id",
            "field_id",
            "date",
            "start_time",
            "end_time",
            "team_name",
            "captain_name",
            "booking_phone",
          ],
          raw: true,
          order: [
            ["date", "ASC"],
            ["start_time", "ASC"],
          ],
        });
      }
      resolve(bookings);
    } catch (e) {
      reject(e);
    }
  });
};

let addNewBooking = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await db.FieldBooking.create({
        user_id: data.user_id,
        status: "Đang chờ",
        price_estimate: data.price_estimate,
      });
      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
};

let addDetailBooking = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await db.FieldBookingDetail.create({
        booking_id: data.booking_id,
        field_id: data.field_id,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        team_name: data.team_name,
        captain_name: data.captain_name,
        booking_phone: data.booking_phone,
      });
      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
};

let addNewServiceBooking = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await db.ServiceBooking.create({
        booking_detail_id: data.booking_detail_id,
        total_service_price: 0,
      });
      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
};

let addServiceBookingDetail = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await db.ServiceBookingDetail.create({
        service_booking_id: data.service_booking_id,
        service_id: data.service_id,
        quantity: data.quantity,
      });
      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getAllFields,
  getAllServices,
  getAllSchedules,
  addNewBooking,
  addDetailBooking,
  addNewServiceBooking,
  addServiceBookingDetail,
};
