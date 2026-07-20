'use strict';

/**
 * Middlewares de autenticacao (JWT) e autorizacao (perfil de acesso).
 */

const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/helpers');

const JWT_SECRET = process.env.JWT_SECRET || 'troque-este-segredo-em-producao';

/**
 * Verifica o token JWT enviado no header Authorization: Bearer <token>.
 * Em caso de sucesso, popula req.usuario com os dados do token.
 */
function autenticar(req, _res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Token de autenticacao ausente ou invalido.'));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload; // { id, nome, email, perfil }
    return next();
  } catch (_err) {
    return next(new ApiError(401, 'Sessao expirada ou token invalido. Faca login novamente.'));
  }
}

/**
 * Restringe o acesso a perfis especificos.
 * Uso: router.delete('/:id', autenticar, autorizar('admin'), handler)
 * @param {...string} perfis - perfis autorizados
 */
function autorizar(...perfis) {
  return (req, _res, next) => {
    if (!req.usuario) {
      return next(new ApiError(401, 'Autenticacao necessaria.'));
    }
    if (perfis.length > 0 && !perfis.includes(req.usuario.perfil)) {
      return next(new ApiError(403, 'Voce nao tem permissao para executar esta acao.'));
    }
    return next();
  };
}

module.exports = { autenticar, autorizar, JWT_SECRET };
