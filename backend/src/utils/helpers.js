'use strict';

/**
 * Funcoes e classes utilitarias compartilhadas pela aplicacao.
 */

/**
 * Erro de aplicacao com status HTTP. Permite lancar erros
 * controlados nos controllers/models que o handler global sabe tratar.
 */
class ApiError extends Error {
  /**
   * @param {number} status - codigo HTTP (ex.: 400, 404, 409)
   * @param {string} message - mensagem amigavel para o cliente
   * @param {Array} [detalhes] - lista opcional de detalhes/validacao
   */
  constructor(status, message, detalhes = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detalhes = detalhes;
  }
}

/**
 * Padroniza a resposta de sucesso da API.
 * @param {import('express').Response} res
 * @param {*} data - conteudo retornado
 * @param {number} [status=200]
 * @param {string} [mensagem]
 */
function responderSucesso(res, data, status = 200, mensagem = null) {
  const corpo = { sucesso: true };
  if (mensagem) corpo.mensagem = mensagem;
  corpo.data = data;
  return res.status(status).json(corpo);
}

/**
 * Remove caracteres nao numericos de uma string (CPF, telefone).
 * @param {string} valor
 * @returns {string}
 */
function apenasDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

/**
 * Valida um CPF pelo algoritmo dos digitos verificadores.
 * @param {string} cpf
 * @returns {boolean}
 */
function cpfValido(cpf) {
  const num = apenasDigitos(cpf);
  if (num.length !== 11) return false;
  // Rejeita sequencias iguais (ex.: 00000000000)
  if (/^(\d)\1{10}$/.test(num)) return false;

  const calcularDigito = (base) => {
    let soma = 0;
    let peso = base.length + 1;
    for (const digito of base) {
      soma += Number(digito) * peso;
      peso -= 1;
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const digito1 = calcularDigito(num.slice(0, 9));
  const digito2 = calcularDigito(num.slice(0, 10));
  return digito1 === Number(num[9]) && digito2 === Number(num[10]);
}

/**
 * Envolve um handler async e encaminha erros para o next().
 * Evita repetir try/catch em todos os controllers.
 * @param {Function} fn
 * @returns {Function}
 */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = {
  ApiError,
  responderSucesso,
  apenasDigitos,
  cpfValido,
  asyncHandler,
};
