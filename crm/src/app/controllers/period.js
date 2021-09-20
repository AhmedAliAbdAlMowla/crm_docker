"use strict";
const validator = require("../utils/validator/period");
const dbConnection = require("../db/connection");
const sqlQuery = require("../db/queries").queryList;

/**
 * @desc    Get all project work period
 * @route   GET /api/v1/admin/client/period/:projectId
 * @access  Private/admin , Private/superAdmin
 *
 */
module.exports.getAll = async (req, res) => {
  let totalHours = await dbConnection.query(
    sqlQuery.GET_TOTAL_WORKING_HOURS_FOR_PROJECT,
    [req.params.projectId]
  );

  totalHours = totalHours.rows[0];

  let periods = await dbConnection.query(
    sqlQuery.GET_ALL_WORKING_PERIODS_FOR_PROJECT,
    [req.params.projectId]
  );
  periods = periods.rows;

  res.status(200).json({
    totalHours: totalHours.total,
    periods,
  });
};

/**
 * @desc    Create Period
 * @route   Post /api/admin/client/period/:projectId
 * @access  Private/admin , Private/superAdmin
 */
module.exports.create = async (req, res) => {

  const { error } = validator.create(req.body);
  if (error)
    return res.status(400).json({
      message: error.details[0].message,
    });
  console.log(req.body.date);

  await dbConnection.query(sqlQuery.CREATE_WORKING_PERIOD, [
    req.params.projectId,
    req.body.hours,
    req.body.description,
    req.body.date,
  ]);

  res.status(201).json({
    message: "period created",
  });
};

/**
 * @desc    Delete Period
 * @route   Delete /api/v1/admin/client/period/:periodId
 * @access  Private/admin , Private/superAdmin
 */
module.exports.delete = async (req, res) => {
  await dbConnection.query(sqlQuery.DELETE_WORKING_PERIOD, [
    req.params.periodId,
  ]);

  res.status(200).json({ message: "Period deleted." });
};
