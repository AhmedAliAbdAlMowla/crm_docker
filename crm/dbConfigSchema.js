"use strict";
const dbConnection = require("./src/app/db/connection");

module.exports = async () => {
  const tables = [
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    `CREATE TABLE account(
            user_id uuid DEFAULT uuid_generate_v4 (),
            first_name VARCHAR(20) NOT NULL,
            last_name VARCHAR(20) NOT NULL,
            password VARCHAR(60) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone_number VARCHAR(20) NOT NULL, 
            role VARCHAR(10) NOT NULL,
            reset_password_token  VARCHAR(6),
            reset_password_expires TIMESTAMP,
            created_at TIMESTAMP,
            PRIMARY KEY (user_id)
            )`,
    `CREATE TABLE folder(
                folder_id uuid DEFAULT uuid_generate_v4 (),
                user_id uuid REFERENCES account(user_id),
                name VARCHAR(50) NOT NULL,
                created_at TIMESTAMP NOT NULL,
                PRIMARY KEY (folder_id)
                )`,

    `CREATE TABLE file(
        file_id uuid DEFAULT uuid_generate_v4 (),
        folder_id uuid REFERENCES folder(folder_id),
        file_link VARCHAR(200) NOT NULL,
        s3_key VARCHAR(50) NOT NULL,
        original_name VARCHAR(50) NOT NULL,
        extention VARCHAR(5) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        PRIMARY KEY (file_id)
        )`,

    `CREATE TABLE profile_image (
            pf_id  uuid DEFAULT uuid_generate_v4 (),
            user_id uuid REFERENCES account(user_id),
            link varchar(200) NOT NULL,
            s3_key varchar(50) NOT NULL,
            PRIMARY KEY (pf_id)
            )`,

    `CREATE TABLE project(
              pr_id uuid DEFAULT uuid_generate_v4 (),
              user_id uuid REFERENCES account(user_id),
              name VARCHAR(60) NOT NULL,
              type VARCHAR(12) NOT NULL,
              budget DECIMAL  Not Null,
              start_date DATE NOT NULL DEFAULT CURRENT_DATE,
              time_line INTEGER Not NULL,
              street_address VARCHAR(60),
              city VARCHAR(40),
              state_address VARCHAR(20),
              zip VARCHAR(10),
              created_at TIMESTAMP, 
              PRIMARY KEY (pr_id)
              )`,
    `
              CREATE TABLE task(
                ts_id uuid DEFAULT uuid_generate_v4 (),
                pr_id uuid REFERENCES project(pr_id),
                name VARCHAR(60) NOT NULL,
                description VARCHAR(1024) NOT NULL,
                done BOOLEAN NOT NULL,
                created_at TIMESTAMP,
                PRIMARY KEY (ts_id)
                )`,
    `
                CREATE TABLE client_tasks_state(
                  id uuid DEFAULT uuid_generate_v4 (),
                  user_id uuid REFERENCES account(user_id),
                  total INTEGER NOT NULL,
                  total_done INTEGER NOT NULL,
                  PRIMARY KEY (id)
                  )
                `,
                `CREATE TABLE project_working_hours(
                  id uuid DEFAULT uuid_generate_v4(),
                  pr_id uuid REFERENCES project(pr_id),
                  hours decimal NOT NULL,
                  description VARCHAR(255) NOT NULL,
                  created_date DATE NOT NULL,
                  created_at TIMESTAMP NOT NULL,
                  PRIMARY KEY (id)
                )`
  ];

  const query = [
    `SELECT  * from account`
  //  ` UPDATE account SET role = 'admin' WHERE user_id=`
  ]
  for (let i of tables) {
    const result = await dbConnection.query(i);
    console.log(result);
  }
};
