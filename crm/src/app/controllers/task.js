"use strict";
const validator = require("../utils/validator/task");
const Email = require("../services/email");
const Sms = require("../services/sms");
const constants = require("../config/constants");
const dbConnection = require("../db/connection");
const sqlQuery = require("../db/queries").queryList;
/**
 * @desc    Get all Tasks
 * @Dual_routes
 *
 *          @route   GET /api/v1/client/task/:projectId
 *          @access  Private
 *
 *          @route   GET /api/v1/admin/client/task/:projectId
 *          @access  Private/admin , Private/superAdmin
 *@Query_Params pageNumber, pageSize
 */
module.exports.getAll = async (req, res) => {
    let totalDone = await dbConnection.query(sqlQuery.GET_ALL_TASKS_DONE_COUNT, [
        req.params.projectId,
    ]);
    totalDone = totalDone.rows[0].count;

    let tasks = await dbConnection.query(sqlQuery.GET_ALL_TASKS, [
        req.params.projectId,
    ]);
    tasks = tasks.rows;
    res.status(200).json({
        totalDone: parseInt(totalDone, 10),
        total: tasks.length,
        tasks,
    });
};
/**
 * @desc    Create Task
 * @route   Post /api/admin/client/task/:projectId
 * @access  Private/admin , Private/superAdmin
 */
module.exports.create = async (req, res) => {
    const {
        error
    } = validator.create(req.body);
    if (error)
        return res.status(400).json({
            message: error.details[0].message,
        });

    let task;

    try {
        await dbConnection.query("BEGIN;");

        task = await dbConnection.query(sqlQuery.CREATE_TASK, [
            req.params.projectId,
            req.body.name,
            req.body.description,
        ]);
        task = task.rows[0];

        let clientId = await dbConnection.query(
            sqlQuery.GET_USER_ID_USING_PROJECT_ID,
            [req.params.projectId]
        );

        clientId = clientId.rows[0].user_id;
        await dbConnection.query(sqlQuery.INCREMENT_REPOSITORY_TOTAL_TASKS, [
            clientId,
        ]);
        await dbConnection.query("COMMIT;");
    } catch (err) {
        await dbConnection.query("ROLLBACK;");
        return res.status(400).json({
            message: "No valid entry found for provided ID",
        });
    }
    res.status(201).json({
        message: "task created",
        task: {
            taskId: task.ts_id,
            doneState: task.done,
        },
    });
};
/**
 * @desc    Update Task
 * @route   Patch /api/admin/client/task/:taskId
 * @access  Private/admin , Private/superAdmin
 */
module.exports.update = async (req, res) => {
    // validate body
    if (req.body.status != "true" && req.body.status != "false")
        return res.status(400).json({
            message: "Bad body",
        });
    let user_id;
    // update
    try {
        await dbConnection.query("BEGIN;");
        await dbConnection.query(sqlQuery.UPDATE_TASK_STAT, [
            req.body.status,
            req.params.taskId,
        ]);

        user_id = await dbConnection.query(sqlQuery.GET_USER_ID_USING_TASK_ID, [
            req.params.taskId,
        ]);
        user_id = user_id.rows[0].user_id;
        if (req.body.status == "true")
            await dbConnection.query(sqlQuery.INCREMENT_REPOSITORY_TOTAL_TASKS_DONE, [
                user_id,
            ]);
        else
            await dbConnection.query(sqlQuery.DECREMENT_REPOSITORY_TOTAL_TASKS_DONE, [
                user_id,
            ]);
        await dbConnection.query("COMMIT;");
    } catch (err) {
        await dbConnection.query("ROLLBACK;");
        return res.status(400).json({
            message: "No valid entry found for provided ID",
        });
    }

    res.status(200).json({
        message: "Task updated.",
    });
    //                                notification
    // if (req.body.status == "true") {

    //   const user = await dbConnection.query(sqlQuery.CHECH_TOKENT_IS_FIND, [])

    //   const notificationText = `${result.name} ${constants.notificationDonetask}`;
    //   const notificationSubject = " Your project updated ";

    //   if (user.notificationOption.email)
    //     await Email.sendMail(notificationSubject, notificationText, user.email);

    //   if (user.notificationOption.sms)
    //     await Sms.sendSms("YSH", user.phoneNumber, notificationText);
    // }
};

/**
 * @desc    Delete Task
 * @route   Delete /api/admin/client/task/delete/:taskId
 * @access  Private/admin , Private/superAdmin
 */
module.exports.delete = async (req, res) => {
    try {
        await dbConnection.query("BEGIN;");

        let user_id = await dbConnection.query(sqlQuery.GET_USER_ID_USING_TASK_ID, [
            req.params.taskId,
        ]);
        user_id = user_id.rows[0].user_id;

        let taskState = await dbConnection.query(sqlQuery.DELETE_TASK, [
            req.params.taskId,
        ]);

        taskState = taskState.rows[0].done;

        await dbConnection.query(sqlQuery.DECREMENT_REPOSITORY_TOTAL_TASKS, [
            user_id,
        ]);

        if (taskState)
            await dbConnection.query(sqlQuery.DECREMENT_REPOSITORY_TOTAL_TASKS_DONE, [
                user_id,
            ]);
        await dbConnection.query("COMMIT;");
    } catch (err) {
        await dbConnection.query("ROLLBACK;");
        return res.status(400).json({
            message: "No valid entry found for provided ID",
        });
    }

    res.status(200).json({
        message: "Task deleted.",
    });
};