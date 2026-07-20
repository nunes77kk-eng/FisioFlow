'use strict';

/**
 * Model de Tratamentos - camada de acesso a dados.
 */

const { pool } = require('../config/database');

const CAMPOS = 'id, nome, descricao, duracao_min, valor, ativo, criado_em, atualizado_em';

async function listar({ busca = '', page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;
  const filtros = [];
  const valores = [];

  if (busca) {
    filtros.push('(nome LIKE ? OR descricao LIKE ?)');
    valores.push(`%${busca}%`, `%${busca}%`);
  }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

  const [linhas] = await pool.query(
    `SELECT ${CAMPOS} FROM tratamentos ${where} ORDER BY nome ASC LIMIT ? OFFSET ?`,
    [...valores, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM tratamentos ${where}`,
    valores
  );

  return { itens: linhas, total, page, limit };
}

async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT ${CAMPOS} FROM tratamentos WHERE id = ?`,
    [id]
  );
  return linhas[0] || null;
}

async function criar(dados) {
  const { nome, descricao, duracao_min, valor } = dados;
  const [resultado] = await pool.query(
    `INSERT INTO tratamentos (nome, descricao, duracao_min, valor)
     VALUES (?, ?, ?, ?)`,
    [nome, descricao || null, duracao_min || 60, valor || 0]
  );
  return buscarPorId(resultado.insertId);
}

async function atualizar(id, dados) {
  const { nome, descricao, duracao_min, valor, ativo } = dados;
  const [resultado] = await pool.query(
    `UPDATE tratamentos SET
        nome = ?, descricao = ?, duracao_min = ?, valor = ?, ativo = ?
     WHERE id = ?`,
    [nome, descricao || null, duracao_min || 60, valor || 0, ativo === undefined ? 1 : (ativo ? 1 : 0), id]
  );
  if (resultado.affectedRows === 0) return null;
  return buscarPorId(id);
}

async function excluir(id) {
  const [resultado] = await pool.query('DELETE FROM tratamentos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
