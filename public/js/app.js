/* ===================== ESTADO ===================== */
let currentUser = null;
let currentItemId = 'i1';
let currentItem = null;
let currentDonorId = 'marina';
let currentRequestId = null;
const PROTECTED_SCREENS = ['busca', 'produto', 'perfil', 'carrinho', 'form', 'tracking'];

/* ===================== HELPER DE API ===================== */
async function api(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  let data = {};
  try { data = await res.json(); } catch (e) { /* resposta vazia */ }
  if (!res.ok) {
    const erro = new Error(data.erro || 'Erro inesperado.');
    erro.status = res.status;
    erro.payload = data;
    throw erro;
  }
  return data;
}

/* ===================== NAVEGAÇÃO ===================== */
async function goTo(name) {
  if (PROTECTED_SCREENS.includes(name) && !currentUser) {
    const msg = document.getElementById('login-msg');
    if (msg) msg.textContent = 'Faça login ou cadastre-se para continuar.';
    name = 'login';
  }
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
  window.scrollTo({ top: 0, behavior: 'smooth' });

  try {
    if (name === 'busca') await renderBusca();
    if (name === 'produto') await renderProdutoScreen();
    if (name === 'perfil') await renderPerfilScreen();
    if (name === 'carrinho') await renderCarrinhoScreen();
    if (name === 'tracking') await renderTrackingScreen();
  } catch (e) {
    console.error(e);
  }
}
document.querySelectorAll('.tabs button').forEach(b => {
  b.addEventListener('click', () => goTo(b.dataset.screen));
});

function togglePw(id, el) {
  const input = document.getElementById(id);
  if (!input) return;
  const isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
}

// delegated handler for `.pw-toggle` buttons
document.addEventListener('click', function (e) {
  const btn = e.target.closest && e.target.closest('.pw-toggle');
  if (!btn) return;
  const targetId = btn.dataset.target;
  if (!targetId) return;
  const input = document.getElementById(targetId);
  if (!input) return;
  const isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
});

// initialize pw-toggle buttons to reflect current input type
function initPwToggles() {
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    const target = btn.dataset.target;
    const input = document.getElementById(target);
    if (!input) return;
    const isPw = input.type === 'password';
  });
}
document.addEventListener('DOMContentLoaded', initPwToggles);

function setRole(role) {
  document.getElementById('rt-doador').classList.toggle('active', role === 'doador');
  document.getElementById('rt-donatario').classList.toggle('active', role === 'donatario');
  document.getElementById('cad-btn').textContent = role === 'doador' ? 'Cadastrar como doador' : 'Cadastrar como donatário';
}

/* ===================== CADASTRO / LOGIN ===================== */
async function cadastrar() {
  const nome = document.getElementById('cad-nome').value.trim();
  const idade = document.getElementById('cad-idade').value.trim();
  const cpf = document.getElementById('cad-cpf').value.trim();
  const telefone = document.getElementById('cad-telefone').value.trim();
  const email = document.getElementById('cad-email').value.trim();
  const senha = document.getElementById('cad-senha').value;
  const confirmar = document.getElementById('cad-confirmar').value;
  const msg = document.getElementById('cad-msg');
  const tipo = document.getElementById('rt-doador').classList.contains('active') ? 'doador' : 'donatario';

  msg.textContent = '';
  try {
    const data = await api('/api/cadastro', {
      method: 'POST',
      body: { nome, idade, cpf, telefone, email, senha, confirmar, tipo }
    });
    currentUser = data.usuario;
    goTo('busca');
  } catch (e) {
    msg.textContent = e.message;
  }
}

async function fazerLogin() {
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;
  const msg = document.getElementById('login-msg');
  msg.textContent = '';
  try {
    const data = await api('/api/login', { method: 'POST', body: { email, senha } });
    currentUser = data.usuario;
    goTo('busca');
  } catch (e) {
    msg.textContent = e.message;
  }
}

