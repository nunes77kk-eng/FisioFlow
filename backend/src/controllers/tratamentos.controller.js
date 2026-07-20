'use strict';

/**
 * Controller de Tratamentos.
 */

const Tratamento = require('../models/tratamento.model');
const { ApiError, responderSucesso, asyncHandler } = require('../utils/helpers');

const listar = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const busca = (req.query.busca || '').trim();
  const resultado = await Tratamento.listar({ busca, page, limit });
  return responderSucesso(res, resultado);
});

const buscar = asyncHandler(async (req, res) => {
  const item = await Tratamento.buscarPorId(req.params.id);
  if (!item) throw new ApiError(404, 'Tratamento nao encontrado.');
  return responderSucesso(res, item);
});

const criar = asyncHandler(async (req, res) => {
  const criado = await Tratamento.criar(req.body);
  return responderSucesso(res, criado, 201, 'Tratamento cadastrado com sucesso.');
});

const atualizar = asyncHandler(async (req, res) => {
  const atualizado = await Tratamento.atualizar(req.params.id, req.body);
  if (!atualizado) throw new ApiError(404, 'Tratamento nao encontrado.');
  return responderSucesso(res, atualizado, 200, 'Tratamento atualizado com sucesso.');
});

const excluir = asyncHandler(async (req, res) => {
  const ok = await Tratamento.excluir(req.params.id);
  if (!ok) throw new ApiError(404, 'Tratamento nao encontrado.');
  return responderSucesso(res, null, 200, 'Tratamento excluido com sucesso.');
});

module.exports = { listar, buscar, criar, atualizar, excluir };
