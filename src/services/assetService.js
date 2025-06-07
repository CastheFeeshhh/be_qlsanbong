import db from "../models/index";

const getAllAssets = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let assets = await db.Asset.findAll({
        include: [
          {
            model: db.AssetInventory,
            as: "AssetInventory",
            attributes: ["current_quantity", "min_quantity", "last_updated"],
            required: false,
          },
        ],
        attributes: [
          "asset_id",
          "name",
          "description",
          "status",
          "is_trackable",
          "total_quantity",
        ],
        raw: true,
        nest: true,
        order: [["asset_id", "ASC"]],
      });

      const formattedAssets = assets.map((asset) => {
        return {
          ...asset,
          current_quantity: asset.AssetInventory
            ? asset.AssetInventory.current_quantity
            : null,
          min_quantity: asset.AssetInventory
            ? asset.AssetInventory.min_quantity
            : null,
          inventory_last_updated: asset.AssetInventories
            ? asset.AssetInventories.last_updated
            : null,
          AssetInventories: undefined,
        };
      });

      resolve({
        errCode: 0,
        errMessage: "OK",
        assets: formattedAssets,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateAssetUsageAndInventory = async (bookingId, transaction) => {
  console.log(
    `[AssetService] Bắt đầu cập nhật kho cho booking_id: ${bookingId}`
  );

  const bookingDetails = await db.FieldBookingDetail.findAll({
    where: { booking_id: bookingId },
    transaction: transaction,
    raw: true,
  });
  console.log(
    `[AssetService] Bước 1: Tìm thấy ${bookingDetails.length} chi tiết đặt sân (FieldBookingDetail).`
  );

  if (!bookingDetails || bookingDetails.length === 0) {
    console.log(`[AssetService] Kết thúc sớm vì không có chi tiết đặt sân.`);
    return;
  }

  for (const detail of bookingDetails) {
    console.log(
      `[AssetService] Đang xử lý FieldBookingDetail ID: ${detail.booking_detail_id}`
    );
    const serviceBookings = await db.ServiceBooking.findAll({
      where: { booking_detail_id: detail.booking_detail_id },
      transaction: transaction,
      raw: true,
    });
    console.log(
      `[AssetService] --> Bước 2: Tìm thấy ${serviceBookings.length} đơn đặt dịch vụ (ServiceBooking) cho chi tiết này.`
    );

    for (const serviceBooking of serviceBookings) {
      const serviceBookingDetails = await db.ServiceBookingDetail.findAll({
        where: { service_booking_id: serviceBooking.service_booking_id },
        transaction: transaction,
        raw: true,
      });
      console.log(
        `[AssetService] ----> Bước 3: Tìm thấy ${serviceBookingDetails.length} chi tiết dịch vụ (ServiceBookingDetail).`
      );

      for (const serviceDetail of serviceBookingDetails) {
        console.log(
          `[AssetService] ------> Bước 4: Đang xử lý Service ID: ${serviceDetail.service_id} với số lượng: ${serviceDetail.quantity}`
        );

        const serviceInfo = await db.Service.findOne({
          where: { service_id: serviceDetail.service_id },
          transaction: transaction,
          raw: true,
        });

        if (!serviceInfo || !serviceInfo.asset_id) {
          console.log(
            `[AssetService] --------> Dịch vụ này không liên kết với tài sản nào. Bỏ qua.`
          );
          continue;
        }
        console.log(
          `[AssetService] --------> Dịch vụ này liên kết với Asset ID: ${serviceInfo.asset_id}`
        );

        const assetInfo = await db.Asset.findOne({
          where: { asset_id: serviceInfo.asset_id },
          transaction: transaction,
          raw: true,
        });

        if (!assetInfo) {
          console.log(
            `[AssetService] --------> LỖI: Không tìm thấy tài sản với ID: ${serviceInfo.asset_id}. Bỏ qua.`
          );
          continue;
        }
        console.log(
          `[AssetService] --------> Tìm thấy tài sản '${assetInfo.name}', is_trackable: ${assetInfo.is_trackable}`
        );

        const quantityUsed = serviceDetail.quantity;

        await db.AssetUsage.create(
          {
            asset_id: assetInfo.asset_id,
            service_booking_id: serviceDetail.detail_id,
            quantity_used: quantityUsed,
            status: "Đã bán",
            used_at: new Date(),
          },
          { transaction: transaction }
        );
        console.log(
          `[AssetService] ----------> Đã tạo bản ghi trong ASSET_USAGE.`
        );

        if (assetInfo.is_trackable) {
          console.log(
            `[AssetService] ----------> Tài sản cần theo dõi. Đang trừ ${quantityUsed} khỏi tồn kho.`
          );
          await db.AssetInventory.decrement("current_quantity", {
            by: quantityUsed,
            where: { asset_id: assetInfo.asset_id },
            transaction: transaction,
          });
          console.log(`[AssetService] ----------> Đã trừ tồn kho thành công.`);
        } else {
          console.log(
            `[AssetService] ----------> Tài sản không cần theo dõi. Bỏ qua trừ tồn kho.`
          );
        }
      }
    }
  }
  console.log(
    `[AssetService] Hoàn tất cập nhật kho cho booking_id: ${bookingId}`
  );
};

module.exports = {
  getAllAssets,
  updateAssetUsageAndInventory,
};
