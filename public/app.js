// =============================================
// CLAVES APP — Lógica Frontend (app.js)
// =============================================

const SHEETDB_URL = 'https://sheetdb.io/api/v1/tpz4wdwvpet8d';

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
  companyAddress: '',
  companyRif: '',
  companyPhone: '',
  companyWebsite: '',
  companyLogoData: '',
  companyLogoName: '',
  companyBrandData: '',
  companyBrandName: '',
  companySocialMedia: '',
  companyNotes: '',
  companyServiceType: '',
  currentQuestion: 0,
  transcriptions: new Array(QUESTIONS_DEFAULT.length).fill(''),
  recognition: null,
  isRecording: false,
  isPaused: false,
  questionsReady: false,
};

// ─── Elementos del DOM ────────────────────────
const $ = (id) => document.getElementById(id);

const viewForm    = $('viewForm');
const viewCompany = $('viewCompany');
const viewQuiz    = $('viewQuiz');
const viewSuccess = $('viewSuccess');
// stepBadge es opcional, se usa un proxy seguro para no romper el quiz
const stepBadge   = $('stepBadge') || { textContent: '' };

// Formulario 1: Credenciales
const initialForm   = $('initialForm');
const fullNameInput = $('fullName');
const companyInput  = $('companyName');
const metaUserInput = $('metaUser');
const metaPwInput   = $('metaPassword');
const metaPwConfirmInput = $('metaPasswordConfirm');
const eyeBtn        = $('eyeBtn');
const eyeIcon       = $('eyeIcon');

// Formulario 2: Datos de la Empresa
const companyForm             = $('companyForm');
const companyPrefilledName    = $('companyPrefilledName');
const companyPrefilledEmail   = $('companyPrefilledEmail');
const companyAddressInput     = $('companyAddress');
const companyRifInput         = $('companyRif');
const companyPhoneInput       = $('companyPhone');
const companyWebsiteInput     = $('companyWebsite');
const companyLogoFileInput    = $('companyLogoFile');
const logoDropzone            = $('logoDropzone');
const logoDropzoneContent     = $('logoDropzoneContent');
const logoPreviewCard         = $('logoPreviewCard');
const logoPreviewImg          = $('logoPreviewImg');
const logoFileName            = $('logoFileName');
const logoFileSize            = $('logoFileSize');
const btnRemoveLogo           = $('btnRemoveLogo');
const companyLogoUrlInput     = $('companyLogoUrl');
const toggleLogoAltBtn        = $('toggleLogoAltBtn');
const logoAltBox              = $('logoAltBox');

const companyBrandFileInput   = $('companyBrandFile');
const brandDropzone           = $('brandDropzone');
const brandDropzoneContent    = $('brandDropzoneContent');
const brandPreviewCard        = $('brandPreviewCard');
const brandFileName           = $('brandFileName');
const brandFileSize           = $('brandFileSize');
const btnRemoveBrand          = $('btnRemoveBrand');
const companyBrandUrlInput    = $('companyBrandUrl');
const toggleBrandAltBtn       = $('toggleBrandAltBtn');
const brandAltBox             = $('brandAltBox');

const companySocialInput      = $('companySocial');
const companyNotesInput       = $('companyNotes');
const companyServiceTypeInput = $('companyServiceType');
const btnPrevCompany          = $('btnPrevCompany');
const btnNextCompany          = $('btnNextCompany');

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
    if (state.isRecording && !state.isPaused) {
      try { state.recognition.start(); } catch (e) {}
    }
  };
}

// ═══════════════════════════════════════════
// 0. CARGAR PREGUNTAS DESDE SHEETS (con cache en localStorage)
// ═══════════════════════════════════════════
const QUESTIONS_CACHE_KEY = 'na_questions_cache';

