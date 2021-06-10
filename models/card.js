const mongoose = require('mongoose');
const validator = require('validator');
const { minLength, maxLength } = require('../utils/constants');

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
          return validator.isURL(string);
        },
        message: 'Вы должны указать ссылку',
      },
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    likes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
        },
      ],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model('card', cardSchema);
