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

const getBookingHistoryByUserId = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu user_id!",
        });
        return;
      }

      let bookings = await db.FieldBooking.findAll({
        where: { user_id: userId },
        attributes: ["booking_id", "status", "created_at", "price_estimate"],
        include: [
          {
            model: db.FieldBookingDetail,
            as: "FieldBookingDetail",
            attributes: ["booking_detail_id", "date", "start_time", "end_time"],
            include: [
              {
                model: db.Field,
                as: "Field",
                attributes: ["field_name", "type"],
              },
              {
                model: db.ServiceBooking,
                as: "ServiceBookings",
                attributes: ["total_service_price"],
                include: [
                  {
                    model: db.ServiceBookingDetail,
                    as: "ServiceBookingDetails",
                    attributes: ["quantity", "note"],
                    include: [
                      {
                        model: db.Service,
                        as: "Service",
                        attributes: ["name", "price"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
        raw: false,
        nest: false,
      });

      resolve({
        errCode: 0,
        errMessage: "OK",
        bookings: bookings,
      });
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
  getBookingHistoryByUserId,
};
