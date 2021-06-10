const jwt = require('jsonwebtoken');
const AuthError = require('../errors/auth-err');
const { authorizationRequired } = require('../utils/errors');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new AuthError(authorizationRequired));
  }
  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    next(new AuthError(authorizationRequired));
  }
  req.user = payload;
  next();
};
