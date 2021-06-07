const mongoose = require("mongoose");
const { minLength, maxLength, regUrl } = require("../utils/constants");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: minLength,
      maxlength: maxLength,
      default: "Жак-Ив Кусто",
    },
    about: {
      type: String,
      minlength: minLength,
      maxlength: maxLength,
      default: "Исследователь",
    },
    avatar: {
      type: String,
      validate: {
        validator(string) {
          return regUrl(string);
        },
        message: "Вы должны указать ссылку",
      },
      default:
        "https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator(string) {
          return validator.isEmail(string);
        },
      message: 'Неправильный формат почты',
      },
    },
    password: {
      type: String,
      required: true,
      select: false
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("user", userSchema);
