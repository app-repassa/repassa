# Repassa

Site (não mais protótipo) de doações: quem tem um item parado se cadastra
como **Doador**, quem precisa se cadastra como **Donatário**, pesquisa itens,
preenche um formulário de solicitação e acompanha a retirada com um código
de segurança e uma tela de rastreamento (estilo Uber).

Cada tela é uma **página de verdade**, com sua própria URL (sem abas / sem
JavaScript de página única): `/login`, `/cadastro`, `/busca`, `/produto/:id`,
`/doador/:id`, `/perfil` (a conta de quem está logado), `/form/:itemId`,
`/carrinho`, `/tracking/:id`.

## Conta de acesso padrão (enquanto o cadastro completo não está em uso)

```
email: ingrid.lacerd@gmail.com
senha: 123456
```

Essa conta é criada automaticamente na primeira vez que o servidor roda
(veja `server/db.js`). Ela é só um atalho para acessar o site enquanto o
banco de dados definitivo não está pronto — dá pra logar com ela ou criar
outras contas normalmente pela tela de cadastro.

## Stack

- **Backend:** Node.js + Express
- **Views:** EJS (páginas renderizadas no servidor — HTML de verdade, sem SPA)
- **Banco de dados:** arquivo JSON local (via `lowdb`) — não exige instalar
  MySQL/Postgres nem compilar módulos nativos. Os dados ficam em
  `data/db.json`, criado automaticamente.
  **Você mencionou que seu servidor tem MySQL disponível** — isso pode
  trocar depois sem mudar as páginas: só a camada `server/db.js` muda
  (as rotas em `server/server.js` continuam iguais). Aviso quando quiser
  seguir com essa troca.
- **Sessão/login:** `express-session` (cookie) + senha com hash `bcryptjs`
- **Front-end:** HTML/CSS (mesma identidade visual do protótipo), sem
  JavaScript de navegação — os links e formulários são HTML puro

## Estrutura

```
repassa/
  server/
    server.js      -> servidor Express + todas as rotas/páginas
    db.js           -> banco de dados (lowdb) + dados iniciais (seed)
  views/
    partials/
      head.ejs        -> <head> comum a todas as páginas
      nav.ejs          -> barra de navegação (logo, links, sair)
      foot.ejs         -> fechamento do <body>/<html>
    login.ejs
    cadastro.ejs
    busca.ejs
    produto.ejs
    doador.ejs          -> perfil público de quem doou o item
    perfil.ejs           -> "Meu perfil" (a própria conta, doador OU donatário)
    form.ejs
    carrinho.ejs
    tracking.ejs
  public/
    css/styles.css
    assets/logo.png
  data/               -> onde o banco (db.json) é criado (não versionar)
  package.json
```

## Rodando localmente

Pré-requisito: [Node.js](https://nodejs.org) 16 ou mais recente instalado.

```bash
npm install
npm start
```

Acesse **http://localhost:3000** e entre com a conta padrão acima (ou crie
uma nova pela tela de cadastro).

A porta pode ser trocada com a variável de ambiente `PORT`:

```bash
PORT=8080 npm start
```

## Colocando no seu servidor (via GitHub)

1. **No seu computador**, suba este projeto para um repositório no GitHub
   (crie o repo vazio no GitHub e depois, dentro desta pasta):

   ```bash
   git init
   git add .
   git commit -m "Repassa - site multi-página"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/repassa.git
   git push -u origin main
   ```

2. **No servidor**, verifique se o Node está instalado:

   ```bash
   node -v
   ```

   Se não estiver, instale (Ubuntu/Debian, por exemplo):

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
   sudo apt-get install -y nodejs
   ```

3. Clone o repositório e instale as dependências:

   ```bash
   git clone https://github.com/SEU-USUARIO/repassa.git
   cd repassa
   npm install
   ```

4. Defina um segredo de sessão próprio (recomendado) e rode:

   ```bash
   export SESSION_SECRET="troque-por-uma-frase-aleatoria-bem-grande"
   export PORT=3000
   npm start
   ```

5. **Deixar rodando de verdade (mesmo depois de fechar o terminal):**
   instale o [PM2](https://pm2.keymetrics.io/):

   ```bash
   sudo npm install -g pm2
   pm2 start server/server.js --name repassa
   pm2 save
   pm2 startup   # segue as instruções que ele mostrar, pra iniciar sozinho no boot
   ```

   Pra atualizar depois de um `git pull`:

   ```bash
   git pull
   npm install
   pm2 restart repassa
   ```

6. **Deixar acessível num domínio/porta 80** (opcional, se seu servidor tiver
   Nginx): configure um proxy reverso apontando para `http://localhost:3000`.
   Se não souber fazer isso ainda, o site já funciona acessando
   `http://SEU-IP:3000` diretamente.

## Onde ficam os dados

Tudo (usuários, itens, pedidos) fica em `data/db.json`. Esse arquivo:

- é criado sozinho na primeira vez que o servidor roda (já com a conta
  padrão da Ingrid e o catálogo de itens de exemplo);
- **não é enviado pro GitHub** (está no `.gitignore`), porque contém dados
  de usuários reais — cada servidor tem o seu;
- pode ser aberto e editado manualmente se precisar mexer nos dados de
  demonstração (itens/doadores) — veja `server/db.js` para a estrutura;
- **faça backup dele de vez em quando** (é um arquivo de texto simples,
  copiar já serve).

## Sobre o banco de dados (próximo passo)

Você disse que pode fazer o banco depois, então por enquanto ficou o arquivo
JSON acima — funciona bem para poucos usuários simultâneos, mas não é um
banco de verdade. Como seu servidor já tem **MySQL**, quando quiser migrar
é só avisar: a troca fica isolada em `server/db.js` (usar `mysql2` com
tabelas para `users`, `donors`, `items` e `requests`), sem precisar
reescrever as páginas nem as rotas.

## Limitações desta versão

- Só existe uma doadora de exemplo (Marina Costa) com o catálogo inicial de
  itens — quem se cadastra como "Doador" ainda não tem uma tela para
  cadastrar os próprios itens (próximo passo natural do projeto, junto com
  o banco de dados).
- O rastreamento em tempo real é simulado (não usa GPS real).
- Sem HTTPS configurado por padrão — se for expor publicamente, use um
  domínio com certificado (Let's Encrypt/Certbot é gratuito) e habilite
  `cookie.secure = true` em `server/server.js`.

## Próximos passos sugeridos

- Banco de dados definitivo (MySQL, já disponível no seu servidor)
- Tela do doador para cadastrar/editar seus próprios itens
- Notificações por email quando um pedido é aprovado
- Upload de fotos reais dos itens


