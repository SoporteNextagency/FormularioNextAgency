// =============================================
// CLAVES APP — Lógica Frontend (app.js)
// Usando Web Speech API (100% Gratis)
// =============================================

// ─── Preguntas del cuestionario ──────────────
const QUESTIONS = [
  "¿Cuál es el objetivo principal que buscas lograr con tu presencia en Meta (Facebook/Instagram) para tu empresa?",
  "¿Quién es tu cliente ideal? Describe brevemente su perfil (edad, intereses, comportamiento de compra).",
  "¿Cuál es el producto o servicio que más quieres promocionar en este momento y por qué?",
  "¿Cuánto presupuesto mensual tienes disponible actualmente para invertir en publicidad pagada en Meta?",
  "¿Has realizado campañas de publicidad en Meta anteriormente? Si es así, ¿cuáles fueron tus resultados?",
  "¿Cuál es el principal reto o problema que enfrentas hoy en tu estrategia de marketing digital?",
  "¿Qué acción específica quieres que tome el usuario al ver tu anuncio? (Ej: comprar, suscribirse, escribirte, visitar tu sitio)",
  "¿Tienes contenido visual (fotos, videos) listo para usar en tus campañas, o necesitas crearlo desde cero?",
  "¿Cómo mides actualmente el éxito de tus esfuerzos de marketing? ¿Qué indicadores usas?",
  "¿Hay algún competidor en tu sector cuya estrategia digital admires o de quien quieras diferenciarte? Cuéntanos un poco sobre ello.",
];

// ─── Estado global ────────────────────────────
const state = {
  sessionId: null,
  currentQuestion: 0,
  transcriptions: new Array(QUESTIONS.length).fill(''),
  recognition: null,
  isRecording: false,
  currentTranscript: '',
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
const statusPulse     = $('statusPulse');
const statusText      = $('statusText');
const btnRecord       = $('btnRecord');
const btnStop         = $('btnStop');
const audioPlayerWrap = $('audioPlayerWrapper');
const transcPreview   = $('transcriptionPreview');
const transcText      = $('transcriptionText');
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
  state.recognition.lang = 'es-ES'; // Español

  state.recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    
    // Mostramos lo que va escuchando en vivo
    state.currentTranscript += finalTranscript;
    transcText.textContent = state.currentTranscript + interimTranscript;
    audioPlayerWrap.classList.remove('hidden');
    transcPreview.classList.remove('hidden');
  };

  state.recognition.onerror = (event) => {
    console.error('Error de reconocimiento de voz:', event.error);
    if (event.error === 'not-allowed') {
      alert('Debes permitir el acceso al micrófono en tu navegador para grabar.');
      stopRecording();
    }
  };

  state.recognition.onend = () => {
    // Si se detiene por silencio, pero seguimos grabando, reiniciarlo
    if (state.isRecording) {
      try { state.recognition.start(); } catch (e) {}
    }
  };
} else {
  alert("Tu navegador no soporta el reconocimiento de voz web. Por favor usa Google Chrome, Edge o Safari moderno.");
}

// ═══════════════════════════════════════════
// 2. FORMULARIO INICIAL
// ═══════════════════════════════════════════

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

initialForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const btn = $('btnNext');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Iniciando...';

  try {
    const res = await fetch('/api/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName:     fullNameInput.value.trim(),
        companyName:  companyInput.value.trim(),
        metaUser:     metaUserInput.value.trim(),
        metaPassword: metaPwInput.value,
      }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    state.sessionId = data.sessionId;
    goToQuiz();
  } catch (err) {
    console.error(err);
    alert('Error al iniciar la sesión. Por favor, intenta de nuevo.');
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Siguiente';
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
        goToQuestion(i);
      }
    });
    progressDots.appendChild(dot);
  });

  goToQuestion(0);
}

// ═══════════════════════════════════════════
// 4. LÓGICA DEL QUIZ
// ═══════════════════════════════════════════

function goToQuestion(index) {
  state.currentQuestion = index;
  const total = QUESTIONS.length;
  const percent = Math.round(((index + 1) / total) * 100);

  progressLabel.textContent = `Pregunta ${index + 1} de ${total}`;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  questionNumber.textContent = String(index + 1).padStart(2, '0');

  questionText.style.animation = 'none';
  questionText.offsetHeight; 
  questionText.style.animation = 'fadeIn 0.4s ease both';
  questionText.textContent = QUESTIONS[index];

  document.querySelectorAll('.progress-dot').forEach((d, i) => {
    d.className = 'progress-dot';
    if (i === index) d.classList.add('active');
    else if (state.transcriptions[i]) d.classList.add('done');
  });

  btnPrev.disabled = index === 0;
  updateSaveNextBtn();

  resetRecorderUI();
  if (state.transcriptions[index]) {
    showTranscription(state.transcriptions[index]);
  }

  setStatus('Listo para escuchar', false);
}

