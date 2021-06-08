const Card = require("../models/card");
const NotFoundError = require('../errors/not-found-err');
const {
  defaultError,
  incorrectCardDataError,
  cardNonExistentError,
  incorrectLikeDataError,
  incorrectDislikeDataError,
  statusCodeOk,
  statusCodeCreated,
  statusCodeBadRequest,
  statusCodeNotFound,
  statusCodeInternalServerError,
} = require("../utils/errors");

module.exports.getCards = (req, res) => {
  (async () => {
    try {
      const cards = await Card.find({}).populate(["owner", "likes"]);
      res.status(statusCodeOk).send(cards);
    } catch (err) {
      res.status(statusCodeInternalServerError).send({ message: defaultError });
    }
  })();
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  (async () => {
    try {
      const card = await Card.create({ name, link, owner: req.user._id });
      res.status(statusCodeCreated).send(card);
    } catch (err) {
      if (err.name === "ValidationError") {
        return res.status(statusCodeBadRequest).send({
          message: incorrectCardDataError,
        });
      }
      res.status(statusCodeInternalServerError).send({ message: defaultError });
    }
  })();
};

module.exports.deleteCard = (req, res) => {
  (async () => {
    if (req.user._id === card.owner.equals(req.user._id)) {
      try {
        const card = await Card.findByIdAndRemove(req.params.cardId);
        res.status(statusCodeOk).send(card);
      } catch (err) {
        if (err.name === "CastError") {
          return res.status(statusCodeNotFound).send({
            message: cardNonExistentError,
          });
        }
        res.status(statusCodeInternalServerError).send({ message: defaultError });
      }
    } else {
      res.status(403).send({ message: "Недостаточно прав для удаления чужих данных" });
    }
  })();
};

module.exports.likeCard = (req, res) => {
  (async () => {
    try {
      const card = await Card.findByIdAndUpdate(
        req.params.cardId,
        { $addToSet: { likes: req.user._id } },
        { new: true }
      ).populate("likes");
      res.status(statusCodeOk).send(card);
    } catch (err) {
      if (err.name === "ValidationError") {
        return res.status(statusCodeBadRequest).send({
          message: incorrectLikeDataError,
        });
      }
      res.status(statusCodeInternalServerError).send({ message: defaultError });
    }
  })();
};

module.exports.dislikeCard = (req, res) => {
  (async () => {
    try {
      const card = await Card.findByIdAndUpdate(
        req.params.cardId,
        { $pull: { likes: req.user._id } },
        { new: true }
      ).populate("likes");
      res.status(statusCodeOk).send(card);
    } catch (err) {
      if (err.name === "ValidationError") {
        return res.status(statusCodeBadRequest).send({
          message: incorrectDislikeDataError,
        });
      }
      res.status(statusCodeInternalServerError).send({ message: defaultError });
    }
  })();
};
