'use strict';

/**
 * Controller de Autenticacao.
 * Responsavel por login (gera JWT), cadastro de usuario e dados do perfil logado.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');
const { ApiError, responderSucesso, asyncHandler } = require('../utils/helpers');
const { JWT_SECRET } = require('../middlewares/auth.middleware');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * POST /api/auth/login
 * Recebe email e senha, valida e retorna um token JWT + dados do usuario.
 */
const login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await Usuario.buscarPorEmailComSenha(email);
  // Mensagem generica: nao revela se o e-mail existe (boa pratica de seguranca)
  if (!usuario) {
    throw new ApiError(401, 'E-mail ou senha incorretos.');
  }
  if (!usuario.ativo) {
    throw new ApiError(403, 'Usuario inativo. Contate o administrador.');
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaConfere) {
    throw new ApiError(401, 'E-mail ou senha incorretos.');
  }

  const payload = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  await Usuario.registrarAcesso(usuario.id);

  return responderSucesso(res, { token, usuario: payload }, 200, 'Login realizado com sucesso.');
});

/**
 * POST /api/auth/cadastro
 * Cria um novo usuario com a senha em hash.
 */
const cadastrar = asyncHandler(async (req, res) => {
  const { nome, email, senha, perfil, fisioterapeuta_id } = req.body;

  const senha_hash = await bcrypt.hash(senha, 10);
  const novo = await Usuario.criar({ nome, email, senha_hash, perfil, fisioterapeuta_id });

  return responderSucesso(res, novo, 201, 'Usuario cadastrado com sucesso.');
});

/**
 * GET /api/auth/perfil
 * Retorna os dados do usuario autenticado (a partir do token).
 */
const perfil = asyncHandler(async (req, res) => {
  const usuario = await Usuario.buscarPorId(req.usuario.id);
  if (!usuario) throw new ApiError(404, 'Usuario nao encontrado.');
  return responderSucesso(res, usuario);
});

module.exports = { login, cadastrar, perfil };
