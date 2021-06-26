"use strict"
/**
 * @desc     Auth admin middleware
 */
module.exports = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "superAdmin") // moderator have all admin methods
    return res.status(403).json({
      message: "Access denied.",
    });
  next();
};
