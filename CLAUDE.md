# Repassa — front

Plataforma de doação de itens para pessoas em situação de vulnerabilidade
(projeto ETEP, tema Economia Circular). Este repositório é o **front**: HTML,
CSS e JavaScript puros. A API fica em `app-repassa/repassa-server`.

## Modo design

Quando eu pedir **"modo design"** (ou "ativa o design", "usa as skills de
design", "deixa bonito"), invoque as **duas** skills juntas, na ordem, antes de
escrever qualquer CSS ou HTML:

1. `design-taste-frontend` — evita a cara de template genérico de IA
2. `minimalist-ui` — a direção estética escolhida para este projeto:
   monocromático quente, contraste tipográfico, sem gradiente e sem sombra
   pesada. Combina com o público do projeto e ajuda na acessibilidade.

Para retrabalhar tela que já existe (como a `demo.html`), use
`redesign-existing-projects` em vez da primeira — ela audita antes de mexer e
não quebra o que já funciona.

Disponível também, mas **não** usar sem eu pedir pelo nome:
`high-end-visual-design` (agência premium, mais pesado) e
`industrial-brutalist-ui` (estética errada para este projeto).

Observação da própria `design-taste-frontend`: ela foi feita para landing page,
portfólio e redesign — **não** para dashboard, tabela de dados ou fluxo de
produto com vários passos. Nas telas de produto (lista de itens, formulários,
painel do avaliador), use `minimalist-ui` sozinha.

## Convenções

- **Código e identificadores em inglês; texto de tela em português.** A única
  exceção são as tabelas do banco, que nasceram em português e ficam assim.
- **Sem comentários no código** que vai para o repositório. Explicação vai no
  README.
- **Mensagens de commit em inglês.**
- Não adicionar linha de atribuição de IA em commit nem em PR.

## Deploy

Push na `main` entra no ar sozinho em até 60 s, em
https://gertrude.vps.webdock.cloud — o servidor faz `git pull` e serve os
arquivos direto do disco. Não precisa build.

A home é servida a partir de `index.html`; se não existir, cai em `demo.html`.

## Dados sensíveis

Documento de beneficiário, comprovante e selfie são dado pessoal (LGPD): nunca
versionar, nunca servir em página pública, e apagar depois da análise —
guardando só o resultado. No servidor eles ficam em `/home/sea/dados/`, fora
dos repositórios.
