"use strict";
const Validator = require("../utils/validator/user");
const dbConnection = require("../db/connection");
const sqlQuery = require("../db/queries").queryList;
const accountTableKey = require("../config/constants").accountTableKey;

/**
 * @desc    Update user profile data
 * @route   PATCH  /api/v1/super/user/profile/:usertId
 * @access  Private/superAdmin
 */
exports.updateUserProfile = async (req, res) => {
  // validateProduct body
  const { error } = Validator.updateForSuperAdminValidator(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  // update
  let updateCol = {};
  let updateDate = [];
  //         bind update key
  Object.keys(req.body).forEach(function (key) {
    updateCol[accountTableKey[key]] = "";
    updateDate.push(req.body[key]);
  });

  const result = await dbConnection.query(
    sqlQuery.UPDATE_ACCOUNT_DATA(req.params.userId, "account", updateCol),
    updateDate
  );

  if (result.rowCount) {
    return res.status(200).json({
      message: "Successful  update",
    });
  } else {
    return res
      .status(400)
      .json({ message: "No valid entry found for provided ID" });
  }
};

/**
 * @desc    Get user profile data
 * @route   GET /api/v1/super/user/profile/:clientId
 * @access  Private/superAdmin
 */
exports.getOneUser = async (req, res) => {
  const result = await dbConnection.query(sqlQuery.GET_ONE_USER_BY_ID, [
    req.params.userId,
  ]);

  if (result.rows.length) return res.status(200).json({ user: result.rows[0] });

  res.status(400).json({ message: "No valid entry found for provided ID" });
};
