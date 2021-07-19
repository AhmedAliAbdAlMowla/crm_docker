"use strict";
const validator = require("../utils/validator/project");
const dbConnection = require("../db/connection");
const sqlQuery = require("../db/queries").queryList;

/**
 * @desc    Get all project
 * @Dual_routes
 *
 *          @route   GET /api/v1/client/project
 *          @access  Private
 *
 *          @route   GET /api/v1/admin/client/project/:clientId
 *          @access  Private/admin , Private/superAdmin
 */
module.exports.getAll = async (req, res) => {
  const userId = req.params.clientId ? req.params.clientId : req.user.id;
  let projects = await dbConnection.query(sqlQuery.GET_ALL_PROJECTS, [userId]);

  projects = projects.rows;
  res.status(200).json({
    total: projects.length,
    projects,
  });
};

/**
 * @desc    Create project
 * @route   Post /api/admin/client/project/:clientId
 * @access  Private/admin , Private/superAdmin
 */

module.exports.create = async (req, res) => {
  const { error } = validator.create(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const clientId = req.params.clientId;
  const pr_data = req.body;
  let project = await dbConnection.query(
    sqlQuery.CREATE_PROJECT,

    [
      clientId,
      pr_data.name,
      pr_data.type,
      pr_data.budget,
      pr_data.startDate,
      pr_data.timeLine,
      pr_data.streetAddress,
      pr_data.city,
      pr_data.state,
      pr_data.zip,
    ]
  );
  project = project.rows[0];
  res.status(201).json({ message: "project created", project });
};

/**
 * @desc    Delete project
 * @route   Delete /api/admin/client/project/delete/:projectId
 * @access  Private/Admin
 */
module.exports.delete = async (req, res) => {
  try {
    await dbConnection.query("BEGIN;");
    let doneTasksCount = await dbConnection.query(
      sqlQuery.GET_ALL_TASKS_DONE_COUNT,
      [req.params.projectId]
    );
    doneTasksCount = doneTasksCount.rows[0].count;
    let allTasksCount = await dbConnection.query(sqlQuery.GET_ALL_TASKS_COUNT, [
      req.params.projectId,
    ]);
    allTasksCount = allTasksCount.rows[0].count;

    let user_id = await dbConnection.query(
      sqlQuery.GET_USER_ID_USING_PROJECT_ID,
      [req.params.projectId]
    );

    user_id = user_id.rows[0].user_id;

    await dbConnection.query(
      sqlQuery.DECREMENT_REPOSITORY_TOTAL_TASKS_DONE_FOR_DELETE,
      [doneTasksCount, user_id]
    );

    await dbConnection.query(
      sqlQuery.DECREMENT_REPOSITORY_TOTAL_TASKS_FOR_DELETE,
      [allTasksCount, user_id]
    );

    await dbConnection.query(sqlQuery.DELETE_TASKS, [req.params.projectId]);

    await dbConnection.query(sqlQuery.DELETE_ONE_PROJECT, [
      req.params.projectId,
    ]);
    await dbConnection.query("COMMIT;");
  } catch (err) {
    await dbConnection.query("ROLLBACK;");
    return res.status(400).json({
      message: "No valid entry found for provided ID",
    });
  }

  res.status(200).json({ message: "Project deleted." });
};
