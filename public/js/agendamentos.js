'use strict';

/**
 * CRUD de Agendamentos no painel.
 * Diferencas em relacao as outras telas:
 *  - Os selects de paciente, fisioterapeuta e tratamento sao populados
 *    dinamicamente a partir da API (carregados uma unica vez e reaproveitados).
 *  - Ha um filtro por status alem da busca por paciente.
 *  - O backend pode responder 409 (conflito de horario); a mensagem e
 *    exibida ao usuario via toast.
 */
(function agendamentos() {
  const estado = { page: 1, limit: 10, busca: '', status: '', total: 0 };
  const listas = { pacientes: [], fisioterapeutas: [], tratamentos: [] };
  let timerBusca = null;
  let opcoesCarregadas = false;

  const el = {
    tbody: document.getElementById('tbody'),
    paginacao: document.getElementById('paginacao'),
    busca: document.getElementById('busca'),
    filtroStatus: document.getElementById('filtroStatus'),
    btnNovo: document.getElementById('btnNovo'),
    form: document.getElementById('form'),
    modalTitulo: document.getElementById('modalTitulo'),
    btnSalvar: document.getElementById('btnSalvar'),
    selPaciente: document.getElementById('f-paciente'),
    selFisio: document.getElementById('f-fisio'),
    selTratamento: document.getElementById('f-tratamento'),
  };

  // ---- Carga das opcoes dos selects (uma unica vez) ----
  async function carregarOpcoes() {
    if (opcoesCarregadas) return;
    try {
      const [pac, fis, tra] = await Promise.all([
        Api.get('/pacientes', { page: 1, limit: 500 }),
        Api.get('/fisioterapeutas', { page: 1, limit: 500 }),
        Api.get('/tratamentos', { page: 1, limit: 500 }),
      ]);
      listas.pacientes = (pac.itens || []).filter((p) => p.ativo !== 0);
      listas.fisioterapeutas = fis.itens || [];
      listas.tratamentos = tra.itens || [];

      preencherSelect(el.selPaciente, listas.pacientes, (p) => p.nome);
      preencherSelect(el.selFisio, listas.fisioterapeutas, (f) => `${f.nome}${f.especialidade ? ' — ' + f.especialidade : ''}`);
      preencherSelect(el.selTratamento, listas.tratamentos, (t) => `${t.nome} (${UI.formatarMoeda(t.valor)})`);
      opcoesCarregadas = true;
    } catch (erro) {
      UI.toast('Não foi possível carregar as listas de seleção. ' + erro.message, 'erro');
      throw erro;
    }
  }

  function preencherSelect(select, itens, rotulo) {
    const atual = select.value;
    select.innerHTML =
      '<option value="">Selecione...</option>' +
      itens.map((i) => `<option value="${i.id}">${rotulo(i)}</option>`).join('');
    if (atual) select.value = atual;
  }

  // ---- Listagem ----
  async function carregar() {
    el.tbody.innerHTML = Array.from({ length: 5 })
      .map(() => `<tr class="skeleton-row">${'<td><div class="skeleton"></div></td>'.repeat(6)}</tr>`)
      .join('');
    try {
      const r = await Api.get('/agendamentos', {
        page: estado.page,
        limit: estado.limit,
        busca: estado.busca,
        status: estado.status,
      });
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
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        <h3>Nenhum agendamento encontrado</h3><p>Crie o primeiro agendamento da clínica.</p></div></td></tr>`;
      return;
    }
    el.tbody.innerHTML = itens
      .map(
        (a) => `
        <tr>
          <td><span class="nome-strong">${a.paciente_nome}</span></td>
          <td>${a.fisioterapeuta_nome}</td>
          <td style="color:var(--muted)">${a.tratamento_nome}</td>
          <td>${UI.formatarDataHora(a.data_hora)}</td>
          <td>${UI.badgeStatus(a.status)}</td>
          <td class="acoes">
            <button class="icon-btn" data-editar="${a.id}" title="Editar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>
            <button class="icon-btn danger" data-excluir="${a.id}" data-nome="${a.paciente_nome}" title="Excluir"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
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

  // ---- Criar / Editar ----
  async function abrirNovo() {
    try {
      await carregarOpcoes();
    } catch { return; }
    el.form.reset();
    document.getElementById('f-id').value = '';
    el.selPaciente.value = '';
    el.selFisio.value = '';
    el.selTratamento.value = '';
    document.getElementById('f-status').value = 'agendado';
    el.modalTitulo.textContent = 'Novo agendamento';
    UI.limparErros(el.form);
    UI.abrirModal('modal');
  }

  async function abrirEditar(id) {
    try {
      await carregarOpcoes();
      const a = await Api.get(`/agendamentos/${id}`);
      el.form.reset();
      UI.limparErros(el.form);
      document.getElementById('f-id').value = a.id;
      el.selPaciente.value = a.paciente_id;
      el.selFisio.value = a.fisioterapeuta_id;
      el.selTratamento.value = a.tratamento_id;
      document.getElementById('f-datahora').value = UI.paraInputDateTime(a.data_hora);
      document.getElementById('f-status').value = a.status;
      document.getElementById('f-obs').value = a.observacoes || '';
      el.modalTitulo.textContent = 'Editar agendamento';
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
      paciente_id: Number(el.selPaciente.value),
      fisioterapeuta_id: Number(el.selFisio.value),
      tratamento_id: Number(el.selTratamento.value),
      data_hora: document.getElementById('f-datahora').value,
      status: document.getElementById('f-status').value,
      observacoes: document.getElementById('f-obs').value.trim(),
    };

    if (!dados.paciente_id) return marcar('f-paciente');
    if (!dados.fisioterapeuta_id) return marcar('f-fisio');
    if (!dados.tratamento_id) return marcar('f-tratamento');
    if (!dados.data_hora) return marcar('f-datahora');

    UI.carregando(el.btnSalvar, true, 'Salvando...');
    try {
      if (id) { await Api.put(`/agendamentos/${id}`, dados); UI.toast('Agendamento atualizado.', 'sucesso'); }
      else { await Api.post('/agendamentos', dados); UI.toast('Agendamento criado.', 'sucesso'); }
      UI.fecharModal('modal');
      carregar();
    } catch (erro) {
      // 409 = conflito de horario do fisioterapeuta; destaca o campo de data
      if (erro.status === 409) UI.marcarErro(document.getElementById('f-datahora'), erro.message);
      UI.toast(erro.message, 'erro');
    } finally {
      UI.carregando(el.btnSalvar, false);
    }
  }

  function marcar(id) { UI.marcarErro(document.getElementById(id)); return false; }

  async function excluir(id, nome) {
    const ok = await UI.confirmar(`Deseja excluir o agendamento de <b>${nome}</b>?`, {
      titulo: 'Excluir agendamento', okTexto: 'Excluir',
    });
    if (!ok) return;
    try {
      await Api.del(`/agendamentos/${id}`);
      UI.toast('Agendamento excluído.', 'sucesso');
      // volta uma pagina se a atual ficou vazia
      const totalPaginas = Math.max(1, Math.ceil((estado.total - 1) / estado.limit));
      if (estado.page > totalPaginas) estado.page = totalPaginas;
      carregar();
    } catch (erro) {
      UI.toast(erro.message, 'erro');
    }
  }

  // ---- Eventos ----
  el.btnNovo.addEventListener('click', abrirNovo);
  el.form.addEventListener('submit', salvar);
  el.busca.addEventListener('input', () => {
    clearTimeout(timerBusca);
    timerBusca = setTimeout(() => { estado.busca = el.busca.value.trim(); estado.page = 1; carregar(); }, 350);
  });
  el.filtroStatus.addEventListener('change', () => {
    estado.status = el.filtroStatus.value;
    estado.page = 1;
    carregar();
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

  // pre-carrega as opcoes em segundo plano para abrir o modal instantaneamente
  carregarOpcoes().catch(() => {});
  carregar();
})();
