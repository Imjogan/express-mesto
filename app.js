const {
  requestedResourceNotFoundError,
  statusCodeNotFound,
} = require("./utils/errors");
const { login, createUser } = require("./controllers/users");
const auth = require("./middlewares/auth");
const { mongoosePreset } = require("./utils/constants");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { PORT = 3000 } = process.env;
const app = express();
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/mestodb", mongoosePreset);

app.post("/signin", login);
app.post("/signup", createUser);
app.use(auth);
app.use("/users", require("./routes/users"));
app.use("/cards", require("./routes/cards"));

app.use((req, res) => {
  res
    .status(statusCodeNotFound)
    .send({ message: requestedResourceNotFoundError });
});

app.use(express.static(path.join(__dirname, "public")));
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
