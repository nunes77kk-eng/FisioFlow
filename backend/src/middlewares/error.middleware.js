'use strict';

/**
 * Middlewares de tratamento de erros.
 *   - naoEncontrado: captura rotas de API inexistentes (404)
 *   - handlerErros: handler global; formata a resposta de erro
 */

const { ApiError } = require('../utils/helpers');

/**
 * Rota de API nao encontrada.
 */
function naoEncontrado(req, _res, next) {
  next(new ApiError(404, `Rota nao encontrada: ${req.method} ${req.originalUrl}`));
}

/**
 * Handler global de erros. Deve ser o ultimo middleware registrado.
 * Traduz erros conhecidos do MySQL em mensagens amigaveis.
 */
// eslint-disable-next-line no-unused-vars
function handlerErros(err, req, res, _next) {
  let status = err.status || 500;
  let mensagem = err.message || 'Erro interno do servidor.';
  let detalhes = err.detalhes || null;

  // Traducao de erros comuns do MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    mensagem = 'Registro duplicado: ja existe um cadastro com este dado unico (CPF, e-mail ou CREFITO).';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    status = 422;
    mensagem = 'Referencia invalida: o paciente, fisioterapeuta ou tratamento informado nao existe.';
  } else if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
    status = 409;
    mensagem = 'Nao e possivel excluir: este registro esta vinculado a agendamentos existentes.';
  } else if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    status = 503;
    mensagem = 'Banco de dados indisponivel no momento. Tente novamente em instantes.';
  }

  // Log no servidor apenas para erros inesperados (5xx)
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[ERRO]', err);
  }

  const corpo = { sucesso: false, mensagem };
  if (detalhes) corpo.detalhes = detalhes;
  return res.status(status).json(corpo);
}

module.exports = { naoEncontrado, handlerErros };
