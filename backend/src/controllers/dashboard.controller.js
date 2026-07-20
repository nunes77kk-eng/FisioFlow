'use strict';

/**
 * Controller do Dashboard.
 * Retorna metricas agregadas para os cards e graficos do painel.
 */

const { pool } = require('../config/database');
const { responderSucesso, asyncHandler } = require('../utils/helpers');

/**
 * GET /api/dashboard
 * Retorna:
 *   - totais de pacientes, fisioterapeutas, tratamentos e agendamentos
 *   - contagem de agendamentos por status
 *   - proximos agendamentos (data futura)
 */
const resumo = asyncHandler(async (_req, res) => {
  // Totais gerais (uma unica ida ao banco por metrica)
  const [[{ total_pacientes }]] = await pool.query('SELECT COUNT(*) AS total_pacientes FROM pacientes');
  const [[{ total_fisios }]] = await pool.query('SELECT COUNT(*) AS total_fisios FROM fisioterapeutas');
  const [[{ total_tratamentos }]] = await pool.query('SELECT COUNT(*) AS total_tratamentos FROM tratamentos');
  const [[{ total_agendamentos }]] = await pool.query('SELECT COUNT(*) AS total_agendamentos FROM agendamentos');

  // Agendamentos agrupados por status
  const [porStatus] = await pool.query(
    'SELECT status, COUNT(*) AS total FROM agendamentos GROUP BY status'
  );

  // Proximos 5 agendamentos a partir de agora
  const [proximos] = await pool.query(
    `SELECT a.id, a.data_hora, a.status,
            p.nome AS paciente_nome,
            f.nome AS fisioterapeuta_nome,
            t.nome AS tratamento_nome
     FROM agendamentos a
     JOIN pacientes p       ON p.id = a.paciente_id
     JOIN fisioterapeutas f ON f.id = a.fisioterapeuta_id
     JOIN tratamentos t     ON t.id = a.tratamento_id
     WHERE a.data_hora >= NOW() AND a.status <> 'cancelado'
     ORDER BY a.data_hora ASC
     LIMIT 5`
  );

  return responderSucesso(res, {
    totais: {
      pacientes: total_pacientes,
      fisioterapeutas: total_fisios,
      tratamentos: total_tratamentos,
      agendamentos: total_agendamentos,
    },
    agendamentos_por_status: porStatus,
    proximos_agendamentos: proximos,
  });
});

module.exports = { resumo };
