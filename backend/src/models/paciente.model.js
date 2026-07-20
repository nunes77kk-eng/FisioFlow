'use strict';

/**
 * Model de Pacientes - camada de acesso a dados.
 * Toda a interacao com a tabela `pacientes` fica centralizada aqui.
 */

const { pool } = require('../config/database');

const CAMPOS = 'id, nome, cpf, data_nascimento, sexo, telefone, email, endereco, observacoes, ativo, criado_em, atualizado_em';

/**
 * Lista pacientes com busca opcional e paginacao.
 * @param {object} opts
 * @param {string} [opts.busca] - termo pesquisado em nome ou CPF
 * @param {number} [opts.page=1]
 * @param {number} [opts.limit=10]
 * @returns {Promise<{itens: Array, total: number, page: number, limit: number}>}
 */
async function listar({ busca = '', page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;
  const filtros = [];
  const valores = [];

  if (busca) {
    filtros.push('(nome LIKE ? OR cpf LIKE ?)');
    valores.push(`%${busca}%`, `%${busca.replace(/\D/g, '')}%`);
  }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

  const [linhas] = await pool.query(
    `SELECT ${CAMPOS} FROM pacientes ${where} ORDER BY nome ASC LIMIT ? OFFSET ?`,
    [...valores, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM pacientes ${where}`,
    valores
  );

  return { itens: linhas, total, page, limit };
}

/**
 * Busca um paciente pelo id.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT ${CAMPOS} FROM pacientes WHERE id = ?`,
    [id]
  );
  return linhas[0] || null;
}

/**
 * Cria um novo paciente.
 * @param {object} dados
 * @returns {Promise<object>} paciente criado
 */
async function criar(dados) {
  const { nome, cpf, data_nascimento, sexo, telefone, email, endereco, observacoes } = dados;
  const [resultado] = await pool.query(
    `INSERT INTO pacientes (nome, cpf, data_nascimento, sexo, telefone, email, endereco, observacoes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome, cpf, data_nascimento, sexo || 'O', telefone, email || null, endereco || null, observacoes || null]
  );
  return buscarPorId(resultado.insertId);
}

/**
 * Atualiza um paciente existente.
 * @param {number} id
 * @param {object} dados
 * @returns {Promise<object|null>} paciente atualizado ou null se nao existir
 */
async function atualizar(id, dados) {
  const { nome, cpf, data_nascimento, sexo, telefone, email, endereco, observacoes, ativo } = dados;
  const [resultado] = await pool.query(
    `UPDATE pacientes SET
        nome = ?, cpf = ?, data_nascimento = ?, sexo = ?, telefone = ?,
        email = ?, endereco = ?, observacoes = ?, ativo = ?
     WHERE id = ?`,
    [
      nome, cpf, data_nascimento, sexo || 'O', telefone,
      email || null, endereco || null, observacoes || null,
      ativo === undefined ? 1 : (ativo ? 1 : 0),
      id,
    ]
  );
  if (resultado.affectedRows === 0) return null;
  return buscarPorId(id);
}

/**
 * Exclui um paciente (os agendamentos vinculados sao removidos em cascata).
 * @param {number} id
 * @returns {Promise<boolean>} true se algo foi excluido
 */
async function excluir(id) {
  const [resultado] = await pool.query('DELETE FROM pacientes WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
