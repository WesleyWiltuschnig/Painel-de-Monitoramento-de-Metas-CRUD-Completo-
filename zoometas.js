
const emojiMap = {
  ' Grandes Felinos'    : '',
  ' Elefantes'          : '',
  ' Girafas & Herbívoros': '',
  ' Aves & Aquáticos'   : '',
  ' Répteis'            : '',
  ' Primatas'           : '',
  ' Conservação'        : '',
  ' Veterinária'        : '',
  ' Visitantes'         : '',
  ' Arrecadação'        : '',
};

let metas = [];

function fmt(v) {
  return 'R$ ' + Number(v)
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function salvar() {
  const titulo       = document.getElementById('titulo').value.trim();
  const categoria    = document.getElementById('categoria').value;
  const valAlvo      = Number(document.getElementById('valAlvo').value);
  const valAlcancado = Number(document.getElementById('valAlcancado').value);
  const idEdicao     = document.getElementById('metaId').value;

  if (!titulo) {
    flash('Informe o título da meta!');
    return;
  }
  if (valAlvo <= 0) {
    flash('O Valor Alvo deve ser maior que zero!');
    return;
  }
  if (valAlcancado < 0) {
    flash('O Valor Alcançado não pode ser negativo!');
    return;
  }

  if (idEdicao) {
    const idx = metas.findIndex(m => m.id == idEdicao);
    metas[idx] = { ...metas[idx], titulo, categoria, valAlvo, valAlcancado };
  } else {
    const novaMeta = {
      id: Date.now(),
      titulo,
      categoria,
      valAlvo,
      valAlcancado
    };
    metas.push(novaMeta);
  }

  limpar();
  renderizar();
}

function renderizar() {
  const container = document.getElementById('listaMetas');

  let somaAlvo = 0;
  let somaAlcancado = 0;

  for (let i = 0; i < metas.length; i++) {
    somaAlvo      += metas[i].valAlvo;
    somaAlcancado += metas[i].valAlcancado;
  }

  document.getElementById('totalAlmejado').textContent  = fmt(somaAlvo);
  document.getElementById('totalAlcancado').textContent = fmt(somaAlcancado);
  document.getElementById('contador').textContent =
    metas.length + (metas.length === 1 ? ' meta' : ' metas');

  if (metas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="emo">🦓</span>
        <p>Nenhuma meta cadastrada ainda.<br>
           Adicione a primeira meta para começar o monitoramento!</p>
      </div>`;
    return;
  }

  container.innerHTML = '';

  for (let i = 0; i < metas.length; i++) {
    const m        = metas[i];
    const pct      = Math.min((m.valAlcancado / m.valAlvo) * 100, 100);
    const restante = Math.max(m.valAlvo - m.valAlcancado, 0);

    let status, badgeClass, cardClass;

    if (m.valAlcancado >= m.valAlvo) {
      status     = 'META BATIDA';
      badgeClass = 'badge-batida';
      cardClass  = 'batida';
    } else if (pct >= 50) {
      status     = 'PENDENTE';
      badgeClass = 'badge-pendente';
      cardClass  = 'pendente';
    } else {
      status     = 'CRÍTICO';
      badgeClass = 'badge-critica';
      cardClass  = 'critica';
    }

    const emoji = emojiMap[m.categoria] || '●';

    const card = document.createElement('div');
    card.className = `meta-card ${cardClass}`;
    card.innerHTML = `
      <div class="meta-emoji">${emoji}</div>
      <div class="meta-info">
        <div class="meta-titulo">${m.titulo}</div>
        <div class="meta-categoria">${m.categoria}</div>
        <div class="prog-track">
          <div class="prog-fill" style="width:${pct}%"></div>
        </div>
        <div class="meta-stats">
          <span>Alvo: <strong>${fmt(m.valAlvo)}</strong></span>
          <span>Alcançado: <strong>${fmt(m.valAlcancado)}</strong></span>
          <span>Falta: <strong>${fmt(restante)}</strong></span>
          <span>${pct.toFixed(0)}%</span>
        </div>
      </div>
      <span class="meta-badge ${badgeClass}">${status}</span>
      <div class="meta-acoes">
        <button class="btn-acao editar"  onclick="prepararEdicao(${m.id})" title="Editar">✏️</button>
        <button class="btn-acao excluir" onclick="excluir(${m.id})"        title="Excluir">🗑️</button>
      </div>`;

    container.appendChild(card);
  }
}

function prepararEdicao(id) {
  const m = metas.find(m => m.id === id);

  document.getElementById('metaId').value       = m.id;
  document.getElementById('titulo').value       = m.titulo;
  document.getElementById('categoria').value    = m.categoria;
  document.getElementById('valAlvo').value      = m.valAlvo;
  document.getElementById('valAlcancado').value = m.valAlcancado;

  document.getElementById('formTitulo').textContent = 'Editando Meta';
  document.getElementById('btnCancelar').classList.remove('oculto');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function excluir(id) {
  if (!confirm('Tem certeza que deseja remover esta meta?')) return;
  metas = metas.filter(m => m.id !== id);
  renderizar();
}

function limpar() {
  document.getElementById('metaId').value       = '';
  document.getElementById('titulo').value       = '';
  document.getElementById('valAlvo').value      = '';
  document.getElementById('valAlcancado').value = '';
  document.getElementById('categoria').value    = 'Grandes Felinos';

  document.getElementById('formTitulo').textContent = ' Nova Meta';
  document.getElementById('btnCancelar').classList.add('oculto');
}

function flash(msg) {
  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed;
    top: 1.5rem;
    left: 50%;
    transform: translateX(-50%) translateY(-10px);
    background: #2d4a2d;
    border: 1.5px solid rgba(245, 197, 24, .4);
    color: #f5c518;
    padding: .75rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: .9rem;
    z-index: 9999;
    animation: flashIn .3s ease forwards;
    box-shadow: 0 8px 24px rgba(0, 0, 0, .4);`;
  el.textContent = msg;

  const style = document.createElement('style');
  style.textContent =
    '@keyframes flashIn { to { transform: translateX(-50%) translateY(0); opacity: 1; } }';

  document.head.appendChild(style);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

metas = [
  { id: 1, titulo: 'Campanha de vacinação — Leões e Tigres', categoria: 'Grandes Felinos',    valAlvo: 8500,  valAlcancado: 9200  },
  { id: 2, titulo: 'Renovação do cercado dos elefantes',      categoria: 'Elefantes',           valAlvo: 45000, valAlcancado: 28000 },
  { id: 3, titulo: 'Reintrodução de araras azuis (lote 3)',   categoria: 'Aves & Aquáticos',   valAlvo: 12000, valAlcancado: 5400  },
  { id: 4, titulo: 'Meta de visitantes — Julho',              categoria: 'Visitantes',        valAlvo: 15000, valAlcancado: 15800 },
  { id: 5, titulo: 'Fundo de conservação da onça-pintada',   categoria: 'Conservação',         valAlvo: 30000, valAlcancado: 16500 },
];

renderizar();
