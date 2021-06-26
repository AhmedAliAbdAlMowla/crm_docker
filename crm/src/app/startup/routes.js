"use strict"
module.exports = (app) => {
    // Routes
    app.use("/api/v1/users",require("../routes/user"));
    app.use("/api/v1/client/folder", require("../routes/folder"));
    app.use("/api/v1/client/file", require("../routes/file"));
    app.use("/api/v1/admin", require("../routes/admin"));
    app.get("/", (req, res) => {
    res.status(200).send(" CRM API is running....");
});
};