async function logout() {
  try { await api('/api/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
  currentUser = null;
  goTo('login');
}

/* ===================== BUSCA ===================== */
function renderSessionSlot() {
  const el = document.getElementById('busca-session');
  if (!el) return;
  el.innerHTML = currentUser
    ? `<span style="font-size:12px; margin-right:10px;">Olá, ${escapeHtml(currentUser.nome.split(' ')[0])}</span><span style="cursor:pointer;" onclick="logout()">Sair</span>`
    : '';
}

function executarBusca() { renderBusca(); }

async function renderBusca() {
  renderSessionSlot();
  const q = (document.getElementById('busca-input').value || '').trim();
  const local = (document.getElementById('busca-local').value || '').trim();

  document.getElementById('busca-titulo-1').textContent = q
    ? `Resultados para "${q}"`
    : 'Com base na sua pesquisa';

  try {
    const { items } = await api(`/api/items?q=${encodeURIComponent(q)}&local=${encodeURIComponent(local)}`);
    const principais = q || local ? items : items.filter(it => it.nome.startsWith('iPhone 7'));
    const similares = items.filter(it => it.nome.startsWith('iPhone 6'));
    renderCards(principais.length ? principais : items.slice(0, 3), 'grid-1');
    renderCards(similares, 'grid-2');
  } catch (e) {
    console.error(e);
  }
}

function renderCards(list, elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<p style="font-size:12.5px; color:var(--ink-soft);">Nenhum item encontrado.</p>';
    return;
  }
  el.innerHTML = list.map(it => `
    <div class="item-card" onclick="abrirProduto('${it.id}')">
      <div class="item-thumb">${it.icon}</div>
      <div class="item-info">
        <span class="tag">${escapeHtml(it.tag)}</span>
        <p class="name">${escapeHtml(it.nome)}</p>
        <p class="loc">${escapeHtml(it.loc)}</p>
      </div>
    </div>`).join('');
}

/* ===================== PRODUTO ===================== */
function abrirProduto(itemId) {
  currentItemId = itemId;
  goTo('produto');
}

async function renderProdutoScreen() {
  const body = document.getElementById('produto-body');
  try {
    const { item, outrosDoDoador } = await api(`/api/items/${currentItemId}`);
    currentItem = item;

    const carList = item.caracteristicas.map(c => `<li>${escapeHtml(c)}</li>`).join('');
    const espList = item.especificacoes.map(e => `<li>${escapeHtml(e)}</li>`).join('');

    body.innerHTML = `
      <div class="back-row" onclick="goTo('busca')">← Voltar</div>
      <div class="produto-main">
        <div class="produto-photo">
          <div class="phone-mock"><div class="screen-mock">${item.icon}</div></div>
        </div>
        <div class="produto-panel">
          <h2>${escapeHtml(item.nome)}${item.variante ? ', ' + escapeHtml(item.variante) : ''}</h2>
          <h4>Informações técnicas</h4>
          <p style="font-size:13.5px; color:var(--ink); margin:0 0 4px; font-weight:600;">Características:</p>
          <ul>${carList}</ul>
          <p style="font-size:13.5px; color:var(--ink); margin:14px 0 4px; font-weight:600;">Especificações:</p>
          <ul>${espList}</ul>
          ${item.doador ? `<p style="font-size:12.5px; color:var(--ink-soft); margin-top:14px;">Doado por <a href="#" onclick="abrirPerfil('${item.doador.id}'); return false;" style="color:var(--forest); font-weight:600;">${escapeHtml(item.doador.nome)}</a></p>` : ''}
          <button class="btn-primary" onclick="goTo('form')">Preencher formulário</button>
        </div>
      </div>
      <p class="similar-heading">Produtos similares</p>
      <div class="card-grid" id="grid-produto-similares" style="grid-template-columns:repeat(5,1fr);"></div>
    `;
    renderCards(outrosDoDoador.slice(0, 5), 'grid-produto-similares');

    const label = document.getElementById('form-item-label');
    if (label) label.textContent = `${item.nome} · ${item.tag}`;
  } catch (e) {
    body.innerHTML = `<p style="padding:20px; color:var(--ink-soft);">Não foi possível carregar este item.</p>`;
  }
}

/* ===================== PERFIL DO DOADOR ===================== */
function abrirPerfil(donorId) {
  currentDonorId = donorId;
  goTo('perfil');
}

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

async function renderPerfilScreen() {
  const body = document.getElementById('perfil-body');
  const donorId = (currentItem && currentItem.doador) ? currentItem.doador.id : currentDonorId;
  try {
    const { donor, itens } = await api(`/api/donors/${donorId}`);

    body.innerHTML = `
      <div class="back-row" onclick="goTo('produto')">← Voltar ao produto</div>
      <div class="perfil-hero">
        <div class="perfil-avatar">${escapeHtml(donor.avatar)}</div>
        <div class="perfil-hero-info">
          <h2>${escapeHtml(donor.nome)}</h2>
          <p class="since">Doador(a) desde ${escapeHtml(donor.desde)} · ${escapeHtml(donor.local)}</p>
          <div class="perfil-badges">
            <span class="perfil-badge">✓ Identidade verificada</span>
            <span class="perfil-badge">✓ CPF confirmado</span>
            <span class="perfil-badge">⚡ Responde rápido</span>
          </div>
        </div>
        <div class="perfil-stars">
          <div class="num">${donor.nota}</div>
          <div class="stars">${stars(5)}</div>
          <div class="count">${donor.avaliacoes} avaliações</div>
        </div>
      </div>
      <div class="perfil-grid">
        <div class="perfil-card">
          <h4>Resumo</h4>
          <div class="perfil-stat-row"><span class="label">Itens doados</span><span class="value">${donor.itensDoados}</span></div>
          <div class="perfil-stat-row"><span class="label">Doações concluídas</span><span class="value">${donor.doacoesConcluidas}</span></div>
          <div class="perfil-stat-row"><span class="label">Tempo médio de resposta</span><span class="value">${escapeHtml(donor.tempoResposta)}</span></div>
          <div class="perfil-stat-row"><span class="label">Taxa de confirmação</span><span class="value">${escapeHtml(donor.taxaConfirmacao)}</span></div>
          <h4 style="margin-top:20px;">Sobre</h4>
          <p class="perfil-about">${escapeHtml(donor.sobre)}</p>
        </div>
        <div class="perfil-card">
          <h4>Avaliações de quem já recebeu</h4>
          ${donor.reviews.map(r => `
            <div class="review">
              <div class="review-top"><span class="who">${escapeHtml(r.who)}</span><span class="stars">${stars(r.stars)}</span></div>
              <p>${escapeHtml(r.text)}</p>
            </div>`).join('')}
        </div>
      </div>
      <div class="perfil-items">
        <h3>Outros itens deste doador(a)</h3>
        <div class="card-grid" id="grid-perfil-itens"></div>
      </div>
    `;
    renderCards(itens, 'grid-perfil-itens');
  } catch (e) {
    body.innerHTML = `<p style="padding:20px; color:var(--ink-soft);">Não foi possível carregar este perfil.</p>`;
  }
}

/* ===================== FORMULÁRIO ===================== */
async function enviarFormulario() {
  const msg = document.getElementById('form-msg');
  const declare = document.getElementById('declare').checked;
  msg.textContent = '';

  const formData = {
    profissao: document.getElementById('f-profissao').value,
    endereco: document.getElementById('f-endereco').value,
    renda: document.getElementById('f-renda').value,
    perto: document.getElementById('f-perto').value,
    motivo: document.getElementById('f-motivo').value,
    conserto: document.getElementById('f-conserto').value
  };

  try {
    const { pedido } = await api('/api/requests', {
      method: 'POST',
      body: { itemId: currentItemId, formData, declare }
    });
    currentRequestId = pedido.id;
    goTo('carrinho');
  } catch (e) {
    if (e.status === 401) { goTo('login'); return; }
    msg.textContent = e.message;
  }
}

/* ===================== CARRINHO ===================== */
async function renderCarrinhoScreen() {
  const body = document.getElementById('carrinho-body');
  try {
    const { pedidos } = await api('/api/requests/mine');

    if (!pedidos.length) {
      body.innerHTML = `
        <h2 class="carrinho-title">Seu carrinho</h2>
        <p style="font-size:13.5px; color:var(--ink-soft);">Você ainda não tem nenhuma solicitação. <a href="#" onclick="goTo('busca'); return false;" style="color:var(--forest); font-weight:600;">Buscar itens →</a></p>
      `;
      return;
    }

    const statusLabel = {
      pendente: 'Solicitação enviada — aguardando aprovação',
      a_caminho: 'Retirada confirmada — em andamento',
      concluido: 'Retirada concluída'
    };

    const itemsHtml = pedidos.map(pedido => {
      const item = pedido.item;
      const donor = item.doador;
      const actionBtn = pedido.status === 'pendente'
        ? `<button class="btn-primary" style="margin-top:12px;" onclick="confirmarRetirada('${pedido.id}')">Confirmar retirada</button>`
        : pedido.status === 'a_caminho'
          ? `<button class="btn-primary" style="margin-top:12px;" onclick="currentRequestId='${pedido.id}'; goTo('tracking')">Ver rastreamento</button>`
          : `<span class="carrinho-status" style="background:#DFF3E3;"><span class="dot"></span> Concluído</span>`;
      return `
        <div class="carrinho-item">
          <div class="carrinho-thumb">${item.icon}</div>
          <div class="carrinho-info">
            <p class="name">${escapeHtml(item.nome)}${item.variante ? ', ' + escapeHtml(item.variante) : ''}</p>
            <p class="meta">${escapeHtml(item.tag)} · Retirada em ${escapeHtml(item.loc)}</p>
            <span class="carrinho-status"><span class="dot"></span> ${statusLabel[pedido.status]}</span>
            <div class="carrinho-donor">
              <div class="mini-avatar">${escapeHtml(donor.avatar)}</div>
              <span class="who">${escapeHtml(donor.nome)}</span>
              <a onclick="abrirPerfil('${donor.id}')">Ver perfil →</a>
            </div>
            ${actionBtn}
          </div>
        </div>`;
    }).join('');

    body.innerHTML = `
      <h2 class="carrinho-title">Seu carrinho</h2>
      <div class="carrinho-layout">
        <div>${itemsHtml}</div>
        <div class="carrinho-summary">
          <h4>Resumo</h4>
          <div class="summary-row"><span>Itens</span><span>${pedidos.length}</span></div>
          <div class="summary-row"><span>Taxa da plataforma</span><span>R$ 0,00</span></div>
          <div class="summary-row total"><span>Total</span><span>R$ 0,00</span></div>
          <p class="carrinho-note">A Repassa é 100% gratuita. Ao confirmar, você poderá acompanhar a retirada em tempo real por segurança.</p>
        </div>
      </div>
    `;
  } catch (e) {
    if (e.status === 401) { goTo('login'); return; }
    body.innerHTML = `<p style="padding:20px; color:var(--ink-soft);">Não foi possível carregar o carrinho.</p>`;
  }
}

async function confirmarRetirada(pedidoId) {
  try {
    await api(`/api/requests/${pedidoId}/confirmar`, { method: 'POST' });
    currentRequestId = pedidoId;
    goTo('tracking');
  } catch (e) {
    alert(e.message);
  }
}

/* ===================== RASTREAMENTO ===================== */
async function renderTrackingScreen() {
  const panel = document.getElementById('tracking-panel');
  try {
    const { pedidos } = await api('/api/requests/mine');
    let pedido = pedidos.find(p => p.id === currentRequestId);
    if (!pedido) pedido = pedidos.find(p => p.status !== 'concluido');
    if (!pedido) {
      panel.innerHTML = `<p style="font-size:13.5px; color:rgba(255,255,255,.85);">Nenhuma retirada em andamento no momento.</p>`;
      return;
    }
    currentRequestId = pedido.id;
    const item = pedido.item;
    const donor = item.doador;
    const finished = pedido.status === 'concluido';

    panel.innerHTML = `
      <h3>${finished ? 'Retirada concluída' : 'A caminho da retirada'}</h3>
      <p class="sub">${escapeHtml(item.nome)}${item.variante ? ', ' + escapeHtml(item.variante) : ''} · com ${escapeHtml(donor.nome)}</p>

      <div class="safety-code">
        <div class="label">Código de segurança da retirada</div>
        <div class="code">${pedido.code.split('').join(' ')}</div>
        <div class="hint">Mostre este código à pessoa doadora para confirmar sua identidade</div>
      </div>

      <ul class="track-steps">
        <li class="done"><span class="bullet">✓</span><div class="txt"><div class="t1">Solicitação aprovada</div><div class="t2">${escapeHtml(donor.nome.split(' ')[0])} confirmou sua retirada</div></div></li>
        <li class="${finished ? 'done' : 'active'}"><span class="bullet">${finished ? '✓' : '●'}</span><div class="txt"><div class="t1">Você está a caminho</div><div class="t2">Localização compartilhada em tempo real</div></div></li>
        <li class="${finished ? 'done' : 'pending'}"><span class="bullet">${finished ? '✓' : '3'}</span><div class="txt"><div class="t1">Retirada confirmada</div><div class="t2">Ambos confirmam com o código de segurança</div></div></li>
        <li class="pending"><span class="bullet">4</span><div class="txt"><div class="t1">Avaliação</div><div class="t2">Avalie como foi a experiência</div></div></li>
      </ul>

      <div class="tracking-donor-card">
        <div class="mini-avatar">${escapeHtml(donor.avatar)}</div>
        <div class="info">
          <div class="name">${escapeHtml(donor.nome)}</div>
          <div class="plate">★ ${donor.nota} · Identidade verificada</div>
        </div>
        <button class="action" title="Chamar" onclick="alert('Ligação simulada nesta versão.')">📞</button>
        <button class="action" title="Mensagem" onclick="alert('Chat simulado nesta versão.')">💬</button>
      </div>

      <div class="tracking-actions">
        <button class="btn-primary btn-ghost" onclick="alert('Link de acompanhamento copiado (simulado).')">Compartilhar trajeto</button>
        ${finished
          ? `<button class="btn-primary" onclick="goTo('carrinho')">Voltar ao carrinho</button>`
          : `<button class="btn-primary" onclick="marcarChegou()">Cheguei</button>`}
      </div>
      <div class="safety-footer">🛡️ Sua localização é compartilhada só durante a retirada, com você e a doadora.</div>
    `;
  } catch (e) {
    if (e.status === 401) { goTo('login'); return; }
    panel.innerHTML = `<p style="color:rgba(255,255,255,.85);">Não foi possível carregar o rastreamento.</p>`;
  }
}

async function marcarChegou() {
  if (!currentRequestId) return;
  try {
    await api(`/api/requests/${currentRequestId}/chegou`, { method: 'POST' });
    renderTrackingScreen();
  } catch (e) {
    alert(e.message);
  }
}

/* ===================== UTIL ===================== */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/* ===================== INIT ===================== */
(async function init() {
  try {
    const { usuario } = await api('/api/me');
    currentUser = usuario;
  } catch (e) {
    currentUser = null;
  }
  goTo(currentUser ? 'busca' : 'login');
})();
