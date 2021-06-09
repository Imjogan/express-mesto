const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthError = require("../errors/auth-err");
const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request-err");
const ConflictError = require("../errors/conflict-err");

const {
  conflictEmailError,
  userNotFoundError,
  incorrectUserDataError,
  incorrectProfileDataError,
  incorrectAvatarDataError,
  wrongEmailPassword,
} = require("../utils/errors");

module.exports.getUsers = (req, res, next) => {
  (async () => {
    try {
      const users = await User.find({});
      res.status(200).send(users);
    } catch (err) {
      next(err);
    }
  })();
};

module.exports.getUser = (req, res, next) => {
  (async () => {
    try {
      const user = await User.findById(req.params.userId).orFail(
        new Error("NotFound")
      );
      res.status(200).send(user);
    } catch (err) {
      if (err.message === "NotFound") {
        next(new NotFoundError(userNotFoundError));
      } else if (err.name === "CastError") {
        next(new BadRequestError(incorrectUserDataError));
      }
      next(err);
    }
  })();
};

module.exports.getCurrentUser = (req, res, next) => {
  (async () => {
    try {
      const currentUser = await User.findById(req.user._id).orFail(
        new Error("NotFound")
      );
      res.status(200).send(currentUser);
    } catch (err) {
      if (err.message === "NotFound") {
        next(new NotFoundError(userNotFoundError));
      } else if (err.name === "CastError") {
        next(new BadRequestError(incorrectUserDataError));
      }
      next(err);
    }
  })();
};

module.exports.createUser = (req, res, next) => {
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
      res.status(201).send({ name, about, avatar, email });
    } catch (err) {
      if (err.name === "ValidationError") {
        next(new BadRequestError(incorrectUserDataError));
      } else if (err.name === "MongoError" && err.code === 11000) {
        next(new ConflictError(conflictEmailError));
      }
      next(err);
    }
  })();
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  (async () => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, about },
        {
          new: true,
          runValidators: true,
        }
      ).orFail(new Error("NotFound"));
      res.status(200).send(user);
    } catch (err) {
      if (err.message === "NotFound") {
        next(new NotFoundError(userNotFoundError));
      } else if (err.name === "CastError") {
        next(new BadRequestError(incorrectProfileDataError));
      }
      next(err);
    }
  })();
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  (async () => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar },
        {
          new: true,
          runValidators: true,
        }
      ).orFail(new Error("NotFound"));
      res.status(200).send(user);
    } catch (err) {
      if (err.message === "NotFound") {
        next(new NotFoundError(userNotFoundError));
      } else if (err.name === "CastError") {
        next(new BadRequestError(incorrectAvatarDataError));
      }
      next(err);
    }
  })();
};

module.exports.login = (req, res, next) => {
  const { password, email } = req.body;
  (async () => {
    try {
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        throw new AuthError(wrongEmailPassword);
      }
      const matched = await bcrypt.compare(password, user.password);
      if (!matched) {
        throw new AuthError(wrongEmailPassword);
      }
      const token = jwt.sign({ _id: user._id }, "some-secret-key", {
        expiresIn: "7d",
      });
      res.status(200).send({ token });
    } catch (err) {
      next(err);
    }
  })();
};
