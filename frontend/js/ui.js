'use strict';

/**
 * Utilitarios de interface: notificacoes (toast), formatadores,
 * validacao visual de formularios e dialogo de confirmacao.
 */
const UI = (() => {
  const ICONES = {
    sucesso: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>',
    erro: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/></svg>',
  };

  /** Garante que o container de toasts exista. */
  function containerToast() {
    let wrap = document.getElementById('toastWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toastWrap';
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    return wrap;
  }

  /**
   * Exibe uma notificacao.
   * @param {string} mensagem
   * @param {'sucesso'|'erro'|'info'} [tipo='info']
   */
  function toast(mensagem, tipo = 'info') {
    const wrap = containerToast();
    const el = document.createElement('div');
    el.className = `toast ${tipo}`;
    el.innerHTML = `<span class="t-ic">${ICONES[tipo] || ICONES.info}</span><span>${mensagem}</span>`;
    wrap.appendChild(el);
    setTimeout(() => {
      el.classList.add('saindo');
      setTimeout(() => el.remove(), 250);
    }, 3600);
  }

  // ---- Formatadores ----
  const formatarData = (valor) => {
    if (!valor) return '—';
    const d = new Date(valor.includes('T') || valor.includes(' ') ? valor.replace(' ', 'T') : `${valor}T00:00:00`);
    return d.toLocaleDateString('pt-BR');
  };
  const formatarDataHora = (valor) => {
    if (!valor) return '—';
    const d = new Date(valor.replace(' ', 'T'));
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  const formatarMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarCpf = (cpf) => {
    const n = String(cpf || '').replace(/\D/g, '').padStart(11, '');
    return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };
  const formatarTelefone = (tel) => tel || '—';

  /** Converte "2026-07-20 09:00:00" para o formato do input datetime-local. */
  const paraInputDateTime = (valor) => (valor ? valor.replace(' ', 'T').slice(0, 16) : '');

  // ---- Validacao de formulario ----
  /** Marca um campo com erro visual. */
  function marcarErro(inputEl, mensagem) {
    const field = inputEl.closest('.field');
    if (!field) return;
    field.classList.add('has-error');
    const err = field.querySelector('.field-error');
    if (err && mensagem) err.textContent = mensagem;
  }
  /** Limpa erros de um formulario. */
  function limparErros(formEl) {
    formEl.querySelectorAll('.field.has-error').forEach((f) => f.classList.remove('has-error'));
  }

  // ---- Loading em botoes ----
  function carregando(botao, ligado, textoCarregando = 'Aguarde...') {
    if (ligado) {
      botao.dataset.textoOriginal = botao.innerHTML;
      botao.disabled = true;
      botao.innerHTML = `<span class="spinner"></span> ${textoCarregando}`;
    } else {
      botao.disabled = false;
      if (botao.dataset.textoOriginal) botao.innerHTML = botao.dataset.textoOriginal;
    }
  }

  // ---- Modais ----
  function abrirModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('aberto'); document.body.style.overflow = 'hidden'; }
  }
  function fecharModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('aberto'); document.body.style.overflow = ''; }
  }

  /**
   * Dialogo de confirmacao (retorna Promise<boolean>).
   */
  function confirmar(mensagem, { titulo = 'Confirmar ação', okTexto = 'Confirmar', perigo = true } = {}) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal aberto';
      overlay.innerHTML = `
        <div class="modal-box" style="max-width:420px">
          <div class="modal-head"><h3>${titulo}</h3></div>
          <div class="modal-body"><p style="color:var(--muted)">${mensagem}</p></div>
          <div class="modal-foot">
            <button class="btn btn-ghost" data-acao="cancelar">Cancelar</button>
            <button class="btn ${perigo ? 'btn-danger' : 'btn-primary'}" data-acao="ok">${okTexto}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      const fechar = (valor) => { overlay.remove(); document.body.style.overflow = ''; resolve(valor); };
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.dataset.acao === 'cancelar') fechar(false);
        if (e.target.dataset.acao === 'ok') fechar(true);
      });
    });
  }

  /** Traduz o status de agendamento em um badge com cor. */
  function badgeStatus(status) {
    const mapa = {
      agendado: ['Agendado', 'badge-info'],
      confirmado: ['Confirmado', 'badge-success'],
      concluido: ['Concluído', 'badge-neutral'],
      cancelado: ['Cancelado', 'badge-danger'],
    };
    const [texto, classe] = mapa[status] || [status, 'badge-neutral'];
    return `<span class="badge ${classe}">${texto}</span>`;
  }

  return {
    toast, formatarData, formatarDataHora, formatarMoeda, formatarCpf, formatarTelefone,
    paraInputDateTime, marcarErro, limparErros, carregando, abrirModal, fecharModal,
    confirmar, badgeStatus,
  };
})();
