// =============================================
// CLAVES APP — Lógica Frontend (app.js)
// =============================================

const SHEETDB_URL = 'https://sheetdb.io/api/v1/tpz4wdwvpet8d';
const CASES_URL   = 'https://sheetdb.io/api/v1/6sty8p65pjvjk?sheet=casos';

// ─── Preguntas del cuestionario (por defecto) ────────────────
const QUESTIONS_DEFAULT = [
  { id: 'Nombre del Bot', q: '¿Qué nombre interno le daremos a este bot? (Ej. Bot de Ventas, Virtual Concierge)', placeholder: 'Ej. Asistente de Soporte' },
  { id: 'Canales', q: '¿En qué canales operará este agente? (Ej. WhatsApp, Instagram DM, Web Chat)', placeholder: 'Ej. WhatsApp e Instagram' },
  { id: 'Retraso de Respuesta', q: '¿Quieres que responda instantáneamente o prefieres un retraso simulado (ej. 2 a 5 segundos)?', placeholder: 'Ej. Retraso de 3 segundos para que parezca más humano.' },
  { id: 'Enlaces Web', q: 'Proporciona los enlaces (URLs) de los que el bot debe aprender.', placeholder: 'https://miweb.com/about\nhttps://miweb.com/servicios' },
  { id: 'FAQs', q: 'Enumera de 5 a 10 preguntas frecuentes de tus clientes con sus respuestas.', placeholder: 'P: ¿Hacen envíos?\nR: Sí, a todo el país.' },
  { id: 'Contexto de Conversación', q: 'Contexto de la conversación: ¿Cuál es la situación típica por la que te contactan?', placeholder: 'Ej. El cliente vio un anuncio y quiere saber los precios.' },
  { id: 'Rol del Agente', q: '¿Quién es el agente dentro de tu empresa? (Ej. Secretaria amigable, Soporte experto)', placeholder: 'Ej. Un vendedor amable y experto en tecnología.' },
  { id: 'Estilo, Tono e Idioma', q: 'Define su estilo de escritura, su tono (ej. Empático, Formal) y la política de idioma.', placeholder: 'Ej. Tono empático y profesional. Siempre responder en español.' },
  { id: 'Objetivo Principal', q: 'Objetivo principal: ¿Qué debe lograr el agente al final de la charla?', placeholder: 'Ej. Agendar una cita.' },
  { id: 'Guion / Flujo', q: 'Describe la secuencia o flujo de preguntas paso a paso.', placeholder: '1. Saludar\n2. Preguntar el problema\n3. Ofrecer solución' },
  { id: 'Objeciones Comunes', q: '¿Qué debe responder ante las 2 o 3 dudas o quejas más típicas?', placeholder: 'Si dicen "muy caro", responde con el valor agregado.' },
  { id: 'Límites Estrictos', q: 'Reglas inquebrantables: ¿Qué cosas NO debe hacer o decir NUNCA el agente?', placeholder: 'Ej. NUNCA dar descuentos sin autorización.' },
  { id: 'Ejemplo 1', q: 'Ejemplo 1 de comportamiento. Escribe qué EVITAR y qué USAR en su lugar.', placeholder: 'EVITAR: "Cuesta $100."\nUSAR: "Te paso los planes detallados..."' },
  { id: 'Ejemplo 2', q: 'Ejemplo 2 de comportamiento. Escribe qué EVITAR y qué USAR en su lugar.', placeholder: 'EVITAR: ...\nUSAR: ...' },
  { id: 'Resumen de Oferta', q: 'Haz un resumen breve de tu oferta principal o servicios clave.', placeholder: 'Ofrecemos automatización con IA...' },
  { id: 'Transferencia a Humanos', q: '¿Bajo qué situaciones exactas el bot debe transferir a un humano?', placeholder: 'Ej. Cuando el cliente pida hablar con un humano o se note molesto.' },
  { id: 'Seguimiento Automático', q: '¿Debe hacer seguimiento si el cliente no responde? ¿Cuándo y qué debe decir?', placeholder: 'Ej. Escribir a las 24 horas preguntando si sigue interesado.' },
  { id: 'Integraciones', q: '¿Con qué herramientas debe conectarse el bot para registrar la info? (Ej. HubSpot, Calendly)', placeholder: 'Ej. Guardar contactos en HubSpot' }
];

