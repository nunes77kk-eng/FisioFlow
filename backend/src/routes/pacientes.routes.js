'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/pacientes.controller');
const { validar } = require('../middlewares/validate.middleware');
const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const { cpfValido } = require('../utils/helpers');

const router = express.Router();

// Todas as rotas de pacientes exigem autenticacao
router.use(autenticar);

// Regras de validacao reutilizadas em criar/atualizar
const regrasPaciente = [
  body('nome').trim().isLength({ min: 3 }).withMessage('O nome deve ter ao menos 3 caracteres.'),
  body('cpf').custom((v) => cpfValido(v)).withMessage('CPF invalido.'),
  body('data_nascimento').isISO8601().withMessage('Data de nascimento invalida (use AAAA-MM-DD).'),
  body('sexo').optional().isIn(['M', 'F', 'O']).withMessage('Sexo invalido.'),
  body('telefone').trim().notEmpty().withMessage('O telefone e obrigatorio.'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('E-mail invalido.'),
];

router.get('/', ctrl.listar);
router.get('/:id', [param('id').isInt()], validar, ctrl.buscar);
router.post('/', regrasPaciente, validar, ctrl.criar);
router.put('/:id', [param('id').isInt(), ...regrasPaciente], validar, ctrl.atualizar);
// Exclusao restrita a admin e recepcionista
router.delete('/:id', autorizar('admin', 'recepcionista'), [param('id').isInt()], validar, ctrl.excluir);

module.exports = router;
