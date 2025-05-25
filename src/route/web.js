import express from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
import bookingController from "../controllers/bookingController";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";
const verifyToken = require("../middleware/verifyToken");

let router = express.Router();

let initWebRoutes = (app) => {
  router.get("/", homeController.getHomePage);
  router.get("/about", homeController.getAboutPage);

  router.get("/crud", homeController.getCRUD);
  router.post("/post-crud", homeController.postCRUD);
  router.get("/get-crud", homeController.displayGetCRUD);
  router.get("/edit-crud", homeController.getEditCRUD);
  router.post("/put-crud", homeController.putCRUD);
  router.get("/delete-crud", homeController.deleteCRUD);

  router.post("/api/login", userController.handleLogin);
  router.get(
    "/api/get-all-users",
    verifyToken,
    userController.handleGetAllUsers
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

  router.get("/api/protected", authenticateToken, (req, res) => {
    res.json({ message: "You are authenticated!", user: req.user });
  });

  router.get(
    "/api/admin-only",
    authenticateToken,
    authorizeRoles(1), // ví dụ: role_id = 1 là admin
    (req, res) => {
      res.json({ message: "Welcome admin!" });
    }
  );

  return app.use("/", router);
};

module.exports = initWebRoutes;
