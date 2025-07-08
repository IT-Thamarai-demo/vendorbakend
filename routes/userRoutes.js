const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const  auth  = require("../middlewares/auth");
const  roleCheck  = require("../middlewares/roleCheck");



// User-only routes
router.get("/profile", auth, roleCheck(["user"]), userController.getProfile);
router.put("/profile", auth, roleCheck(["user"]), userController.updateProfile);

router.post("/cart", auth, roleCheck(["user"]), userController.addToCart);
router.get("/cart", auth, roleCheck(["user"]), userController.getCart);
router.delete("/cart/:id", auth, roleCheck(["user"]), userController.removeFromCart);

router.post("/orders", auth, roleCheck(["user"]), userController.createOrder);
router.get("/orders", auth, roleCheck(["user"]), userController.getMyOrders);

module.exports = router;