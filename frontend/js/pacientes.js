'use strict';

/**
 * CRUD de Pacientes no painel.
 * Consome /api/pacientes via fetch (Api) e atualiza a tabela.
 */
(function pacientes() {
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

  // ---- Listagem ----
  async function carregar() {
    mostrarSkeleton();
    try {
      const r = await Api.get('/pacientes', { page: estado.page, limit: estado.limit, busca: estado.busca });
      estado.total = r.total;
      render(r.itens);
      renderPaginacao();
    } catch (erro) {
      UI.toast(erro.message, 'erro');
      el.tbody.innerHTML = linhaMensagem('Erro ao carregar os pacientes.');
    }
  }

  function mostrarSkeleton() {
    el.tbody.innerHTML = Array.from({ length: 5 })
      .map(() => `<tr class="skeleton-row">${'<td><div class="skeleton"></div></td>'.repeat(6)}</tr>`)
      .join('');
  }

  function linhaMensagem(texto) {
    return `<tr><td colspan="6"><div class="empty-state"><h3>${texto}</h3></div></td></tr>`;
  }

  function render(itens) {
    if (!itens.length) {
      el.tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        <h3>Nenhum paciente encontrado</h3><p>Cadastre o primeiro paciente clicando em "Novo paciente".</p></div></td></tr>`;
      return;
    }
    el.tbody.innerHTML = itens
      .map(
        (p) => `
        <tr>
          <td><span class="nome-strong">${p.nome}</span></td>
          <td>${UI.formatarCpf(p.cpf)}</td>
          <td>${UI.formatarData(p.data_nascimento)}</td>
          <td>${p.telefone}</td>
          <td>${p.email || '—'}</td>
          <td class="acoes">
            <button class="icon-btn" data-editar="${p.id}" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
            </button>
            <button class="icon-btn danger" data-excluir="${p.id}" data-nome="${p.nome}" title="Excluir">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
            </button>
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
    for (let i = 1; i <= totalPaginas; i++) {
      botoes += `<button class="${i === estado.page ? 'ativo' : ''}" data-page="${i}">${i}</button>`;
    }
    el.paginacao.innerHTML = `
      <div class="info">Mostrando ${inicio}–${fim} de ${estado.total}</div>
      <div class="controls">
        <button data-page="${estado.page - 1}" ${estado.page === 1 ? 'disabled' : ''}>‹</button>
        ${botoes}
        <button data-page="${estado.page + 1}" ${estado.page === totalPaginas ? 'disabled' : ''}>›</button>
      </div>`;
  }

  // ---- Modal ----
  function abrirNovo() {
    el.form.reset();
    document.getElementById('f-id').value = '';
    el.modalTitulo.textContent = 'Novo paciente';
    UI.limparErros(el.form);
    UI.abrirModal('modal');
  }

  async function abrirEditar(id) {
    try {
      const p = await Api.get(`/pacientes/${id}`);
      el.form.reset();
      UI.limparErros(el.form);
      document.getElementById('f-id').value = p.id;
      document.getElementById('f-nome').value = p.nome;
      document.getElementById('f-cpf').value = UI.formatarCpf(p.cpf);
      document.getElementById('f-nasc').value = p.data_nascimento;
      document.getElementById('f-sexo').value = p.sexo;
      document.getElementById('f-tel').value = p.telefone;
      document.getElementById('f-email').value = p.email || '';
      document.getElementById('f-end').value = p.endereco || '';
      document.getElementById('f-obs').value = p.observacoes || '';
      el.modalTitulo.textContent = 'Editar paciente';
      UI.abrirModal('modal');
    } catch (erro) {
      UI.toast(erro.message, 'erro');
    }
  }

  // ---- Salvar (criar/editar) ----
  async function salvar(e) {
    e.preventDefault();
    UI.limparErros(el.form);

    const id = document.getElementById('f-id').value;
    const dados = {
      nome: document.getElementById('f-nome').value.trim(),
      cpf: document.getElementById('f-cpf').value.replace(/\D/g, ''),
      data_nascimento: document.getElementById('f-nasc').value,
      sexo: document.getElementById('f-sexo').value,
      telefone: document.getElementById('f-tel').value.trim(),
      email: document.getElementById('f-email').value.trim(),
      endereco: document.getElementById('f-end').value.trim(),
      observacoes: document.getElementById('f-obs').value.trim(),
    };

    // Validacao no cliente (a API tambem valida)
    if (dados.nome.length < 3) return erroCampo('f-nome');
    if (dados.cpf.length !== 11) return erroCampo('f-cpf');
    if (!dados.data_nascimento) return erroCampo('f-nasc');
    if (!dados.telefone) return erroCampo('f-tel');

    UI.carregando(el.btnSalvar, true, 'Salvando...');
    try {
      if (id) {
        await Api.put(`/pacientes/${id}`, dados);
        UI.toast('Paciente atualizado com sucesso.', 'sucesso');
      } else {
        await Api.post('/pacientes', dados);
        UI.toast('Paciente cadastrado com sucesso.', 'sucesso');
      }
      UI.fecharModal('modal');
      carregar();
    } catch (erro) {
      // Destaca campos retornados pela API, se houver
      if (erro.detalhes) {
        erro.detalhes.forEach((d) => {
          const map = { nome: 'f-nome', cpf: 'f-cpf', data_nascimento: 'f-nasc', telefone: 'f-tel', email: 'f-email' };
          if (map[d.campo]) UI.marcarErro(document.getElementById(map[d.campo]), d.mensagem);
        });
      }
      UI.toast(erro.message, 'erro');
    } finally {
      UI.carregando(el.btnSalvar, false);
    }
  }

  function erroCampo(id) {
    UI.marcarErro(document.getElementById(id));
    return false;
  }

  // ---- Excluir ----
  async function excluir(id, nome) {
    const ok = await UI.confirmar(`Deseja excluir o paciente <b>${nome}</b>? Os agendamentos vinculados também serão removidos.`, {
      titulo: 'Excluir paciente', okTexto: 'Excluir',
    });
    if (!ok) return;
    try {
      await Api.del(`/pacientes/${id}`);
      UI.toast('Paciente excluído com sucesso.', 'sucesso');
      // Se a pagina ficou vazia, volta uma
      if (el.tbody.querySelectorAll('tr').length === 1 && estado.page > 1) estado.page--;
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
    timerBusca = setTimeout(() => {
      estado.busca = el.busca.value.trim();
      estado.page = 1;
      carregar();
    }, 350);
  });

  // Mascara simples de CPF enquanto digita
  document.getElementById('f-cpf').addEventListener('input', (ev) => {
    let v = ev.target.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    ev.target.value = v;
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
  document.getElementById('modal').addEventListener('click', (ev) => {
    if (ev.target.id === 'modal') UI.fecharModal('modal');
  });

  // Inicializa
  carregar();
})();
