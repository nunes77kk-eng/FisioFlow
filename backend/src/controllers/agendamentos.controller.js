'use strict';

/**
 * Controller de Agendamentos.
 * Alem do CRUD, valida conflito de horario do fisioterapeuta.
 */

const Agendamento = require('../models/agendamento.model');
const { ApiError, responderSucesso, asyncHandler } = require('../utils/helpers');

/** Normaliza "2026-07-20T09:00" (input datetime-local) para "2026-07-20 09:00:00" */
function normalizarDataHora(valor) {
  if (!valor) return valor;
  return String(valor).replace('T', ' ').slice(0, 19).padEnd(19, ':00').slice(0, 19);
}

const listar = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const busca = (req.query.busca || '').trim();
  const status = (req.query.status || '').trim();
  const paciente_id = req.query.paciente_id ? Number(req.query.paciente_id) : undefined;
  const fisioterapeuta_id = req.query.fisioterapeuta_id ? Number(req.query.fisioterapeuta_id) : undefined;

  const resultado = await Agendamento.listar({ busca, status, paciente_id, fisioterapeuta_id, page, limit });
  return responderSucesso(res, resultado);
});

const buscar = asyncHandler(async (req, res) => {
  const item = await Agendamento.buscarPorId(req.params.id);
  if (!item) throw new ApiError(404, 'Agendamento nao encontrado.');
  return responderSucesso(res, item);
});

const criar = asyncHandler(async (req, res) => {
  const dados = { ...req.body, data_hora: normalizarDataHora(req.body.data_hora) };

  const conflito = await Agendamento.existeConflito({
    fisioterapeuta_id: dados.fisioterapeuta_id,
    data_hora: dados.data_hora,
  });
  if (conflito) {
    throw new ApiError(409, 'Este fisioterapeuta ja possui um agendamento neste horario.');
  }

  const criado = await Agendamento.criar(dados);
  return responderSucesso(res, criado, 201, 'Agendamento criado com sucesso.');
});

const atualizar = asyncHandler(async (req, res) => {
  const dados = { ...req.body, data_hora: normalizarDataHora(req.body.data_hora) };

  const conflito = await Agendamento.existeConflito({
    fisioterapeuta_id: dados.fisioterapeuta_id,
    data_hora: dados.data_hora,
    ignorarId: Number(req.params.id),
  });
  if (conflito) {
    throw new ApiError(409, 'Este fisioterapeuta ja possui um agendamento neste horario.');
  }

  const atualizado = await Agendamento.atualizar(req.params.id, dados);
  if (!atualizado) throw new ApiError(404, 'Agendamento nao encontrado.');
  return responderSucesso(res, atualizado, 200, 'Agendamento atualizado com sucesso.');
});

const excluir = asyncHandler(async (req, res) => {
  const ok = await Agendamento.excluir(req.params.id);
  if (!ok) throw new ApiError(404, 'Agendamento nao encontrado.');
  return responderSucesso(res, null, 200, 'Agendamento excluido com sucesso.');
});

module.exports = { listar, buscar, criar, atualizar, excluir };
