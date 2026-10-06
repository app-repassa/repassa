/* =====================================================================
   ICONS.JS  ·  Central de ícones e imagens do Repassa
   ---------------------------------------------------------------------
   Para trocar qualquer ícone do site, basta alterar o CAMINHO abaixo.
   Não precisa mexer no HTML, no CSS ou no resto do JS.

   Dica: se o arquivo não for encontrado, o ícone aparece como um
   quadradinho tracejado cinza no lugar, assim você vê onde falta imagem.
   Formatos aceitos: .png, .svg, .webp, .jpg
   ===================================================================== */

const ICONS = {

  /* ---------- Marca ---------- */
  'logo':               'assets/logo.png',

  /* ---------- Menu superior ---------- */
  'busca':              'assets/icons/busca.png',          // lupa (menu + campo de busca)
  'avisos':             'assets/icons/avisos.png',         // sino
  'mensagens':          'assets/icons/mensagens.png',      // balão de conversa (menu)
  'carrinho':           'assets/icons/carrinho.png',       // carrinho
  'rastreamento':       'assets/icons/rastreamento.png',   // pino de localização
  'perfil':             'assets/icons/perfil.png',         // pessoa (menu)
  'sair':               'assets/icons/sair.png',           // porta

  /* ---------- Senha ---------- */
  'olho':               'assets/icons/olho.png',           // mostrar senha
  'olho-fechado':       'assets/icons/olho-fechado.png',   // ocultar senha

  /* ---------- Categorias (filtros e itens sem foto) ---------- */
  'cat-eletronicos':    'assets/icons/cat-eletronicos.png',
  'cat-acessibilidade': 'assets/icons/cat-acessibilidade.png',
  'cat-saude':          'assets/icons/cat-saude.png',

  /* ---------- Notificações / produto / chat ---------- */
  'entrega':            'assets/icons/entrega.png',        // caminhão
  'mensagem':           'assets/icons/mensagem.png',       // balão (avisos, botão Chat, rastreamento)
  'presente':           'assets/icons/presente.png',       // presente / conta doador
  'enviar':             'assets/icons/enviar.png',         // botão enviar do chat (use branco)
  'usuario':            'assets/icons/usuario.png',        // "Doado por"
  'telefone':           'assets/icons/telefone.png',       // ligar

  /* ---------- Setas ---------- */
  'voltar':             'assets/icons/voltar.png',         // seta para a esquerda
  'seta-direita':       'assets/icons/seta-direita.png',   // seta para a direita

  /* ---------- Avaliações e selos ---------- */
  'estrela':            'assets/icons/estrela.png',
  'check':              'assets/icons/check.png',          // verificado / etapa concluída
  'raio':               'assets/icons/raio.png',           // "responde rápido"
  'ponto':              'assets/icons/ponto.png',          // etapa atual do rastreamento

  /* ---------- Match Seguro / retirada ---------- */
  'cadeado':            'assets/icons/cadeado.png',
  'chave':              'assets/icons/chave.png',
  'pessoa':             'assets/icons/pessoa.png',         // marcador no mapa
  'calendario':         'assets/icons/calendario.png',
  'sos':                'assets/icons/sos.png',            // botão de emergência
  'aperto-de-mao':      'assets/icons/aperto-de-mao.png'   // conta donatário
};

/* ---------- Fotos dos produtos ---------- */
const IMAGENS = {
  'iphone':             'assets/imagem.jpg'
};

/* =====================================================================
   FUNÇÕES AUXILIARES (não precisa editar daqui para baixo)
   ===================================================================== */

// Gera a tag <img> de um ícone (usada nos templates do JS)
function ico(nome, classe) {
  const src = ICONS[nome] || '';
  return `<img class="ico ico-${nome}${classe ? ' ' + classe : ''}" data-icon="${nome}" src="${src}" alt="" onerror="this.classList.add('ico-missing')">`;
}

// Gera N estrelas
function estrelas(n) {
  return ico('estrela').repeat(Math.max(0, Math.round(n)));
}

// Preenche os <img data-icon="..."> e [data-stars="..."] que estão no HTML
function aplicarIcones(raiz) {
  raiz = raiz || document;
  raiz.querySelectorAll('img[data-icon]').forEach(img => {
    const src = ICONS[img.dataset.icon] || '';
    img.classList.remove('ico-missing');
    if (!img.hasAttribute('onerror')) {
      img.onerror = () => img.classList.add('ico-missing');
    }
    if (!src) img.classList.add('ico-missing');
    img.src = src;
  });
  raiz.querySelectorAll('[data-stars]').forEach(el => {
    el.innerHTML = estrelas(Number(el.dataset.stars));
  });
}