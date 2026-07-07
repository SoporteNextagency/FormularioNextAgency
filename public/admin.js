// =============================================
// ADMIN LOGIC — NextAgency v4
// =============================================

const SHEETDB_URL = 'https://sheetdb.io/api/v1/tpz4wdwvpet8d';
const CASES_BASE  = 'https://sheetdb.io/api/v1/6sty8p65pjvjk';
const CASES_URL   = `${CASES_BASE}?sheet=casos`;

const QUESTIONS = [
  { id: 'Nombre del Bot',           label: '¿Nombre del Bot?',              q: '¿Qué nombre interno le daremos a este bot? (Ej. Bot de Ventas, Virtual Concierge)',                   placeholder: 'Ej. Asistente de Soporte' },
  { id: 'Canales',                  label: '¿Canales de operación?',         q: '¿En qué canales operará este agente? (Ej. WhatsApp, Instagram DM, Web Chat)',                        placeholder: 'Ej. WhatsApp e Instagram' },
  { id: 'Retraso de Respuesta',     label: '¿Retraso de respuesta?',         q: '¿Quieres que responda instantáneamente o prefieres un retraso simulado (ej. 2 a 5 segundos)?',       placeholder: 'Ej. Retraso de 3 segundos para que parezca más humano.' },
  { id: 'Enlaces Web',              label: 'URLs de referencia',              q: 'Proporciona los enlaces (URLs) de los que el bot debe aprender.',                                   placeholder: 'https://miweb.com/about\nhttps://miweb.com/servicios' },
  { id: 'FAQs',                     label: 'Preguntas Frecuentes (FAQs)',     q: 'Enumera de 5 a 10 preguntas frecuentes de tus clientes con sus respuestas.',                        placeholder: 'P: ¿Hacen envíos?\nR: Sí, a todo el país.' },
  { id: 'Contexto de Conversación', label: 'Contexto de la conversación',    q: 'Contexto de la conversación: ¿Cuál es la situación típica por la que te contactan?',               placeholder: 'Ej. El cliente vio un anuncio y quiere saber los precios.' },
  { id: 'Rol del Agente',           label: 'Rol del Agente',                 q: '¿Quién es el agente dentro de tu empresa? (Ej. Secretaria amigable, Soporte experto)',              placeholder: 'Ej. Un vendedor amable y experto en tecnología.' },
  { id: 'Estilo, Tono e Idioma',    label: 'Estilo, Tono e Idioma',          q: 'Define su estilo de escritura, su tono (ej. Empático, Formal) y la política de idioma.',            placeholder: 'Ej. Tono empático y profesional. Siempre responder en español.' },
  { id: 'Objetivo Principal',       label: 'Objetivo Principal',             q: 'Objetivo principal: ¿Qué debe lograr el agente al final de la charla?',                             placeholder: 'Ej. Agendar una cita.' },
  { id: 'Guion / Flujo',            label: 'Guion / Flujo de conversación',  q: 'Describe la secuencia o flujo de preguntas paso a paso.',                                           placeholder: '1. Saludar\n2. Preguntar el problema\n3. Ofrecer solución' },
  { id: 'Objeciones Comunes',       label: 'Objeciones Comunes',             q: '¿Qué debe responder ante las 2 o 3 dudas o quejas más típicas?',                                    placeholder: 'Si dicen "muy caro", responde con el valor agregado.' },
  { id: 'Límites Estrictos',        label: 'Límites Estrictos (Reglas)',      q: 'Reglas inquebrantables: ¿Qué cosas NO debe hacer o decir NUNCA el agente?',                        placeholder: 'Ej. NUNCA dar descuentos sin autorización.' },
  { id: 'Ejemplo 1',                label: 'Ejemplo 1 (Evitar / Usar)',       q: 'Ejemplo 1 de comportamiento. Escribe qué EVITAR y qué USAR en su lugar.',                           placeholder: 'EVITAR: "Cuesta $100."\nUSAR: "Te paso los planes detallados..."' },
  { id: 'Ejemplo 2',                label: 'Ejemplo 2 (Evitar / Usar)',       q: 'Ejemplo 2 de comportamiento. Escribe qué EVITAR y qué USAR en su lugar.',                           placeholder: 'EVITAR: ...\nUSAR: ...' },
  { id: 'Resumen de Oferta',        label: 'Resumen de Oferta',              q: 'Haz un resumen breve de tu oferta principal o servicios clave.',                                    placeholder: 'Ofrecemos automatización con IA...' },
  { id: 'Transferencia a Humanos',  label: 'Transferencia a Humanos',        q: '¿Bajo qué situaciones exactas el bot debe transferir a un humano?',                                 placeholder: 'Ej. Cuando el cliente pida hablar con un humano o se note molesto.' },
  { id: 'Seguimiento Automático',   label: 'Seguimiento Automático',         q: '¿Debe hacer seguimiento si el cliente no responde? ¿Cuándo y qué debe decir?',                      placeholder: 'Ej. Escribir a las 24 horas preguntando si sigue interesado.' },
  { id: 'Integraciones',            label: 'Integraciones',                  q: '¿Con qué herramientas debe conectarse el bot para registrar la info? (Ej. HubSpot, Calendly)',      placeholder: 'Ej. Guardar contactos en HubSpot' },
];


// ─── Estado global ───────────────────────────
let currentClient = null;
let currentTab    = 'servicios';

// ─── DOM refs ────────────────────────────────
const adminLogin     = document.getElementById('adminLogin');
const adminDashboard = document.getElementById('adminDashboard');
const adminEmail     = document.getElementById('adminEmail');
const btnLogin       = document.getElementById('btnLogin');
const tableBody      = document.getElementById('tableBody');

const clientDetail   = document.getElementById('clientDetail');
const detailOverlay  = document.getElementById('detailOverlay');
const detailFooter   = document.getElementById('detailFooter');

// Detail header
const detailClientTitle = document.getElementById('detailClientTitle');
const detailClientSub   = document.getElementById('detailClientSub');
const detailBadge       = document.getElementById('detailBadge');

