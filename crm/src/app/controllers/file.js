"use strict"
const s3Service = require("../services/s3");
const dbConnection = require("../db/connection");
const sqlQuery = require("../db/queries").queryList;
/**
 * @desc    Get all files
 * @route   GET /api/v1/client/file/:folderId
 * @access  Private
 * @Query_Params pageNumber , pageSize
 */
module.exports.getAll = async (req, res, next) => {
  // pagination element
  const pageNumber = parseInt(req.query.pageNumber, 10);
  const pageSize = parseInt(req.query.pageSize, 10);

  let total = await dbConnection.query(sqlQuery.GET_FILES_COUNT, [
    req.params.folderId,
  ]);
  total = total.rows[0].count;

  let files = await dbConnection.query(sqlQuery.GET_ALL_FILES, [
    req.params.folderId,
    pageSize,
    (pageNumber - 1) * pageSize,
  ]);
 
  files = files.rows;

  res.status(200).json({
    total: parseInt(total, 10),
    files,
  });
};
/**
 * @desc    Create new file
 * @route   POST /api/v1/client/file/:folderId
 * @access  Private
 */
module.exports.create = async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ message: "You shoud send file in form-data." });

  const fileData = await s3Service.uploadFile(req.file);

  let file = await dbConnection.query(sqlQuery.CREATE_FILE, [
    req.params.folderId,
    fileData.fileLink,
    fileData.s3_key,
    fileData.originalName,
    fileData.extension,
  ]);
  file = file.rows[0];

  return res.status(201).json({
    message: "file uploaded.",
    file: {
      id: file.file_id,
      fileLink: fileData.fileLink,
      originalName: fileData.originalName,
      extension: fileData.extension,
      createdAt: file.created_at,
    },
  });
};
/**
 * @desc    Update  file data
 * @route   PATCH /api/v1/client/file/:fileId
 * @access  Private
 */
module.exports.update = async (req, res) => {
  if (!req.body.fileName)
    return res.status(400).json({
      message: "file name is required !",
    });

  const result = await dbConnection.query(sqlQuery.UPDATE_FILE_NAME, [
    req.body.fileName,
    req.params.fileId,
  ]);
  if (result.rowCount)
    return res.status(200).json({ message: "file updated." });

  res.status(400).json({
    message: "No valid entry found for provided ID",
  });
};

/**
 * @desc    Delete  file
 * @Dual_routes
 *
 *          @route   DELETE /api/v1/client/file/:fileId
 *          @access  Private
 *
 *          @route   DELETE /api/v1/super/client/file/:fileId
 *          @access  Private/superAdmin
 *
 */
module.exports.delete = async (req, res) => {
  const file = await dbConnection.query(sqlQuery.GET_ONE_FILE,[req.params.fileId]);

  if (!file.rowCount)
    return res.status(400).json({
      message: "No valid entry found for provided ID",
    });
  //  delete file from server first
  await s3Service.deleteOne(file.rows[0]);

  // delete file from file map in db second
  await dbConnection.query(sqlQuery.DELETE_ONE_FILE,[req.params.fileId]);
  res.status(200).json({ message: "file deleted." });
};
