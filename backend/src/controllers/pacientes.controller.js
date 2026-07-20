'use strict';

/**
 * Controller de Pacientes - orquestra a regra de negocio do CRUD.
 */

const Paciente = require('../models/paciente.model');
const { ApiError, responderSucesso, asyncHandler, apenasDigitos } = require('../utils/helpers');

/** GET /api/pacientes - lista com busca e paginacao */
const listar = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const busca = (req.query.busca || '').trim();

  const resultado = await Paciente.listar({ busca, page, limit });
  return responderSucesso(res, resultado);
});

/** GET /api/pacientes/:id */
const buscar = asyncHandler(async (req, res) => {
  const paciente = await Paciente.buscarPorId(req.params.id);
  if (!paciente) throw new ApiError(404, 'Paciente nao encontrado.');
  return responderSucesso(res, paciente);
});

/** POST /api/pacientes */
const criar = asyncHandler(async (req, res) => {
  const dados = { ...req.body, cpf: apenasDigitos(req.body.cpf) };
  const criado = await Paciente.criar(dados);
  return responderSucesso(res, criado, 201, 'Paciente cadastrado com sucesso.');
});

/** PUT /api/pacientes/:id */
const atualizar = asyncHandler(async (req, res) => {
  const dados = { ...req.body, cpf: apenasDigitos(req.body.cpf) };
  const atualizado = await Paciente.atualizar(req.params.id, dados);
  if (!atualizado) throw new ApiError(404, 'Paciente nao encontrado.');
  return responderSucesso(res, atualizado, 200, 'Paciente atualizado com sucesso.');
});

/** DELETE /api/pacientes/:id */
const excluir = asyncHandler(async (req, res) => {
  const ok = await Paciente.excluir(req.params.id);
  if (!ok) throw new ApiError(404, 'Paciente nao encontrado.');
  return responderSucesso(res, null, 200, 'Paciente excluido com sucesso.');
});

module.exports = { listar, buscar, criar, atualizar, excluir };
