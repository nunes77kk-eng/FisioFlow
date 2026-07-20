'use strict';

/**
 * Scripts da landing page: menu responsivo e formulario de contato.
 * O formulario nao envia para um backend fake — ele monta uma mensagem
 * e abre o WhatsApp da clinica com os dados ja preenchidos (100% funcional).
 */

// Numero do WhatsApp da clinica (formato internacional, sem simbolos).
// >>> Substitua pelo numero real da clinica.
const WHATSAPP_CLINICA = '5531333300000';

document.addEventListener('DOMContentLoaded', () => {
  // Menu mobile
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // Formulario de contato -> WhatsApp
  const form = document.getElementById('contatoForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    UI.limparErros(form);

    const nome = document.getElementById('c-nome');
    const tel = document.getElementById('c-tel');
    const trat = document.getElementById('c-trat');
    const msg = document.getElementById('c-msg');

    let valido = true;
    if (!nome.value.trim()) { UI.marcarErro(nome); valido = false; }
    if (!tel.value.trim()) { UI.marcarErro(tel); valido = false; }
    if (!valido) {
      UI.toast('Preencha os campos obrigatórios.', 'erro');
      return;
    }

    const texto =
      `Olá! Gostaria de agendar uma avaliação na FisioFlow.%0A%0A` +
      `*Nome:* ${encodeURIComponent(nome.value.trim())}%0A` +
      `*Telefone:* ${encodeURIComponent(tel.value.trim())}%0A` +
      `*Tratamento:* ${encodeURIComponent(trat.value)}%0A` +
      (msg.value.trim() ? `*Mensagem:* ${encodeURIComponent(msg.value.trim())}` : '');

    const url = `https://wa.me/${WHATSAPP_CLINICA}?text=${texto}`;
    UI.toast('Abrindo o WhatsApp com sua solicitação...', 'sucesso');
    window.open(url, '_blank');
    form.reset();
  });
});
