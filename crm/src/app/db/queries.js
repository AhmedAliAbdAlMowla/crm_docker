"use strict"
exports.queryList = {

  //                                             ACCUNT
  GET_ALL_ACCOUNT: `SELECT * FROM account`,
  GET_ACCOUNT_BY_EMAIL: `SELECT user_id FROM account WHERE email = $1`,
  CREATE_ACCOUNT: `INSERT INTO  account(first_name ,last_name ,password ,email , phone_number ,role ,created_at)
  VALUES($1,$2,$3,$4,$5,'client',CURRENT_TIMESTAMP);`,
  CHECK_EMAIL_IS_EXIST: `SELECT COUNT(*) FROM account WHERE email = $1`,
  GET_DATA_FOR_LOGIN: `SELECT user_id,first_name,last_name,role,password FROM account WHERE email = $1`,
  GET_ACCOUNT_DATA: `SELECT user_id,first_name,last_name,role FROM account WHERE user_id = $1`,
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
    query.push("WHERE user_id = " + id);
    return query.join(" ");
  },
  //                                          ACCUNT PROFILE IMAGE
   GET_ACCOUNT_PROFILE_IMAGE:`SELECT link,s3_key FROM profile_image WHERE user_id =$1`,
   CREATE_ACCOUNT_PROFILE_IMAGE: `INSERT INTO profile_image(user_id,link,s3_key) 
   VALUES($1,$2,$3)`,
   UPDATE_ACCOUNT_PROFILE_IMAGE:`UPDATE  profile_image SET link=$1,s3_key=$2 WHERE user_id =$3`,
   //                                       ACCOUNT RECOVERY
   UPDATE_PASSWORD_VERIFICATION_TOKEN:`UPDATE account SET reset_password_token = $1
   ,reset_password_expires =  (to_timestamp($2/ 1000.0))  WHERE user_id=$3`,
   CHECH_TOKENT_IS_FIND : `SELECT reset_password_expires FROM account where reset_password_token = $1`,
   RESET_ACCOUNT_PASSWORD: `UPDATE account SET password = $1 , reset_password_token= null ,reset_password_expires =null WHERE reset_password_token=$2`,
   
   //                                          FOLDER
  GET_ALL_FOLDERS: `SELECT folder_id,name,created_at FROM folder where user_id=$1 
  order by  created_at DESC LIMIT $2 OFFSET $3`,
  CREATE_FOLDER: `INSERT INTO folder (user_id, name, created_at) VALUES($1, $2,CURRENT_TIMESTAMP)
  RETURNING  folder_id,name,created_at;`,
  GET_FOLDERS_COUNT: `SELECT COUNT(*) FROM folder WHERE user_id=$1`,
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
  GET_ALL_CLIENTS: `SELECT user_id,first_name,last_name,email,phone_number FROM account where role = 'client' 
  order by  created_at DESC LIMIT $1 OFFSET $2`,
  GET_CLIENTS_COUNT: `SELECT COUNT(*) FROM account WHERE role= 'client'`,
  GET_ONE_CLIENT_BY_ID:`SELECT user_id,first_name,last_name,email,phone_number FROM account where user_id = $1 AND role = 'client' `,
  UPDATE_CLIENT_DATA: (id, table, cols) => {
    let query = ["UPDATE " + table];
    query.push("SET");
    var set = [];
    Object.keys(cols).forEach(function (key, i) {
      set.push(key + " = ($" + (i + 1) + ")");
    });
    query.push(set.join(", "));
    query.push("WHERE user_id = " + id +" AND role = 'client'");
    return query.join(" ");
  },
};
