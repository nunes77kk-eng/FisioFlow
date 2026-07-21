'use strict';

/**
 * Monta a estrutura comum do painel (sidebar + topbar), protege as
 * paginas que exigem login e trata o logout. Cada pagina informa qual
 * item de menu esta ativo via <body data-pagina="...">.
 */
console.log(document.querySelector(".carousel-slide"));
console.log(document.querySelector(".next"));
console.log(document.querySelector(".prev"));
(function layout() {
  // ---- Guarda de autenticacao ----
  const usuario = Api.getUsuario();
  if (!Api.getToken() || !usuario) {
    location.href = 'login.html';
    return;
  }

  const paginaAtual = document.body.dataset.pagina || '';
  const iniciais = (usuario.nome || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  // Itens do menu (rotulo, arquivo, chave, icone SVG)
  const itens = [
    { chave: 'dashboard', rotulo: 'Dashboard', arquivo: 'dashboard.html', icone: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>' },
    { chave: 'pacientes', rotulo: 'Pacientes', arquivo: 'pacientes.html', icone: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>' },
    { chave: 'fisioterapeutas', rotulo: 'Fisioterapeutas', arquivo: 'fisioterapeutas.html', icone: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>' },
    { chave: 'tratamentos', rotulo: 'Tratamentos', arquivo: 'tratamentos.html', icone: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' },
    { chave: 'agendamentos', rotulo: 'Agendamentos', arquivo: 'agendamentos.html', icone: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>' },
  ];

  const navHtml = itens
    .map(
      (i) => `
      <a href="${i.arquivo}" class="nav-item ${i.chave === paginaAtual ? 'ativo' : ''}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${i.icone}</svg>
        ${i.rotulo}
      </a>`
    )
    .join('');

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <a href="../index.html" class="brand">
        <img src="../imagens/logo.svg" alt="" class="mark" style="width:30px;height:30px" /> FisioFlow
      </a>
      <nav class="sidebar-nav">${navHtml}</nav>
      <div class="sidebar-foot">
        <div class="sidebar-user">
          <div class="avatar">${iniciais}</div>
          <div>
            <b>${usuario.nome}</b>
            <span>${usuario.perfil}</span>
          </div>
        </div>
        <button class="btn btn-logout btn-sm" id="btnLogout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>
          Sair
        </button>
      </div>`;
  }

  // Titulo e subtitulo da pagina
  const titleEl = document.getElementById('pageTitle');
  const subEl = document.getElementById('pageSubtitle');
  if (titleEl) titleEl.textContent = document.body.dataset.titulo || '';
  if (subEl) subEl.textContent = document.body.dataset.subtitulo || '';

  // Data de hoje na topbar
  const topbarRight = document.getElementById('topbarRight');
  if (topbarRight) {
    const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    topbarRight.innerHTML = `<span style="color:var(--muted);font-size:.9rem;text-transform:capitalize">${hoje}</span>`;
  }

  // Logout
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btnLogout')) {
      Api.limparSessao();
      location.href = 'login.html';
    }
  });

  // Menu mobile
  const hamburguer = document.getElementById('hamburguer');
  const backdrop = document.getElementById('sidebarBackdrop');
  const fechar = () => { sidebar.classList.remove('aberta'); backdrop && backdrop.classList.remove('ativo'); };
  if (hamburguer && sidebar) {
    hamburguer.addEventListener('click', () => {
      sidebar.classList.toggle('aberta');
      backdrop && backdrop.classList.toggle('ativo');
    });
  }
  if (backdrop) backdrop.addEventListener('click', fechar);
})();
