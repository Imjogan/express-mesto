const User = require("../models/user");
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

module.exports.getUser = (req, res) => {
  (async () => {
    try {
      const user = await User.findById(req.params.userId);
      res.status(statusCodeOk).send(user);
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
  const { name, about, avatar } = req.body;
  (async () => {
    try {
      const user = await User.create({ name, about, avatar });
      res.status(statusCodeCreated).send(user);
    } catch (err) {
      if (err.name === "ValidationError") {
        return res.status(statusCodeBadRequest).send({
          message: incorrectUserDataError,
        });
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