// Aplicar cache inmediatamente si existe (carga instantánea en visitas repetidas)
try {
  const cached = localStorage.getItem(QUESTIONS_CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length) {
      QUESTIONS = parsed;
      state.transcriptions = new Array(QUESTIONS.length).fill('');
    }
  }
} catch(e) {}

async function loadQuestionsFromSheets() {
  try {
    const res  = await fetch(`${SHEETDB_URL}/search?Session ID=__QUESTIONS_CONFIG__`);
    const data = await res.json();
    if (data && data.length && data[0]['__questions_json__']) {
      const loaded = JSON.parse(data[0]['__questions_json__']);
      if (Array.isArray(loaded) && loaded.length) {
        QUESTIONS = loaded;
        state.transcriptions = new Array(QUESTIONS.length).fill('');
        // Guardar en caché para la próxima visita
        try { localStorage.setItem(QUESTIONS_CACHE_KEY, JSON.stringify(loaded)); } catch(e) {}
      }
    }
  } catch(e) {
    console.warn('No se pudo cargar la plantilla de preguntas, usando defaults.');
  }
}

// Cargar en background sin bloquear el render
setTimeout(() => loadQuestionsFromSheets(), 0);

// ═══════════════════════════════════════════
// BOTÓN SALIR (X) DEL QUIZ
// ═══════════════════════════════════════════
const exitModal      = document.getElementById('exitConfirmModal');
const btnExitQuiz    = document.getElementById('btnExitQuiz');
const exitCancelBtn  = document.getElementById('exitCancelBtn');
const exitConfirmBtn = document.getElementById('exitConfirmBtn');

if (btnExitQuiz) {
  btnExitQuiz.addEventListener('click', () => {
    exitModal.style.display = 'flex';
  });
}

if (exitCancelBtn) {
  exitCancelBtn.addEventListener('click', () => {
    exitModal.style.display = 'none';
  });
}

if (exitConfirmBtn) {
  exitConfirmBtn.addEventListener('click', () => {
    // Detener grabación si está activa
    if (state.isRecording) stopRecording();

    // Resetear estado del quiz
    state.currentQuestion = 0;
    state.transcriptions = new Array(QUESTIONS.length).fill('');
    state.baseTranscript  = '';
    if (answerTextarea) answerTextarea.value = '';

    // Ocultar modal
    exitModal.style.display = 'none';

    // Regresar a Portal de Clientes
    viewQuiz.classList.add('hidden');
    viewCompany.classList.add('hidden');
    viewForm.classList.remove('hidden');
    if (stepBadge && stepBadge.textContent !== undefined) {
      stepBadge.textContent = 'Paso 1 de 3';
    }
  });
}

// Cerrar modal al hacer clic en el fondo oscuro
if (exitModal) {
  exitModal.addEventListener('click', (e) => {
    if (e.target === exitModal) exitModal.style.display = 'none';
  });
}


// ═══════════════════════════════════════════
// 2. FORMULARIO INICIAL
// ═══════════════════════════════════════════

let pwVisible = false;
if (eyeBtn) {
  eyeBtn.addEventListener('click', () => {
    pwVisible = !pwVisible;
    metaPwInput.type = pwVisible ? 'text' : 'password';
    eyeIcon.innerHTML = pwVisible
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  });
}

const eyeBtnConfirm = $('eyeBtnConfirm');
const eyeIconConfirm = $('eyeIconConfirm');
let pwConfirmVisible = false;
if (eyeBtnConfirm) {
  eyeBtnConfirm.addEventListener('click', () => {
    pwConfirmVisible = !pwConfirmVisible;
    metaPwConfirmInput.type = pwConfirmVisible ? 'text' : 'password';
    eyeIconConfirm.innerHTML = pwConfirmVisible
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  });
}

initialForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  state.fullName = fullNameInput.value.trim();
  state.companyName = companyInput.value.trim();
  state.metaUser = metaUserInput.value.trim();
  state.metaPasswordPreview = metaPwInput.value.trim();

  goToCompanyData();
});

