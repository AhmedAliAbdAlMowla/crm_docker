"use strict";
const dbConnection = require("./src/app/db/connection");

module.exports = async () => {
  const tables = [
    `CREATE TABLE account(
            user_id SERIAL PRIMARY KEY,
            first_name VARCHAR(20) NOT NULL,
            last_name VARCHAR(20) NOT NULL,
            password VARCHAR(60) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone_number VARCHAR(20) NOT NULL, 
            role VARCHAR(10) NOT NULL,
            reset_password_token  VARCHAR(6),
            reset_password_expires TIMESTAMP,
            created_at TIMESTAMP
            )`,
    `CREATE TABLE folder(
                folder_id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES account(user_id),
                name VARCHAR(50) NOT NULL,
                created_at TIMESTAMP NOT NULL
                )`,

    `CREATE TABLE file(
        file_id SERIAL PRIMARY KEY,
        folder_id INTEGER REFERENCES folder(folder_id),
        file_link VARCHAR(200) NOT NULL,
        s3_key VARCHAR(50) NOT NULL,
        original_name VARCHAR(50) NOT NULL,
        extention VARCHAR(5) NOT NULL,
        created_at TIMESTAMP NOT NULL
        )`,

    `CREATE TABLE profile_image (
            pf_id  SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES account(user_id),
            link varchar(200) NOT NULL,
            s3_key varchar(50) NOT NULL
            )`,

    `CREATE TABLE project(
              pr_id SERIAL PRIMARY KEY,
              user_id INTEGER REFERENCES account(user_id),
              name VARCHAR(60) NOT NULL,
              type VARCHAR(12) NOT NULL,
              budget INTEGER Not Null,
              start_date DATE NOT NULL DEFAULT CURRENT_DATE,
              time_line INTEGER Not NULL,
              street_address VARCHAR(60),
              city VARCHAR(40),
              state_address VARCHAR(20),
              zip VARCHAR(10),
              created_at TIMESTAMP 
              )`,
    `
              CREATE TABLE task(
                ts_id SERIAL PRIMARY KEY,
                pr_id INTEGER REFERENCES project(pr_id),
                name VARCHAR(60) NOT NULL,
                description VARCHAR(1024) NOT NULL,
                done BOOLEAN NOT NULL,
                created_at TIMESTAMP 
                )`,
    `
                CREATE TABLE client_tasks_state(
                  id SERIAL PRIMARY KEY,
                  user_id INTEGER REFERENCES account(user_id),
                  total INTEGER NOT NULL,
                  total_done INTEGER NOT NULL
                  )
                `,
  ];

  const query = [
   ` UPDATE account SET role = 'admin' WHERE user_id=1`
  ]
  for (let i of tables) {
    const result = await dbConnection.query(i);
    // console.log(i);
  }
};
