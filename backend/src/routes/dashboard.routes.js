'use strict';

const express = require('express');
const ctrl = require('../controllers/dashboard.controller');
const { autenticar } = require('../middlewares/auth.middleware');

const router = express.Router();

// GET /api/dashboard - metricas do painel (requer login)
router.get('/', autenticar, ctrl.resumo);

module.exports = router;
