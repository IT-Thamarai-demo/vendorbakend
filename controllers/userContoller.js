const User = require("../models/userModel");
// Profile Management
exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
};

exports.updateProfile = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
    }).select("-password");
    res.json(user);
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
};