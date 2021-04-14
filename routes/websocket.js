const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Incubator Page
router.get('/', forwardAuthenticated, (req, res) => res.render('ws'));



module.exports = router;
