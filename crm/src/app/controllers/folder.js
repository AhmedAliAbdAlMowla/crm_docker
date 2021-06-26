"use strict"
const s3Service = require("../services/s3");
const validator = require("../utils/validator/folder");
const dbConnection = require("../db/connection");
const sqlQuery = require("../db/queries").queryList;

/**
 * @desc    Get all folders
 * @Dual_routes
 *
 *          @route   GET /api/v1/client/folder
 *          @access  Private
 *
 *          @route   GET /api/v1/admin/client/folder/:clientId
 *          @access  Private/admin , Private/superAdmin
 *
 * @Query_Params pageNumber , pageSize
 */
exports.getAll = async (req, res) => {
  // pagination element
  const pageNumber = parseInt(req.query.pageNumber, 10);
  const pageSize = parseInt(req.query.pageSize, 10);
  const userId = req.params.clientId ? req.params.clientId : req.user.id;

  let total = await dbConnection.query(sqlQuery.GET_FOLDERS_COUNT, [userId]);
  total = total.rows[0].count;

  let folders = await dbConnection.query(sqlQuery.GET_ALL_FOLDERS, [
    userId,
    pageSize,
    (pageNumber - 1) * pageSize,
  ]);

  folders = folders.rows;

  res.status(200).json({
    total: parseInt(total, 10),
    folders,
  });
};
/**
 * @desc    Create new folder
 * @Dual_routes
 *
 *          @route   POST /api/v1/client/folder
 *          @access  Private
 *
 *          @route   POST /api/v1/admin/client/folder/:clientId
 *          @access  Private/admin , Private/superAdmin
 *
 */
exports.create = async (req, res) => {
  const { error } = validator.create(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const userId = req.params.clientId ? req.params.clientId : req.user.id;

  let folder = await dbConnection.query(sqlQuery.CREATE_FOLDER, [
    userId,
    req.body.folderName,
  ]);
  folder = folder.rows[0];

  res.status(201).json({
    message: "folder created",
    folder: {
      id: folder.folder_id,
      name: folder.name,
      createdAt: folder.created_at,
    },
  });
};
/**
 * @desc    Update  folder
 * @Dual_routes
 *
 *          @route   PATCH /api/v1/client/folder/:folderId
 *          @access  Private
 *
 *          @route   PATCH /api/v1/admin/client/folder/:folderId
 *          @access  Private/admin , Private/superAdmin
 *
 */

exports.update = async (req, res) => {
  if (!req.body.folderName)
    return res.status(400).json({
      message: "folder name is required !",
    });

  const result = await dbConnection.query(sqlQuery.UPDATE_FOLDER_NAME, [
    req.body.folderName,
    req.params.folderId,
  ]);

  if (result.rowCount)
    return res.status(200).json({ message: "folder updated." });

  res.status(400).json({
    message: "No valid entry found for provided ID",
  });
};
/**
 * @desc    Delete  folder
 * @Dual_routes
 *
 *          @route   DELETE /api/v1/client/folder/:folderId
 *          @access  Private
 *
 *          @route   DELETE /api/v1/super/client/folder/:folderId
 *          @access  Private/superAdmin
 *
 */
exports.delete = async (req, res) => {
 
  let files = await dbConnection.query(sqlQuery.GET_MANY_FILE, [
    req.params.folderId,
  ]);
  files = files.rows;

  if (files.length) {
    await s3Service.deleteManyFiles(files);
    await dbConnection.query(sqlQuery.DELETE_MANY_FILE, [req.params.folderId]);
  }

  await dbConnection.query(sqlQuery.DELETE_ONE_FOLDER, [req.params.folderId]);

  res.status(200).json({
    message: "folder deleted.",
  });
};
