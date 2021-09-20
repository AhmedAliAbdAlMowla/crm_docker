"use strict";
const {
  updateValidator,
  loginValidator,
  signupValidator,
} = require("../utils/validator/user");
const dbConnection = require("../db/connection");
const sqlQuery = require("../db/queries").queryList;
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const s3Service = require("../services/s3");
const crypto = require("crypto");
const Email = require("../services/email");
const accountTableKey = require("../config/constants").accountTableKey;
const { defultProfileImage } = require("../config/constants");
/**
 * @desc    Login user
 * @route   POST /api/v1/users/login
 * @access  Public
 */
exports.login = async (req, res) => {
  const { error } = loginValidator(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });
  let account = await dbConnection.query(sqlQuery.GET_DATA_FOR_LOGIN, [
    req.body.email,
  ]);

  account = account.rows[0];
  if (!account)
    return res.status(400).json({ message: "Invalid email or password." });

  const validPassword = await bcrypt.compare(
    req.body.password,
    account.password
  );
  if (!validPassword)
    return res.status(400).json({ message: "Invalid  password." });
  const token = JWT.sign(
    {
      id: account.user_id,
      name: account.first_name + " " + account.last_name,
      role: account.role,
    },
    process.env.JWT_PRIVIAT_KEY,
    {
      expiresIn: "20h",
    }
  );

  res.status(200).json({ message: "succes Auth", token: token });
};
/**
 * @desc    Signup user
 * @route   POST /api/v1/users/signup
 * @access  Private/admin
 */
exports.signup = async (req, res) => {
  const { error } = signupValidator(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const email_exist = await dbConnection.query(sqlQuery.CHECK_EMAIL_IS_EXIST, [
    req.body.email,
  ]);
  if (email_exist.rows[0].count == 1)
    return res.status(400).json({ message: "User already exists." });
  // hashing password
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  const accountData = [
    req.body.firstName,
    req.body.lastName,
    req.body.password,
    req.body.email,
    req.body.phoneNumber,
  ];

  //  create account
  let result = await dbConnection.query(sqlQuery.CREATE_ACCOUNT, accountData);
  result = result.rows[0];
  // create client_tasks_state_repositry
  await dbConnection.query(sqlQuery.CREATE_TASKS_STATE_REPOSITORY, [
    result.user_id,
  ]);

  await dbConnection.query(sqlQuery.CREATE_ACCOUNT_PROFILE_IMAGE, [
    result.user_id,
    defultProfileImage.link,
    defultProfileImage.s3_key,
  ]);

  res.status(201).json({
    message: "Account created.",
  });
};

/**
 * @desc    Get user profile data
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
exports.getUser = async (req, res) => {
  const accountData = await dbConnection.query(sqlQuery.GET_ACCOUNT_DATA, [
    req.user.id,
  ]);

  res.status(200).json({
    userData: accountData.rows[0],
  });
};

/**
 * @desc    Update user profile data
 * @route   PATCH /api/v1/users/profile
 * @access  Private
 */
exports.updateUser = async (req, res) => {
  // validateProduct body
  const { error } = updateValidator(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  // update
  let updateCol = {};
  let updateDate = [];
  Object.keys(req.body).forEach(function (key) {
    updateCol[accountTableKey[key]] = "";
    updateDate.push(req.body[key]);
  });


  const result = await dbConnection.query(
    sqlQuery.UPDATE_ACCOUNT_DATA(req.user.id, "account", updateCol),
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
 * @desc    Update user password
 * @route   PATCH /api/v1/users/account/password
 * @access  Private
 */
exports.updatePassword = async (req, res) => {
  // validate newPassword
  const { error } = updateValidator({ password: req.body.newPassword });

  if (error) return res.status(400).json({ message: error.details[0].message });

  let user = await dbConnection.query(sqlQuery.GET_ACCOUNT_PASSWORD, [
    req.user.id,
  ]);
  const oldPassword = user.rows[0].password;

  // check old password
  const validPassword = await bcrypt.compare(req.body.password, oldPassword);

  if (!validPassword)
    return res.status(401).json({ message: "Invalid  old password." });
  // hashing new password
  const salt = await bcrypt.genSalt(10);
  req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);
  await dbConnection.query(sqlQuery.UPDATE_ACCOUNT_PASSWORD, [
    req.body.newPassword,
    req.user.id,
  ]);
  res.status(200).json({ message: "password updated." });
};

/**
 * @desc    Upload profile image
 * @route   POST /api/v1/users/profile/image
 * @access  Private
 */
exports.uploadProfileImage = async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ message: "You shoud send file in form-data." });

  const userImage = await dbConnection.query(
    sqlQuery.GET_ACCOUNT_PROFILE_IMAGE,
    [req.user.id]
  );

  if (
    userImage.rows[0] &&
    userImage.rows[0].s3_key != defultProfileImage.s3_key
  )
    await s3Service.deleteOne(userImage.rows[0]);

  const imageData = await s3Service.uploadFile(req.file);

  await dbConnection.query(sqlQuery.UPDATE_ACCOUNT_PROFILE_IMAGE, [
    imageData.fileLink,
    imageData.s3_key,
    req.user.id,
  ]);

  res.status(200).json({
    message: "Successful upload",
    link: imageData.fileLink,
  });
};

//  Forgot Password

/**
 * @desc    Recover  account
 * @route   POST /api/v1/user/account/recover
 * @access  Public
 */