// Tab: Servicios
const dServicesSelect   = document.getElementById('d-servicesSelect');
const dServicesInput    = document.getElementById('d-servicesInput');
const dEditDate         = document.getElementById('d-editDate');
const dBillingPreview   = document.getElementById('d-billingPreview');
const dBillingPreviewText = document.getElementById('d-billingPreviewText');
const dTrialEnd         = document.getElementById('d-trialEnd');
const dNextBill         = document.getElementById('d-nextBill');
const dMetaUser         = document.getElementById('d-metaUser');
const dMetaPassWrap     = document.getElementById('d-metaPassWrap');
const dMetaPassDisplay  = document.getElementById('d-metaPassDisplay');

// Tab: Preguntas
const questionsContainer = document.getElementById('questionsContainer');

// Tab: Prompt
const dPromptTextarea = document.getElementById('d-promptTextarea');

// ─── Helpers de fechas ──────────────────────
function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

function calcBilling(activationDateStr, vencimientoStr) {
  if (!activationDateStr) return null;
  const activation = new Date(activationDateStr);
  if (isNaN(activation)) return null;

  const trialEnd = addDays(activationDateStr, 30);
  const today    = new Date();
  today.setHours(0,0,0,0);

  if (vencimientoStr) {
    const nextBill = new Date(vencimientoStr);
    if (nextBill <= addDays(activationDateStr, 32) && today <= trialEnd) {
      return { trialEnd, nextBill, status: 'trial' };
    }
    return { trialEnd, nextBill, status: 'active' };
  }

  const firstBill = addDays(activationDateStr, 31);
  if (today < firstBill) {
    return { trialEnd, nextBill: firstBill, status: 'trial' };
  }

  const msPerCycle = 30 * 24 * 60 * 60 * 1000;
  const msSinceFirstBill = today - firstBill;
  const cyclesPassed = Math.floor(msSinceFirstBill / msPerCycle);
  const nextBill = new Date(firstBill.getTime() + (cyclesPassed + 1) * msPerCycle);

  return { trialEnd, nextBill, status: 'active' };
}

function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
}

// ─── LOGIN ──────────────────────────────────
btnLogin.addEventListener('click', () => {
  const email = adminEmail.value.trim().toLowerCase();
  if (email === 'soporte@nextagency.app') {
    adminLogin.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    loadClients();
  } else {
    alert('Acceso denegado. Correo no autorizado.');
  }
});

// ─── PARSEO DE SERVICIOS MULTIPLES ────────────
function parseClientServices(client) {
  const raw = client['Servicios Activados'] || '';
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch(e) {}
  // Fallback a CSV legacy
  const fbDate = client['Fecha Activación Servicios'] || '';
  return raw.split(',').map(s => ({
    name: s.trim(),
    date: fbDate
  })).filter(s => s.name);
}

// ─── TABS DASHBOARD ───────────────────────────
window.switchDashTab = (tab) => {
  ['registros', 'consultas'].forEach(t => {
    document.getElementById(`dtb-${t}`).classList.toggle('active', t === tab);
    document.getElementById(`dtb-${t}`).style.color = (t === tab) ? 'var(--clr-primary)' : 'var(--clr-text-2)';
    document.getElementById(`dtb-${t}`).style.borderBottomColor = (t === tab) ? 'var(--clr-primary)' : 'transparent';
    document.getElementById(`dpanel-${t}`).style.display = (t === tab) ? 'block' : 'none';
  });
};

