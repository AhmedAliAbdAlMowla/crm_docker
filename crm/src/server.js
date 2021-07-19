"use strict"
if (process.env.NODE_ENV.trim() === "development")
  require("dotenv/config");
const http = require("http");
const app = require("./app/app");
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;





server.listen(PORT, (err) =>
  console.log(err ? err : `Server started on port ${PORT}..✌️✌️`)
);