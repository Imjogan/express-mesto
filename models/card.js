const mongoose = require("mongoose");
const { minLength, maxLength, regUrl } = require("../utils/constants");

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: minLength,
      maxlength: maxLength,
    },
    link: {
      type: String,
      validate: {
        validator(string) {
          return regUrl(string);
        },
        message: "Вы должны указать ссылку",
      },
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    likes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("card", cardSchema);
