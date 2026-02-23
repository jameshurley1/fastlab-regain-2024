import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, createReadStream, statSync } from 'node:fs';
import { randomUUID, createHmac } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

// Simple JWT implementation for local dev (no jsonwebtoken dependency needed)
const JWT_SECRET = 'local-dev-secret';
function createJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'db.json');
const FILES_DIR = join(__dirname, 'files');
const VIDEOS_DIR = join(__dirname, 'videos');
const PORT = 3001;

const MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

// --- JSON File Database ---

function loadDb() {
  if (!existsSync(DB_PATH)) {
    const initial = {
      users: [],
      groups: [],
      exercises: [],
      groupExercises: [],
      userGroups: [],
      stats: [],
      messages: [],
      sessions: [],
    };
    writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

function saveDb(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// --- Request Helpers ---

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Credentials': 'true',
  });
  res.end(JSON.stringify(data));
}

function cors(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Credentials': 'true',
  });
  res.end();
}

// --- Route Matching ---

function match(pattern, pathname) {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  if (patternParts.length !== pathParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith('{') && patternParts[i].endsWith('}')) {
      params[patternParts[i].slice(1, -1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

// --- Route Handler ---

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') return cors(res);

  const db = loadDb();
  let params;

  // --- Health Check ---
  if (method === 'GET' && pathname === '/') {
    return json(res, `Hello world. The time is ${new Date().toISOString()}`);
  }

  // --- Presigned URL (returns a placeholder local URL) ---
  if (method === 'GET' && (params = match('/presignedurl/{uploadId}', pathname))) {
    return json(res, { url: `http://localhost:${PORT}/files/${params.uploadId}` });
  }

  // --- Static File Serving (videos and images) ---
  if (method === 'GET' && pathname.startsWith('/files/')) {
    const fileName = decodeURIComponent(pathname.slice('/files/'.length));
    let filePath = join(FILES_DIR, fileName);
    // Fall back to videos symlink directory (e.g. OneDrive) for .mp4 files
    if (!existsSync(filePath) && existsSync(join(VIDEOS_DIR, fileName))) {
      filePath = join(VIDEOS_DIR, fileName);
    }
    // Check in 720p subfolder
    if (!existsSync(filePath) && existsSync(join(VIDEOS_DIR, 'fastlab-regain-videoassets 720p', fileName))) {
      filePath = join(VIDEOS_DIR, 'fastlab-regain-videoassets 720p', fileName);
    }
    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Access-Control-Allow-Origin': 'http://localhost:3000' });
      res.end('File not found');
      return;
    }
    const ext = extname(fileName).toLowerCase();
    let contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stat = statSync(filePath);

    // In local dev, placeholder images are SVGs with .jpg extension
    if (['.jpg', '.jpeg', '.png'].includes(ext) && stat.size < 10000) {
      try {
        const peek = readFileSync(filePath, 'utf-8').slice(0, 5);
        if (peek === '<svg ') contentType = 'image/svg+xml';
      } catch {}
    }

    // Support range requests for video seeking
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': 'http://localhost:3000',
      });
      createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': 'http://localhost:3000',
      });
      createReadStream(filePath).pipe(res);
    }
    return;
  }

  // =====================
  // EXERCISE ENDPOINTS
  // =====================
  if (method === 'GET' && pathname === '/exercise/list') {
    return json(res, db.exercises);
  }
  if (method === 'GET' && (params = match('/exercise/get/{id}', pathname))) {
    const item = db.exercises.find((e) => e.id === params.id);
    return item ? json(res, item) : json(res, 'Error: Exercise not found');
  }
  if (method === 'POST' && pathname === '/exercise/create') {
    const body = await parseBody(req);
    if (!body.id) body.id = randomUUID();
    db.exercises.push(body);
    saveDb(db);
    return json(res, body);
  }
  if (method === 'PUT' && pathname === '/exercise/update') {
    const body = await parseBody(req);
    const idx = db.exercises.findIndex((e) => e.id === body.id);
    if (idx === -1) return json(res, 'Error: Exercise not found', 500);
    db.exercises[idx] = { ...db.exercises[idx], ...body, updatedAt: new Date().toISOString() };
    saveDb(db);
    return json(res, db.exercises[idx]);
  }
  if (method === 'DELETE' && pathname === '/exercise/delete') {
    const body = await parseBody(req);
    db.exercises = db.exercises.filter((e) => e.id !== body.id);
    saveDb(db);
    return json(res, { message: 'Exercise deleted' });
  }

  // =====================
  // GROUP ENDPOINTS
  // =====================
  if (method === 'GET' && pathname === '/group/list') {
    return json(res, db.groups);
  }
  if (method === 'GET' && (params = match('/group/get/{id}', pathname))) {
    const item = db.groups.find((g) => g.id === params.id);
    return item ? json(res, item) : json(res, 'Error: Group not found');
  }
  if (method === 'POST' && pathname === '/group/create') {
    const body = await parseBody(req);
    if (!body.id) body.id = randomUUID();
    db.groups.push(body);
    saveDb(db);
    return json(res, body);
  }
  if (method === 'PUT' && pathname === '/group/update') {
    const body = await parseBody(req);
    const idx = db.groups.findIndex((g) => g.id === body.id);
    if (idx === -1) return json(res, 'Error: Group not found', 500);
    db.groups[idx] = { ...db.groups[idx], ...body, updatedAt: new Date().toISOString() };
    saveDb(db);
    return json(res, db.groups[idx]);
  }
  if (method === 'DELETE' && pathname === '/group/delete') {
    const body = await parseBody(req);
    db.groups = db.groups.filter((g) => g.id !== body.id);
    saveDb(db);
    return json(res, { message: 'Group deleted' });
  }

  // =====================
  // GROUP EXERCISE ENDPOINTS
  // =====================
  if (method === 'GET' && pathname === '/groupExercise/list') {
    return json(res, db.groupExercises);
  }
  if (method === 'GET' && (params = match('/groupExercise/get/{id}', pathname))) {
    const item = db.groupExercises.find((ge) => ge.id === params.id);
    return item ? json(res, item) : json(res, 'Error: GroupExercise not found');
  }
  if (method === 'POST' && pathname === '/groupExercise/create') {
    const body = await parseBody(req);
    if (!body.id) body.id = randomUUID();
    db.groupExercises.push(body);
    saveDb(db);
    return json(res, body);
  }
  if (method === 'PUT' && pathname === '/groupExercise/update') {
    const body = await parseBody(req);
    const idx = db.groupExercises.findIndex((ge) => ge.id === body.id);
    if (idx === -1) return json(res, 'Error: GroupExercise not found', 500);
    db.groupExercises[idx] = { ...db.groupExercises[idx], ...body, updatedAt: new Date().toISOString() };
    saveDb(db);
    return json(res, db.groupExercises[idx]);
  }
  if (method === 'DELETE' && pathname === '/groupExercise/delete') {
    const body = await parseBody(req);
    db.groupExercises = db.groupExercises.filter((ge) => ge.id !== body.id);
    saveDb(db);
    return json(res, { message: 'GroupExercise deleted' });
  }

  // =====================
  // STAT ENDPOINTS
  // =====================
  if (method === 'GET' && pathname === '/stat/list') {
    return json(res, db.stats);
  }
  if (method === 'GET' && (params = match('/stat/get/{id}', pathname))) {
    const item = db.stats.find((s) => s.id === params.id);
    return item ? json(res, item) : json(res, 'Error: Stat not found');
  }
  if (method === 'POST' && pathname === '/stat/create') {
    const body = await parseBody(req);
    if (!body.id) body.id = randomUUID();
    db.stats.push(body);
    saveDb(db);
    return json(res, body);
  }
  if (method === 'PUT' && pathname === '/stat/update') {
    const body = await parseBody(req);
    const idx = db.stats.findIndex((s) => s.id === body.id);
    if (idx === -1) return json(res, 'Error: Stat not found', 500);
    db.stats[idx] = { ...db.stats[idx], ...body, updatedAt: new Date().toISOString() };
    saveDb(db);
    return json(res, db.stats[idx]);
  }
  if (method === 'DELETE' && pathname === '/stat/delete') {
    const body = await parseBody(req);
    db.stats = db.stats.filter((s) => s.id !== body.id);
    saveDb(db);
    return json(res, { message: 'Stat deleted' });
  }

  // =====================
  // USER ENDPOINTS
  // =====================
  if (method === 'GET' && pathname === '/user/list') {
    return json(res, db.users);
  }
  if (method === 'GET' && (params = match('/user/getUserByEmail/{id}', pathname))) {
    const item = db.users.find((u) => u.email === params.id);
    return item ? json(res, item) : json(res, "Error: User doesn't exist");
  }
  if (method === 'POST' && pathname === '/user/create') {
    const body = await parseBody(req);
    if (!body.id) body.id = randomUUID();
    db.users.push(body);
    saveDb(db);
    return json(res, body);
  }
  if (method === 'PUT' && pathname === '/user/update') {
    const body = await parseBody(req);
    const idx = db.users.findIndex((u) => u.email === body.email);
    if (idx === -1) return json(res, "Error: User doesn't exist", 500);
    db.users[idx] = { ...db.users[idx], ...body, updatedAt: new Date().toISOString() };
    saveDb(db);
    return json(res, db.users[idx]);
  }
  if (method === 'DELETE' && pathname === '/user/delete') {
    const body = await parseBody(req);
    db.users = db.users.filter((u) => u.email !== body.email);
    saveDb(db);
    return json(res, { message: 'User deleted' });
  }
  if (method === 'PUT' && pathname === '/user/updateExerciseTargets') {
    const body = await parseBody(req);
    const idx = db.users.findIndex((u) => u.email === body.email);
    if (idx === -1) return json(res, "Error: User doesn't exist", 500);
    db.users[idx].exercises = body.exercises;
    db.users[idx].updatedAt = new Date().toISOString();
    saveDb(db);
    return json(res, db.users[idx]);
  }

  // =====================
  // USER GROUP ENDPOINTS
  // =====================
  if (method === 'GET' && pathname === '/userGroup/list') {
    return json(res, db.userGroups);
  }
  if (method === 'GET' && (params = match('/userGroup/get/{id}', pathname))) {
    const item = db.userGroups.find((ug) => ug.id === params.id);
    return item ? json(res, item) : json(res, 'Error: UserGroup not found');
  }
  if (method === 'POST' && pathname === '/userGroup/create') {
    const body = await parseBody(req);
    if (!body.id) body.id = randomUUID();
    db.userGroups.push(body);
    saveDb(db);
    return json(res, body);
  }
  if (method === 'PUT' && pathname === '/userGroup/update') {
    const body = await parseBody(req);
    const idx = db.users.findIndex((u) => u.email === body.email);
    if (idx === -1) return json(res, "Error: User not found", 500);
    if (body.groups) db.users[idx].groups = body.groups;
    if (body.onboard !== undefined) db.users[idx].onboard = body.onboard;
    db.users[idx].updatedAt = new Date().toISOString();
    saveDb(db);
    return json(res, db.users[idx]);
  }
  if (method === 'DELETE' && pathname === '/userGroup/delete') {
    const body = await parseBody(req);
    db.userGroups = db.userGroups.filter((ug) => ug.id !== body.id);
    saveDb(db);
    return json(res, { message: 'UserGroup deleted' });
  }

  // =====================
  // SESSION ENDPOINTS
  // =====================
  if (method === 'GET' && pathname === '/session/list') {
    return json(res, db.sessions);
  }
  if (method === 'GET' && (params = match('/session/listByUser/{userId}', pathname))) {
    return json(res, db.sessions.filter((s) => s.userId === params.userId));
  }
  if (method === 'GET' && (params = match('/session/get/{id}', pathname))) {
    const item = db.sessions.find((s) => s.id === params.id);
    return item ? json(res, item) : json(res, 'Error: Session not found');
  }
  if (method === 'POST' && pathname === '/session/create') {
    const body = await parseBody(req);
    if (!body.id) body.id = randomUUID();
    db.sessions.push(body);
    saveDb(db);
    return json(res, body);
  }
  if (method === 'PUT' && pathname === '/session/update') {
    const body = await parseBody(req);
    const idx = db.sessions.findIndex((s) => s.id === body.id);
    if (idx === -1) return json(res, 'Error: Session not found', 500);
    db.sessions[idx] = { ...db.sessions[idx], ...body, updatedAt: new Date().toISOString() };
    saveDb(db);
    return json(res, db.sessions[idx]);
  }
  if (method === 'DELETE' && pathname === '/session/delete') {
    const body = await parseBody(req);
    db.sessions = db.sessions.filter((s) => s.id !== body.id);
    saveDb(db);
    return json(res, { message: 'Session deleted' });
  }

  // =====================
  // AUTH - Magic Link (simplified for local dev)
  // =====================
  if (method === 'POST' && pathname.startsWith('/auth/magicLink/authorize')) {
    const email = url.searchParams.get('email');
    // Look up the actual user to get their real ID
    const user = db.users.find((u) => u.email === email);
    const userId = user ? user.id : randomUUID();
    // Generate a proper JWT that jwt.decode() can parse
    const token = createJwt({ userId, email, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 180 });
    const callbackUrl = `http://localhost:3000/auth/callback?token=${token}`;
    console.log(`\n  Magic link for ${email}:\n  ${callbackUrl}\n`);
    return json(res, { message: 'Magic link logged to console', callbackUrl });
  }

  // =====================
  // MESSAGE ENDPOINTS
  // =====================
  if (method === 'GET' && pathname === '/message/list') {
    return json(res, db.messages);
  }
  if (method === 'GET' && (params = match('/message/get/{id}', pathname))) {
    const item = db.messages.find((m) => m.id === params.id);
    return item ? json(res, item) : json(res, 'Error: Message not found');
  }
  if (method === 'POST' && pathname === '/message/create') {
    const body = await parseBody(req);
    if (!body.id) body.id = randomUUID();
    db.messages.push(body);
    saveDb(db);
    return json(res, body);
  }
  if (method === 'PUT' && pathname === '/message/update') {
    const body = await parseBody(req);
    const idx = db.messages.findIndex((m) => m.id === body.id);
    if (idx === -1) return json(res, 'Error: Message not found', 500);
    db.messages[idx] = { ...db.messages[idx], ...body, updatedAt: new Date().toISOString() };
    saveDb(db);
    return json(res, db.messages[idx]);
  }
  if (method === 'DELETE' && pathname === '/message/delete') {
    const body = await parseBody(req);
    db.messages = db.messages.filter((m) => m.id !== body.id);
    saveDb(db);
    return json(res, { message: 'Message deleted' });
  }

  // --- 404 ---
  json(res, { error: 'Not found', path: pathname }, 404);
}

// --- Start Server ---

const server = createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`Local API server running at http://localhost:${PORT}`);
  console.log(`Database file: ${DB_PATH}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    /exercise/list`);
  console.log(`  GET    /exercise/get/:id`);
  console.log(`  POST   /exercise/create`);
  console.log(`  PUT    /exercise/update`);
  console.log(`  DELETE /exercise/delete`);
  console.log(`  GET    /group/list`);
  console.log(`  GET    /group/get/:id`);
  console.log(`  ...and all other CRUD endpoints`);
  console.log(`  POST   /auth/magicLink/authorize?email=...`);
  console.log(`\nMagic links will be printed to this console.\n`);
});
