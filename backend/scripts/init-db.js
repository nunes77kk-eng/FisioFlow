'use strict';

/**
 * Inicializa o banco de dados executando o script database/banco.sql.
 *
 * Funciona em dois cenarios:
 *   - Local:   cria o banco "fisioflow" e popula os dados de teste.
 *   - Railway: usa o banco ja provisionado (ex.: "railway"), adaptando
 *              o script para o nome configurado em MYSQLDATABASE/DB_NAME.
 *
 * Uso manual:  npm run db:init   (recria tudo)
 * Uso no boot: AUTO_INIT_DB=true (executa apenas se o banco estiver vazio)
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { config } = require('../src/config/database');

const CAMINHO_SQL = path.join(__dirname, '..', '..', 'database', 'banco.sql');

/**
 * Extrai apenas o corpo do script (DROP/CREATE/INSERT), removendo as
 * instrucoes "CREATE DATABASE" e "USE fisioflow" para que possamos
 * apontar para o banco configurado no ambiente atual.
 * @param {string} sql
 * @returns {string}
 */
function extrairCorpo(sql) {
  const marcador = 'USE fisioflow;';
  const idx = sql.indexOf(marcador);
  return idx >= 0 ? sql.slice(idx + marcador.length) : sql;
}

/**
 * Verifica se o banco ja possui dados (tabela pacientes com registros).
 * @param {import('mysql2/promise').Connection} conn
 * @param {string} database
 * @returns {Promise<boolean>}
 */
async function bancoJaPopulado(conn, database) {
  try {
    await conn.query(`USE \`${database}\``);
    const [linhas] = await conn.query('SELECT COUNT(*) AS total FROM pacientes');
    return linhas[0].total > 0;
  } catch (_e) {
    return false; // banco/tabela ainda nao existe
  }
}

/**
 * Executa a inicializacao.
 * @param {object} [opts]
 * @param {boolean} [opts.somenteSeVazio=false] - se true, nao recria caso ja haja dados
 */
async function inicializarBanco({ somenteSeVazio = false } = {}) {
  const database = config.database;
  const sqlBruto = fs.readFileSync(CAMINHO_SQL, 'utf8');
  const corpo = extrairCorpo(sqlBruto);

  // Conexao sem selecionar banco (permite CREATE DATABASE)
  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    multipleStatements: true,
    ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  try {
    if (somenteSeVazio && (await bancoJaPopulado(conn, database))) {
      // eslint-disable-next-line no-console
      console.log(`[DB] Banco "${database}" ja possui dados. Inicializacao ignorada.`);
      return;
    }

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${database}\``);
    await conn.query(corpo);

    // eslint-disable-next-line no-console
    console.log(`[DB] Banco "${database}" inicializado com sucesso (schema + dados de teste).`);
  } finally {
    await conn.end();
  }
}

module.exports = { inicializarBanco };

// Permite rodar diretamente pela linha de comando: node scripts/init-db.js
if (require.main === module) {
  inicializarBanco({ somenteSeVazio: false })
    .then(() => process.exit(0))
    .catch((erro) => {
      // eslint-disable-next-line no-console
      console.error('[DB] Erro ao inicializar o banco:', erro.message);
      process.exit(1);
    });
}