// ─── CARGAR CLIENTES Y CONSULTAS ────────────
async function loadClients() {
  const tableBody = document.getElementById('tableBody');
  const tableBodyConsultas = document.getElementById('tableBodyConsultas');

  try {
    // ⚡ Fetch ambas APIs EN PARALELO para no sumar tiempos de espera
    const [res, casesRes] = await Promise.all([
      fetch(SHEETDB_URL),
      fetch(CASES_URL)
    ]);
    const [data, casesData] = await Promise.all([
      res.json(),
      casesRes.json()
    ]);

    window.clientsData = data;
    tableBody.innerHTML = '';
    tableBodyConsultas.innerHTML = '';

    const defaultServices = ['WhatsApp', 'Instagram', 'Facebook Messenger', 'Telegram', 'Web Chat'];
    let uniqueServices = new Set(defaultServices);
    
    // Arrays separados
    const registros = [];
    const consultas = [];
    
    data.forEach(c => {
      if (c['Tipo'] === 'Consulta') {
        consultas.push(c);
      } else {
        registros.push(c);
        const svcs = parseClientServices(c);
        svcs.forEach(s => {
          if (s.name) uniqueServices.add(s.name);
        });
      }
    });
    
    window.availableServices = Array.from(uniqueServices).sort();

    // RENDERIZAR REGISTROS
    if (!registros.length) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--clr-text-3);">No hay clientes registrados aún.</td></tr>';
    } else {
      registros.slice().reverse().forEach(client => {
      const vencimientoDate = client['Fecha Vencimiento'];
      const svcs = parseClientServices(client);
      
      let mostUrgentBilling = null;
      svcs.forEach(svc => {
        const b = calcBilling(svc.date, vencimientoDate);
        if (b) {
          if (!mostUrgentBilling) mostUrgentBilling = b;
          else if (daysUntil(b.nextBill) < daysUntil(mostUrgentBilling.nextBill)) {
            mostUrgentBilling = b;
          }
        }
      });
      
      const dateStr = client['Fecha de Envío'] ? fmt(client['Fecha de Envío']) : 'N/A';
      
      const serviceText = svcs.length > 1 
        ? `${svcs.length} servicios` 
        : (svcs.length === 1 ? svcs[0].name : '');

      let badgeHtml = '<span class="badge pending">Sin activar</span>';
      let billCellHtml = '<span style="color:var(--clr-text-3)">—</span>';

      if (mostUrgentBilling) {
        const days = daysUntil(mostUrgentBilling.nextBill);
        if (mostUrgentBilling.status === 'trial') {
          badgeHtml = '<span class="badge trial">🎁 Prueba</span>';
          billCellHtml = `<div class="billing-info">
            <span class="billing-value highlight">${fmt(mostUrgentBilling.nextBill)}</span>
            <span class="billing-label">Primera factura</span>
          </div>`;
        } else {
          badgeHtml = days <= 5
            ? '<span class="badge overdue">⚠️ Cobro pronto</span>'
            : '<span class="badge active">✅ Activo</span>';
          billCellHtml = `<div class="billing-info">
            <span class="billing-value ${days <= 5 ? 'danger' : 'ok'}">${fmt(mostUrgentBilling.nextBill)}</span>
            <span class="billing-label">en ${days} días</span>
          </div>`;
        }
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <span style="color:var(--clr-text-2);font-size:0.85rem;">${dateStr}</span>
            <button
              title="Eliminar cliente"
              onclick="openDeleteModal('${client['Session ID']}', '${(client['Nombre Completo'] || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')} — ${(client['Empresa'] || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')}')"
              style="background:none;border:none;cursor:pointer;padding:3px;border-radius:5px;color:#ef4444;opacity:0.6;transition:opacity 0.15s,background 0.15s;flex-shrink:0;"
              onmouseover="this.style.opacity='1';this.style.background='rgba(239,68,68,0.1)'"
              onmouseout="this.style.opacity='0.6';this.style.background='none'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
            <button
              title="Actualizar datos del cliente"
              onclick="openUpdateModal('${client['Session ID']}')"
              style="background:none;border:none;cursor:pointer;padding:2px 6px;border-radius:5px;color:var(--clr-primary);font-size:0.7rem;font-weight:600;opacity:0.7;transition:opacity 0.15s,background 0.15s;flex-shrink:0;"
              onmouseover="this.style.opacity='1';this.style.background='rgba(0,163,221,0.1)'"
              onmouseout="this.style.opacity='0.7';this.style.background='none'"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </td>
        <td>
          <div style="font-weight:600;">${client['Empresa'] || 'N/A'}</div>
          <div style="font-size:0.8rem;color:var(--clr-text-3);">${client['Nombre Completo'] || ''}</div>
        </td>
        <td>${serviceText ? `<strong>${serviceText}</strong>` : '<span style="color:var(--clr-text-3)">Sin asignar</span>'}</td>
        <td>${badgeHtml}</td>
        <td>${billCellHtml}</td>
        <td style="text-align:center;">
          <button class="btn-primary" style="padding:0.35rem 1rem;font-size:0.8rem;"
            onclick="openClientDetail('${client['Session ID']}')">
            Ver →
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    }

    // RENDERIZAR CONSULTAS (ya cargadas en paralelo arriba)
    if (!Array.isArray(casesData) || !casesData.length) {
      tableBodyConsultas.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--clr-text-3);">No hay consultas.</td></tr>';
    } else {
      casesData.slice().reverse().forEach((query, i) => {
          // Verificar si existe en registros
          const qEmpresa = (query['Nombre de la empresa'] || '').trim().toLowerCase();
          const qNombre  = (query['Nombre completo'] || '').trim().toLowerCase();
          let isRegistered = false;
          if (qEmpresa || qNombre) {
            isRegistered = registros.some(r => {
              const rE = (r['Empresa'] || '').trim().toLowerCase();
              const rN = (r['Nombre Completo'] || '').trim().toLowerCase();
              return (qEmpresa && qEmpresa === rE) || (qNombre && qNombre === rN);
            });
          }

          const dateStr = query['Fecha consulta'] ? fmt(query['Fecha consulta']) : 'N/A';
          const numStr  = query['NumeroConsulta'] ? `Consulta #${query['NumeroConsulta']}` : `Consulta #${casesData.length - i}`;
          const especialista = (query['Especialista'] || '').trim();
          const checkIcon = isRegistered
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" title="Cliente Registrado"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--clr-text-3)" stroke-width="2" title="Prospecto Nuevo"><circle cx="12" cy="12" r="10"/></svg>`;

          // Usar Fecha consulta como ID único para actualizar
          const fechaKey = query['Fecha consulta'] || '';

          const especialistaBadge = especialista
            ? `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(16,185,129,0.1);color:#10b981;font-size:0.75rem;font-weight:600;padding:3px 8px;border-radius:20px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                ${especialista}
               </span>`
            : `<button onclick="tomarCaso('${fechaKey}','${numStr}')" style="background:var(--clr-primary);color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:0.78rem;font-weight:600;cursor:pointer;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">Tomar caso</button>`;

          const respuestaActual = (query['Respuesta'] || '').trim();
          const respuestaDropdown = `
            <select onchange="actualizarRespuesta('${fechaKey}', this.value)" style="padding: 4px 8px; border-radius: 6px; border: 1px solid var(--clr-border, #ccc); font-size: 0.78rem; outline: none; background: #fff; cursor: pointer; color: var(--clr-text-1);">
              <option value="" ${!respuestaActual ? 'selected' : ''}>Acciones</option>
              <option value="Seguimiento" ${respuestaActual === 'Seguimiento' ? 'selected' : ''}>Seguimiento</option>
              <option value="Finalizado" ${respuestaActual === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
              <option value="Escalado" ${respuestaActual === 'Escalado' ? 'selected' : ''}>Escalado</option>
            </select>
          `;

          const safeId = `nota-${i}`;
          const notasTextarea = `
            <div style="display:flex; flex-direction:column; gap:6px;">
              <textarea 
                id="${safeId}"
                placeholder="Añadir nueva nota..." 
                style="width: 100%; min-width: 200px; height: 60px; padding: 6px; border-radius: 6px; border: 1px solid var(--clr-border, #ccc); font-size: 0.78rem; font-family: inherit; resize: vertical; outline: none; background: #fff; color: var(--clr-text-1); transition: border-color 0.2s;"
                onfocus="this.style.borderColor='var(--clr-primary)'"
                onblur="this.style.borderColor='var(--clr-border, #ccc)'"
              ></textarea>
              <button onclick="actualizarComentarios('${fechaKey}', '${safeId}', '${numStr}', '${especialista}')" style="align-self:flex-end; background:var(--clr-primary); color:#fff; border:none; border-radius:4px; padding:4px 10px; font-size:0.75rem; font-weight:600; cursor:pointer; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">Guardar Nota</button>
            </div>
          `;

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>
              <div style="color:var(--clr-primary); font-weight:700; font-size:0.78rem; margin-bottom:2px;">${numStr}</div>
              <span style="color:var(--clr-text-2);font-size:0.82rem;">${dateStr}</span>
            </td>
            <td>
              <div style="display:flex;align-items:center;gap:8px;">
                ${checkIcon}
                <div>
                  <div style="font-weight:600;">${query['Nombre de la empresa'] || 'N/A'}</div>
                  <div style="font-size:0.78rem;color:var(--clr-text-3);">${query['Nombre completo'] || ''}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="max-width:320px; white-space:pre-wrap; font-size:0.83rem; color:var(--clr-text-1); line-height:1.5;">${(query['Tu consulta'] || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </td>
            <td>${notasTextarea}</td>
            <td style="text-align:center;">${especialistaBadge}</td>
            <td style="text-align:center;">${respuestaDropdown}</td>
          `;
          tableBodyConsultas.appendChild(tr);
        });
      }

  } catch (err) {
    console.error('Error loading clients:', err);
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;padding:1rem;">Error al cargar datos.</td></tr>';
  }
}

// ─── TOMAR CASO ──────────────────────────
window.tomarCaso = async (fechaKey, label) => {
  if (!fechaKey) {
    alert('No se puede actualizar este caso porque no tiene fecha de envío.');
    return;
  }
  const nombre = prompt(`¿Cuál es tu nombre para tomar ${label}?`);
  if (!nombre || !nombre.trim()) return;
  const nombreTrimmed = nombre.trim();

  try {
    // Actualizar usando 'Fecha consulta' como clave única de búsqueda
    const updateRes = await fetch(
      `${CASES_BASE}/Fecha%20consulta/${encodeURIComponent(fechaKey)}?sheet=casos`,
      {
        method: 'PATCH',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { 'Especialista': nombreTrimmed } }),
      }
    );
    if (!updateRes.ok) {
      const errBody = await updateRes.text();
      throw new Error(`HTTP ${updateRes.status}: ${errBody}`);
    }
    loadClients();
  } catch (e) {
    console.error('tomarCaso error:', e);
    alert('Error al asignar el especialista. Intenta de nuevo.');
  }
};

