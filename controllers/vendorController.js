const Product = require("../models/productModel");


// Product Management
exports.addProduct = async (req, res) => {
    const { name, price, description, category, stock } = req.body;
    const product = await Product.create({
        name,
        price,
        description,
        category,
        stock,
        vendor: req.user.id,
        isApproved: false, // Requires admin approval
    });
    res.status(201).json(product);
};

exports.getMyProducts = async (req, res) => {
    const products = await Product.find({ vendor: req.user.id });
    res.json(products);
};

exports.updateProduct = async (req, res) => {
    const product = await Product.findOneAndUpdate(
        { _id: req.params.id, vendor: req.user.id },
        req.body,
        { new: true }
    );
    res.json(product);
};

exports.deleteProduct = async (req, res) => {
    await Product.findOneAndDelete({ _id: req.params.id, vendor: req.user.id });
    res.json({ message: "Product deleted" });
};


