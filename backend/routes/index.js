const express = require('express');
const router = express.Router();

// 挂载所有子路由
router.use('/auth', require('./auth'));
router.use('/ai', require('./ai'));
router.use('/goals', require('./goals'));
router.use('/social', require('./social'));
router.use('/tasks', require('./tasks'));

module.exports = router;