function validateForm() {
  const fields = [
    { id: 'fullName',    el: fullNameInput },
    { id: 'companyName', el: companyInput  },
    { id: 'metaUser',    el: metaUserInput },
    { id: 'metaPassword',el: metaPwInput   },
    { id: 'metaPasswordConfirm', el: metaPwConfirmInput }
  ];
  let valid = true;
  fields.forEach(({ id, el }) => {
    const fg = $(`fg-${id}`);
    if (!el.value.trim()) {
      fg.classList.add('has-error');
      // If it's the confirm field, set a default error text when empty
      if (id === 'metaPasswordConfirm') {
        $('err-metaPasswordConfirm').textContent = 'Este campo es requerido';
      }
      valid = false;
    } else {
      fg.classList.remove('has-error');
    }
  });

  // Check if passwords match
  if (metaPwInput.value.trim() && metaPwConfirmInput.value.trim() && metaPwInput.value !== metaPwConfirmInput.value) {
    const fg = $('fg-metaPasswordConfirm');
    fg.classList.add('has-error');
    $('err-metaPasswordConfirm').textContent = 'Las contraseñas no coinciden';
    valid = false;
  }

  return valid;
}

['fullName','companyName','metaUser','metaPassword','metaPasswordConfirm'].forEach(id => {
  $(id).addEventListener('input', () => $(`fg-${id}`).classList.remove('has-error'));
});

// ═══════════════════════════════════════════
// 2.1 TRANSICIÓN A DATOS DE LA EMPRESA
// ═══════════════════════════════════════════