// ─── ACTUALIZAR RESPUESTA (ESTADO) ─────────
window.actualizarRespuesta = async (fechaKey, status) => {
  if (!fechaKey) return;
  try {
    const updateRes = await fetch(
      `${CASES_BASE}/Fecha%20consulta/${encodeURIComponent(fechaKey)}?sheet=casos`,
      {
        method: 'PATCH',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { 'Respuesta': status } }),
      }
    );
    if (!updateRes.ok) {
      const errBody = await updateRes.text();
      throw new Error(`HTTP ${updateRes.status}: ${errBody}`);
    }
    // Opcional: mostrar feedback de guardado exitoso
    const msg = document.createElement('div');
    msg.textContent = 'Estado actualizado';
    msg.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#10b981; color:#fff; padding:10px 20px; border-radius:8px; font-size:0.85rem; font-weight:600; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.15);';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2500);
  } catch (e) {
    console.error('actualizarRespuesta error:', e);
    alert('Error al actualizar el estado de la consulta. Verifica tu conexión.');
    loadClients(); // revert UI change if failed
  }
};

// ─── AGREGAR COMENTARIOS AL HISTORIAL ────────────────
window.actualizarComentarios = async (fechaKey, textareaId, consultaLabel, especialista) => {
  if (!fechaKey) return;
  const textarea = document.getElementById(textareaId);
  const notas = textarea.value.trim();
  if (!notas) return; // No guardar notas vacías

  try {
    // 1. Registrar el historial en la hoja "Historial Notas"
    const fechaHoraStr = new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    const logData = {
      'FechaRegistro': fechaHoraStr,
      'ConsultaRelacionada': consultaLabel,
      'Especialista': especialista || 'Desconocido',
      'Nota': notas
    };
    
    const postRes = await fetch(`${CASES_BASE}?sheet=Historial%20Notas`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [logData] }),
    });

    if (!postRes.ok) {
      throw new Error('Error al guardar en el Historial');
    }

    // 2. Limpiar el textarea
    textarea.value = '';

    // Feedback visual pequeño
    const msg = document.createElement('div');
    msg.textContent = 'Nota guardada en Historial';
    msg.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#10b981; color:#fff; padding:10px 20px; border-radius:8px; font-size:0.85rem; font-weight:600; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.15);';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2500);
  } catch (e) {
    console.error('actualizarComentarios error:', e);
    alert('Error al guardar la nota. Verifica tu conexión.');
  }
};

// ─── ABRIR PANEL DE DETALLE ─────────────────
window.openClientDetail = (sessionId) => {
  const client = (window.clientsData || []).find(c => c['Session ID'] === sessionId);
  if (!client) return;

  currentClient = client;

  // Cabecera
  detailClientTitle.textContent = client['Empresa'] || 'Empresa sin nombre';
  detailClientSub.textContent   = client['Nombre Completo'] || '';

  const billing = calcBilling(client['Fecha Activación Servicios'], client['Fecha Vencimiento']);
  let badgeHtml = '<span class="badge pending">Sin activar</span>';
  if (billing) {
    const days = daysUntil(billing.nextBill);
    if (billing.status === 'trial') badgeHtml = '<span class="badge trial">🎁 Prueba Gratis</span>';
    else badgeHtml = days <= 5 ? '<span class="badge overdue">⚠️ Próximo cobro</span>' : '<span class="badge active">✅ Activo</span>';
  }
  detailBadge.innerHTML = badgeHtml;

  // Llenar Tab Servicios
  fillServiciosTab(client, billing);

  // Llenar Tab Preguntas
  fillPreguntasTab(client);

  // Llenar Tab Prompt
  fillPromptTab(client);

  // Mostrar primera pestaña
  switchTab('servicios');

  // Abrir panel
  detailOverlay.classList.add('open');
  clientDetail.classList.add('open');
};

// ─── CERRAR PANEL ───────────────────────────
window.closeClientDetail = () => {
  clientDetail.classList.remove('open');
  detailOverlay.classList.remove('open');
  currentClient = null;
};

// ─── CAMBIAR PESTAÑA ────────────────────────
window.switchTab = (tab) => {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`panel-${tab}`).classList.add('active');

  // Actualizar footer
  updateDetailFooter();
};

