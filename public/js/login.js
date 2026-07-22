'use strict';

/**
 * Logica da tela de login.
 * Se ja houver sessao ativa, redireciona direto ao dashboard.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Ja logado? vai direto ao painel
  if (Api.getToken() && Api.getUsuario()) {
    location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const emailEl = document.getElementById('email');
  const senhaEl = document.getElementById('senha');
  const btn = document.getElementById('btnLogin');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    UI.limparErros(form);

    const email = emailEl.value.trim();
    const senha = senhaEl.value;

    // Validacao basica no cliente
    let valido = true;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { UI.marcarErro(emailEl); valido = false; }
    if (!senha) { UI.marcarErro(senhaEl); valido = false; }
    if (!valido) return;

    UI.carregando(btn, true, 'Entrando...');
    try {
      const { token, usuario } = await Api.post('/auth/login', { email, senha });
      Api.salvarSessao(token, usuario);
      UI.toast(`Olá, ${usuario.nome.split(' ')[0]}!`, 'sucesso');
      setTimeout(() => (location.href = 'dashboard.html'), 500);
    } catch (erro) {
      UI.toast(erro.message || 'Não foi possível entrar.', 'erro');
      UI.carregando(btn, false);
    }
  });
});