function goToCompanyData() {
  viewForm.classList.add('hidden');
  viewQuiz.classList.add('hidden');
  viewCompany.classList.remove('hidden');

  // Prellenar nombre y correo previos
  if (companyPrefilledName) companyPrefilledName.value = state.fullName;
  if (companyPrefilledEmail) companyPrefilledEmail.value = state.metaUser;

  if (stepBadge && stepBadge.textContent !== undefined) {
    stepBadge.textContent = 'Paso 2 de 3';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

if (btnPrevCompany) {
  btnPrevCompany.addEventListener('click', () => {
    viewCompany.classList.add('hidden');
    viewForm.classList.remove('hidden');
    if (stepBadge && stepBadge.textContent !== undefined) {
      stepBadge.textContent = 'Paso 1 de 3';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (companyForm) {
  companyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    state.companyAddress     = companyAddressInput ? companyAddressInput.value.trim() : '';
    state.companyRif         = companyRifInput ? companyRifInput.value.trim() : '';
    state.companyPhone       = companyPhoneInput ? companyPhoneInput.value.trim() : '';
    state.companyWebsite     = companyWebsiteInput ? companyWebsiteInput.value.trim() : '';
    state.companySocialMedia = companySocialInput ? companySocialInput.value.trim() : '';
    state.companyNotes       = companyNotesInput ? companyNotesInput.value.trim() : '';
    state.companyServiceType = companyServiceTypeInput ? companyServiceTypeInput.value.trim() : '';

    goToQuiz();
  });
}

// ─── Archivos adjuntables: Logo e Identidad ───
// Google Sheets tiene un límite estricto de 50.000 caracteres por celda.
// Garantizamos que las miniaturas base64 queden siempre por debajo de 30.000 caracteres.
function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const render = (dim, q) => {
        let width = img.width;
        let height = img.height;
        if (width > dim || height > dim) {
          if (width > height) {
            height = Math.round((height * dim) / width);
            width = dim;
          } else {
            width = Math.round((width * dim) / height);
            height = dim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL('image/jpeg', q);
      };

      let dataUrl = render(200, 0.65);
      if (dataUrl.length > 30000) {
        dataUrl = render(150, 0.50);
      }
      if (dataUrl.length > 30000) {
        dataUrl = render(100, 0.40);
      }

      const approxKb = (dataUrl.length * 0.75 / 1024).toFixed(1) + ' KB';
      callback(dataUrl, approxKb);
    };
    img.onerror = () => {
      const approxKb = (file.size / 1024).toFixed(1) + ' KB';
      if (e.target.result && e.target.result.length <= 30000) {
        callback(e.target.result, approxKb);
      } else {
        callback(`[Archivo adjunto: ${file.name} (${approxKb})]`, approxKb);
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Logo Dropzone
if (companyLogoFileInput) {
  const handleLogoFile = (file) => {
    if (!file) return;
    state.companyLogoName = file.name;
    if (logoFileName) logoFileName.textContent = file.name;

    compressImage(file, (dataUrl, sizeStr) => {
      state.companyLogoData = dataUrl;
      if (logoFileSize) logoFileSize.textContent = sizeStr;
      if (logoPreviewImg) logoPreviewImg.src = dataUrl;
      if (logoDropzoneContent) logoDropzoneContent.classList.add('hidden');
      if (logoPreviewCard) logoPreviewCard.classList.remove('hidden');
    });
  };

  companyLogoFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleLogoFile(e.target.files[0]);
    }
  });

  if (logoDropzone) {
    logoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      logoDropzone.classList.add('dragover');
    });
    ['dragleave', 'dragend'].forEach(ev => {
      logoDropzone.addEventListener(ev, () => logoDropzone.classList.remove('dragover'));
    });
    logoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      logoDropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleLogoFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (btnRemoveLogo) {
    btnRemoveLogo.addEventListener('click', (e) => {
      e.stopPropagation();
      state.companyLogoData = '';
      state.companyLogoName = '';
      companyLogoFileInput.value = '';
      if (logoPreviewImg) logoPreviewImg.src = '';
      if (logoPreviewCard) logoPreviewCard.classList.add('hidden');
      if (logoDropzoneContent) logoDropzoneContent.classList.remove('hidden');
    });
  }
}

// Brand Identity Dropzone
if (companyBrandFileInput) {
  const handleBrandFile = (file) => {
    if (!file) return;
    state.companyBrandName = file.name;
    if (brandFileName) brandFileName.textContent = file.name;
    const sizeStr = file.size > 1048576
      ? (file.size / 1048576).toFixed(1) + ' MB'
      : (file.size / 1024).toFixed(1) + ' KB';
    if (brandFileSize) brandFileSize.textContent = sizeStr;

    if (file.type.startsWith('image/')) {
      compressImage(file, (dataUrl) => {
        state.companyBrandData = dataUrl;
      });
    } else if (file.size <= 15000 && (file.type === 'text/plain' || file.type === 'image/svg+xml')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target.result && e.target.result.length <= 30000) {
          state.companyBrandData = e.target.result;
        } else {
          state.companyBrandData = `[Archivo adjunto: ${file.name} (${sizeStr})]`;
        }
      };
      reader.readAsDataURL(file);
    } else {
      state.companyBrandData = `[Archivo adjunto: ${file.name} (${sizeStr})]`;
    }

    if (brandDropzoneContent) brandDropzoneContent.classList.add('hidden');
    if (brandPreviewCard) brandPreviewCard.classList.remove('hidden');
  };

  companyBrandFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleBrandFile(e.target.files[0]);
    }
  });

  if (brandDropzone) {
    brandDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      brandDropzone.classList.add('dragover');
    });
    ['dragleave', 'dragend'].forEach(ev => {
      brandDropzone.addEventListener(ev, () => brandDropzone.classList.remove('dragover'));
    });
    brandDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      brandDropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleBrandFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (btnRemoveBrand) {
    btnRemoveBrand.addEventListener('click', (e) => {
      e.stopPropagation();
      state.companyBrandData = '';
      state.companyBrandName = '';
      companyBrandFileInput.value = '';
      if (brandPreviewCard) brandPreviewCard.classList.add('hidden');
      if (brandDropzoneContent) brandDropzoneContent.classList.remove('hidden');
    });
  }
}