function updateDetailFooter() {
  if (!currentClient) return;

  const sid = currentClient['Session ID'];

  if (currentTab === 'servicios') {
    const billing = calcBilling(currentClient['Fecha Activación Servicios'], currentClient['Fecha Vencimiento']);
    const renewBtn = billing ? `
      <button class="btn-primary" style="flex:1;background:#10b981;border-color:#10b981;margin-top:0;"
        onclick="renewFromDetail('${sid}', '${billing.nextBill.toISOString()}')">
        🔄 Renovar 30 días
      </button>` : '';
    detailFooter.innerHTML = `
      <button class="btn-secondary" style="flex:1;" onclick="closeClientDetail()">Cancelar</button>
      ${renewBtn}
      <button class="btn-primary" style="flex:1;margin-top:0;" id="btnDetailSaveService" onclick="saveServiceFromDetail('${sid}')">
        <span id="detailSaveServiceText">Guardar servicio</span>
      </button>
    `;
  } else if (currentTab === 'preguntas') {
    detailFooter.innerHTML = `
      <button class="btn-secondary" style="flex:1;" onclick="closeClientDetail()">Cancelar</button>
      <button class="btn-primary" style="flex:1;margin-top:0;" onclick="savePreguntasFromDetail('${sid}')">
        <span id="detailSavePreguntasText">Guardar preguntas</span>
      </button>
    `;
  } else if (currentTab === 'prompt') {
    detailFooter.innerHTML = `
      <button class="btn-secondary" style="flex:1;" onclick="closeClientDetail()">Cerrar</button>
      <button class="btn-primary" style="flex:1;margin-top:0;" id="btnDetailCopyPrompt" onclick="copyDetailPrompt()">
        <span id="detailCopyPromptText">📋 Copiar prompt</span>
      </button>
    `;
  }
}

let currentClientServices = [];

// ─── LLENAR TAB SERVICIOS ───────────────────
function fillServiciosTab(client, billing) {
  // Meta
  dMetaUser.textContent = client['Usuario Meta'] || '—';
  if (client['Contraseña Meta']) {
    dMetaPassWrap.style.display = 'flex';
    dMetaPassDisplay.textContent = '••••••';
    dMetaPassDisplay.dataset.pass = client['Contraseña Meta'];
    dMetaPassDisplay.dataset.revealed = '0';
  } else {
    dMetaPassWrap.style.display = 'none';
  }

  currentClientServices = parseClientServices(client);
  renderServicesList();

  // Servicios select
  dServicesSelect.innerHTML = '<option value="">-- Añadir servicio existente --</option>';
  (window.availableServices || []).forEach(s => {
    dServicesSelect.innerHTML += `<option value="${s}">${s}</option>`;
  });
  dServicesSelect.innerHTML += '<option value="_ADD_NEW_">➕ Añadir nuevo...</option>';
}

function renderServicesList() {
  const container = document.getElementById('d-servicesList');
  if (!container) return;
  container.innerHTML = '';
  
  if (currentClientServices.length === 0) {
    container.innerHTML = '<div style="color:var(--clr-text-3); font-size:0.85rem; padding:0.5rem 0;">No hay servicios.</div>';
  }

  currentClientServices.forEach((svc, index) => {
    const div = document.createElement('div');
    div.style = 'display:flex; align-items:center; gap:0.5rem; background:#f8fafc; padding:0.5rem 0.75rem; border-radius:0.5rem; border:1px solid #e2e8f0;';
    
    div.innerHTML = `
      <div style="flex:1; font-weight:600; color:var(--clr-text-1); font-size:0.9rem;">${svc.name}</div>
      <input type="date" class="field-input" style="width:140px; padding:0.4rem; font-size:0.8rem;" value="${svc.date}" onchange="updateServiceDate(${index}, this.value)">
      <button type="button" onclick="removeService(${index})" style="background:none; border:none; color:var(--clr-danger); cursor:pointer; padding:0.2rem; display:flex; align-items:center; justify-content:center; border-radius:0.3rem;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='none'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;
    container.appendChild(div);
  });
  updateDetailBillingPreview();
}

window.updateServiceDate = (index, val) => {
  currentClientServices[index].date = val;
  updateDetailBillingPreview();
};

window.removeService = (index) => {
  const keyword = prompt('Para eliminar este servicio, escribe: Eliminar');
  if (keyword === 'Eliminar') {
    currentClientServices.splice(index, 1);
    renderServicesList();
  } else if (keyword !== null) {
    alert('Palabra clave incorrecta. No se eliminó el servicio. Debe escribir "Eliminar".');
  }
};

// Evento: añadir servicio
window.addServiceFromSelect = () => {
  const selectEl = document.getElementById('d-servicesSelect');
  let val = selectEl.value;
  
  if (val === '_ADD_NEW_') {
    val = prompt('Nombre del nuevo servicio:');
  }
  
  if (!val) {
    selectEl.value = '';
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  currentClientServices.push({ name: val.trim(), date: today });
  selectEl.value = '';
  renderServicesList();
};

function updateDetailBillingPreview() {
  const dBillingPreview = document.getElementById('d-billingPreview');
  const dBillingPreviewText = document.getElementById('d-billingPreviewText');
  const dBillingStatus  = document.getElementById('d-billingStatus');
  
  if (!currentClient || currentClientServices.length === 0) {
    dBillingPreview.style.display = 'flex';
    dBillingPreviewText.innerHTML = '<span style="color:var(--clr-text-3);">Sin servicios para calcular.</span>';
    dBillingStatus.innerHTML  = '<div class="field-input" style="color:var(--clr-text-3);">Sin datos</div>';
    return;
  }

  const vencimientoDate = currentClient['Fecha Vencimiento'];
  let mostUrgent = null;

  currentClientServices.forEach(svc => {
    const b = calcBilling(svc.date, vencimientoDate);
    if (b) {
      if (!mostUrgent) mostUrgent = b;
      else if (daysUntil(b.nextBill) < daysUntil(mostUrgent.nextBill)) mostUrgent = b;
    }
  });

  if (!mostUrgent) {
    dBillingPreview.style.display = 'flex';
    dBillingPreviewText.innerHTML = '<span style="color:var(--clr-text-3);">Fechas inválidas.</span>';
    dBillingStatus.innerHTML  = '<div class="field-input" style="color:var(--clr-text-3);">Sin datos</div>';
    return;
  }

  const days = daysUntil(mostUrgent.nextBill);
  
  dBillingPreview.style.display = 'flex';
  dBillingPreviewText.innerHTML = `
    🎁 <strong>Prueba gratis hasta:</strong> ${fmt(mostUrgent.trialEnd)}<br>
    💳 <strong>Primera factura:</strong> ${fmt(mostUrgent.nextBill)}<br>
    🔄 <strong>Ciclo:</strong> Cada 30 días a partir del ${fmt(mostUrgent.nextBill)}
  `;

  if (mostUrgent.status === 'trial') {
    dBillingStatus.innerHTML = `
      <div class="field-input" style="margin-bottom:0.5rem; font-weight:600;">
        Prueba gratis hasta &nbsp; <span style="font-weight:400; color:var(--clr-text-2);">${fmt(mostUrgent.trialEnd)} (${days} días restantes)</span>
      </div>
      <div class="field-input" style="font-weight:600;">
        Próxima facturación &nbsp; <span style="font-weight:400; color:var(--clr-text-2);">${fmt(mostUrgent.nextBill)} (en ${days + 1} días)</span>
      </div>
    `;
  } else {
    const c = days <= 5 ? 'var(--clr-warning)' : 'var(--clr-text-1)';
    dBillingStatus.innerHTML = `
      <div class="field-input" style="margin-bottom:0.5rem; font-weight:600;">
        Prueba gratis &nbsp; <span style="font-weight:400; color:var(--clr-text-3);">Finalizada el ${fmt(mostUrgent.trialEnd)}</span>
      </div>
      <div class="field-input" style="font-weight:600;">
        Próxima facturación &nbsp; <span style="font-weight:400; color:${c};">${fmt(mostUrgent.nextBill)} ${days >= 0 ? `(en ${days} días)` : `(hace ${Math.abs(days)} días)`}</span>
      </div>
    `;
  }
}

// ─── GUARDAR DETALLES ───────────────────────
window.saveServiceFromDetail = async (sessionId) => {
  const btn = document.getElementById('detailSaveServiceText');
  if (btn) btn.textContent = 'Guardando...';

  try {
    const jsonStr = JSON.stringify(currentClientServices);
    const url = `${SHEETDB_URL}/Session ID/${encodeURIComponent(sessionId)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { 'Servicios Activados': jsonStr } })
    });
    const result = await res.json();
    if (result.updated) {
      closeClientDetail();
      loadClients();
    } else throw new Error('Fallo al actualizar');
  } catch (err) {
    console.error(err);
    alert('Error al guardar los cambios.');
  } finally {
    if (btn) btn.textContent = 'Guardar servicio';
  }
};

