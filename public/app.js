// =============================================
// CLAVES APP — Lógica Frontend (app.js)
// =============================================

// ─── Preguntas del cuestionario ──────────────
// Puedes reemplazar estos textos con las preguntas reales
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
  recordings: new Array(QUESTIONS.length).fill(null), // Blobs de audio
  transcriptions: new Array(QUESTIONS.length).fill(''),
  mediaRecorder: null,
  audioChunks: [],
  isRecording: false,
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
const audioPlayer     = $('audioPlayer');
const transcPreview   = $('transcriptionPreview');
const transcText      = $('transcriptionText');
const loadingOverlay  = $('loadingOverlay');
const btnPrev         = $('btnPrev');
const btnSaveNext     = $('btnSaveNext');

// ═══════════════════════════════════════════
// 1. FORMULARIO INICIAL
// ═══════════════════════════════════════════

// Alternar visibilidad de contraseña
eyeBtn.addEventListener('click', () => {
  const isPassword = metaPwInput.type === 'password';
  metaPwInput.type = isPassword ? 'text' : 'password';
  eyeIcon.innerHTML = isPassword
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
});

// Medidor de fortaleza de contraseña
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

// Validación y submit del formulario
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

// Limpiar error al escribir
['fullName','companyName','metaUser','metaPassword'].forEach(id => {
  $(id).addEventListener('input', () => $(`fg-${id}`).classList.remove('has-error'));
});

// ═══════════════════════════════════════════
// 2. TRANSICIÓN AL QUIZ
// ═══════════════════════════════════════════

function goToQuiz() {
  viewForm.classList.add('hidden');
  viewQuiz.classList.remove('hidden');
  stepBadge.textContent = 'Paso 2 de 2';

  // Crear los dots de progreso
  progressDots.innerHTML = '';
  QUESTIONS.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    dot.id = `dot-${i}`;
    dot.addEventListener('click', () => {
      // Solo permitir ir a preguntas ya respondidas o la actual
      if (i <= state.currentQuestion || state.recordings[i - 1]) {
        goToQuestion(i);
      }
    });
    progressDots.appendChild(dot);
  });

  goToQuestion(0);
}

// ═══════════════════════════════════════════
// 3. LÓGICA DEL QUIZ
// ═══════════════════════════════════════════

function goToQuestion(index) {
  state.currentQuestion = index;
  const total = QUESTIONS.length;
  const percent = Math.round(((index + 1) / total) * 100);

  // Actualizar UI de progreso
  progressLabel.textContent = `Pregunta ${index + 1} de ${total}`;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  questionNumber.textContent = String(index + 1).padStart(2, '0');

  // Animar cambio de pregunta
  questionText.style.animation = 'none';
  questionText.offsetHeight; // reflow
  questionText.style.animation = 'fadeIn 0.4s ease both';
  questionText.textContent = QUESTIONS[index];

  // Actualizar dots
  document.querySelectorAll('.progress-dot').forEach((d, i) => {
    d.className = 'progress-dot';
    if (i === index) d.classList.add('active');
    else if (state.recordings[i]) d.classList.add('done');
  });

  // Botones de navegación
  btnPrev.disabled = index === 0;
  updateSaveNextBtn();

  // Restaurar estado de grabación para esta pregunta
  resetRecorderUI();
  if (state.recordings[index]) {
    showAudioPlayer(state.recordings[index], state.transcriptions[index]);
  }

  // Status
  setStatus('Listo para grabar', false);
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
  audioPlayer.src = '';
}

function showAudioPlayer(blob, transcription) {
  const url = URL.createObjectURL(blob);
  audioPlayer.src = url;
  audioPlayerWrap.classList.remove('hidden');

  if (transcription) {
    transcText.textContent = transcription;
    transcPreview.classList.remove('hidden');
  }
}

function setStatus(text, recording = false) {
  statusText.textContent = text;
  if (recording) {
    statusPulse.classList.remove('hidden');
  } else {
    statusPulse.classList.add('hidden');
  }
}

// ─── Grabación de audio ────────────────────
btnRecord.addEventListener('click', startRecording);
btnStop.addEventListener('click', stopRecording);

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.audioChunks = [];
    state.mediaRecorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });

    state.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) state.audioChunks.push(e.data);
    };

    state.mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop()); // Liberar micrófono
      const mimeType = getSupportedMimeType();
      const blob = new Blob(state.audioChunks, { type: mimeType });
      state.recordings[state.currentQuestion] = blob;
      showAudioPlayer(blob, null);
      uploadAndTranscribe(blob);
    };

    state.mediaRecorder.start(100); // Chunks cada 100ms
    state.isRecording = true;

    btnRecord.disabled = true;
    btnRecord.classList.add('recording');
    btnStop.disabled = false;
    setStatus('🔴 Grabando... Habla claramente', true);
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      alert('Permiso de micrófono denegado. Por favor, permite el acceso al micrófono en tu navegador.');
    } else {
      alert('Error al acceder al micrófono: ' + err.message);
    }
    console.error(err);
  }
}

function stopRecording() {
  if (state.mediaRecorder && state.isRecording) {
    state.mediaRecorder.stop();
    state.isRecording = false;
    btnRecord.classList.remove('recording');
    btnStop.disabled = true;
    setStatus('Procesando audio...', false);
  }
}

function getSupportedMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

// ─── Subir audio y transcribir ─────────────
async function uploadAndTranscribe(blob) {
  const qi = state.currentQuestion;
  loadingOverlay.classList.remove('hidden');
  setStatus('Enviando a Whisper AI...', false);

  try {
    const formData = new FormData();
    formData.append('sessionId', state.sessionId);
    formData.append('questionIndex', String(qi));
    formData.append('audio', blob, `pregunta_${qi}.webm`);

    const res = await fetch('/api/audio/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      state.transcriptions[qi] = data.transcription;
      transcText.textContent = data.transcription;
      transcPreview.classList.remove('hidden');
      setStatus('✅ Transcripción lista', false);
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    console.error('Error al transcribir:', err);
    setStatus('⚠️ Transcripción fallida (audio guardado)', false);
  } finally {
    loadingOverlay.classList.add('hidden');
    // Actualizar el dot a "done"
    const dot = $(`dot-${qi}`);
    if (dot) dot.classList.add('done');
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
// 4. FINALIZAR SESIÓN
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

  const answeredCount = state.recordings.filter(Boolean).length;
  const transcribedCount = state.transcriptions.filter(t => t && !t.startsWith('[Transcripción demo')).length;

  $('successStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${QUESTIONS.length}</div>
      <div class="stat-label">Preguntas</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${answeredCount}</div>
      <div class="stat-label">Grabaciones</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${transcribedCount}</div>
      <div class="stat-label">Transcritas</div>
    </div>
  `;
}
