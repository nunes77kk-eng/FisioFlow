'use strict';

/**
 * Configuracao da aplicacao Express (middlewares, rotas e frontend).
 * O mesmo servico serve a API (/api) e os arquivos estaticos do frontend,
 * simplificando o deploy no Railway (um unico servico).
 */

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const rotasApi = require('./routes');
const { naoEncontrado, handlerErros } = require('./middlewares/error.middleware');

const app = express();

// ----- Seguranca e infraestrutura -----
// CSP desabilitado para permitir Google Fonts e assets do frontend estatico
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logs de requisicao (formato enxuto em producao)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ----- Rotas da API -----
app.use('/api', rotasApi);

// ----- Frontend estatico -----
const pastaFrontend = path.join(__dirname, '..', '..', 'frontend');

app.use(express.static(pastaFrontend));

// Raiz -> pagina inicial
app.get('/', (_req, res) => {
  res.sendFile(path.join(pastaFrontend, 'index.html'));
});



// ----- Tratamento de erros -----
// 404 apenas para rotas de API (arquivos estaticos ja foram resolvidos acima)
app.use('/api', naoEncontrado);
app.use(handlerErros);

module.exports = app;
