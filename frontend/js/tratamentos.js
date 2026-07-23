'use strict';

/**
 * CRUD de Tratamentos no painel.
 */
(function tratamentos() {
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
      .map(() => `<tr class="skeleton-row">${'<td><div class="skeleton"></div></td>'.repeat(5)}</tr>`)
      .join('');
    try {
      const r = await Api.get('/tratamentos', { page: estado.page, limit: estado.limit, busca: estado.busca });
      estado.total = r.total;
      render(r.itens);
      renderPaginacao();
    } catch (erro) {
      UI.toast(erro.message, 'erro');
    }
  }

  function render(itens) {
    if (!itens.length) {
      el.tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        <h3>Nenhum tratamento encontrado</h3><p>Cadastre o primeiro tratamento da clínica.</p></div></td></tr>`;
      return;
    }
    el.tbody.innerHTML = itens
      .map(
        (t) => `
        <tr>
          <td><span class="nome-strong">${t.nome}</span></td>
          <td style="max-width:320px;color:var(--muted)">${t.descricao || '—'}</td>
          <td>${t.duracao_min} min</td>
          <td>${UI.formatarMoeda(t.valor)}</td>
          <td class="acoes">
            <button class="icon-btn" data-editar="${t.id}" title="Editar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>
            <button class="icon-btn danger" data-excluir="${t.id}" data-nome="${t.nome}" title="Excluir"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
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
    document.getElementById('f-dur').value = 60;
    document.getElementById('f-valor').value = '0.00';
    el.modalTitulo.textContent = 'Novo tratamento';
    UI.limparErros(el.form);
    UI.abrirModal('modal');
  }

  async function abrirEditar(id) {
    try {
      const t = await Api.get(`/tratamentos/${id}`);
      el.form.reset();
      UI.limparErros(el.form);
      document.getElementById('f-id').value = t.id;
      document.getElementById('f-nome').value = t.nome;
      document.getElementById('f-desc').value = t.descricao || '';
      document.getElementById('f-dur').value = t.duracao_min;
      document.getElementById('f-valor').value = t.valor;
      el.modalTitulo.textContent = 'Editar tratamento';
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
      descricao: document.getElementById('f-desc').value.trim(),
      duracao_min: Number(document.getElementById('f-dur').value),
      valor: Number(document.getElementById('f-valor').value),
    };
    if (dados.nome.length < 3) return marcar('f-nome');
    if (!dados.duracao_min || dados.duracao_min < 1) return marcar('f-dur');
    if (dados.valor < 0 || Number.isNaN(dados.valor)) return marcar('f-valor');

    UI.carregando(el.btnSalvar, true, 'Salvando...');
    try {
      if (id) { await Api.put(`/tratamentos/${id}`, dados); UI.toast('Tratamento atualizado.', 'sucesso'); }
      else { await Api.post('/tratamentos', dados); UI.toast('Tratamento cadastrado.', 'sucesso'); }
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
    const ok = await UI.confirmar(`Deseja excluir o tratamento <b>${nome}</b>? Não será possível se houver agendamentos vinculados.`, {
      titulo: 'Excluir tratamento', okTexto: 'Excluir',
    });
    if (!ok) return;
    try {
      await Api.del(`/tratamentos/${id}`);
      UI.toast('Tratamento excluído.', 'sucesso');
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
