'use strict';

/**
 * Model de Agendamentos - camada de acesso a dados.
 * As consultas usam JOIN para trazer os nomes de paciente,
 * fisioterapeuta e tratamento junto de cada agendamento.
 */

const { pool } = require('../config/database');

// Selecao com JOINs para exibir descricoes legiveis no frontend
const SELECT_JOIN = `
  SELECT
    a.id, a.paciente_id, a.fisioterapeuta_id, a.tratamento_id,
    a.data_hora, a.status, a.observacoes, a.criado_em, a.atualizado_em,
    p.nome  AS paciente_nome,
    f.nome  AS fisioterapeuta_nome,
    t.nome  AS tratamento_nome,
    t.valor AS tratamento_valor,
    t.duracao_min AS tratamento_duracao
  FROM agendamentos a
  JOIN pacientes p        ON p.id = a.paciente_id
  JOIN fisioterapeutas f  ON f.id = a.fisioterapeuta_id
  JOIN tratamentos t      ON t.id = a.tratamento_id
`;

/**
 * Lista agendamentos com filtros e paginacao.
 * @param {object} opts
 * @param {string} [opts.busca] - pesquisa por nome do paciente
 * @param {string} [opts.status] - filtra por status
 * @param {number} [opts.paciente_id]
 * @param {number} [opts.fisioterapeuta_id]
 * @param {number} [opts.page=1]
 * @param {number} [opts.limit=10]
 */
async function listar({ busca = '', status = '', paciente_id, fisioterapeuta_id, page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;
  const filtros = [];
  const valores = [];

  if (busca) {
    filtros.push('p.nome LIKE ?');
    valores.push(`%${busca}%`);
  }
  if (status) {
    filtros.push('a.status = ?');
    valores.push(status);
  }
  if (paciente_id) {
    filtros.push('a.paciente_id = ?');
    valores.push(paciente_id);
  }
  if (fisioterapeuta_id) {
    filtros.push('a.fisioterapeuta_id = ?');
    valores.push(fisioterapeuta_id);
  }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

  const [linhas] = await pool.query(
    `${SELECT_JOIN} ${where} ORDER BY a.data_hora DESC LIMIT ? OFFSET ?`,
    [...valores, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM agendamentos a JOIN pacientes p ON p.id = a.paciente_id ${where}`,
    valores
  );

  return { itens: linhas, total, page, limit };
}

async function buscarPorId(id) {
  const [linhas] = await pool.query(`${SELECT_JOIN} WHERE a.id = ?`, [id]);
  return linhas[0] || null;
}

async function criar(dados) {
  const { paciente_id, fisioterapeuta_id, tratamento_id, data_hora, status, observacoes } = dados;
  const [resultado] = await pool.query(
    `INSERT INTO agendamentos (paciente_id, fisioterapeuta_id, tratamento_id, data_hora, status, observacoes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [paciente_id, fisioterapeuta_id, tratamento_id, data_hora, status || 'agendado', observacoes || null]
  );
  return buscarPorId(resultado.insertId);
}

async function atualizar(id, dados) {
  const { paciente_id, fisioterapeuta_id, tratamento_id, data_hora, status, observacoes } = dados;
  const [resultado] = await pool.query(
    `UPDATE agendamentos SET
        paciente_id = ?, fisioterapeuta_id = ?, tratamento_id = ?,
        data_hora = ?, status = ?, observacoes = ?
     WHERE id = ?`,
    [paciente_id, fisioterapeuta_id, tratamento_id, data_hora, status || 'agendado', observacoes || null, id]
  );
  if (resultado.affectedRows === 0) return null;
  return buscarPorId(id);
}

async function excluir(id) {
  const [resultado] = await pool.query('DELETE FROM agendamentos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

/**
 * Verifica conflito de horario para o mesmo fisioterapeuta.
 * Considera conflito o mesmo fisioterapeuta no mesmo horario exato
 * (excluindo agendamentos cancelados).
 * @param {object} opts
 * @param {number} opts.fisioterapeuta_id
 * @param {string} opts.data_hora
 * @param {number} [opts.ignorarId] - id a ignorar (usado em edicao)
 * @returns {Promise<boolean>}
 */
async function existeConflito({ fisioterapeuta_id, data_hora, ignorarId = 0 }) {
  const [linhas] = await pool.query(
    `SELECT id FROM agendamentos
     WHERE fisioterapeuta_id = ? AND data_hora = ? AND status <> 'cancelado' AND id <> ?
     LIMIT 1`,
    [fisioterapeuta_id, data_hora, ignorarId]
  );
  return linhas.length > 0;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, existeConflito };
