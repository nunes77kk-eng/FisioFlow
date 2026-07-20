'use strict';

/**
 * Dashboard: consome /api/dashboard e renderiza metricas,
 * proximos agendamentos e a distribuicao por status.
 */
document.addEventListener('DOMContentLoaded', carregarDashboard);

async function carregarDashboard() {
  try {
    const dados = await Api.get('/dashboard');
    renderMetricas(dados.totais);
    renderProximos(dados.proximos_agendamentos);
    renderStatus(dados.agendamentos_por_status, dados.totais.agendamentos);
  } catch (erro) {
    UI.toast(erro.message || 'Erro ao carregar o dashboard.', 'erro');
  }
}

function renderMetricas(t) {
  const cards = [
    { icone: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>', cor: 'c1', valor: t.pacientes, rotulo: 'Pacientes' },
    { icone: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 12 0V4a2 2 0 0 0-2-2h-1"/><circle cx="20" cy="10" r="2"/>', cor: 'c2', valor: t.fisioterapeutas, rotulo: 'Fisioterapeutas' },
    { icone: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>', cor: 'c3', valor: t.tratamentos, rotulo: 'Tratamentos' },
    { icone: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>', cor: 'c4', valor: t.agendamentos, rotulo: 'Agendamentos' },
  ];
  document.getElementById('metricGrid').innerHTML = cards
    .map(
      (c) => `
      <div class="metric">
        <div class="m-ic ${c.cor}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${c.icone}</svg></div>
        <div><b>${c.valor}</b><span>${c.rotulo}</span></div>
      </div>`
    )
    .join('');
}

function renderProximos(lista) {
  const alvo = document.getElementById('proximos');
  if (!lista || lista.length === 0) {
    alvo.innerHTML = '<div class="empty-state" style="padding:30px"><h3>Sem agendamentos futuros</h3><p>Novos agendamentos aparecerão aqui.</p></div>';
    return;
  }
  alvo.innerHTML = lista
    .map((a) => {
      const d = new Date(a.data_hora.replace(' ', 'T'));
      const dia = d.toLocaleDateString('pt-BR', { day: '2-digit' });
      const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="timeline-item">
          <div class="when"><b>${dia}</b><span>${mes}</span></div>
          <div class="info">
            <b>${a.paciente_nome}</b>
            <span>${a.tratamento_nome} · ${a.fisioterapeuta_nome} · ${hora}</span>
          </div>
          <div style="margin-left:auto">${UI.badgeStatus(a.status)}</div>
        </div>`;
    })
    .join('');
}

function renderStatus(porStatus, total) {
  const alvo = document.getElementById('statusChart');
  const cores = { agendado: 'var(--primary)', confirmado: 'var(--success)', concluido: 'var(--muted)', cancelado: 'var(--danger)' };
  const rotulos = { agendado: 'Agendados', confirmado: 'Confirmados', concluido: 'Concluídos', cancelado: 'Cancelados' };
  const ordem = ['agendado', 'confirmado', 'concluido', 'cancelado'];

  const mapa = {};
  porStatus.forEach((s) => (mapa[s.status] = s.total));

  alvo.innerHTML = ordem
    .map((chave) => {
      const valor = mapa[chave] || 0;
      const pct = total ? Math.round((valor / total) * 100) : 0;
      return `
        <div style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;font-size:.9rem;margin-bottom:6px">
            <span>${rotulos[chave]}</span><b>${valor}</b>
          </div>
          <div style="height:9px;background:var(--bg);border-radius:99px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${cores[chave]};border-radius:99px;transition:width .5s"></div>
          </div>
        </div>`;
    })
    .join('');
}
