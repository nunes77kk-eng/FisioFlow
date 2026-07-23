'use strict';

/**
 * Camada de comunicacao com a API REST (usando fetch).
 * Centraliza: URL base, envio do token JWT, parse de JSON e erros.
 */
const Api = (() => {
  /** Recupera o token salvo no navegador. */
  function getToken() {
    return localStorage.getItem(CONFIG.TOKEN_KEY);
  }

  /** Salva token e dados do usuario apos o login. */
  function salvarSessao(token, usuario) {
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(usuario));
  }

  /** Retorna o usuario logado (ou null). */
  function getUsuario() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.USER_KEY));
    } catch {
      return null;
    }
  }

  /** Limpa a sessao (logout). */
  function limparSessao() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
  }

  /**
   * Requisicao generica.
   * @param {string} caminho - ex.: '/pacientes'
   * @param {object} [opcoes] - { method, body, params }
   * @returns {Promise<*>} o campo "data" da resposta
   * @throws {Error} com .status e .detalhes em caso de falha
   */
  async function request(caminho, { method = 'GET', body, params } = {}) {
    let url = `${CONFIG.API_BASE}${caminho}`;

    // Monta query string a partir de params (ignora vazios)
    if (params) {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.append(k, v);
      });
      const s = qs.toString();
      if (s) url += `?${s}`;
    }

    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let resposta;
    try {
      resposta = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (_erroRede) {
      const e = new Error('Nao foi possivel conectar ao servidor. Verifique sua conexao.');
      e.status = 0;
      throw e;
    }

    // Sessao expirada / invalida -> volta para o login
    if (resposta.status === 401 && !caminho.startsWith('/auth/login')) {
      limparSessao();
      if (!location.pathname.endsWith('login.html')) {
        location.href = resolverCaminhoLogin();
      }
    }

    let json = null;
    try {
      json = await resposta.json();
    } catch {
      /* resposta sem corpo JSON */
    }

    if (!resposta.ok) {
      const e = new Error((json && json.mensagem) || 'Erro ao processar a requisicao.');
      e.status = resposta.status;
      e.detalhes = json && json.detalhes;
      throw e;
    }

    return json ? json.data : null;
  }

  /** Resolve o caminho de login relativo a pagina atual. */
  function resolverCaminhoLogin() {
    return location.pathname.includes('/paginas/') ? 'login.html' : 'paginas/login.html';
  }

  // Atalhos por verbo HTTP
  const get = (caminho, params) => request(caminho, { method: 'GET', params });
  const post = (caminho, body) => request(caminho, { method: 'POST', body });
  const put = (caminho, body) => request(caminho, { method: 'PUT', body });
  const del = (caminho) => request(caminho, { method: 'DELETE' });

  return { request, get, post, put, del, getToken, getUsuario, salvarSessao, limparSessao, resolverCaminhoLogin };
})();
