const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const auth = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../Uploads');
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, uploadPath);
    });
  },
  filename: (req, file, cb) => {
    const filename = `image-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Add product with Cloudinary upload
router.post('/add', auth(['vendor']), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    
    // Validation
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Name, description, and price are required' });
    }
    
    if (isNaN(parseFloat(price))) {
      return res.status(400).json({ message: 'Price must be a valid number' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'product_images',
      quality: 'auto:good'
    });

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    // Create product
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      image: result.secure_url,
      cloudinaryPublicId: result.public_id,
      vendorId: req.user.id,
    });

    await product.save();

    // Send approval email to admin
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS 
        },
      });
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || 'admin@example.com',
        subject: 'New Product Added',
        html: `
          <h2>New Product Pending Approval</h2>
          <p><strong>Product Name:</strong> ${name}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Price:</strong> $${price}</p>
          <p><strong>Image:</strong></p>
          <img src="${result.secure_url}" alt="${name}" style="max-width: 300px;">
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/products/pending">
            Review in Admin Panel
          </a></p>
        `,
      });
    }

    res.status(201).json({ 
      message: 'Product added, pending approval', 
      product 
    });
  } catch (error) {
    console.error('Add product error:', error);
    // Clean up file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      message: error.message || 'Failed to add product' 
    });
  }
});

// Get vendor's products
router.get('/my-products', auth(['vendor']), async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.user.id });
    res.json(products.map(p => ({
      ...p.toObject(),
      status: p.isApproved ? 'approved' : 'pending'
    })));
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Approve product (admin)
router.put('/approve/:id', auth(['admin']), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product approved', product });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete product (admin) with Cloudinary cleanup
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete from Cloudinary if public_id exists
    if (product.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(product.cloudinaryPublicId);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get pending products (admin)
router.get('/pending', auth(['admin']), async (req, res) => {
  try {
    const products = await Product.find({ isApproved: false });
    res.json(products.map(p => ({
      ...p.toObject(),
      id: p._id,
      status: 'pending'
    })));
  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get approved products (public)
router.get('/approved', async (req, res) => {
  try {
    const products = await Product.find({ isApproved: true });
    res.json(products);
  } catch (error) {
    console.error('Get approved products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;