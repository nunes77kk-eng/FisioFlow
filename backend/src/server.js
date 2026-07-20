'use strict';

/**
 * Ponto de entrada da aplicacao.
 *   1) Carrega variaveis de ambiente (.env em desenvolvimento).
 *   2) Testa a conexao com o banco.
 *   3) (Opcional) inicializa o schema/seed se AUTO_INIT_DB=true.
 *   4) Sobe o servidor HTTP.
 */

require('dotenv').config();

const app = require('./app');
const { testarConexao } = require('./config/database');
const { inicializarBanco } = require('../scripts/init-db');

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    // Inicializacao automatica do schema (util no primeiro deploy do Railway)
    if (process.env.AUTO_INIT_DB === 'true') {
      // eslint-disable-next-line no-console
      console.log('[BOOT] AUTO_INIT_DB=true -> verificando/inicializando o banco...');
      await inicializarBanco({ somenteSeVazio: true });
    }

    await testarConexao();
    // eslint-disable-next-line no-console
    console.log('[BOOT] Conexao com o MySQL estabelecida com sucesso.');

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`[BOOT] FisioFlow rodando na porta ${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`[BOOT] API:      http://localhost:${PORT}/api/health`);
      // eslint-disable-next-line no-console
      console.log(`[BOOT] Frontend: http://localhost:${PORT}/`);
    });
  } catch (erro) {
    // eslint-disable-next-line no-console
    console.error('[BOOT] Falha ao iniciar a aplicacao:', erro.message);
    process.exit(1);
  }
}

iniciar();
