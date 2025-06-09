import db from "../models/index";

let getAllServices = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let services = await db.Service.findAll({
        raw: true,
        order: [["service_id", "ASC"]],
      });
      resolve(services);
    } catch (e) {
      reject(e);
    }
  });
};

let createNewService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.Service.create({
        name: data.name,
        price: data.price,
        description: data.description,
        type: data.type,
        asset_id: data.asset_id ? data.asset_id : null,
      });
      resolve({
        errCode: 0,
        errMessage: "Tạo mới dịch vụ thành công!",
      });
    } catch (e) {
      reject(e);
    }
  });
};

let updateServiceData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.service_id) {
        resolve({
          errCode: 2,
          errMessage: "Thiếu tham số bắt buộc",
        });
        return;
      }
      let service = await db.Service.findOne({
        where: { service_id: data.service_id },
        raw: false,
      });
      if (service) {
        service.name = data.name;
        service.price = data.price;
        service.description = data.description;
        service.type = data.type;
        service.asset_id = data.asset_id ? data.asset_id : null;
        await service.save();
        resolve({
          errCode: 0,
          errMessage: "Cập nhật dịch vụ thành công!",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "Không tìm thấy dịch vụ!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteService = (serviceId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let service = await db.Service.findOne({
        where: { service_id: serviceId },
        raw: false,
      });
      if (!service) {
        resolve({
          errCode: 2,
          errMessage: "Dịch vụ không tồn tại",
        });
        return;
      }
      await service.destroy();
      resolve({
        errCode: 0,
        errMessage: "Xóa dịch vụ thành công",
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getAllServices: getAllServices,
  createNewService: createNewService,
  updateServiceData: updateServiceData,
  deleteService: deleteService,
};
