const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/mestodb", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// хардкод
app.use((req, res, next) => {
  req.user = {
    _id: "60ae21355fe7f80f805b733b",
  };

  next();
});

app.use("/users", require("./routes/users"));
app.use("/cards", require("./routes/cards"));

app.use((req, res) => {
  res.status(404).send({ message: "Запрашиваемый ресурс не найден" });
});

app.use(express.static(path.join(__dirname, "public")));
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});