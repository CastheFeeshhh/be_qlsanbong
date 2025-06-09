import express from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
import bookingController from "../controllers/bookingController";
import assetController from "../controllers/assetController";
import invoiceController from "../controllers/invoiceController";
import supplierController from "../controllers/supplierController";
import fieldController from "../controllers/fieldController";
import serviceController from "../controllers/serviceController";
import statisticsController from "../controllers/statisticsController";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";
import passport from "passport";
const verifyToken = require("../middleware/verifyToken");
import jwt from "jsonwebtoken";
const vnpayController = require("../controllers/vnpayController");

let router = express.Router();

let initWebRoutes = (app) => {
  router.get("/", homeController.getHomePage);

  router.get("/crud", homeController.getCRUD);
  router.post("/post-crud", homeController.postCRUD);
  router.get("/get-crud", homeController.displayGetCRUD);
  router.get("/edit-crud", homeController.getEditCRUD);
  router.post("/put-crud", homeController.putCRUD);
  router.get("/delete-crud", homeController.deleteCRUD);

  router.post("/api/login", userController.handleLogin);
  router.post("/api/register", userController.handleRegister);
  router.post("/api/forgot-password", userController.handleForgotPassword);
  router.get("/api/reset-password", userController.handleVerifyResetToken);
  router.post("/api/reset-password", userController.handleResetPassword);

  router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      session: true,
      failureRedirect: `${process.env.FRONTEND_URL}/login?status=error&message=Đăng nhập Google thất bại.`,
    }),
    (req, res) => {
      const token = jwt.sign(
        {
          user_id: req.user.user_id,
          email: req.user.email,
          role_id: req.user.role_id,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          avatar: req.user.avatar,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/login?token=${token}&user_id=${
          req.user.user_id
        }&role_id=${req.user.role_id}&first_name=${encodeURIComponent(
          req.user.first_name || ""
        )}&last_name=${encodeURIComponent(
          req.user.last_name || ""
        )}&avatar=${encodeURIComponent(req.user.avatar || "")}`
      );
    }
  );

  router.get(
    "/auth/facebook",
    passport.authenticate("facebook", { scope: ["email", "public_profile"] })
  );

  router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
      session: true,
      failureRedirect: `${
        process.env.FRONTEND_URL
      }/login?status=error&message=${encodeURIComponent(
        "Đăng nhập Facebook thất bại!"
      )}`,
    }),
    (req, res) => {
      const user = req.user;
      const token = jwt.sign(
        {
          user_id: user.user_id,
          email: user.email,
          role_id: user.role_id,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/login?token=${token}` +
          `&user_id=${user.user_id}` +
          `&role_id=${user.role_id}` +
          `&first_name=${encodeURIComponent(user.first_name || "")}` +
          `&last_name=${encodeURIComponent(user.last_name || "")}` +
          `&avatar=${encodeURIComponent(user.avatar || "")}`
      );
    }
  );

  router.get("/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return console.error(err);
      }
      res.clearCookie("jwt");
      req.session.destroy((err) => {
        if (err) {
          return console.error(err);
        }
        res.redirect("http://localhost:3000/login");
      });
    });
  });

  router.get(
    "/api/get-all-users",
    // verifyToken,
    // authorizeRoles(1),
    userController.handleGetAllUsers
  );

  router.get(
    "/api/get-all-admins",
    verifyToken,
    authorizeRoles(1),
    userController.handleGetAllAdmins
  );

  router.get(
    "/api/get-all-staffs",
    verifyToken,
    authorizeRoles(1),
    userController.handleGetAllStaffs
  );

  router.get(
    "/api/get-all-customers",
    verifyToken,
    authorizeRoles(1, 2),
    userController.handleGetAllCustomers
  );

  router.get(
    "/api/get-all-suppliers",
    verifyToken,
    authorizeRoles(1, 2),
    supplierController.handleGetAllSuppliers
  );

  router.get(
    "/api/get-all-assets",
    // verifyToken,
    // authorizeRoles(1, 2),
    assetController.handleGetAllAssets
  );

  router.get(
    "/api/get-all-invoices",
    // verifyToken,
    // authorizeRoles(1, 2),
    invoiceController.handleGetAllInvoices
  );

  router.get(
    "/api/get-all-asset-invoices",
    verifyToken,
    authorizeRoles(1, 2),
    invoiceController.handleGetAllAssetInvoices
  );

  router.get(
    "/api/get-invoice-details",
    invoiceController.handleGetInvoiceDetails
  );

  router.post(
    "/api/create-new-user",
    verifyToken,
    userController.handleCreateNewUser
  );
  router.put("/api/edit-user", verifyToken, userController.handleEditUser);
  router.delete(
    "/api/delete-user",
    verifyToken,
    userController.handleDeleteUser
  );

  router.get(
    "/api/get-booking-history",
    verifyToken,
    bookingController.handleGetBookingHistory
  );

  router.post(
    "/api/change-password",
    verifyToken,
    userController.handleChangePassword
  );

  router.get("/api/get-all-fields", bookingController.handleGetAllFields);
  router.get("/api/get-all-services", bookingController.handleGetAllServices);
  router.get("/api/get-all-schedules", bookingController.handleGetAllSchedules);

  router.post("/api/add-new-booking", bookingController.handleAddNewBooking);
  router.post(
    "/api/add-detail-booking",
    bookingController.handleAddDetailBooking
  );
  router.post(
    "/api/add-new-service-booking",
    bookingController.handleAddNewServiceBooking
  );
  router.post(
    "/api/add-service-booking-detail",
    bookingController.handleAddServiceBookingDetail
  );

  router.post(
    "/api/vnpay/create_payment_url",
    vnpayController.createVnpayPayment
  );

  router.get("/api/vnpay/ipn", (req, res, next) => {
    console.log(">>> ĐÃ NHẬN REQUEST TỚI /api/vnpay/ipn");
    console.log(">>> Query params:", req.query);
    vnpayController.handleVnpayIPN(req, res, next);
  });

  router.get("/api/vnpay/return", vnpayController.handleVnpayReturn);

  router.post(
    "/api/create-new-supplier",
    verifyToken,
    authorizeRoles(1, 2),
    supplierController.handleCreateNewSupplier
  );

  router.put(
    "/api/edit-supplier",
    verifyToken,
    authorizeRoles(1, 2),
    supplierController.handleEditSupplier
  );
  router.delete(
    "/api/delete-supplier",
    verifyToken,
    authorizeRoles(1, 2),
    supplierController.handleDeleteSupplier
  );

  router.post(
    "/api/create-new-field",
    verifyToken,
    authorizeRoles(1, 2),
    fieldController.handleCreateNewField
  );
  router.put(
    "/api/edit-field",
    verifyToken,
    authorizeRoles(1, 2),
    fieldController.handleEditField
  );
  router.delete(
    "/api/delete-field",
    verifyToken,
    authorizeRoles(1, 2),
    fieldController.handleDeleteField
  );

  router.post(
    "/api/create-new-asset",
    verifyToken,
    authorizeRoles(1, 2),
    assetController.handleCreateNewAsset
  );
  router.put(
    "/api/edit-asset",
    verifyToken,
    authorizeRoles(1, 2),
    assetController.handleEditAsset
  );
  router.delete(
    "/api/delete-asset",
    verifyToken,
    authorizeRoles(1, 2),
    assetController.handleDeleteAsset
  );

  router.post(
    "/api/create-new-service",
    verifyToken,
    authorizeRoles(1, 2),
    serviceController.handleCreateNewService
  );

  router.put(
    "/api/edit-service",
    verifyToken,
    authorizeRoles(1, 2),
    serviceController.handleEditService
  );
  router.delete(
    "/api/delete-service",
    verifyToken,
    authorizeRoles(1, 2),
    serviceController.handleDeleteService
  );

  router.get(
    "/api/statistics/revenue",
    verifyToken,
    authorizeRoles(1, 2),
    statisticsController.handleGetRevenueStats
  );

  return app.use("/", router);
};

module.exports = initWebRoutes;
