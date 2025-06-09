import db from "../models/index";
import { Sequelize } from "sequelize";

const getRevenueStatistics = (startDate, endDate) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!startDate || !endDate) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu ngày bắt đầu hoặc ngày kết thúc!",
        });
        return;
      }

      const revenueByDay = await db.TotalInvoice.findAll({
        where: {
          paid_at: {
            [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
        attributes: [
          [Sequelize.fn("date", Sequelize.col("paid_at")), "date"],
          [Sequelize.fn("sum", Sequelize.col("total_price")), "revenue"],
        ],
        group: [Sequelize.fn("date", Sequelize.col("paid_at"))],
        order: [[Sequelize.fn("date", Sequelize.col("paid_at")), "ASC"]],
        raw: true,
      });

      const totalStats = await db.TotalInvoice.findOne({
        where: {
          paid_at: {
            [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
        attributes: [
          [Sequelize.fn("sum", Sequelize.col("total_price")), "totalRevenue"],
          [Sequelize.fn("count", Sequelize.col("invoice_id")), "totalInvoices"],
        ],
        raw: true,
      });

      resolve({
        errCode: 0,
        errMessage: "OK",
        data: {
          totalRevenue: totalStats.totalRevenue || 0,
          totalInvoices: totalStats.totalInvoices || 0,
          revenueByDay: revenueByDay,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getRevenueStatistics,
};
