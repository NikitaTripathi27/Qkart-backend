const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");

let server;

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port

// const DB_URI = "mongodb://127.0.0.1:27017/qkart"
mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(() => console.log("connected to DB at", config.mongoose.url))
  .catch((error) => console.log("failed to connect", error));


app.listen(config.port, () => {
  console.log("listening on port", config.port);
});
