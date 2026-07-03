// =============================================
// CLAVES APP - Servidor Express (Node.js)
// Configurado para despliegue en Render.com
// Usa transcripción en el cliente (Web Speech API)
// =============================================
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────
// 📊 URL de SheetDB (Google Sheets)
// ─────────────────────────────────────────────
const SHEETDB_URL = 'https://sheetdb.io/api/v1/tpz4wdwvpet8d';

const app  = express();
// Render asigna el puerto dinámicamente a través de process.env.PORT
const PORT = process.env.PORT || 3000;

// ─── Middlewares ─────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// ─── Almacenamiento JSON local ────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const dataFile = path.join(__dirname, '../uploads/data.json');
const loadData = () => {
  try { return JSON.parse(fs.readFileSync(dataFile, 'utf8')); }
  catch { return []; }
};
const saveData = (data) => fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

// ════════════════════════════════════════════
// 🏓 ENDPOINT PING — Para UptimeRobot
// ════════════════════════════════════════════
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

// ════════════════════════════════════════════
// ENDPOINT 1: Iniciar sesión
// POST /api/session/start
// ════════════════════════════════════════════
app.post('/api/session/start', (req, res) => {
  try {
    const { fullName, companyName, metaUser, metaPassword } = req.body;

    if (!fullName || !companyName || !metaUser || !metaPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    const sessionId = uuidv4();
    const session = {
      sessionId,
      fullName,
      companyName,
      metaUser,
      metaPasswordPreview: metaPassword.substring(0, 3) + '***',
      createdAt: new Date().toISOString(),
      transcriptions: [],
    };

    const data = loadData();
    data.push(session);
    saveData(data);

    console.log(`✅ Nueva sesión: ${sessionId} — ${fullName} (${companyName})`);
    res.json({ success: true, sessionId });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ════════════════════════════════════════════
// ENDPOINT 2: Recibir transcripción (Texto)
// POST /api/session/answer
// ════════════════════════════════════════════
app.post('/api/session/answer', (req, res) => {
  try {
    const { sessionId, questionIndex, transcription } = req.body;

    if (!sessionId || transcription === undefined) {
      return res.status(400).json({ error: 'Faltan datos de la sesión o transcripción.' });
    }

    console.log(`📝 Respuesta recibida — Sesión: ${sessionId} | Pregunta: ${parseInt(questionIndex) + 1}`);

    // Guardar transcripción en la sesión
    const data = loadData();
    const idx  = data.findIndex(s => s.sessionId === sessionId);
    if (idx !== -1) {
      data[idx].transcriptions[parseInt(questionIndex)] = {
        questionIndex: parseInt(questionIndex),
        transcription: transcription || '[Respuesta vacía o inaudible]',
        savedAt: new Date().toISOString(),
      };
      saveData(data);
    }

    res.json({ success: true, transcription });
  } catch (err) {
    console.error('Error al guardar respuesta:', err);
    res.status(500).json({ error: 'Error al procesar la respuesta: ' + err.message });
  }
});

// ════════════════════════════════════════════
// ENDPOINT 3: Finalizar sesión → Google Sheets
// POST /api/session/complete
// ════════════════════════════════════════════
app.post('/api/session/complete', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const data    = loadData();
    const session = data.find(s => s.sessionId === sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada.' });
    }

    session.completedAt = new Date().toISOString();
    session.status      = 'completed';
    saveData(data);

    console.log(`🎉 Sesión completada: ${sessionId}`);

    // ─────────────────────────────────────────
    // 📊 ENVIAR A GOOGLE SHEETS VÍA SHEETDB
    // ─────────────────────────────────────────
    try {
      // Construir la fila con todos los datos
      const sheetData = {
        'Session ID':     session.sessionId,
        'Nombre Completo': session.fullName,
        'Empresa':         session.companyName,
        'Usuario Meta':    session.metaUser,
        'Fecha':           session.completedAt,
      };

      // Agregar cada transcripción como columna separada
      for (let i = 0; i < 10; i++) {
        const t = session.transcriptions[i];
        sheetData[`Pregunta ${i + 1}`] = t ? t.transcription : '';
      }

      console.log('📤 Enviando datos a Google Sheets (SheetDB)...');

      const sheetRes = await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: {
          'Accept':       'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [sheetData] }),
      });

      const sheetResult = await sheetRes.json();
      console.log('✅ Google Sheets actualizado:', sheetResult);
    } catch (sheetErr) {
      console.error('⚠️  Error al enviar a Google Sheets:', sheetErr.message);
    }

    res.json({ success: true, session });
  } catch (err) {
    console.error('Error al completar sesión:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ════════════════════════════════════════════
// ENDPOINT 4: Listar sesiones (Admin)
// GET /api/sessions
// ════════════════════════════════════════════
app.get('/api/sessions', (req, res) => {
  const data = loadData();
  res.json(data);
});

// ─── Catch-all → servir el frontend ──────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── Iniciar servidor ─────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔═════════════════════════════════════════╗');
  console.log('║   🔑 CLAVES APP — Servidor activo        ║');
  console.log(`║   ➜  http://localhost:${PORT}               ║`);
  console.log('╚═════════════════════════════════════════╝');
  console.log('✅ Modo 100% Gratuito (Web Speech API) activo');
  console.log('🏓 Endpoint de ping disponible en /ping\n');
});