// Se llena dinámicamente al iniciar (carga desde Sheets o usa defaults)
let QUESTIONS = [...QUESTIONS_DEFAULT];

// ─── Estado global ────────────────────────────────────────
const state = {
  sessionId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
  fullName: '',
  companyName: '',
  metaUser: '',
  metaPasswordPreview: '',
  currentQuestion: 0,
  transcriptions: new Array(QUESTIONS_DEFAULT.length).fill(''),
  recognition: null,
  isRecording: false,
  questionsReady: false,
};

// ─── Elementos del DOM ────────────────────────
const $ = (id) => document.getElementById(id);

const viewForm   = $('viewForm');
const viewQuiz   = $('viewQuiz');
const viewSuccess= $('viewSuccess');
const stepBadge  = $('stepBadge');

// Formulario
const initialForm   = $('initialForm');
const fullNameInput = $('fullName');
const companyInput  = $('companyName');
const metaUserInput = $('metaUser');
const metaPwInput   = $('metaPassword');
const eyeBtn        = $('eyeBtn');
const eyeIcon       = $('eyeIcon');

// Quiz
const progressFill    = $('progressFill');
const progressLabel   = $('progressLabel');
const progressPercent = $('progressPercent');
const progressDots    = $('progressDots');
const questionNumber  = $('questionNumber');
const questionText    = $('questionText');

const answerTextarea  = $('answerTextarea');
const btnRecord       = $('btnRecord');
const btnStop         = $('btnStop');
const loadingOverlay  = $('loadingOverlay');
const btnPrev         = $('btnPrev');
const btnSaveNext     = $('btnSaveNext');

// ═══════════════════════════════════════════
// 1. INICIALIZAR RECONOCIMIENTO DE VOZ
// ═══════════════════════════════════════════
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  state.recognition = new SpeechRecognition();
  state.recognition.continuous = true;
  state.recognition.interimResults = true;
  state.recognition.lang = 'es-ES';

  state.recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' ';
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    
    // Anexamos lo que ya estaba escrito en el textarea
    const currentVal = state.baseTranscript || '';
    answerTextarea.value = currentVal + finalTranscript + interimTranscript;
    
    // Si la frase es final, actualizamos el baseTranscript
    if (finalTranscript) {
      state.baseTranscript = currentVal + finalTranscript;
    }
  };

  state.recognition.onerror = (event) => {
    console.error('Error de reconocimiento de voz:', event.error);
    if (event.error === 'not-allowed') {
      alert('Debes permitir el acceso al micrófono en tu navegador para grabar.');
      stopRecording();
    }
  };

  state.recognition.onend = () => {
    if (state.isRecording) {
      try { state.recognition.start(); } catch (e) {}
    }
  };
}

// ═══════════════════════════════════════════
// 0. CARGAR PREGUNTAS DESDE SHEETS (si el admin las editó)
// ═══════════════════════════════════════════
async function loadQuestionsFromSheets() {
  try {
    const res  = await fetch(`${SHEETDB_URL}/search?Session ID=__QUESTIONS_CONFIG__`);
    const data = await res.json();
    if (data && data.length && data[0]['__questions_json__']) {
      const loaded = JSON.parse(data[0]['__questions_json__']);
      if (Array.isArray(loaded) && loaded.length) {
        QUESTIONS = loaded;
        state.transcriptions = new Array(QUESTIONS.length).fill('');
      }
    }
  } catch(e) {
    // Si falla la carga, usamos los defaults (ya asignados)
    console.warn('No se pudo cargar la plantilla de preguntas, usando defaults.');
  }
}