function updateSaveNextBtn() {
  const isLast = state.currentQuestion === QUESTIONS.length - 1;
  btnSaveNext.querySelector('span').textContent = isLast ? 'Finalizar entrevista' : 'Guardar y Continuar';
}

function resetRecorderUI() {
  btnRecord.disabled = false;
  btnRecord.classList.remove('recording');
  btnStop.disabled = true;
  audioPlayerWrap.classList.add('hidden');
  transcPreview.classList.add('hidden');
  loadingOverlay.classList.add('hidden');
  state.currentTranscript = '';
  transcText.textContent = '';
}

function showTranscription(text) {
  transcText.textContent = text;
  audioPlayerWrap.classList.remove('hidden');
  transcPreview.classList.remove('hidden');
}

function setStatus(text, recording = false) {
  statusText.textContent = text;
  if (recording) {
    statusPulse.classList.remove('hidden');
  } else {
    statusPulse.classList.add('hidden');
  }
}

// ─── Grabación de audio (Voz a Texto) ──────
btnRecord.addEventListener('click', startRecording);
btnStop.addEventListener('click', stopRecording);

async function startRecording() {
  if (!state.recognition) {
    alert("Reconocimiento de voz no soportado. Por favor, escribe tu respuesta manualmente o usa Google Chrome.");
    return;
  }
  
  try {
    // Pedir permiso de micrófono primero (buena práctica aunque la API a veces lo hace)
    await navigator.mediaDevices.getUserMedia({ audio: true });
    
    state.currentTranscript = '';
    transcText.textContent = 'Te estoy escuchando...';
    audioPlayerWrap.classList.remove('hidden');
    transcPreview.classList.remove('hidden');

    state.isRecording = true;
    state.recognition.start();

    btnRecord.disabled = true;
    btnRecord.classList.add('recording');
    btnStop.disabled = false;
    setStatus('🔴 Escuchando... Habla claramente', true);
  } catch (err) {
    alert('Para usar el asistente por voz, debes permitir el uso del micrófono.');
    console.error(err);
  }
}

async function stopRecording() {
  if (state.isRecording) {
    state.isRecording = false;
    state.recognition.stop();
    btnRecord.classList.remove('recording');
    btnStop.disabled = true;
    setStatus('Guardando respuesta...', false);

    // Guardar el texto final capturado
    const finalVal = state.currentTranscript.trim() || transcText.textContent.trim();
    if (finalVal && finalVal !== 'Te estoy escuchando...') {
      await saveAnswerToServer(finalVal);
    } else {
      setStatus('⚠️ No se escuchó nada, intenta de nuevo', false);
      btnRecord.disabled = false;
    }
  }
}

// ─── Enviar respuesta al servidor ─────────────
async function saveAnswerToServer(text) {
  const qi = state.currentQuestion;
  loadingOverlay.classList.remove('hidden');

  try {
    const res = await fetch('/api/session/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: state.sessionId,
        questionIndex: qi,
        transcription: text
      }),
    });

    const data = await res.json();
    if (data.success) {
      state.transcriptions[qi] = data.transcription;
      setStatus('✅ Respuesta guardada', false);
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    console.error('Error al guardar:', err);
    setStatus('⚠️ Error al guardar respuesta', false);
  } finally {
    loadingOverlay.classList.add('hidden');
    const dot = $(`dot-${qi}`);
    if (dot) dot.classList.add('done');
    btnRecord.disabled = false; // Permitir re-grabar
  }
}

// ─── Navegación del quiz ───────────────────
btnPrev.addEventListener('click', () => {
  if (state.currentQuestion > 0) {
    goToQuestion(state.currentQuestion - 1);
  }
});

btnSaveNext.addEventListener('click', async () => {
  const isLast = state.currentQuestion === QUESTIONS.length - 1;

  if (isLast) {
    await completeSession();
  } else {
    goToQuestion(state.currentQuestion + 1);
  }
});

// ═══════════════════════════════════════════
// 5. FINALIZAR SESIÓN
// ═══════════════════════════════════════════

async function completeSession() {
  btnSaveNext.disabled = true;
  btnSaveNext.querySelector('span').textContent = 'Finalizando...';

  try {
    const res = await fetch('/api/session/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: state.sessionId }),
    });
    const data = await res.json();

    if (data.success) {
      showSuccess();
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    console.error('Error al completar sesión:', err);
    alert('Error al guardar. Por favor intenta de nuevo.');
    btnSaveNext.disabled = false;
    updateSaveNextBtn();
  }
}

function showSuccess() {
  viewQuiz.classList.add('hidden');
  viewSuccess.classList.remove('hidden');
  stepBadge.textContent = '✅ Completado';

  const transcribedCount = state.transcriptions.filter(t => t.trim().length > 0).length;

  $('successStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${QUESTIONS.length}</div>
      <div class="stat-label">Preguntas</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${transcribedCount}</div>
      <div class="stat-label">Respuestas dadas</div>
    </div>
  `;
}
