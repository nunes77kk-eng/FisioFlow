'use strict';

/**
 * Model de Usuarios - camada de acesso a dados de autenticacao.
 * O hash da senha nunca sai deste model exceto na busca por login.
 */

const { pool } = require('../config/database');

const CAMPOS_PUBLICOS = 'id, nome, email, perfil, fisioterapeuta_id, ativo, ultimo_acesso, criado_em';

/**
 * Busca usuario por e-mail incluindo o hash da senha (uso interno no login).
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function buscarPorEmailComSenha(email) {
  const [linhas] = await pool.query(
    'SELECT id, nome, email, senha_hash, perfil, fisioterapeuta_id, ativo FROM usuarios WHERE email = ?',
    [email]
  );
  return linhas[0] || null;
}

/**
 * Busca usuario por id (dados publicos, sem senha).
 * @param {number} id
 */
async function buscarPorId(id) {
  const [linhas] = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = ?`,
    [id]
  );
  return linhas[0] || null;
}

/**
 * Cria um novo usuario ja com a senha em hash.
 * @param {object} dados - { nome, email, senha_hash, perfil, fisioterapeuta_id }
 */
async function criar({ nome, email, senha_hash, perfil, fisioterapeuta_id }) {
  const [resultado] = await pool.query(
    `INSERT INTO usuarios (nome, email, senha_hash, perfil, fisioterapeuta_id)
     VALUES (?, ?, ?, ?, ?)`,
    [nome, email, senha_hash, perfil || 'recepcionista', fisioterapeuta_id || null]
  );
  return buscarPorId(resultado.insertId);
}

/**
 * Atualiza o carimbo de ultimo acesso do usuario.
 * @param {number} id
 */
async function registrarAcesso(id) {
  await pool.query('UPDATE usuarios SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = ?', [id]);
}

module.exports = {
  buscarPorEmailComSenha,
  buscarPorId,
  criar,
  registrarAcesso,
};