// Cargar preguntas al iniciar la página — diferido para no bloquear el render inicial
// Usamos setTimeout(0) para que la página se pinte primero y el fetch ocurra después
setTimeout(() => loadQuestionsFromSheets(), 0);

// ═══════════════════════════════════════════
// 2. FORMULARIO INICIAL Y ACORDEONES
// ═══════════════════════════════════════════

window.toggleAccordion = (id) => {
  const allAccs = ['registro', 'consulta'];
  
  allAccs.forEach(acc => {
    const el = document.getElementById(`acc-${acc}`);
    const content = document.getElementById(`content-${acc}`);
    if (acc === id) {
      const isOpen = el.classList.contains('open');
      if (isOpen) {
        el.classList.remove('open');
        content.style.display = 'none';
      } else {
        el.classList.add('open');
        content.style.display = 'block';
      }
    } else {
      el.classList.remove('open');
      content.style.display = 'none';
    }
  });
};


eyeBtn.addEventListener('click', () => {
  const isPassword = metaPwInput.type === 'password';
  metaPwInput.type = isPassword ? 'text' : 'password';
  eyeIcon.innerHTML = isPassword
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
});

metaPwInput.addEventListener('input', () => {
  const val  = metaPwInput.value;
  const bars = [$('sb1'), $('sb2'), $('sb3'), $('sb4')];
  const label = $('strengthLabel');

  let score = 0;
  if (val.length >= 8)              score++;
  if (/[A-Z]/.test(val))            score++;
  if (/[0-9]/.test(val))            score++;
  if (/[^A-Za-z0-9]/.test(val))     score++;

  const configs = [
    { color: '',          text: 'Ingresa una contraseña', labelColor: 'var(--clr-text-3)' },
    { color: 'active-1', text: 'Muy débil',               labelColor: 'var(--clr-danger)' },
    { color: 'active-2', text: 'Débil',                   labelColor: 'var(--clr-warning)' },
    { color: 'active-3', text: 'Buena',                   labelColor: '#84cc16' },
    { color: 'active-4', text: 'Muy fuerte 💪',           labelColor: 'var(--clr-success)' },
  ];

  const cfg = val.length === 0 ? configs[0] : configs[score] || configs[score - 1];
  bars.forEach((b, i) => {
    b.className = 'strength-bar';
    if (val.length > 0 && i < score) b.classList.add(cfg.color);
  });
  label.textContent = cfg.text;
  label.style.color = cfg.labelColor;
});

initialForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  state.fullName = fullNameInput.value.trim();
  state.companyName = companyInput.value.trim();
  state.metaUser = metaUserInput.value.trim();
  state.metaPasswordPreview = metaPwInput.value.substring(0, 3) + '***';

  goToQuiz();
});

const queryForm = document.getElementById('queryForm');
queryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const fn = document.getElementById('q-fullName');
  const cn = document.getElementById('q-companyName');
  const msg = document.getElementById('q-message');
  
  let isValid = true;
  [fn, cn, msg].forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('invalid');
      document.getElementById(`err-${input.id}`).style.display = 'block';
      isValid = false;
    } else {
      input.classList.remove('invalid');
      document.getElementById(`err-${input.id}`).style.display = 'none';
    }
  });
  
  if (!isValid) return;
  
  const btnText = document.getElementById('q-btnText');
  const btnLoader = document.getElementById('q-btnLoader');
  const btnSubmit = document.getElementById('q-btnSubmit');
  const successMsg = document.getElementById('q-successMessage');
  
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  btnSubmit.disabled = true;
  
  try {
    // 1. Contar consultas existentes para enumerarlas
    const res = await fetch(CASES_URL);
    const data = await res.json();
    const nextQueryNum = Array.isArray(data) ? data.length + 1 : 1;

    const sheetData = {
      'Fecha consulta': new Date().toISOString(),
      'Nombre completo': fn.value.trim(),
      'Nombre de la empresa': cn.value.trim(),
      'Tu consulta': msg.value.trim(),
      'Especialista': '',
      'NumeroConsulta': nextQueryNum
    };
    
    await fetch(CASES_URL, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [sheetData] }),
    });
    
    queryForm.reset();
    successMsg.style.display = 'block';
    setTimeout(() => successMsg.style.display = 'none', 5000);
  } catch (err) {
    console.error('Error enviando consulta:', err);
    alert('Error enviando la consulta. Inténtalo de nuevo.');
  } finally {
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
    btnSubmit.disabled = false;
  }
});

