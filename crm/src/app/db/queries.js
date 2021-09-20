"use strict";
exports.queryList = {
  //                                             ACCUNT
  GET_ALL_ACCOUNT: `SELECT * FROM account`,
  GET_ACCOUNT_BY_EMAIL: `SELECT user_id FROM account WHERE email = $1`,
  // GET_ACCOUNT_BY_USER_ID: `SELECT user_id FROM account WHERE user_id = $1`,
  CREATE_ACCOUNT: `INSERT INTO  account(first_name ,last_name ,password ,email , phone_number ,role ,created_at)
  VALUES($1,$2,$3,$4,$5,'client',CURRENT_TIMESTAMP) RETURNING user_id;`,
  CHECK_EMAIL_IS_EXIST: `SELECT COUNT(*) FROM account WHERE email = $1`,
  GET_DATA_FOR_LOGIN: `SELECT user_id,first_name,last_name,role,password FROM account WHERE email = $1`,
  GET_ACCOUNT_DATA: `SELECT account.user_id,account.first_name,account.last_name,account.email,account.phone_number,account.role,profile_image.link as image_link FROM account 
  inner JOIN profile_image ON account.user_id=profile_image.user_id WHERE account.user_id= $1`,
  GET_ACCOUNT_PASSWORD: `SELECT password FROM account WHERE user_id= $1`,
  UPDATE_ACCOUNT_PASSWORD: `UPDATE account SET password = $1  WHERE user_id=$2`,

  UPDATE_ACCOUNT_DATA: (id, table, cols) => {
    let query = ["UPDATE " + table];
    query.push("SET");
    var set = [];
    Object.keys(cols).forEach(function (key, i) {
      set.push(key + " = ($" + (i + 1) + ")");
    });
    query.push(set.join(", "));
    query.push(`WHERE user_id='${id}'`);
    return query.join(" ");
  },
  //                                          ACCUNT PROFILE IMAGE
  GET_ACCOUNT_PROFILE_IMAGE: `SELECT link,s3_key FROM profile_image WHERE user_id =$1`,
  CREATE_ACCOUNT_PROFILE_IMAGE: `INSERT INTO profile_image(user_id,link,s3_key) 
   VALUES($1,$2,$3)`,
  UPDATE_ACCOUNT_PROFILE_IMAGE: `UPDATE  profile_image SET link=$1,s3_key=$2 WHERE user_id =$3`,
  //                                       ACCOUNT RECOVERY
  UPDATE_PASSWORD_VERIFICATION_TOKEN: `UPDATE account SET reset_password_token = $1
   ,reset_password_expires =  (to_timestamp($2/ 1000.0))  WHERE user_id=$3`,
  CHECH_TOKENT_IS_FIND: `SELECT reset_password_expires FROM account where reset_password_token = $1`,
  RESET_ACCOUNT_PASSWORD: `UPDATE account SET password = $1 , reset_password_token= null ,reset_password_expires =null WHERE reset_password_token=$2`,

  //                                          FOLDER
  GET_ALL_FOLDERS: `SELECT folder_id,name,created_at FROM folder where user_id=$1 
  order by  created_at DESC`,
  CREATE_FOLDER: `INSERT INTO folder (user_id, name, created_at) VALUES($1, $2,CURRENT_TIMESTAMP)
  RETURNING  folder_id,name,created_at;`,
  UPDATE_FOLDER_NAME: `UPDATE folder SET name = $1 WHERE folder_id=$2`,
  DELETE_ONE_FOLDER: `DELETE FROM folder WHERE folder_id = $1`,
  //                                           FILE
  CREATE_FILE: `INSERT INTO file (folder_id,file_link,s3_key,original_name,extention,created_at) 
  VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP) RETURNING  file_id,created_at;`,
  GET_ALL_FILES: `SELECT file_id,file_link,original_name,extention,created_at FROM file where folder_id=$1 
  order by  created_at DESC LIMIT $2 OFFSET $3`,
  GET_FILES_COUNT: `SELECT COUNT(*) FROM file WHERE folder_id=$1`,
  UPDATE_FILE_NAME: `UPDATE file SET original_name = $1 WHERE file_id=$2`,
  GET_ONE_FILE: `SELECT s3_key FROM file WHERE file_id = $1`,
  DELETE_ONE_FILE: `DELETE FROM file WHERE file_id = $1`,
  GET_MANY_FILE: `SELECT s3_key FROM file WHERE folder_id =$1`,
  DELETE_MANY_FILE: `DELETE FROM file WHERE folder_id = $1`,
  //                                          ADMIN
  GET_ALL_ADMINS: `SELECT user_id,first_name,last_name,email,phone_number FROM account where role = 'admin' 
  order by  created_at DESC LIMIT $1 OFFSET $2`,
  GET_ADMINS_COUNT: `SELECT COUNT(*) FROM account WHERE role= 'admin'`,
  //                                          CLIENT
  GET_ALL_CLIENTS: `SELECT account.user_id,first_name,last_name,email,phone_number,total,total_done FROM account INNER JOIN client_tasks_state ON client_tasks_state.user_id =account.user_id
   WHERE role='client' order by  created_at DESC LIMIT $1 OFFSET $2`,
  GET_CLIENTS_COUNT: `SELECT COUNT(*) FROM account WHERE role= 'client'`,
  GET_ONE_CLIENT_BY_ID: `SELECT user_id,first_name,last_name,email,phone_number FROM account where user_id = $1 AND role = 'client' `,
  UPDATE_CLIENT_DATA: (id, table, cols) => {
    let query = ["UPDATE " + table];
    query.push("SET");
    var set = [];
    Object.keys(cols).forEach(function (key, i) {
      set.push(key + " = ($" + (i + 1) + ")");
    });
    query.push(set.join(", "));
    query.push("WHERE user_id = " + id + " AND role = 'client'");
    return query.join(" ");
  },
  //                                          AdminProject
  CREATE_PROJECT: `INSERT INTO PROJECT (user_id, name, type, budget, start_date, time_line, street_address, city, state_address, zip, created_at) 
  VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
  RETURNING  pr_id, name;`,
  GET_USER_ID_USING_PROJECT_ID: `SELECT user_id FROM project WHERE pr_id=$1`,
  // GET_PROJECT_COUNT: `SELECT COUNT(*) FROM folder WHERE user_id=$1`,
  GET_ALL_PROJECTS: `SELECT pr_id,name FROM project WHERE user_id=$1`,
  DELETE_ONE_PROJECT: `DELETE FROM project WHERE pr_id = $1`,
  //                                           CLIENT_TASKS_STATE
  CREATE_TASKS_STATE_REPOSITORY: `INSERT INTO  client_tasks_state(user_id ,total ,total_done)
  VALUES($1,0,0);`,
  INCREMENT_REPOSITORY_TOTAL_TASKS: ` UPDATE client_tasks_state SET total = total + 1
  WHERE user_id = $1;`,
  DECREMENT_REPOSITORY_TOTAL_TASKS: ` UPDATE client_tasks_state SET total = total - 1
  WHERE user_id = $1;`,
  INCREMENT_REPOSITORY_TOTAL_TASKS_DONE: ` UPDATE client_tasks_state SET total_done = total_done + 1
  WHERE user_id = $1;`,
  DECREMENT_REPOSITORY_TOTAL_TASKS_DONE: ` UPDATE client_tasks_state SET total_done = total_done - 1
  WHERE user_id = $1;`,
  // for deleted
  DECREMENT_REPOSITORY_TOTAL_TASKS_FOR_DELETE: ` UPDATE client_tasks_state SET total = total - $1
  WHERE user_id = $2;`,
  DECREMENT_REPOSITORY_TOTAL_TASKS_DONE_FOR_DELETE: ` UPDATE client_tasks_state SET total_done = total_done - $1
  WHERE user_id = $2;`,
  //                                      TASK
  CREATE_TASK: `INSERT INTO task (pr_id, name, description, done, created_at)
  VALUES($1, $2,$3,false,CURRENT_TIMESTAMP) RETURNING ts_id,done;`,
  GET_ALL_TASKS: `SELECT ts_id, name, description,done FROM task  WHERE pr_id=$1
  order by  created_at DESC;`,
  GET_ALL_TASKS_DONE_COUNT: `SELECT COUNT(*) FROM task  WHERE pr_id=$1 AND done=true`,
  GET_ALL_TASKS_COUNT: `SELECT COUNT(*) FROM task  WHERE pr_id=$1 `,
  UPDATE_TASK_STAT: `UPDATE task SET done=$1 WHERE ts_id=$2  RETURNING name;`,
  GET_USER_ID_USING_TASK_ID: `SELECT project.user_id FROM task 
  INNER JOIN project ON task.pr_id=project.pr_id  WHERE ts_id=$1;`,
  DELETE_TASK: ` DELETE from task where ts_id=$1 RETURNING done;`,
  DELETE_TASKS: `DELETE from task where pr_id=$1 ;`,
  GET_FIRST_NAME_AND_EMAIL_BY_ID: `SELECT email FROM account WHERE user_id=$1;`,
  //                           project working hours
  GET_TOTAL_WORKING_HOURS_FOR_PROJECT: `SELECT COALESCE(SUM(hours),0) as total FROM working_period WHERE pr_id= $1;`,
  GET_ALL_WORKING_PERIODS_FOR_PROJECT: `SELECT id,TO_CHAR(created_date :: DATE, 'dd/mm/yyyy') as date ,hours,description FROM working_period
   WHERE pr_id=$1;`,
   CREATE_WORKING_PERIOD:`INSERT INTO working_period (pr_id,hours,description,created_date,created_at) VALUES(
    $1,$2,$3,TO_DATE($4, 'DD/MM/YYYY'),CURRENT_TIMESTAMP)`,
    DELETE_WORKING_PERIOD:`DELETE FROM working_period WHERE id =$1`,

    //                          SuperAdmin
    GET_ALL_FOLDERS_IDS: `SELECT folder_id FROM folder WHERE user_id=$1`,
    GET_FILES_S3_KEY:`SELECT s3_key FROM file WHERE folder_id = $1`,
    DELETE_ALL_FILES_BY_FOLDER_ID:`DELETE FROM file WHERE folder_id = $1`,
    DELETE_ALL_FOLDERS_BY_USER_ID:`DELETE FROM folder WHERE user_id = $1`,
    GET_ALL_PROJECTS_IDS: `SELECT pr_id FROM project WHERE user_id=$1`,
    DELETE_ALL_TASKS_FOR_PROJECT: `DELETE FROM task WHERE pr_id = $1`,
    DELETE_ALL_PROJECT_WORKING_PERIOD_BY_PROJECT_ID: `DELETE FROM working_period WHERE pr_id = $1`,
    DELETE_ALL_PROJECTS_BY_USER_ID:`DELETE FROM project WHERE user_id = $1`,
    DELETE_CLIENT_TASKS_STATE_BY_USER_ID:`DELETE FROM client_tasks_state WHERE user_id = $1`,
    GET_PROFILE_IMAGE_S3_KEY:`SELECT s3_key FROM profile_image WHERE user_id = $1`,
    DELETE_PROFILE_IMAGE_BY_USER_ID:`DELETE FROM profile_image WHERE user_id = $1`,
    DELETE_USER_ACCOUNT_BY_USER_ID:`DELETE FROM account WHERE user_id = $1`,
    GET_ONE_USER_BY_ID:`SELECT user_id,first_name,last_name,email,phone_number,role FROM account where user_id = $1 `,
};