// Botones para alternar links directos
if (toggleLogoAltBtn && logoAltBox) {
  toggleLogoAltBtn.addEventListener('click', () => {
    logoAltBox.classList.toggle('hidden');
  });
}
if (toggleBrandAltBtn && brandAltBox) {
  toggleBrandAltBtn.addEventListener('click', () => {
    brandAltBox.classList.toggle('hidden');
  });
}

// ═══════════════════════════════════════════
// 3. TRANSICIÓN AL QUIZ
// ═══════════════════════════════════════════

function goToQuiz() {
  viewForm.classList.add('hidden');
  viewCompany.classList.add('hidden');
  viewQuiz.classList.remove('hidden');
  if (stepBadge && stepBadge.textContent !== undefined) stepBadge.textContent = 'Paso 3 de 3';

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

function updateRecorderUI() {
  const btnRecordText = $('btnRecordText');
  const btnRecordInner = $('btnRecordInner');
  const statusText = $('statusText');
  const statusPulse = $('statusPulse');
  const btnReset = $('btnReset');

  if (state.isRecording && !state.isPaused) {
    // Recording
    btnRecord.disabled = false;
    btnRecord.classList.add('recording');
    if (btnRecordText) btnRecordText.textContent = 'Pausar';
    if (btnRecordInner) {
      btnRecordInner.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="4" width="4" height="16" rx="1"></rect>
          <rect x="14" y="4" width="4" height="16" rx="1"></rect>
        </svg>
      `;
    }
    btnStop.disabled = false;
    if (btnReset) btnReset.disabled = false;
    if (statusText) statusText.textContent = 'Grabando...';
    if (statusPulse) statusPulse.classList.remove('hidden');
  } else if (state.isRecording && state.isPaused) {
    // Paused
    btnRecord.disabled = false;
    btnRecord.classList.remove('recording');
    if (btnRecordText) btnRecordText.textContent = 'Reanudar';
    if (btnRecordInner) {
      btnRecordInner.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
    }
    btnStop.disabled = false;
    if (btnReset) btnReset.disabled = false;
    if (statusText) statusText.textContent = 'Grabación pausada';
    if (statusPulse) statusPulse.classList.add('hidden');
  } else {
    // Stopped / Idle
    btnRecord.disabled = false;
    btnRecord.classList.remove('recording');
    if (btnRecordText) btnRecordText.textContent = 'Grabar';
    if (btnRecordInner) {
      btnRecordInner.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      `;
    }
    btnStop.disabled = true;
    if (btnReset) btnReset.disabled = answerTextarea.value.trim() === '';
    if (statusText) statusText.textContent = 'Listo para grabar';
    if (statusPulse) statusPulse.classList.add('hidden');
  }
}

function resetRecorderUI() {
  if (state.isRecording) stopRecording();
  updateRecorderUI();
}

// ─── Lógica para Grabación ──────────
btnRecord.addEventListener('click', () => {
  if (state.isRecording) {
    if (state.isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  } else {
    startRecording();
  }
});

btnStop.addEventListener('click', stopRecording);

const btnReset = $('btnReset');
if (btnReset) {
  btnReset.addEventListener('click', resetRecording);
}

answerTextarea.addEventListener('input', () => {
  if (!state.isRecording && btnReset) {
    btnReset.disabled = answerTextarea.value.trim() === '';
  }
});

async function startRecording() {
  if (!state.recognition) {
    alert("Reconocimiento de voz no soportado. Usa Chrome o Edge.");
    return;
  }
  
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    
    state.baseTranscript = answerTextarea.value + (answerTextarea.value ? ' ' : '');
    state.isRecording = true;
    state.isPaused = false;
    state.recognition.start();

    updateRecorderUI();
  } catch (err) {
    alert('Debes permitir el uso del micrófono.');
  }
}

function pauseRecording() {
  if (state.isRecording && !state.isPaused) {
    state.isPaused = true;
    state.recognition.stop();
    updateRecorderUI();
  }
}

function resumeRecording() {
  if (state.isRecording && state.isPaused) {
    state.isPaused = false;
    state.baseTranscript = answerTextarea.value + (answerTextarea.value ? ' ' : '');
    state.recognition.start();
    updateRecorderUI();
  }
}

function stopRecording() {
  if (state.isRecording) {
    state.isRecording = false;
    state.isPaused = false;
    state.recognition.stop();
  }
  updateRecorderUI();
}

function resetRecording() {
  if (state.isRecording) {
    state.isRecording = false;
    state.isPaused = false;
    state.recognition.stop();
  }
  answerTextarea.value = '';
  state.baseTranscript = '';
  startRecording();
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
    // Pregunta 1 → regresar a Datos de la empresa
    if (state.isRecording) stopRecording();
    viewQuiz.classList.add('hidden');
    viewCompany.classList.remove('hidden');
    if (stepBadge && stepBadge.textContent !== undefined) {
      stepBadge.textContent = 'Paso 2 de 3';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const logoVal  = (companyLogoUrlInput && companyLogoUrlInput.value.trim())
      || state.companyLogoData
      || (state.companyLogoName ? `[Archivo adjunto: ${state.companyLogoName}]` : '');

    const brandVal = (companyBrandUrlInput && companyBrandUrlInput.value.trim())
      || state.companyBrandData
      || (state.companyBrandName ? `[Archivo adjunto: ${state.companyBrandName}]` : '');

    const sheetData = {
      'Session ID': state.sessionId,
      'Fecha de Envío': new Date().toISOString(),
      'Nombre Completo': state.fullName,
      'Empresa': state.companyName,
      'Usuario Meta': state.metaUser,
      'Contraseña Meta': state.metaPasswordPreview,
      'Rif': state.companyRif,
      'Dirección': state.companyAddress,
      'Teléfono': state.companyPhone,
      'Página Web': state.companyWebsite,
      'Logo': logoVal,
      'Identidad de Marca': brandVal,
      'Redes Sociales': state.companySocialMedia,
      'Observaciones': state.companyNotes,
      'Tipo de Empresa y Servicio': state.companyServiceType,
    };

    QUESTIONS.forEach((q, index) => {
      sheetData[q.id] = state.transcriptions[index] || '';
    });

    sheetData['Servicios Activados'] = '';
    sheetData['Fecha Activación Servicios'] = '';

    // Límite de Google Sheets: 50.000 caracteres por celda.
    // Garantizar que ningún campo supere los 35.000 caracteres.
    const MAX_CELL_CHARS = 35000;
    for (const key of Object.keys(sheetData)) {
      if (typeof sheetData[key] === 'string' && sheetData[key].length > MAX_CELL_CHARS) {
        if (key === 'Logo') {
          sheetData[key] = state.companyLogoName ? `[Logo adjunto: ${state.companyLogoName}]` : '';
        } else if (key === 'Identidad de Marca') {
          sheetData[key] = state.companyBrandName ? `[Marca adjunta: ${state.companyBrandName}]` : '';
        } else {
          sheetData[key] = sheetData[key].substring(0, MAX_CELL_CHARS) + '... [truncado por límite de celda]';
        }
      }
    }

    const res = await fetch(SHEETDB_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [sheetData] }),
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok || result.error || (!result.created && !result.rows)) {
      const errMsg = result.error || `Error del servidor (${res.status}): No se pudo guardar la información.`;
      throw new Error(errMsg);
    }

    showSuccess();
  } catch (err) {
    console.error('Error al guardar en SheetDB:', err);
    alert(`No se pudo guardar la información: ${err.message || 'Error de conexión'}. Por favor intenta de nuevo.`);
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
