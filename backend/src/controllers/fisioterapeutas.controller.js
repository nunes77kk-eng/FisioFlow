'use strict';

/**
 * Controller de Fisioterapeutas.
 */

const Fisioterapeuta = require('../models/fisioterapeuta.model');
const { ApiError, responderSucesso, asyncHandler } = require('../utils/helpers');

const listar = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const busca = (req.query.busca || '').trim();
  const resultado = await Fisioterapeuta.listar({ busca, page, limit });
  return responderSucesso(res, resultado);
});

const buscar = asyncHandler(async (req, res) => {
  const item = await Fisioterapeuta.buscarPorId(req.params.id);
  if (!item) throw new ApiError(404, 'Fisioterapeuta nao encontrado.');
  return responderSucesso(res, item);
});

const criar = asyncHandler(async (req, res) => {
  const criado = await Fisioterapeuta.criar(req.body);
  return responderSucesso(res, criado, 201, 'Fisioterapeuta cadastrado com sucesso.');
});

const atualizar = asyncHandler(async (req, res) => {
  const atualizado = await Fisioterapeuta.atualizar(req.params.id, req.body);
  if (!atualizado) throw new ApiError(404, 'Fisioterapeuta nao encontrado.');
  return responderSucesso(res, atualizado, 200, 'Fisioterapeuta atualizado com sucesso.');
});

const excluir = asyncHandler(async (req, res) => {
  const ok = await Fisioterapeuta.excluir(req.params.id);
  if (!ok) throw new ApiError(404, 'Fisioterapeuta nao encontrado.');
  return responderSucesso(res, null, 200, 'Fisioterapeuta excluido com sucesso.');
});

module.exports = { listar, buscar, criar, atualizar, excluir };
