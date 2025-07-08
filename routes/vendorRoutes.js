const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");
const auth = require("../middlewares/auth");
const roleCheck = require("../middlewares/roleCheck");

// Vendor-only routes
router.post("/products", auth, roleCheck(["vendor"]), vendorController.addProduct);
router.get("/products", auth, roleCheck(["vendor"]), vendorController.getMyProducts);
router.put("/products/:id", auth, roleCheck(["vendor"]), vendorController.updateProduct);
router.delete("/products/:id", auth, roleCheck(["vendor"]), vendorController.deleteProduct);

router.get("/orders", auth, roleCheck(["vendor"]), vendorController.getMyOrders);
router.put("/orders/:id/status", auth, roleCheck(["vendor"]), vendorController.updateOrderStatus);

module.exports = router;