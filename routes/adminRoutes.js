const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const  auth  = require("../middlewares/auth");

// For DEFAULT export (Option 1):
const roleCheck = require("../middlewares/roleCheck");

// For NAMED export (Option 2):
// const { roleCheck } = require("../middlewares/roleCheck");

// Admin-only routes
router.get("/vendors", auth, roleCheck(["admin"]), adminController.getAllVendors);
router.put("/vendors/approve/:id", auth, roleCheck(["admin"]), adminController.approveVendor);
router.delete("/vendors/:id", auth, roleCheck(["admin"]), adminController.deleteVendor);

router.get("/products/pending", auth, roleCheck(["admin"]), adminController.getPendingProducts);
router.put("/products/approve/:id", auth, roleCheck(["admin"]), adminController.approveProduct);
router.delete("/products/:id", auth, roleCheck(["admin"]), adminController.deleteProduct);

router.get("/users", auth, roleCheck(["admin"]), adminController.getAllUsers);
router.delete("/users/:id", auth, roleCheck(["admin"]), adminController.deleteUser);

module.exports = router;