// Option 1: Default export (recommended)
const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied." });
    }
    next();
  };
};

module.exports = roleCheck;

// Option 2: Named export (alternative)
// exports.roleCheck = (roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ error: "Access denied." });
//     }
//     next();
//   };
// };