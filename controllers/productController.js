const Product = require("../models/productModel");

// Public endpoints
exports.getAllProducts = async (req, res) => {
  const products = await Product.find({ isApproved: true });
  res.json(products);
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
};

// Protected endpoints (used by Admin/Vendor)
exports.createProduct = async (req, res) => {
  const product = await Product.create({
    ...req.body,
    vendor: req.user.id,
  });
  res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};