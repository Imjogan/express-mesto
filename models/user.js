const mongoose = require("mongoose");
const { minLength, maxLength, regUrl } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: minLength,
      maxlength: maxLength,
    },
    about: {
      type: String,
      required: true,
      minlength: minLength,
      maxlength: maxLength,
    },
    avatar: {
      type: String,
      validate: {
        validator(string) {
          return regUrl(string);
        },
        message: "Вы должны указать ссылку",
      },
      required: true,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("user", userSchema);
