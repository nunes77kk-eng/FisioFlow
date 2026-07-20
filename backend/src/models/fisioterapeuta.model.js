'use strict';

/**
 * Model de Fisioterapeutas - camada de acesso a dados.
 */

const { pool } = require('../config/database');

const CAMPOS = 'id, nome, crefito, especialidade, telefone, email, ativo, criado_em, atualizado_em';

async function listar({ busca = '', page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;
  const filtros = [];
  const valores = [];

  if (busca) {
    filtros.push('(nome LIKE ? OR crefito LIKE ? OR especialidade LIKE ?)');
    valores.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
  }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

  const [linhas] = await pool.query(
    `SELECT ${CAMPOS} FROM fisioterapeutas ${where} ORDER BY nome ASC LIMIT ? OFFSET ?`,
    [...valores, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM fisioterapeutas ${where}`,
    valores
  );

  return { itens: linhas, total, page, limit };
}

async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT ${CAMPOS} FROM fisioterapeutas WHERE id = ?`,
    [id]
  );
  return linhas[0] || null;
}

async function criar(dados) {
  const { nome, crefito, especialidade, telefone, email } = dados;
  const [resultado] = await pool.query(
    `INSERT INTO fisioterapeutas (nome, crefito, especialidade, telefone, email)
     VALUES (?, ?, ?, ?, ?)`,
    [nome, crefito, especialidade, telefone, email]
  );
  return buscarPorId(resultado.insertId);
}

async function atualizar(id, dados) {
  const { nome, crefito, especialidade, telefone, email, ativo } = dados;
  const [resultado] = await pool.query(
    `UPDATE fisioterapeutas SET
        nome = ?, crefito = ?, especialidade = ?, telefone = ?, email = ?, ativo = ?
     WHERE id = ?`,
    [nome, crefito, especialidade, telefone, email, ativo === undefined ? 1 : (ativo ? 1 : 0), id]
  );
  if (resultado.affectedRows === 0) return null;
  return buscarPorId(id);
}

async function excluir(id) {
  const [resultado] = await pool.query('DELETE FROM fisioterapeutas WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
