const User = require("../models/userModel");
const Product = require("../models/productModel");

// Vendor Management
exports.getAllVendors = async (req, res) => {
  const vendors = await User.find({ role: "vendor" });
  res.json(vendors);
};

exports.approveVendor = async (req, res) => {
  const vendor = await User.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );
  res.json(vendors);
};

exports.deleteVendor = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Vendor deleted" });
};

// Product Management
exports.getPendingProducts = async (req, res) => {
  const products = await Product.find({ isApproved: false });
  res.json(products);
};

exports.approveProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};

// User Management
exports.getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" });
  res.json(users);
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};