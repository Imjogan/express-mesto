const Card = require("../models/card");
const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request-err");
const ForbiddenError = require("../errors/forbidden-err");

const {
  incorrectCardDataError,
  cardNonExistentError,
  incorrectLikeDataError,
  incorrectDislikeDataError,
  insufficientRights,
} = require("../utils/errors");

module.exports.getCards = (req, res, next) => {
  (async () => {
    try {
      const cards = await Card.find({}).populate(["owner", "likes"]);
      res.status(200).send(cards);
    } catch (err) {
      next(err);
    }
  })();
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  (async () => {
    try {
      const card = await Card.create({ name, link, owner: req.user._id });
      res.status(201).send(card);
    } catch (err) {
      if (err.name === "ValidationError") {
        next(new BadRequestError(incorrectCardDataError));
      }
      next(err);
    }
  })();
};

module.exports.deleteCard = (req, res, next) => {
  (async () => {
    if (req.user._id === card.owner.equals(req.user._id)) {
      try {
        const card = await Card.findByIdAndRemove(req.params.cardId);
        res.status(200).send(card);
      } catch (err) {
        if (err.name === "CastError") {
          next(new NotFoundError(cardNonExistentError));
        }
        next(err);
      }
    } else {
      next(new ForbiddenError(insufficientRights));
    }
  })();
};

module.exports.likeCard = (req, res, next) => {
  (async () => {
    try {
      const card = await Card.findByIdAndUpdate(
        req.params.cardId,
        { $addToSet: { likes: req.user._id } },
        { new: true }
      ).populate("likes");
      res.status(200).send(card);
    } catch (err) {
      if (err.name === "ValidationError") {
        next(new BadRequestError(incorrectLikeDataError));
      }
      next(err);
    }
  })();
};

module.exports.dislikeCard = (req, res, next) => {
  (async () => {
    try {
      const card = await Card.findByIdAndUpdate(
        req.params.cardId,
        { $pull: { likes: req.user._id } },
        { new: true }
      ).populate("likes");
      res.status(200).send(card);
    } catch (err) {
      if (err.name === "ValidationError") {
        next(new BadRequestError(incorrectDislikeDataError));
      }
      next(err);
    }
  })();
};
