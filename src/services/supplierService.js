import { where } from "sequelize";
import db from "../models/index";

let getAllSuppliers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = "";
      users = await db.Supplier.findAll();
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let createNewSupplier = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.name || !data.phone) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu các trường bắt buộc: Tên và Số điện thoại",
        });
      } else {
        await db.Supplier.create({
          name: data.name,
          phone: data.phone,
          address: data.address,
          description: data.description,
        });
        resolve({
          errCode: 0,
          errMessage: "Thêm nhà cung cấp mới thành công!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteSupplier = (supplierId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let supplier = await db.Supplier.findOne({
        where: { supplier_id: supplierId },
      });
      if (!supplier) {
        resolve({
          errCode: 2,
          errMessage: `Nhà cung cấp không tồn tại`,
        });
      }
      await db.Supplier.destroy({
        where: { supplier_id: supplierId },
      });
      resolve({
        errCode: 0,
        errMessage: "Xóa nhà cung cấp thành công!",
      });
    } catch (e) {
      reject(e);
    }
  });
};

let updateSupplier = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.supplier_id) {
        resolve({
          errCode: 2,
          errMessage: "Thiếu tham số bắt buộc!",
        });
      }

      let supplier = await db.Supplier.findOne({
        where: { supplier_id: data.supplier_id },
        raw: false,
      });
      if (supplier) {
        supplier.name = data.name;
        supplier.phone = data.phone;
        supplier.address = data.address;
        supplier.description = data.description;
        await supplier.save();
        resolve({
          errCode: 0,
          errMessage: "Cập nhật nhà cung cấp thành công!",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "Không tìm thấy nhà cung cấp!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getAllSuppliers,
  createNewSupplier,
  deleteSupplier,
  updateSupplier,
};
