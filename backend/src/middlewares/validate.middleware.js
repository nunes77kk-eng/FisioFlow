'use strict';

/**
 * Middleware que coleta o resultado das validacoes (express-validator).
 * Se houver erros, retorna 422 com a lista de campos invalidos.
 */

const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/helpers');

function validar(req, _res, next) {
  const resultado = validationResult(req);
  if (!resultado.isEmpty()) {
    const detalhes = resultado.array().map((e) => ({
      campo: e.path,
      mensagem: e.msg,
    }));
    return next(new ApiError(422, 'Dados invalidos. Verifique os campos.', detalhes));
  }
  return next();
}

module.exports = { validar };
