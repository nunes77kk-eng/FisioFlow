'use strict';

/**
 * CRUD de Fisioterapeutas no painel.
 */
(function fisioterapeutas() {
  const estado = { page: 1, limit: 10, busca: '', total: 0 };
  let timerBusca = null;

  const el = {
    tbody: document.getElementById('tbody'),
    paginacao: document.getElementById('paginacao'),
    busca: document.getElementById('busca'),
    btnNovo: document.getElementById('btnNovo'),
    form: document.getElementById('form'),
    modalTitulo: document.getElementById('modalTitulo'),
    btnSalvar: document.getElementById('btnSalvar'),
  };

  async function carregar() {
    el.tbody.innerHTML = Array.from({ length: 5 })
      .map(() => `<tr class="skeleton-row">${'<td><div class="skeleton"></div></td>'.repeat(6)}</tr>`)
      .join('');
    try {
      const r = await Api.get('/fisioterapeutas', { page: estado.page, limit: estado.limit, busca: estado.busca });
      estado.total = r.total;
      render(r.itens);
      renderPaginacao();
    } catch (erro) {
      UI.toast(erro.message, 'erro');
    }
  }

  function render(itens) {
    if (!itens.length) {
      el.tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 12 0V4a2 2 0 0 0-2-2h-1"/><circle cx="20" cy="10" r="2"/></svg>
        <h3>Nenhum fisioterapeuta encontrado</h3><p>Cadastre o primeiro profissional da equipe.</p></div></td></tr>`;
      return;
    }
    el.tbody.innerHTML = itens
      .map(
        (f) => `
        <tr>
          <td><span class="nome-strong">${f.nome}</span></td>
          <td>${f.crefito}</td>
          <td>${f.especialidade}</td>
          <td>${f.telefone}</td>
          <td>${f.email}</td>
          <td class="acoes">
            <button class="icon-btn" data-editar="${f.id}" title="Editar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>
            <button class="icon-btn danger" data-excluir="${f.id}" data-nome="${f.nome}" title="Excluir"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
          </td>
        </tr>`
      )
      .join('');
  }

  function renderPaginacao() {
    const totalPaginas = Math.max(1, Math.ceil(estado.total / estado.limit));
    const inicio = estado.total === 0 ? 0 : (estado.page - 1) * estado.limit + 1;
    const fim = Math.min(estado.page * estado.limit, estado.total);
    let botoes = '';
    for (let i = 1; i <= totalPaginas; i++) botoes += `<button class="${i === estado.page ? 'ativo' : ''}" data-page="${i}">${i}</button>`;
    el.paginacao.innerHTML = `
      <div class="info">Mostrando ${inicio}–${fim} de ${estado.total}</div>
      <div class="controls">
        <button data-page="${estado.page - 1}" ${estado.page === 1 ? 'disabled' : ''}>‹</button>
        ${botoes}
        <button data-page="${estado.page + 1}" ${estado.page === totalPaginas ? 'disabled' : ''}>›</button>
      </div>`;
  }

  function abrirNovo() {
    el.form.reset();
    document.getElementById('f-id').value = '';
    el.modalTitulo.textContent = 'Novo fisioterapeuta';
    UI.limparErros(el.form);
    UI.abrirModal('modal');
  }

  async function abrirEditar(id) {
    try {
      const f = await Api.get(`/fisioterapeutas/${id}`);
      el.form.reset();
      UI.limparErros(el.form);
      document.getElementById('f-id').value = f.id;
      document.getElementById('f-nome').value = f.nome;
      document.getElementById('f-crefito').value = f.crefito;
      document.getElementById('f-esp').value = f.especialidade;
      document.getElementById('f-tel').value = f.telefone;
      document.getElementById('f-email').value = f.email;
      el.modalTitulo.textContent = 'Editar fisioterapeuta';
      UI.abrirModal('modal');
    } catch (erro) {
      UI.toast(erro.message, 'erro');
    }
  }

  async function salvar(e) {
    e.preventDefault();
    UI.limparErros(el.form);
    const id = document.getElementById('f-id').value;
    const dados = {
      nome: document.getElementById('f-nome').value.trim(),
      crefito: document.getElementById('f-crefito').value.trim(),
      especialidade: document.getElementById('f-esp').value.trim(),
      telefone: document.getElementById('f-tel').value.trim(),
      email: document.getElementById('f-email').value.trim(),
    };
    if (dados.nome.length < 3) return marcar('f-nome');
    if (!dados.crefito) return marcar('f-crefito');
    if (!dados.especialidade) return marcar('f-esp');
    if (!dados.telefone) return marcar('f-tel');
    if (!/^\S+@\S+\.\S+$/.test(dados.email)) return marcar('f-email');

    UI.carregando(el.btnSalvar, true, 'Salvando...');
    try {
      if (id) { await Api.put(`/fisioterapeutas/${id}`, dados); UI.toast('Fisioterapeuta atualizado.', 'sucesso'); }
      else { await Api.post('/fisioterapeutas', dados); UI.toast('Fisioterapeuta cadastrado.', 'sucesso'); }
      UI.fecharModal('modal');
      carregar();
    } catch (erro) {
      UI.toast(erro.message, 'erro');
    } finally {
      UI.carregando(el.btnSalvar, false);
    }
  }

  function marcar(id) { UI.marcarErro(document.getElementById(id)); return false; }

  async function excluir(id, nome) {
    const ok = await UI.confirmar(`Deseja excluir <b>${nome}</b>? Não será possível se houver agendamentos vinculados.`, {
      titulo: 'Excluir fisioterapeuta', okTexto: 'Excluir',
    });
    if (!ok) return;
    try {
      await Api.del(`/fisioterapeutas/${id}`);
      UI.toast('Fisioterapeuta excluído.', 'sucesso');
      carregar();
    } catch (erro) {
      UI.toast(erro.message, 'erro');
    }
  }

  el.btnNovo.addEventListener('click', abrirNovo);
  el.form.addEventListener('submit', salvar);
  el.busca.addEventListener('input', () => {
    clearTimeout(timerBusca);
    timerBusca = setTimeout(() => { estado.busca = el.busca.value.trim(); estado.page = 1; carregar(); }, 350);
  });
  el.tbody.addEventListener('click', (ev) => {
    const editar = ev.target.closest('[data-editar]');
    const excluirBtn = ev.target.closest('[data-excluir]');
    if (editar) abrirEditar(editar.dataset.editar);
    if (excluirBtn) excluir(excluirBtn.dataset.excluir, excluirBtn.dataset.nome);
  });
  el.paginacao.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-page]');
    if (!btn || btn.disabled) return;
    estado.page = Number(btn.dataset.page);
    carregar();
  });
  document.querySelectorAll('[data-fechar]').forEach((b) => b.addEventListener('click', () => UI.fecharModal('modal')));
  document.getElementById('modal').addEventListener('click', (ev) => { if (ev.target.id === 'modal') UI.fecharModal('modal'); });

  carregar();
})();
