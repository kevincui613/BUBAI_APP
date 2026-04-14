// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const { errors } = require('../utils/response');
const mock = require('../mockData');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json(errors.UNAUTHORIZED());
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = mock.users.find(u => u.id === decoded.id);

    if (!user) {
      return res.json(errors.UNAUTHORIZED());
    }

    // 把用户信息挂载到req上
    req.user = { ...user, password: undefined };
    next();
  } catch (err) {
    return res.json(errors.UNAUTHORIZED());
  }
};

module.exports = { authMiddleware };