function validateForm() {
  const fields = [
    { id: 'fullName',    el: fullNameInput },
    { id: 'companyName', el: companyInput  },
    { id: 'metaUser',    el: metaUserInput },
    { id: 'metaPassword',el: metaPwInput   },
  ];
  let valid = true;
  fields.forEach(({ id, el }) => {
    const fg = $(`fg-${id}`);
    if (!el.value.trim()) {
      fg.classList.add('has-error');
      valid = false;
    } else {
      fg.classList.remove('has-error');
    }
  });
  return valid;
}

['fullName','companyName','metaUser','metaPassword'].forEach(id => {
  $(id).addEventListener('input', () => $(`fg-${id}`).classList.remove('has-error'));
});

// ═══════════════════════════════════════════
// 3. TRANSICIÓN AL QUIZ
// ═══════════════════════════════════════════

function goToQuiz() {
  viewForm.classList.add('hidden');
  viewQuiz.classList.remove('hidden');
  stepBadge.textContent = 'Paso 2 de 2';

  progressDots.innerHTML = '';
  QUESTIONS.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    dot.id = `dot-${i}`;
    dot.addEventListener('click', () => {
      if (i <= state.currentQuestion || state.transcriptions[i - 1]) {
        saveCurrentAnswer(); // Guardar antes de saltar
        goToQuestion(i);
      }
    });
    progressDots.appendChild(dot);
  });

  goToQuestion(0);
}

// ═══════════════════════════════════════════
// 4. LÓGICA DEL QUIZ (Híbrido)
// ═══════════════════════════════════════════

function goToQuestion(index) {
  state.currentQuestion = index;
  const qData = QUESTIONS[index];
  const total = QUESTIONS.length;
  const percent = Math.round(((index + 1) / total) * 100);

  progressLabel.textContent = `Pregunta ${index + 1} de ${total}`;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  questionNumber.textContent = String(index + 1).padStart(2, '0');

  questionText.style.animation = 'none';
  questionText.offsetHeight; 
  questionText.style.animation = 'fadeIn 0.4s ease both';
  questionText.textContent = qData.q;

  document.querySelectorAll('.progress-dot').forEach((d, i) => {
    d.className = 'progress-dot';
    if (i === index) d.classList.add('active');
    else if (state.transcriptions[i]) d.classList.add('done');
  });

  // En pregunta 1, el botón Anterior NUNCA se deshabilita (regresa al form)
  btnPrev.disabled = false;
  updateSaveNextBtn();
  resetRecorderUI();

  // Mostrar el valor actual si ya fue respondido
  answerTextarea.placeholder = qData.placeholder || 'Escribe aquí tu respuesta o usa el micrófono...';
  answerTextarea.value = state.transcriptions[index] || '';
}

function updateSaveNextBtn() {
  const isLast = state.currentQuestion === QUESTIONS.length - 1;
  btnSaveNext.querySelector('span').textContent = isLast ? 'Finalizar entrevista' : 'Guardar y Continuar';
}

function resetRecorderUI() {
  if (state.isRecording) stopRecording();
  btnRecord.disabled = false;
  btnRecord.classList.remove('recording');
  btnStop.disabled = true;
}