exports.recover = async (req, res) => {
  const { error } = updateValidator({ email: req.body.email });
  if (error) return res.status(400).json({ error: error.details[0].message });

  let user = await dbConnection.query(sqlQuery.GET_ACCOUNT_BY_EMAIL, [
    req.body.email,
  ]);

  if (!user.rows.length)
    return res.status(401).json({
      message:
        "The email address " +
        req.body.email +
        " is not associated with any account. Double-check your email address and try again.",
    });

  //Generate and set password reset code
  const resetPasswordToken = crypto.randomBytes(3).toString("hex");
  let resetPasswordExpires = Date.now() + 1200000; //expires in an 20 minutes

  await dbConnection.query(sqlQuery.UPDATE_PASSWORD_VERIFICATION_TOKEN, [
    resetPasswordToken,
    resetPasswordExpires,
    user.rows[0].user_id,
  ]);

  //  Send mail

  const emailText = "The password reset code is : " + resetPasswordToken;
  const emailSubject = "(PROTOQIT) Sending code to confirm change password :";
  await Email.sendMail(emailSubject, emailText, req.body.email);

  res.status(200).json({ message: " Send password reset code is success." });
};

/**
 * @desc    Check recover token
 * @route   POST /api/v1/user/account/token/check
 * @access  Public
 */
exports.checkToken = async (req, res) => {
  const user = await dbConnection.query(sqlQuery.CHECH_TOKENT_IS_FIND, [
    req.body.token,
  ]);

  if (!user.rows.length)
    return res
      .status(401)
      .json({ message: "Password reset token is invalid or has expired." });

  const resetPasswordExpires = user.rows[0].reset_password_expires.getTime();

  if (resetPasswordExpires < Date.now())
    return res
      .status(401)
      .json({ message: "Password reset token has expired." });

  return res.status(200).json({ message: "Token auth is success." });
};
/**
 * @desc    Reset password
 * @route   POST /api/v1/user/account/password/reset
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  // validate newPassword
  const { error } = updateValidator({ password: req.body.password });

  if (error) return res.status(400).json({ message: error.details[0].message });

  const user = await dbConnection.query(sqlQuery.CHECH_TOKENT_IS_FIND, [
    req.body.token,
  ]);

  if (!user.rows.length)
    return res
      .status(401)
      .json({ message: "Password reset token is invalid or has expired." });

  const resetPasswordExpires = user.rows[0].reset_password_expires.getTime();

  if (resetPasswordExpires < Date.now())
    return res
      .status(401)
      .json({ message: "Password reset token has expired." });

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  await dbConnection.query(sqlQuery.RESET_ACCOUNT_PASSWORD, [
    req.body.password,
    req.body.token,
  ]);

  res.status(200).json({ message: "Your password has been updated." });
};

//      just for super admin

/**
 * @desc    Delete user
 * @route   POST /api/v1/super/user/:userId
 * @access  Private/superAdmin
 */
exports.delete = async (req, res) => {
  const userId = req.params.userId;
  try {
    await dbConnection.query("BEGIN;");
    // delete folders and files
    // --------------------------------------------------------------------
    let foldersIds = await dbConnection.query(sqlQuery.GET_ALL_FOLDERS_IDS, [
      userId,
    ]);
    foldersIds = foldersIds.rows;

    // delete files
    for (let i in foldersIds) {
      let filesKeys = await dbConnection.query(sqlQuery.GET_FILES_S3_KEY, [
        foldersIds[i].folder_id,
      ]);
      filesKeys = filesKeys.rows;
      await s3Service.deleteManyFiles(filesKeys);
      await dbConnection.query(sqlQuery.DELETE_ALL_FILES_BY_FOLDER_ID, [
        foldersIds[i].folder_id,
      ]);
    }

    // delete folders
    await dbConnection.query(sqlQuery.DELETE_ALL_FOLDERS_BY_USER_ID, [userId]);
    // --------------------------------------------------------------------
    // delete projects and tasks
    let projectsIds = await dbConnection.query(sqlQuery.GET_ALL_PROJECTS_IDS, [
      userId,
    ]);
    projectsIds = projectsIds.rows;
    // delete tasks
    for (let i in projectsIds) {
      await dbConnection.query(sqlQuery.DELETE_ALL_TASKS_FOR_PROJECT, [
        projectsIds[i].pr_id,
      ]);
      // delete project worhing period
      await dbConnection.query(
        sqlQuery.DELETE_ALL_PROJECT_WORKING_PERIOD_BY_PROJECT_ID,
        [projectsIds[i].pr_id]
      );
    }

    // delete project
    await dbConnection.query(sqlQuery.DELETE_ALL_PROJECTS_BY_USER_ID, [userId]);
    // --------------------------------------------------------------------
    // dekete user_tasks_state
    await dbConnection.query(sqlQuery.DELETE_CLIENT_TASKS_STATE_BY_USER_ID, [
      userId,
    ]);
    // check if profile image is defult
    let profileImageS3Key = await dbConnection.query(
      sqlQuery.GET_PROFILE_IMAGE_S3_KEY,
      [userId]
    );

    profileImageS3Key = profileImageS3Key.rows[0].s3_key;
    // delete user profile image
    if (profileImageS3Key != defultProfileImage.s3_key)
      await s3Service.deleteOne({ s3_key: profileImageS3Key });
    await dbConnection.query(sqlQuery.DELETE_PROFILE_IMAGE_BY_USER_ID, [
      userId,
    ]);
    // delete user account
    await dbConnection.query(sqlQuery.DELETE_USER_ACCOUNT_BY_USER_ID, [userId]);

    await dbConnection.query("COMMIT;");
  } catch (err) {
    console.log(err);
    await dbConnection.query("ROLLBACK;");
    return res.status(400).json({
      message: "No valid entry found for provided ID",
    });
  }

  res.status(200).json({
    message: "User deleted",
  });
};
