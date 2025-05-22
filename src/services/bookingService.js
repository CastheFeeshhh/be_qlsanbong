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

module.exports = {
  getAllFields,
  getAllServices,
  getAllSchedules,
};
