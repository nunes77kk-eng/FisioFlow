'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/fisioterapeutas.controller');
const { validar } = require('../middlewares/validate.middleware');
const { autenticar, autorizar } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(autenticar);

const regras = [
  body('nome').trim().isLength({ min: 3 }).withMessage('O nome deve ter ao menos 3 caracteres.'),
  body('crefito').trim().notEmpty().withMessage('O CREFITO e obrigatorio.'),
  body('especialidade').trim().notEmpty().withMessage('A especialidade e obrigatoria.'),
  body('telefone').trim().notEmpty().withMessage('O telefone e obrigatorio.'),
  body('email').isEmail().withMessage('E-mail invalido.'),
];

router.get('/', ctrl.listar);
router.get('/:id', [param('id').isInt()], validar, ctrl.buscar);
router.post('/', autorizar('admin'), regras, validar, ctrl.criar);
router.put('/:id', autorizar('admin'), [param('id').isInt(), ...regras], validar, ctrl.atualizar);
router.delete('/:id', autorizar('admin'), [param('id').isInt()], validar, ctrl.excluir);

module.exports = router;
