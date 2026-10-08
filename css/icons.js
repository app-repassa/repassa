const ICONS = {

  'logo':               'assets/logo.png',

  
  'busca':              'assets/icons/busca.png',         
  'avisos':             'assets/icons/avisos.png',      
  'mensagens':          'assets/icons/mensagens.png',      
  'carrinho':           'assets/icons/carrinho.png',       
  'rastreamento':       'assets/icons/rastreamento.png',   
  'perfil':             'assets/icons/perfil.png',         
  'sair':               'assets/icons/sair.png',           
  'olho':               'assets/icons/olho.png',           
  'olho-fechado':       'assets/icons/olho-fechado.png',  

  
  'cat-eletronicos':    'assets/icons/cat-eletronicos.png',
  'cat-acessibilidade': 'assets/icons/cat-acessibilidade.png',
  'cat-saude':          'assets/icons/cat-saude.png',


  'entrega':            'assets/icons/entrega.png',      
  'mensagem':           'assets/icons/mensagem.png',   
  'presente':           'assets/icons/presente.png',    
  'enviar':             'assets/icons/enviar.png',         
  'usuario':            'assets/icons/usuario.png',        
  'telefone':           'assets/icons/telefone.png',      
  'voltar':             'assets/icons/voltar.png',         
  'seta-direita':       'assets/icons/seta-direita.png',  
  'estrela':            'assets/icons/estrela.png',
  'check':              'assets/icons/check.png',         
  'raio':               'assets/icons/raio.png',          
  'ponto':              'assets/icons/ponto.png',          


  'cadeado':            'assets/icons/cadeado.png',
  'chave':              'assets/icons/chave.png',
  'pessoa':             'assets/icons/pessoa.png',         
  'calendario':         'assets/icons/calendario.png',
  'sos':                'assets/icons/sos.png',            
  'aperto-de-mao':      'assets/icons/aperto-de-mao.png', 
  'sorteio':            'assets/icons/sorteio.png'        
};


const IMAGENS = {
  'iphone':             'assets/imagem.jpg',
  'qrcode':             'assets/qrcode.jpeg'              
};


const SORTEIO = {
  link: '' 
};


function ico(nome, classe) {
  const src = ICONS[nome] || '';
  return `<img class="ico ico-${nome}${classe ? ' ' + classe : ''}" data-icon="${nome}" src="${src}" alt="" onerror="this.classList.add('ico-missing')">`;
}


function estrelas(n) {
  return ico('estrela').repeat(Math.max(0, Math.round(n)));
}


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

 
  raiz.querySelectorAll('img[data-img]').forEach(img => {
    const box = img.parentElement;
    const src = IMAGENS[img.dataset.img] || '';
    img.onload  = () => { img.hidden = false; box.classList.remove('qr-missing'); };
    img.onerror = () => { img.hidden = true;  box.classList.add('qr-missing'); };
    if (!src) { img.onerror(); return; }
    img.src = src;
  });


  raiz.querySelectorAll('[data-sorteio-link]').forEach(a => {
    if (SORTEIO.link) { a.href = SORTEIO.link; a.hidden = false; }
    else { a.hidden = true; }
  });
}
