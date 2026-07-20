'use strict';

const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const { validar } = require('../middlewares/validate.middleware');
const { autenticar, autorizar } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Informe um e-mail valido.'),
    body('senha').notEmpty().withMessage('A senha e obrigatoria.'),
  ],
  validar,
  ctrl.login
);

// POST /api/auth/cadastro - apenas admin pode criar novos usuarios
router.post(
  '/cadastro',
  autenticar,
  autorizar('admin'),
  [
    body('nome').trim().notEmpty().withMessage('O nome e obrigatorio.'),
    body('email').isEmail().withMessage('Informe um e-mail valido.'),
    body('senha').isLength({ min: 6 }).withMessage('A senha deve ter no minimo 6 caracteres.'),
    body('perfil').optional().isIn(['admin', 'recepcionista', 'fisioterapeuta'])
      .withMessage('Perfil invalido.'),
  ],
  validar,
  ctrl.cadastrar
);

// GET /api/auth/perfil - dados do usuario logado
router.get('/perfil', autenticar, ctrl.perfil);

module.exports = router;