// ─── RENOVAR DESDE PANEL ────────────────────
window.renewFromDetail = async (sessionId, currentNextBillStr) => {
  if (!confirm('¿Confirmas que recibiste el pago y quieres renovar por 30 días más?')) return;

  const newVencimiento = new Date(currentNextBillStr);
  newVencimiento.setDate(newVencimiento.getDate() + 30);
  const todayStr = new Date().toISOString().split('T')[0];
  const newVencimientoStr = newVencimiento.toISOString().split('T')[0];

  try {
    const url = `${SHEETDB_URL}/Session ID/${encodeURIComponent(sessionId)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { 'Fecha Último Pago': todayStr, 'Fecha Vencimiento': newVencimientoStr } })
    });
    const result = await res.json();
    if (result.updated) {
      alert('¡Suscripción renovada exitosamente!');
      closeClientDetail();
      loadClients();
    } else throw new Error();
  } catch(e) {
    console.error(e);
    alert('Fallo al renovar suscripción.');
  }
};

// ─── REVELAR CONTRASEÑA EN PANEL ────────────
window.revealDetailPassword = () => {
  const keyword = prompt('Palabra clave:');
  if (keyword === 'Next') {
    dMetaPassDisplay.textContent = dMetaPassDisplay.dataset.pass;
    dMetaPassDisplay.dataset.revealed = '1';
  } else if (keyword !== null) {
    alert('Palabra clave incorrecta');
  }
};

// ─── LLENAR TAB PREGUNTAS ───────────────────
function fillPreguntasTab(client) {
  questionsContainer.innerHTML = '';
  QUESTIONS.forEach(q => {
    const val = client[q.id] || '';
    const card = document.createElement('div');
    card.className = 'qa-card';
    card.innerHTML = `
      <div class="qa-label">${q.label}</div>
      <textarea class="qa-textarea" data-qid="${q.id}" rows="3">${val}</textarea>
    `;
    questionsContainer.appendChild(card);
  });
}

// ─── GUARDAR PREGUNTAS ───────────────────────
window.savePreguntasFromDetail = async (sessionId) => {
  const btn = document.getElementById('detailSavePreguntasText');
  if (btn) btn.textContent = 'Guardando...';

  const data = {};
  document.querySelectorAll('.qa-textarea').forEach(ta => {
    data[ta.dataset.qid] = ta.value;
  });

  try {
    const url = `${SHEETDB_URL}/Session ID/${encodeURIComponent(sessionId)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    const result = await res.json();
    if (result.updated) {
      // Actualizar datos locales
      const idx = (window.clientsData || []).findIndex(c => c['Session ID'] === sessionId);
      if (idx !== -1) Object.assign(window.clientsData[idx], data);
      alert('¡Preguntas actualizadas exitosamente!');
    } else throw new Error();
  } catch (err) {
    console.error(err);
    alert('Error al guardar las preguntas.');
  } finally {
    if (btn) btn.textContent = 'Guardar preguntas';
  }
};

// ─── LLENAR TAB PROMPT ──────────────────────
function fillPromptTab(client) {
  dPromptTextarea.value = buildPromptStr(client);
}

function buildPromptStr(client) {
  return `Actúa como un experto creador de agentes de IA y diseña el prompt del sistema ("System Prompt") para este bot basándote en la siguiente información proporcionada por el cliente:

🏢 EMPRESA: ${client['Empresa'] || ''}
🤖 NOMBRE DEL BOT: ${client['Nombre del Bot'] || ''}
📱 CANALES: ${client['Canales'] || ''}
⏱️ RETRASO DE RESPUESTA: ${client['Retraso de Respuesta'] || ''}

🔗 ENLACES WEB DE REFERENCIA:
${client['Enlaces Web'] || ''}

❓ PREGUNTAS FRECUENTES (FAQs):
${client['FAQs'] || ''}

💬 CONTEXTO DE LA CONVERSACIÓN:
${client['Contexto de Conversación'] || ''}

🎭 ROL DEL AGENTE:
${client['Rol del Agente'] || ''}

🗣️ ESTILO, TONO E IDIOMA:
${client['Estilo, Tono e Idioma'] || ''}

🎯 OBJETIVO PRINCIPAL:
${client['Objetivo Principal'] || ''}

🗺️ GUION / FLUJO DE CONVERSACIÓN:
${client['Guion / Flujo'] || ''}

🛡️ OBJECIONES COMUNES:
${client['Objeciones Comunes'] || ''}

🛑 LÍMITES ESTRICTOS (REGLAS):
${client['Límites Estrictos'] || ''}

✅ EJEMPLO 1 (Evitar / Usar):
${client['Ejemplo 1'] || ''}

✅ EJEMPLO 2 (Evitar / Usar):
${client['Ejemplo 2'] || ''}

📦 RESUMEN DE LA OFERTA:
${client['Resumen de Oferta'] || ''}

👨‍💻 TRANSFERENCIA A HUMANOS:
${client['Transferencia a Humanos'] || ''}

🔄 SEGUIMIENTO AUTOMÁTICO:
${client['Seguimiento Automático'] || ''}

🔌 INTEGRACIONES:
${client['Integraciones'] || ''}

Por favor, con esta información genera el prompt maestro definitivo que deberá insertarse en la plataforma conversacional para que el agente opere exactamente bajo estas pautas. Asegúrate de estructurarlo de manera clara y profesional.`;
}

// ─── COPIAR PROMPT ───────────────────────────
window.copyDetailPrompt = async () => {
  try {
    await navigator.clipboard.writeText(dPromptTextarea.value);
    const btn = document.getElementById('detailCopyPromptText');
    if (btn) {
      btn.textContent = '✅ ¡Copiado!';
      setTimeout(() => { btn.textContent = '📋 Copiar prompt'; }, 2000);
    }
  } catch (err) {
    alert('Fallo al copiar el texto al portapapeles');
  }
};

// ─── ACTUALIZAR DATOS DEL CLIENTE ────────────
const updateModal          = document.getElementById('updateModal');
const updateClientLabel    = document.getElementById('updateClientLabel');
const updateSessionIdEl    = document.getElementById('updateSessionId');
const updateFullName       = document.getElementById('updateFullName');
const updateCompany        = document.getElementById('updateCompany');
const updateMetaUser       = document.getElementById('updateMetaUser');
const updateMetaPass       = document.getElementById('updateMetaPass');
const btnCancelUpdate      = document.getElementById('btnCancelUpdate');
const btnConfirmUpdate     = document.getElementById('btnConfirmUpdate');
const btnConfirmUpdateText = document.getElementById('btnConfirmUpdateText');

window.openUpdateModal = (sessionId) => {
  const client = (window.clientsData || []).find(c => c['Session ID'] === sessionId);
  if (!client) return;

  updateSessionIdEl.value       = sessionId;
  updateClientLabel.textContent = `${client['Nombre Completo'] || ''} — ${client['Empresa'] || ''}`;
  updateFullName.value          = client['Nombre Completo'] || '';
  updateCompany.value           = client['Empresa'] || '';
  updateMetaUser.value          = client['Usuario Meta'] || '';
  updateMetaPass.value          = client['Contraseña Meta'] || '';
  updateModal.classList.remove('hidden');
  setTimeout(() => updateFullName.focus(), 50);
};

btnCancelUpdate.addEventListener('click', () => {
  updateModal.classList.add('hidden');
});

btnConfirmUpdate.addEventListener('click', async () => {
  const sessionId = updateSessionIdEl.value;
  btnConfirmUpdateText.textContent = 'Guardando...';
  btnConfirmUpdate.disabled = true;

  try {
    const url = `${SHEETDB_URL}/Session ID/${encodeURIComponent(sessionId)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          'Nombre Completo': updateFullName.value.trim(),
          'Empresa': updateCompany.value.trim(),
          'Usuario Meta': updateMetaUser.value.trim(),
          'Contraseña Meta': updateMetaPass.value.trim(),
        }
      })
    });
    const result = await res.json();
    if (result.updated) {
      updateModal.classList.add('hidden');
      loadClients();
    } else {
      throw new Error('Fallo al actualizar');
    }
  } catch(err) {
    console.error(err);
    alert('Error al actualizar los datos del cliente.');
  } finally {
    btnConfirmUpdateText.textContent = 'Guardar cambios';
    btnConfirmUpdate.disabled = false;
  }
});

// ─── ELIMINAR CLIENTE ─────────────────────
const deleteModal        = document.getElementById('deleteModal');
const deleteClientLabel  = document.getElementById('deleteClientLabel');
const deleteConfirmInput = document.getElementById('deleteConfirmInput');
const deleteConfirmError = document.getElementById('deleteConfirmError');
const deleteSessionIdEl  = document.getElementById('deleteSessionId');
const btnCancelDelete    = document.getElementById('btnCancelDelete');
const btnConfirmDelete   = document.getElementById('btnConfirmDelete');
const btnConfirmDeleteText = document.getElementById('btnConfirmDeleteText');

window.openDeleteModal = (sessionId, clientLabel) => {
  deleteSessionIdEl.value     = sessionId;
  deleteClientLabel.textContent = clientLabel;
  deleteConfirmInput.value    = '';
  deleteConfirmError.style.display = 'none';
  deleteModal.classList.remove('hidden');
  setTimeout(() => deleteConfirmInput.focus(), 50);
};

btnCancelDelete.addEventListener('click', () => {
  deleteModal.classList.add('hidden');
});

// Limpiar error al escribir
deleteConfirmInput.addEventListener('input', () => {
  deleteConfirmError.style.display = 'none';
});

// Confirmar con Enter
deleteConfirmInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnConfirmDelete.click();
});

btnConfirmDelete.addEventListener('click', async () => {
  if (deleteConfirmInput.value.trim() !== 'Eliminar') {
    deleteConfirmError.style.display = 'block';
    deleteConfirmInput.focus();
    return;
  }

  const sessionId = deleteSessionIdEl.value;
  btnConfirmDeleteText.textContent = 'Eliminando...';
  btnConfirmDelete.disabled = true;

  try {
    const url = `${SHEETDB_URL}/Session ID/${encodeURIComponent(sessionId)}`;
    const res  = await fetch(url, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    });
    const result = await res.json();
    if (result.deleted > 0 || result.deleted === '1') {
      deleteModal.classList.add('hidden');
      // Eliminar de la cache local
      window.clientsData = (window.clientsData || []).filter(c => c['Session ID'] !== sessionId);
      loadClients();
    } else {
      throw new Error('No se pudo eliminar');
    }
  } catch(err) {
    console.error(err);
    alert('Error al eliminar el cliente. Verifica la consola.');
  } finally {
    btnConfirmDeleteText.textContent = 'Eliminar cliente';
    btnConfirmDelete.disabled = false;
  }
});

// ─── ABRIR GOOGLE SHEETS ──────────────────
window.openGoogleSheets = () => {
  const keyword = prompt('Palabra clave:');
  if (keyword === 'Next') {
    window.open('https://docs.google.com/spreadsheets/d/1D5HS9_5bC6auDkexUCJisBT2XZRrffEaO7xiTAEGMAo/edit?gid=0#gid=0', '_blank');
  } else if (keyword !== null) {
    alert('Palabra clave incorrecta');
  }
};

// ─── EDITOR GLOBAL DE PREGUNTAS ─────────────────────────────

const questionsEditorOverlay = document.getElementById('questionsEditorOverlay');
const questionsEditorList    = document.getElementById('questionsEditorList');

window.openQuestionsEditor = async () => {
  questionsEditorOverlay.style.display = 'flex';
  questionsEditorList.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--clr-text-2);">Cargando preguntas...</div>`;

  // Cargar config actual (si existe en Sheets)
  let savedQuestions = null;
  try {
    const res  = await fetch(`${SHEETDB_URL}/search?Session ID=__QUESTIONS_CONFIG__`);
    const data = await res.json();
    if (data && data.length && data[0]['__questions_json__']) {
      savedQuestions = JSON.parse(data[0]['__questions_json__']);
    }
  } catch(e) { /* usa defaults */ }

  const source = savedQuestions || QUESTIONS;
  questionsEditorList.innerHTML = '';

  source.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'qa-card';
    card.innerHTML = `
      <div class="qa-label" style="margin-bottom:0.5rem;">Pregunta ${i + 1} · <span style="font-weight:500;text-transform:none;color:var(--clr-text-3);font-size:0.7rem;">${q.id}</span></div>
      <label style="font-size:0.75rem;color:var(--clr-text-2);font-weight:600;display:block;margin-bottom:3px;">Texto de la pregunta</label>
      <textarea class="qa-textarea editor-q-text" data-qid="${q.id}" rows="3" style="margin-bottom:0.5rem;">${q.q}</textarea>
      <label style="font-size:0.75rem;color:var(--clr-text-2);font-weight:600;display:block;margin-bottom:3px;">Placeholder (ejemplo)</label>
      <textarea class="qa-textarea editor-q-placeholder" data-qid="${q.id}" rows="2">${q.placeholder || ''}</textarea>
    `;
    questionsEditorList.appendChild(card);
  });
};

window.closeQuestionsEditor = () => {
  questionsEditorOverlay.style.display = 'none';
};

window.saveQuestionsTemplate = async () => {
  const btn = document.getElementById('btnSaveQuestionsText');
  if (btn) btn.textContent = 'Guardando...';

  // Recopilar valores editados
  const updatedQuestions = QUESTIONS.map(q => {
    const textEl        = questionsEditorList.querySelector(`.editor-q-text[data-qid="${q.id}"]`);
    const placeholderEl = questionsEditorList.querySelector(`.editor-q-placeholder[data-qid="${q.id}"]`);
    return {
      id:          q.id,
      q:           textEl        ? textEl.value        : q.q,
      placeholder: placeholderEl ? placeholderEl.value : q.placeholder,
    };
  });

  const jsonStr = JSON.stringify(updatedQuestions);

  try {
    // Comprobar si ya existe la fila de config
    const searchRes  = await fetch(`${SHEETDB_URL}/search?Session ID=__QUESTIONS_CONFIG__`);
    const searchData = await searchRes.json();
    const exists     = searchData && searchData.length > 0;

    if (exists) {
      // Actualizar
      await fetch(`${SHEETDB_URL}/Session ID/__QUESTIONS_CONFIG__`, {
        method: 'PATCH',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { '__questions_json__': jsonStr } })
      });
    } else {
      // Crear nueva fila
      await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [{ 'Session ID': '__QUESTIONS_CONFIG__', '__questions_json__': jsonStr }] })
      });
    }

    closeQuestionsEditor();
    alert('✅ Preguntas actualizadas. Los nuevos clientes verán los cambios al abrir el formulario.');
  } catch(err) {
    console.error(err);
    alert('Error al guardar la plantilla de preguntas.');
  } finally {
    if (btn) btn.textContent = 'Guardar cambios';
  }
};

