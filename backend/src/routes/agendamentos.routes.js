'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/agendamentos.controller');
const { validar } = require('../middlewares/validate.middleware');
const { autenticar } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(autenticar);

const regras = [
  body('paciente_id').isInt({ min: 1 }).withMessage('Selecione um paciente.'),
  body('fisioterapeuta_id').isInt({ min: 1 }).withMessage('Selecione um fisioterapeuta.'),
  body('tratamento_id').isInt({ min: 1 }).withMessage('Selecione um tratamento.'),
  body('data_hora').notEmpty().withMessage('Informe a data e hora do agendamento.'),
  body('status').optional().isIn(['agendado', 'confirmado', 'concluido', 'cancelado'])
    .withMessage('Status invalido.'),
];

router.get('/', ctrl.listar);
router.get('/:id', [param('id').isInt()], validar, ctrl.buscar);
router.post('/', regras, validar, ctrl.criar);
router.put('/:id', [param('id').isInt(), ...regras], validar, ctrl.atualizar);
router.delete('/:id', [param('id').isInt()], validar, ctrl.excluir);

module.exports = router;
