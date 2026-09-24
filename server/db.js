// Banco de dados simples baseado em arquivo JSON (lowdb).
// Não exige instalação de MySQL/Postgres nem compilação de módulos nativos.
// Os dados ficam salvos em data/db.json (criado automaticamente).

const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const adapter = new FileSync(path.join(dataDir, 'db.json'));
const db = low(adapter);

const seed = {
  users: [], // {id, nome, idade, cpf, telefone, email, senhaHash, tipo, criadoEm}
  donors: [
    {
      id: 'marina',
      nome: 'Marina Costa',
      avatar: 'MC',
      desde: 'Março de 2024',
      local: 'São José dos Campos, SP',
      nota: 4.9,
      avaliacoes: 32,
      itensDoados: 18,
      doacoesConcluidas: 16,
      tempoResposta: '~2 horas',
      taxaConfirmacao: '96%',
      sobre: 'Gosto de dar um novo destino pra coisas que ainda estão em bom estado. Prefiro combinar retirada durante a semana, à tarde.',
      reviews: [
        { who: 'João P.', stars: 5, text: 'Item exatamente como descrito, Marina foi super atenciosa na entrega.' },
        { who: 'Ana L.', stars: 5, text: 'Combinamos tudo rapidinho pelo chat, retirada tranquila.' },
        { who: 'Pedro S.', stars: 4, text: 'Muito solícita, só demorou um pouco pra confirmar o horário.' }
      ]
    }
  ],
  items: [
    { id: 'i1', nome: 'iPhone 7', variante: '256GB, Preto Brilhante', tag: 'Semi-novo', loc: 'Av. Andrômeda, 120 — São José dos Campos, SP', doadorId: 'marina', icon: '📱',
      caracteristicas: ['Marca: Apple', 'Modelo: iPhone 7'],
      especificacoes: ['Condição: Bom', 'Cor: Preto Brilhante', 'Memória Interna: 256GB', 'Memória RAM: 2GB', 'Câmera Principal: 12MP', 'Câmera Frontal: 7MP', 'Chip: um chip', 'Processador: Quad-core 2.34GHz e 2GHz', 'Resolução da tela: 1334 x 750 pixels', 'Tamanho da tela: 4.7"', 'Dual SIM: Não', 'Operadora: Desbloqueado'] },
    { id: 'i2', nome: 'iPhone 7', variante: '128GB, Preto', tag: 'Usado', loc: 'R. das Palmeiras, 45 — São José dos Campos, SP', doadorId: 'marina', icon: '📱',
      caracteristicas: ['Marca: Apple', 'Modelo: iPhone 7'],
      especificacoes: ['Condição: Usado, com marcas de uso', 'Cor: Preto', 'Memória Interna: 128GB', 'Memória RAM: 2GB', 'Operadora: Desbloqueado'] },
    { id: 'i3', nome: 'iPhone 7', variante: '256GB, Dourado', tag: 'Semi-novo', loc: 'Av. Brasil, 890 — São José dos Campos, SP', doadorId: 'marina', icon: '📱',
      caracteristicas: ['Marca: Apple', 'Modelo: iPhone 7'],
      especificacoes: ['Condição: Bom', 'Cor: Dourado', 'Memória Interna: 256GB', 'Operadora: Desbloqueado'] },
    { id: 'i4', nome: 'iPhone 6', variante: '64GB, Prateado', tag: 'Semi-novo', loc: 'R. Tucunaré, 12 — São José dos Campos, SP', doadorId: 'marina', icon: '📱',
      caracteristicas: ['Marca: Apple', 'Modelo: iPhone 6'],
      especificacoes: ['Condição: Bom', 'Memória Interna: 64GB', 'Operadora: Desbloqueado'] },
    { id: 'i5', nome: 'iPhone 6', variante: '32GB, Cinza espacial', tag: 'Semi-novo', loc: 'Av. Dr. Nelson, 300 — São José dos Campos, SP', doadorId: 'marina', icon: '📱',
      caracteristicas: ['Marca: Apple', 'Modelo: iPhone 6'],
      especificacoes: ['Condição: Bom', 'Memória Interna: 32GB', 'Operadora: Desbloqueado'] },
    { id: 'i6', nome: 'iPhone 6', variante: '64GB, Prateado', tag: 'Semi-novo', loc: 'R. Bahia, 77 — São José dos Campos, SP', doadorId: 'marina', icon: '📱',
      caracteristicas: ['Marca: Apple', 'Modelo: iPhone 6'],
      especificacoes: ['Condição: Bom', 'Memória Interna: 64GB', 'Operadora: Desbloqueado'] },
    { id: 'i7', nome: 'Samsung Galaxy Mega', variante: '', tag: 'Usado', loc: 'Av. xxxxx, xx — São José dos Campos, SP', doadorId: 'marina', icon: '📱',
      caracteristicas: ['Marca: Samsung', 'Modelo: Galaxy Mega'],
      especificacoes: ['Condição: Usado', 'Operadora: Desbloqueado'] },
    { id: 'i8', nome: 'Samsung Galaxy Mega', variante: '', tag: 'Usado', loc: 'Av. xxxxx, xx — São José dos Campos, SP', doadorId: 'marina', icon: '📱',
      caracteristicas: ['Marca: Samsung', 'Modelo: Galaxy Mega'],
      especificacoes: ['Condição: Usado', 'Operadora: Desbloqueado'] },
    { id: 'i9', nome: 'Samsung Galaxy Mega', variante: '', tag: 'Usado', loc: 'Av. xxxxx, xx — São José dos Campos, SP', doadorId: 'marina', icon: '📱',
      caracteristicas: ['Marca: Samsung', 'Modelo: Galaxy Mega'],
      especificacoes: ['Condição: Usado', 'Operadora: Desbloqueado'] },
    { id: 'i10', nome: 'Cadeira de escritório', variante: '', tag: 'Bom estado', loc: 'Av. Andrômeda, 120 — São José dos Campos, SP', doadorId: 'marina', icon: '🪑',
      caracteristicas: ['Categoria: Móveis'],
      especificacoes: ['Condição: Bom estado'] },
    { id: 'i11', nome: 'Livros diversos (caixa)', variante: '', tag: 'Usado', loc: 'Av. Andrômeda, 120 — São José dos Campos, SP', doadorId: 'marina', icon: '📚',
      caracteristicas: ['Categoria: Livros'],
      especificacoes: ['Condição: Usado', 'Quantidade: 1 caixa'] },
    { id: 'i12', nome: 'Micro-ondas Electrolux', variante: '', tag: 'Semi-novo', loc: 'Av. Andrômeda, 120 — São José dos Campos, SP', doadorId: 'marina', icon: '🍽️',
      caracteristicas: ['Categoria: Eletrodomésticos', 'Marca: Electrolux'],
      especificacoes: ['Condição: Semi-novo'] }
  ],
  requests: [] // {id, itemId, userId, status, formData, code, criadoEm}
};

// Só popula se o arquivo ainda não existir / estiver vazio
db.defaults(seed).write();

// Conta padrão para acessar o site enquanto o cadastro/banco definitivo
// não está pronto. Só é criada se ainda não existir (não sobrescreve senha
// se alguém já mudou algo manualmente).
const DEFAULT_EMAIL = 'ingrid.lacerd@gmail.com';
const DEFAULT_SENHA = '123456';
if (!db.get('users').find({ email: DEFAULT_EMAIL }).value()) {
  db.get('users').push({
    id: 'ingrid-default',
    nome: 'Ingrid Lacerda',
    idade: null,
    cpf: null,
    telefone: null,
    email: DEFAULT_EMAIL,
    senhaHash: bcrypt.hashSync(DEFAULT_SENHA, 10),
    tipo: 'doador',
    criadoEm: Date.now()
  }).write();
}

module.exports = db;
