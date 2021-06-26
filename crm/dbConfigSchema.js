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
  ];

  for (let i of tables) {
    
     const result = await dbConnection.query(i);
    // console.log(i);
  }
};
