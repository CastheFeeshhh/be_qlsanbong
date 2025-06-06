import { where } from "sequelize";
import db from "../models/index";

const getAllAssets = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let assets = await db.Asset.findAll({
        include: [
          {
            model: db.AssetInventory,
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
          inventory_last_updated: asset.AssetInventory
            ? asset.AssetInventory.last_updated
            : null,
          AssetInventory: undefined,
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

module.exports = {
  getAllAssets,
};
