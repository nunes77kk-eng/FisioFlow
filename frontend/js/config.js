'use strict';

/**
 * Configuracao global do frontend.
 *
 * A API e servida pelo mesmo backend que entrega estes arquivos, entao
 * usamos a origem atual + /api. Caso os arquivos sejam abertos direto do
 * disco (file://), caimos para o localhost padrao de desenvolvimento.
 */
const CONFIG = {
  API_BASE:
    location.origin && location.origin.startsWith('http')
      ? `${location.origin}/api`
      : 'http://localhost:3000/api',

  // Chave usada para guardar o token JWT no navegador
  TOKEN_KEY: 'fisioflow_token',
  USER_KEY: 'fisioflow_user',
};
