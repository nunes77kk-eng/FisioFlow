'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/tratamentos.controller');
const { validar } = require('../middlewares/validate.middleware');
const { autenticar, autorizar } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(autenticar);

const regras = [
  body('nome').trim().isLength({ min: 3 }).withMessage('O nome deve ter ao menos 3 caracteres.'),
  body('descricao').optional({ checkFalsy: true }).isLength({ max: 255 }).withMessage('Descricao muito longa.'),
  body('duracao_min').isInt({ min: 1 }).withMessage('Duracao deve ser um numero positivo (minutos).'),
  body('valor').isFloat({ min: 0 }).withMessage('Valor deve ser maior ou igual a zero.'),
];

router.get('/', ctrl.listar);
router.get('/:id', [param('id').isInt()], validar, ctrl.buscar);
router.post('/', autorizar('admin'), regras, validar, ctrl.criar);
router.put('/:id', autorizar('admin'), [param('id').isInt(), ...regras], validar, ctrl.atualizar);
router.delete('/:id', autorizar('admin'), [param('id').isInt()], validar, ctrl.excluir);

module.exports = router;
