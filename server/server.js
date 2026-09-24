const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'repassa-troque-este-segredo';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.urlencoded({ extended: true })); // formulários HTML normais
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
    // secure: true, // habilite se o site estiver atrás de HTTPS
  }
}));

app.use(express.static(path.join(__dirname, '..', 'public')));

/* ---------- helpers ---------- */
function getUser(req) {
  if (!req.session.userId) return null;
  const u = db.get('users').find({ id: req.session.userId }).value();
  if (!u) return null;
  const { senhaHash, ...rest } = u;
  return rest;
}
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}
function itemComDoador(item) {
  const donor = db.get('donors').find({ id: item.doadorId }).value();
  return { ...item, doador: donor ? { id: donor.id, nome: donor.nome, avatar: donor.avatar, nota: donor.nota } : null };
}
function formatMes(ts) {
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const d = new Date(ts);
  return `${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

// Deixa o usuário logado disponível em todas as views, sem repetir em cada rota
app.use((req, res, next) => {
  res.locals.user = getUser(req);
  next();
});

/* ================= HOME ================= */
app.get('/', (req, res) => {
  res.redirect(req.session.userId ? '/busca' : '/login');
});

/* ================= AUTENTICAÇÃO ================= */
app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/busca');
  res.render('login', { erro: req.query.erro || null });
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body || {};
  const emailLower = (email || '').trim().toLowerCase();
  const user = db.get('users').find({ email: emailLower }).value();
  if (!user || !bcrypt.compareSync(senha || '', user.senhaHash)) {
    return res.render('login', { erro: 'Email ou senha incorretos.' });
  }
  req.session.userId = user.id;
  res.redirect('/busca');
});

app.get('/cadastro', (req, res) => {
  if (req.session.userId) return res.redirect('/busca');
  const tipo = req.query.tipo === 'donatario' ? 'donatario' : 'doador';
  res.render('cadastro', { erro: null, tipo });
});

app.post('/cadastro', (req, res) => {
  const { nome, idade, cpf, telefone, email, senha, confirmar, tipo } = req.body || {};
  const tipoFinal = tipo === 'donatario' ? 'donatario' : 'doador';

  function erro(msg) {
    return res.render('cadastro', { erro: msg, tipo: tipoFinal });
  }

  if (!nome || !email || !senha) return erro('Preencha ao menos nome, email e senha.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return erro('Digite um email válido.');
  if (senha.length < 4) return erro('A senha deve ter pelo menos 4 caracteres.');
  if (senha !== confirmar) return erro('As senhas não coincidem.');

  const emailLower = email.trim().toLowerCase();
  if (db.get('users').find({ email: emailLower }).value()) {
    return erro('Já existe um cadastro com esse email. Faça login.');
  }

  const user = {
    id: crypto.randomUUID(),
    nome, idade: idade || null, cpf: cpf || null, telefone: telefone || null,
    email: emailLower, senhaHash: bcrypt.hashSync(senha, 10),
    tipo: tipoFinal,
    criadoEm: Date.now()
  };
  db.get('users').push(user).write();
  req.session.userId = user.id;
  res.redirect('/busca');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

/* ================= MEU PERFIL (conta própria) ================= */
app.get('/perfil', requireAuth, (req, res) => {
  const user = getUser(req);
  res.render('perfil', {
    user,
    iniciais: user.nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase(),
    membroDesde: formatMes(user.criadoEm || Date.now())
  });
});

/* ================= BUSCA ================= */
app.get('/busca', requireAuth, (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  const local = (req.query.local || '').toLowerCase().trim();

  let items = db.get('items').value().map(itemComDoador);
  let principais = items.filter(it =>
    (!q || it.nome.toLowerCase().includes(q)) &&
    (!local || it.loc.toLowerCase().includes(local))
  );
  if (!q && !local) principais = items.filter(it => it.nome.startsWith('iPhone 7'));
  const similares = items.filter(it => it.nome.startsWith('iPhone 6'));

  res.render('busca', { items, principais, similares, q: req.query.q || '', local: req.query.local || '' });
});

/* ================= PRODUTO ================= */
app.get('/produto/:id', requireAuth, (req, res) => {
  const raw = db.get('items').find({ id: req.params.id }).value();
  if (!raw) return res.status(404).send('Item não encontrado.');
  const item = itemComDoador(raw);
  const outrosDoDoador = db.get('items').filter(i => i.doadorId === item.doadorId && i.id !== item.id).value().map(itemComDoador);
  res.render('produto', { item, outrosDoDoador });
});

/* ================= DOADOR (perfil público) ================= */
app.get('/doador/:id', requireAuth, (req, res) => {
  const donor = db.get('donors').find({ id: req.params.id }).value();
  if (!donor) return res.status(404).send('Doador não encontrado.');
  const itens = db.get('items').filter({ doadorId: donor.id }).value().map(itemComDoador);
  res.render('doador', { donor, itens });
});

/* ================= FORMULÁRIO ================= */
app.get('/form/:itemId', requireAuth, (req, res) => {
  const raw = db.get('items').find({ id: req.params.itemId }).value();
  if (!raw) return res.status(404).send('Item não encontrado.');
  res.render('form', { item: itemComDoador(raw), erro: null });
});

app.post('/form/:itemId', requireAuth, (req, res) => {
  const raw = db.get('items').find({ id: req.params.itemId }).value();
  if (!raw) return res.status(404).send('Item não encontrado.');
  if (!req.body.declare) {
    return res.render('form', { item: itemComDoador(raw), erro: 'É preciso aceitar a declaração de uso próprio para continuar.' });
  }
  const pedido = {
    id: crypto.randomUUID(),
    itemId: raw.id,
    userId: req.session.userId,
    status: 'pendente',
    formData: {
      profissao: req.body.profissao || '',
      endereco: req.body.endereco || '',
      renda: req.body.renda || '',
      perto: req.body.perto || '',
      motivo: req.body.motivo || '',
      conserto: req.body.conserto || ''
    },
    code: String(Math.floor(1000 + Math.random() * 9000)),
    criadoEm: Date.now()
  };
  db.get('requests').push(pedido).write();
  res.redirect('/carrinho');
});

/* ================= CARRINHO ================= */
app.get('/carrinho', requireAuth, (req, res) => {
  const pedidos = db.get('requests').filter({ userId: req.session.userId }).value()
    .sort((a, b) => b.criadoEm - a.criadoEm)
    .map(p => ({ ...p, item: itemComDoador(db.get('items').find({ id: p.itemId }).value()) }));
  res.render('carrinho', { pedidos });
});

app.post('/carrinho/:id/confirmar', requireAuth, (req, res) => {
  const pedido = db.get('requests').find({ id: req.params.id, userId: req.session.userId });
  if (pedido.value()) pedido.assign({ status: 'a_caminho' }).write();
  res.redirect(`/tracking/${req.params.id}`);
});

/* ================= RASTREAMENTO ================= */
app.get('/tracking/:id', requireAuth, (req, res) => {
  const pedido = db.get('requests').find({ id: req.params.id, userId: req.session.userId }).value();
  if (!pedido) return res.status(404).send('Pedido não encontrado.');
  const item = itemComDoador(db.get('items').find({ id: pedido.itemId }).value());
  const donor = db.get('donors').find({ id: item.doadorId }).value();
  res.render('tracking', { pedido, item, donor, finished: pedido.status === 'concluido' });
});

app.post('/tracking/:id/chegou', requireAuth, (req, res) => {
  const pedido = db.get('requests').find({ id: req.params.id, userId: req.session.userId });
  if (pedido.value()) pedido.assign({ status: 'concluido' }).write();
  res.redirect(`/tracking/${req.params.id}`);
});

/* ================= 404 ================= */
app.use((req, res) => {
  res.status(404).send('Página não encontrada. <a href="/">Voltar</a>');
});

app.listen(PORT, () => {
  console.log(`Repassa rodando em http://localhost:${PORT}`);
});
