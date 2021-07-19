const { updateValidator } = require("../utils/validator/user");
const dbConnection = require("../db/connection");
const sqlQuery = require("../db/queries").queryList;
const accountTableKey = require("../config/constants").accountTableKey;
/**
 * @desc    Get all admins
 * @route   GET /api/v1/admin
 * @access  Private/admin , Private/superAdmin
 * @Query_Params pageNumber , pageSize
 */
exports.getAllAdmin = async (req, res) => {
  const pageNumber = parseInt(req.query.pageNumber, 10);
  const pageSize = parseInt(req.query.pageSize, 10);

  let total = await dbConnection.query(sqlQuery.GET_ADMINS_COUNT);
  total = total.rows[0].count;

  const admins = await dbConnection.query(sqlQuery.GET_ALL_ADMINS, [
    pageSize,
    (pageNumber - 1) * pageSize,
  ]);

  res.status(200).json({
    total: parseInt(total, 10),
    admins: admins.rows,
  });
};
/**
 * @desc    Get all clients
 * @route   GET /api/v1/admin/clients
 * @access  Private/admin , Private/superAdmin
 * @Query_Params pageNumber , pageSize
 */
exports.getAllClient = async (req, res) => {
  // pagination element
  const pageNumber = parseInt(req.query.pageNumber, 10);
  const pageSize = parseInt(req.query.pageSize, 10);

  
  let total = await dbConnection.query(sqlQuery.GET_CLIENTS_COUNT);
  total = total.rows[0].count;

  let clients = await dbConnection.query(sqlQuery.GET_ALL_CLIENTS, [
    pageSize,
    (pageNumber - 1) * pageSize,
  ]);



  res.status(200).json({
    total: parseInt(total, 10),
    clients: clients.rows,
  });
};

/**
 * @desc    Get client profile data
 * @route   GET /api/v1/admin/client/:clientId
 * @access  Private/admin , Private/superAdmin
 */
exports.getOneClient = async (req, res) => {
  const result = await dbConnection.query(sqlQuery.GET_ONE_CLIENT_BY_ID, [
    req.params.clientId,
  ]);

  if (result.rows.length)
    return res.status(200).json({ client: result.rows[0] });

  res.status(400).json({ message: "No valid entry found for provided ID" });
};
/**
 * @desc    Update client profile data
 * @route   PATCH  /api/v1/admin/client/profile/:clientId
 * @access  Private/admin , Private/superAdmin
 */
exports.updateClientProfile = async (req, res) => {
  // validateProduct body
  const { error } = updateValidator(req.body);
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
    sqlQuery.UPDATE_CLIENT_DATA(req.params.clientId, "account", updateCol),
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