// ─── STUBS LEGACY (para no romper referencias) ─
const editModal = { classList: { remove: () => {}, add: () => {} } };
const promptModal = document.getElementById('promptModal');
const btnCancelPrompt = document.getElementById('btnCancelPrompt');
const btnCopyPrompt   = document.getElementById('btnCopyPrompt');
const btnCopyPromptText = document.getElementById('btnCopyPromptText');
const promptTextarea  = document.getElementById('promptTextarea');
const promptClientName = document.getElementById('promptClientName');
if (btnCancelPrompt) btnCancelPrompt.addEventListener('click', () => promptModal.classList.add('hidden'));
if (btnCopyPrompt) btnCopyPrompt.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(promptTextarea.value);
    btnCopyPromptText.textContent = '¡Copiado!';
    setTimeout(() => { btnCopyPromptText.textContent = 'Copiar al portapapeles'; }, 2000);
  } catch(e) {}
});

window.openPromptModal = (sid) => { openClientDetail(sid); switchTab('prompt'); };
window.openEditModal   = (sid) => { openClientDetail(sid); switchTab('servicios'); };
window.renewSubscription = (sid, str) => renewFromDetail(sid, str);
window.revealPassword    = (btn, pw) => {
  const keyword = prompt('Palabra clave:');
  if (keyword === 'Next') {
    btn.outerHTML = `<div style="font-family:monospace;background:var(--clr-bg-2);padding:4px 8px;border-radius:4px;font-size:0.75rem;">${pw}</div>`;
  } else if (keyword !== null) {
    alert('Palabra clave incorrecta');
  }
};
