import db from "../models/index";

const createNewField = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.field_name || !data.price_per_minute || !data.type) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu các trường bắt buộc: Tên sân, Giá, Loại sân",
        });
      } else {
        await db.Field.create({
          field_name: data.field_name,
          price_per_minute: data.price_per_minute,
          type: data.type,
          description: data.description,
          status: data.status,
          image: data.image,
        });
        resolve({
          errCode: 0,
          errMessage: "Thêm sân mới thành công!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const deleteField = (fieldId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let field = await db.Field.findOne({
        where: { field_id: fieldId },
      });
      if (!field) {
        resolve({
          errCode: 2,
          errMessage: `Sân không tồn tại`,
        });
      }
      await db.Field.destroy({
        where: { field_id: fieldId },
      });
      resolve({
        errCode: 0,
        errMessage: "Xóa sân thành công!",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateField = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.field_id) {
        resolve({
          errCode: 2,
          errMessage: "Thiếu tham số bắt buộc!",
        });
      }
      let field = await db.Field.findOne({
        where: { field_id: data.field_id },
        raw: false,
      });
      if (field) {
        field.field_name = data.field_name;
        field.price_per_minute = data.price_per_minute;
        field.type = data.type;
        field.description = data.description;
        field.status = data.status;
        field.image = data.image;
        await field.save();
        resolve({
          errCode: 0,
          errMessage: "Cập nhật thông tin sân thành công!",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "Không tìm thấy sân!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createNewField,
  deleteField,
  updateField,
};
