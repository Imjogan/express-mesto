const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthError = require("../errors/auth-err");
const NotFoundError = require("../errors/not-found-err");
const {
  defaultError,
  userNotFoundError,
  incorrectUserDataError,
  incorrectProfileDataError,
  incorrectAvatarDataError,
  userNonExistentError,
  statusCodeOk,
  statusCodeCreated,
  statusCodeBadRequest,
  statusCodeNotFound,
  statusCodeInternalServerError,
} = require("../utils/errors");

module.exports.getUsers = (req, res) => {
  (async () => {
    try {
      const users = await User.find({});
      res.status(statusCodeOk).send(users);
    } catch (err) {
      res.status(statusCodeInternalServerError).send({ message: defaultError });
    }
  })();
};

module.exports.getUser = (req, res, next) => {
  (async () => {
    try {
      const user = await User.findById(req.params.userId);
      res.status(statusCodeOk).send(user);
    } catch (err) {
      if (err.name === "CastError") {
        // return res.status(statusCodeNotFound).send({
        //   message: userNotFoundError,
        // });
        next(new NotFoundError(userNotFoundError));
      }
      // res.status(statusCodeInternalServerError).send({ message: defaultError });
      // next(new NotFoundError("Пользователь не найден"));
    }
  })();
};

module.exports.getCurrentUser = (req, res) => {
  (async () => {
    try {
      const currentUser = await User.findById(req.user._id);
      res.status(statusCodeOk).send(currentUser);
    } catch (err) {
      if (err.name === "CastError") {
        return res.status(statusCodeNotFound).send({
          message: userNotFoundError,
        });
      }
      res.status(statusCodeInternalServerError).send({ message: defaultError });
    }
  })();
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar, email, password } = req.body;
  (async () => {
    try {
      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      });
      res.status(statusCodeCreated).send(user);
    } catch (err) {
      if (err.name === "ValidationError") {
        return res.status(statusCodeBadRequest).send({
          message: incorrectUserDataError,
        });
      } else if (err.name === "MongoError" && err.code === 11000) {
        // Обработка ошибки
      }
      res.status(statusCodeInternalServerError).send({ message: defaultError });
    }
  })();
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  (async () => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, about },
        {
          new: true,
          runValidators: true,
          upsert: true,
        }
      );
      res.status(statusCodeOk).send(user);
    } catch (err) {
      if (err.name === "ValidationError") {
        return res.status(statusCodeBadRequest).send({
          message: incorrectProfileDataError,
        });
      } else if (err.name === "CastError") {
        return res.status(statusCodeNotFound).send({
          message: userNonExistentError,
        });
      }
      res.status(statusCodeInternalServerError).send({ message: defaultError });
    }
  })();
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  (async () => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar },
        {
          new: true,
          runValidators: true,
          upsert: true,
        }
      );
      res.status(statusCodeOk).send(user);
    } catch (err) {
      if (err.name === "ValidationError") {
        return res.status(statusCodeBadRequest).send({
          message: incorrectAvatarDataError,
        });
      } else if (err.name === "CastError") {
        return res.status(statusCodeNotFound).send({
          message: userNonExistentError,
        });
      }
      res.status(statusCodeInternalServerError).send({ message: defaultError });
    }
  })();
};

module.exports.login = (req, res, next) => {
  const { password, email } = req.body;
  (async () => {
    try {
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        throw new AuthError("Неправильные почта или пароль");
      }
      const matched = await bcrypt.compare(password, user.password);
      if (!matched) {
        throw new AuthError("Неправильные почта или пароль");
      }
      const token = jwt.sign({ _id: user._id }, "some-secret-key", {
        expiresIn: "7d",
      });
      res
        .cookie("jwt", token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
        })
        .send(token);
    } catch (err) {
      next(err);
    }
  })();
};
