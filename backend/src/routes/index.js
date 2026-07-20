'use strict';

/**
 * Roteador central da API. Agrupa todos os modulos sob /api.
 */

const express = require('express');

const authRoutes = require('./auth.routes');
const pacientesRoutes = require('./pacientes.routes');
const fisioterapeutasRoutes = require('./fisioterapeutas.routes');
const tratamentosRoutes = require('./tratamentos.routes');
const agendamentosRoutes = require('./agendamentos.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = express.Router();

// Healthcheck (usado pelo Railway e para testes rapidos)
router.get('/health', (_req, res) => {
  res.json({ sucesso: true, servico: 'FisioFlow API', status: 'online', horario: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/pacientes', pacientesRoutes);
router.use('/fisioterapeutas', fisioterapeutasRoutes);
router.use('/tratamentos', tratamentosRoutes);
router.use('/agendamentos', agendamentosRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