// ─── Lógica para Grabación ──────────
btnRecord.addEventListener('click', startRecording);
btnStop.addEventListener('click', stopRecording);

async function startRecording() {
  if (!state.recognition) {
    alert("Reconocimiento de voz no soportado. Usa Chrome o Edge.");
    return;
  }
  
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Tomar lo que ya haya escrito el usuario como base
    state.baseTranscript = answerTextarea.value + (answerTextarea.value ? ' ' : '');
    
    state.isRecording = true;
    state.recognition.start();

    btnRecord.disabled = true;
    btnRecord.classList.add('recording');
    btnRecord.querySelector('span').textContent = 'Grabando...';
    btnStop.disabled = false;
  } catch (err) {
    alert('Debes permitir el uso del micrófono.');
  }
}

function stopRecording() {
  if (state.isRecording) {
    state.isRecording = false;
    state.recognition.stop();
    btnRecord.classList.remove('recording');
    btnRecord.querySelector('span').textContent = 'Usar Voz';
    btnStop.disabled = true;
  }
}

// ─── Guardar Respuesta ─────────────────────
function saveCurrentAnswer() {
  const val = answerTextarea.value.trim();
  if (val) {
    state.transcriptions[state.currentQuestion] = val;
    const dot = $(`dot-${state.currentQuestion}`);
    if (dot) dot.classList.add('done');
  }
}

// ─── Navegación del quiz ───────────────────
btnPrev.addEventListener('click', () => {
  if (state.currentQuestion > 0) {
    saveCurrentAnswer();
    goToQuestion(state.currentQuestion - 1);
  } else {
    // Pregunta 1 → regresar al formulario inicial
    if (state.isRecording) stopRecording();
    viewQuiz.classList.add('hidden');
    viewForm.classList.remove('hidden');
    stepBadge.textContent = 'Paso 1 de 2';
  }
});

btnSaveNext.addEventListener('click', async () => {
  saveCurrentAnswer();

  const isLast = state.currentQuestion === QUESTIONS.length - 1;
  if (isLast) {
    await completeSession();
  } else {
    goToQuestion(state.currentQuestion + 1);
  }
});

// ═══════════════════════════════════════════
// 5. FINALIZAR SESIÓN (Google Sheets)
// ═══════════════════════════════════════════

async function completeSession() {
  btnSaveNext.disabled = true;
  btnSaveNext.querySelector('span').textContent = 'Guardando datos...';
  loadingOverlay.classList.remove('hidden');

  try {
    const sheetData = {
      'Session ID': state.sessionId,
      'Fecha de Envío': new Date().toISOString(),
      'Tipo': 'Registro',
      'Nombre Completo': state.fullName,
      'Empresa': state.companyName,
      'Usuario Meta': state.metaUser,
      'Contraseña Meta': state.metaPasswordPreview,
    };

    QUESTIONS.forEach((q, index) => {
      sheetData[q.id] = state.transcriptions[index] || '';
    });

    sheetData['Servicios Activados'] = '';
    sheetData['Fecha Activación Servicios'] = '';

    const res = await fetch(SHEETDB_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [sheetData] }),
    });

    await res.json();
    showSuccess();
  } catch (err) {
    console.error('Error al guardar en SheetDB:', err);
    alert('Error al guardar. Verifica tu conexión e intenta de nuevo.');
    btnSaveNext.disabled = false;
    updateSaveNextBtn();
  } finally {
    loadingOverlay.classList.add('hidden');
  }
}

function showSuccess() {
  viewQuiz.classList.add('hidden');
  viewSuccess.classList.remove('hidden');
  stepBadge.textContent = '✅ Completado';

  const answeredCount = state.transcriptions.filter(t => t.trim().length > 0).length;

  $('successStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${QUESTIONS.length}</div>
      <div class="stat-label">Preguntas Totales</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${answeredCount}</div>
      <div class="stat-label">Respuestas Guardadas</div>
    </div>
  `;
}
