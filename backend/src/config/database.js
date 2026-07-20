'use strict';

/**
 * Configuracao da conexao com o MySQL.
 *
 * Suporta dois modos de configuracao, nesta ordem de prioridade:
 *   1) String de conexao unica: MYSQL_URL ou DATABASE_URL
 *      (formato: mysql://usuario:senha@host:porta/banco)
 *      -> usado principalmente pelo Railway em producao.
 *   2) Variaveis individuais (Railway usa o prefixo MYSQL*, o
 *      desenvolvimento local usa o prefixo DB_*).
 *
 * A conexao usa um POOL para reaproveitar conexoes e suportar
 * varias requisicoes simultaneas com boa performance.
 */

const mysql = require('mysql2/promise');

/**
 * Monta o objeto de configuracao a partir das variaveis de ambiente.
 * @returns {object} configuracao aceita pelo mysql2
 */
function montarConfig() {
  const url = process.env.MYSQL_URL || process.env.DATABASE_URL;

  // Modo 1: string de conexao unica
  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
    };
  }

  // Modo 2: variaveis individuais (Railway MYSQL* -> fallback DB_*)
  return {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'fisioflow',
  };
}

const config = montarConfig();

// Pool de conexoes reutilizaveis
const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  timezone: 'Z',
  dateStrings: true, // datas retornam como string (evita problemas de fuso)
  // Railway exige SSL em alguns casos; habilite via env se necessario
  ...(process.env.DB_SSL === 'true'
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});

/**
 * Testa a conexao com o banco (usado no boot da aplicacao).
 * @returns {Promise<void>}
 */
async function testarConexao() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}

module.exports = {
  pool,
  config,
  testarConexao,
};
