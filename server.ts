import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: "25mb" }));

const PORT = Number(process.env.PORT) || 3000;

// Setup persistent data directories for Server-side Storage, Backups, and Audit Logs
const DATA_DIR = path.resolve(__dirname, "data");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");
const PERSONNEL_FILE = path.join(DATA_DIR, "personnel.json");
const AUDIT_LOGS_FILE = path.join(DATA_DIR, "audit-logs.json");
const BROADCASTS_FILE = path.join(DATA_DIR, "broadcasts.json");
const SQUAD_TASKS_FILE = path.join(DATA_DIR, "squad-tasks.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const CHAT_FILE = path.join(DATA_DIR, "chat-messages.json");
const SUPABASE_CONFIG_FILE = path.join(DATA_DIR, "supabase-config.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

function writeAuditLog(action: string, user: string, details: string) {
  try {
    const entry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      user,
      details
    };
    let logs = [];
    if (fs.existsSync(AUDIT_LOGS_FILE)) {
      try {
        logs = JSON.parse(fs.readFileSync(AUDIT_LOGS_FILE, "utf-8"));
      } catch (e) {
        logs = [];
      }
    }
    logs.unshift(entry);
    if (logs.length > 500) logs = logs.slice(0, 500);
    fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

// ---------------------------------------------------------------------------
// 1. Server-side Personnel API Endpoints
// ---------------------------------------------------------------------------
app.get("/api/personnel", (_req, res) => {
  try {
    if (fs.existsSync(PERSONNEL_FILE)) {
      const data = fs.readFileSync(PERSONNEL_FILE, "utf-8");
      return res.json({ personnel: JSON.parse(data), source: "server_db" });
    }
    return res.json({ personnel: null, source: "none" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to read database: " + err.message });
  }
});

app.post("/api/personnel", (req, res) => {
  try {
    const { personnel, user = "Super Admin", reason = "Updated Personnel Records" } = req.body;
    if (!Array.isArray(personnel)) {
      return res.status(400).json({ error: "Invalid personnel list." });
    }
    fs.writeFileSync(PERSONNEL_FILE, JSON.stringify(personnel, null, 2));
    writeAuditLog("DATABASE_SAVE", user, `${reason}: ${personnel.length} records saved to server.`);
    res.json({ success: true, count: personnel.length });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to persist database: " + err.message });
  }
});

// ---------------------------------------------------------------------------
// 2. Real-time Broadcasts API
// ---------------------------------------------------------------------------
app.get("/api/broadcasts", (_req, res) => {
  try {
    if (fs.existsSync(BROADCASTS_FILE)) {
      const broadcasts = JSON.parse(fs.readFileSync(BROADCASTS_FILE, "utf-8"));
      return res.json({ broadcasts });
    }
    return res.json({ broadcasts: [] });
  } catch (e: any) {
    res.json({ broadcasts: [] });
  }
});

app.post("/api/broadcasts", (req, res) => {
  try {
    const broadcast = req.body;
    if (!broadcast || !broadcast.id) {
      return res.status(400).json({ error: "Invalid broadcast payload." });
    }
    let broadcasts: any[] = [];
    if (fs.existsSync(BROADCASTS_FILE)) {
      try {
        broadcasts = JSON.parse(fs.readFileSync(BROADCASTS_FILE, "utf-8"));
      } catch (e) {
        broadcasts = [];
      }
    }
    // Prepend new broadcast
    broadcasts = [broadcast, ...broadcasts.filter((b) => b.id !== broadcast.id)].slice(0, 50);
    fs.writeFileSync(BROADCASTS_FILE, JSON.stringify(broadcasts, null, 2));
    writeAuditLog("REALTIME_BROADCAST", broadcast.author || "Super Admin", `Dispatched broadcast: "${broadcast.title}"`);
    res.json({ success: true, count: broadcasts.length });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save broadcast: " + err.message });
  }
});

app.delete("/api/broadcasts/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (fs.existsSync(BROADCASTS_FILE)) {
      let broadcasts = JSON.parse(fs.readFileSync(BROADCASTS_FILE, "utf-8"));
      broadcasts = broadcasts.filter((b: any) => b.id !== id);
      fs.writeFileSync(BROADCASTS_FILE, JSON.stringify(broadcasts, null, 2));
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 3. Squad Tasks API (Daily, Weekly, Monthly)
// ---------------------------------------------------------------------------
app.get("/api/squad-tasks", (_req, res) => {
  try {
    if (fs.existsSync(SQUAD_TASKS_FILE)) {
      const tasks = JSON.parse(fs.readFileSync(SQUAD_TASKS_FILE, "utf-8"));
      return res.json({ tasks });
    }
    return res.json({ tasks: [] });
  } catch (e) {
    res.json({ tasks: [] });
  }
});

app.post("/api/squad-tasks", (req, res) => {
  try {
    const task = req.body;
    if (!task || !task.id) {
      return res.status(400).json({ error: "Invalid task." });
    }
    let tasks: any[] = [];
    if (fs.existsSync(SQUAD_TASKS_FILE)) {
      try {
        tasks = JSON.parse(fs.readFileSync(SQUAD_TASKS_FILE, "utf-8"));
      } catch (e) {
        tasks = [];
      }
    }
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      tasks[idx] = task;
    } else {
      tasks.unshift(task);
    }
    fs.writeFileSync(SQUAD_TASKS_FILE, JSON.stringify(tasks, null, 2));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/squad-tasks/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (fs.existsSync(SQUAD_TASKS_FILE)) {
      let tasks = JSON.parse(fs.readFileSync(SQUAD_TASKS_FILE, "utf-8"));
      tasks = tasks.filter((t: any) => t.id !== id);
      fs.writeFileSync(SQUAD_TASKS_FILE, JSON.stringify(tasks, null, 2));
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Realtime Chat API
// ---------------------------------------------------------------------------
app.get("/api/chat", (_req, res) => {
  try {
    if (fs.existsSync(CHAT_FILE)) {
      const messages = JSON.parse(fs.readFileSync(CHAT_FILE, "utf-8"));
      return res.json({ messages });
    }
    return res.json({ messages: [] });
  } catch (e) {
    res.json({ messages: [] });
  }
});

app.post("/api/chat", (req, res) => {
  try {
    const msg = req.body;
    if (!msg || !msg.id || !msg.message) {
      return res.status(400).json({ error: "Invalid message payload." });
    }
    let messages: any[] = [];
    if (fs.existsSync(CHAT_FILE)) {
      try {
        messages = JSON.parse(fs.readFileSync(CHAT_FILE, "utf-8"));
      } catch (e) {
        messages = [];
      }
    }
    messages.push(msg);
    if (messages.length > 200) messages = messages.slice(-200);
    fs.writeFileSync(CHAT_FILE, JSON.stringify(messages, null, 2));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 4. App Users & Role Management API (Super Admin can change roles)
// ---------------------------------------------------------------------------
const DEFAULT_USERS = [
  {
    id: "user-super-admin-01",
    name: "Super Admin (Crime Branch HQ)",
    badgeNo: "ADMIN-01",
    mobile: "9274583654",
    role: "super_admin",
    lastActive: new Date().toISOString(),
    loginTime: new Date().toISOString(),
    device: "Crime Branch HQ Terminal"
  },
  {
    id: "user-admin-02",
    name: "Inspector V.K. Parmar",
    badgeNo: "PI-402",
    mobile: "9825000101",
    role: "admin",
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    loginTime: new Date(Date.now() - 7200000).toISOString(),
    device: "Squad Command Room"
  },
  {
    id: "user-squad-03",
    name: "Sub-Inspector H.D. Patel",
    badgeNo: "PSI-804",
    mobile: "9426000202",
    role: "squad",
    lastActive: new Date(Date.now() - 1800000).toISOString(),
    loginTime: new Date(Date.now() - 3600000).toISOString(),
    device: "Mobile Patrol Unit 01"
  },
  {
    id: "user-officer-04",
    name: "Rameshchandra S. Solanki",
    badgeNo: "770",
    mobile: "9824000303",
    role: "officer",
    lastActive: new Date(Date.now() - 5400000).toISOString(),
    loginTime: new Date(Date.now() - 10800000).toISOString(),
    device: "Station Terminal"
  },
  {
    id: "user-viewer-05",
    name: "Control Room Monitor",
    badgeNo: "VIEW-01",
    mobile: "9876543210",
    role: "viewer",
    lastActive: new Date(Date.now() - 900000).toISOString(),
    loginTime: new Date(Date.now() - 1800000).toISOString(),
    device: "HQ Wall Monitor"
  }
];

app.get("/api/users", (_req, res) => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      return res.json({ users });
    }
    // seed default users
    fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2));
    return res.json({ users: DEFAULT_USERS });
  } catch (e) {
    res.json({ users: DEFAULT_USERS });
  }
});

app.post("/api/users", (req, res) => {
  try {
    const user = req.body;
    let users = DEFAULT_USERS;
    if (fs.existsSync(USERS_FILE)) {
      try {
        users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      } catch (e) {
        users = DEFAULT_USERS;
      }
    }
    const idx = users.findIndex((u: any) => u.id === user.id || u.badgeNo === user.badgeNo);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user, lastActive: new Date().toISOString() };
    } else {
      users.unshift({ ...user, lastActive: new Date().toISOString() });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/users/role", (req, res) => {
  try {
    const { userId, role } = req.body;
    let users = DEFAULT_USERS;
    if (fs.existsSync(USERS_FILE)) {
      try {
        users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      } catch (e) {
        users = DEFAULT_USERS;
      }
    }
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx >= 0) {
      users[idx].role = role;
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      writeAuditLog("USER_ROLE_CHANGED", "Super Admin", `Changed role of user ${users[idx].name} to ${role}`);
      return res.json({ success: true, user: users[idx] });
    }
    res.status(404).json({ error: "User not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 5. Audit Logs API & Backups API
// ---------------------------------------------------------------------------
app.get("/api/audit-logs", (_req, res) => {
  try {
    if (fs.existsSync(AUDIT_LOGS_FILE)) {
      const logs = JSON.parse(fs.readFileSync(AUDIT_LOGS_FILE, "utf-8"));
      return res.json({ logs });
    }
    res.json({ logs: [] });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to read audit logs." });
  }
});

app.post("/api/backups", (req, res) => {
  try {
    const { user = "Admin", note = "Manual Backup" } = req.body;
    if (!fs.existsSync(PERSONNEL_FILE)) {
      return res.status(400).json({ error: "No personnel data to backup." });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `backup-${timestamp}.json`;
    const backupPath = path.join(BACKUPS_DIR, backupFileName);
    fs.copyFileSync(PERSONNEL_FILE, backupPath);

    writeAuditLog("BACKUP_CREATED", user, `Created backup file ${backupFileName} (${note})`);
    res.json({ success: true, fileName: backupFileName });
  } catch (err: any) {
    res.status(500).json({ error: "Backup failed: " + err.message });
  }
});

app.get("/api/backups", (_req, res) => {
  try {
    const files = fs.readdirSync(BACKUPS_DIR).filter((f) => f.endsWith(".json"));
    const backups = files
      .map((file) => {
        const stats = fs.statSync(path.join(BACKUPS_DIR, file));
        return {
          fileName: file,
          createdAt: stats.mtime.toISOString(),
          size: stats.size
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ backups });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to list backups." });
  }
});

// ---------------------------------------------------------------------------
// 6. Supabase Credentials Sync on Server (Loaded directly from ENV Variables)
// ---------------------------------------------------------------------------
function getEffectiveSupabaseCredentials() {
  let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  let anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  if ((!url || !anonKey) && fs.existsSync(SUPABASE_CONFIG_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(SUPABASE_CONFIG_FILE, "utf-8"));
      if (!url && saved.url) url = saved.url;
      if (!anonKey && saved.anonKey) anonKey = saved.anonKey;
    } catch (e) {}
  }
  return {
    url: url.trim(),
    anonKey: anonKey.trim(),
    isConfigured: Boolean(url.trim() && anonKey.trim())
  };
}

app.get("/api/supabase/credentials", (_req, res) => {
  const creds = getEffectiveSupabaseCredentials();
  res.json(creds);
});

app.get("/api/supabase/config", (_req, res) => {
  const creds = getEffectiveSupabaseCredentials();
  res.json({ url: creds.url, hasKey: Boolean(creds.anonKey), anonKey: creds.anonKey, isConfigured: creds.isConfigured });
});

app.post("/api/supabase/config", (req, res) => {
  try {
    const { url, anonKey } = req.body;
    fs.writeFileSync(
      SUPABASE_CONFIG_FILE,
      JSON.stringify({ url: url?.trim() || "", anonKey: anonKey?.trim() || "" }, null, 2)
    );
    writeAuditLog("SUPABASE_CONFIG_UPDATE", "Super Admin", `Updated Supabase connection endpoint: ${url}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/supabase/credentials", (req, res) => {
  try {
    const { url, anonKey } = req.body;
    fs.writeFileSync(
      SUPABASE_CONFIG_FILE,
      JSON.stringify({ url: url?.trim() || "", anonKey: anonKey?.trim() || "" }, null, 2)
    );
    writeAuditLog("SUPABASE_CONFIG_UPDATE", "Super Admin", `Configured Supabase credentials: ${url}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 7. AI Assistant API Endpoint
// Base URL: https://api.apinex.bond/v1
// Primary Model: free/minimax-m3.1-flash
// Fallback Model: free/deepseek-v4.1-flash
// ---------------------------------------------------------------------------
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}

function runLocalCrimeBranchIntelligence(q: string, list: any[]) {
  const lq = q.toLowerCase();
  const count = list.length;

  // Squad query
  if (lq.includes("squad") || lq.includes("સ્કોડ") || lq.includes("કેટલા")) {
    const squadCounts: Record<string, number> = {};
    list.forEach((p: any) => {
      const sq = p.code || "Unassigned";
      squadCounts[sq] = (squadCounts[sq] || 0) + 1;
    });
    const squadBreakdown = Object.entries(squadCounts)
      .map(([sq, c]) => `• ${sq}: ${c} અધિકારીઓ/જવાનો`)
      .join("\n");
    return `ગુજરાત પોલીસ ક્રાઇમ બ્રાન્ચ સ્કોડ વિશ્લેષણ:\nકુલ સ્ટાફ: ${count}\n\nસ્કોડ મુજબ કર્મચારીઓની સંખ્યા:\n${squadBreakdown}\n\nCrime Branch squad distribution is balanced across active operational squads.`;
  }

  // Retirement query
  if (lq.includes("retire") || lq.includes("નિવૃત્ત") || lq.includes("નિવૃત્તિ")) {
    const retiring = list
      .filter((p: any) => p.retirementDate)
      .slice(0, 8)
      .map((p: any) => `• ${p.name} (${p.designation} #${p.badgeNo}) - નિવૃત્તિ તારીખ: ${p.retirementDate}`);
    return `નિવૃત્તિ વિગતો:\n${retiring.join("\n")}\n\nકુલ નોંધાયેલ નિવૃત્તિ રેકોર્ડ્સ: ${list.length}.`;
  }

  // Appointment / Nimnok query
  if (lq.includes("appointment") || lq.includes("નીમણુંક") || lq.includes("crime") || lq.includes("એટેચ")) {
    const crime = list.filter((p: any) => (p.appointment || "").toLowerCase().includes("crime")).length;
    const attach = list.filter(
      (p: any) => (p.appointment || "").includes("એટેચ") || (p.appointment || "").toLowerCase().includes("attach")
    ).length;
    return `નીમણૂંક (Appointment) વિશ્લેષણ:\n• CRIME સ્ટાફ: ${crime}\n• એટેચ (Attached): ${attach}\n• અન્ય / પ્રતિનિયુક્તિ: ${count - (crime + attach)}\n\nકુલ સ્ટાફ સંખ્યા: ${count}.`;
  }

  // Default summary
  return `ગુજરાત પોલીસ ક્રાઇમ બ્રાન્ચ સ્ટાફ વિશ્લેષણ:\nકુલ કર્મચારીઓ: ${count}\nસક્રિય સ્કોડ્સ: ${new Set(list.map((p: any) => p.code)).size}\nહોદ્દાઓ: ${new Set(list.map((p: any) => p.designation)).size}\nતમે સ્કોડ, નિવૃત્તિ તારીખ, નીમણૂંક (CRIME / એટેચ) અથવા કોઈ ચોક્કસ અધિકારી વિશે પૂછી શકો છો.`;
}

app.post("/api/ai/query", async (req, res) => {
  const { prompt, personnelData = [], userApiKey = "" } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Query prompt is required." });
  }

  const systemInstruction = `You are the official Crime Branch Personnel Intelligence & Operations Officer for Gujarat Police.
Analyze the provided roster dataset (${personnelData.length} total records) and provide fast, precise, authoritative answers in Gujarati or English depending on user prompt.
Mention badge numbers, designations (UASI, UHC, PSI, PI, etc.), squads, appointments (CRIME vs એટેચ), and tenure accurately.`;

  const rosterContext = personnelData.slice(0, 150).map((p: any) => ({
    srNo: p.srNo,
    code: p.code,
    designation: p.designation,
    badgeNo: p.badgeNo,
    name: p.name,
    mobile: p.mobile,
    dutyPlace: p.dutyPlace,
    appointment: p.appointment,
    reportDate: p.reportDate,
    birthDate: p.birthDate,
    recruitedDate: p.recruitedDate,
    retirementDate: p.retirementDate
  }));

  const messages = [
    { role: "system", content: systemInstruction },
    {
      role: "user",
      content: `Crime Branch Personnel Dataset (${personnelData.length} records):\n${JSON.stringify(rosterContext, null, 1)}\n\nQuery: ${prompt}`
    }
  ];

  const apinexApiKey = userApiKey || process.env.APINEX_API_KEY || "free";

  // Step 1: Call Primary Apinex model: free/minimax-m3.1-flash
  try {
    const apinexRes = await fetch("https://api.apinex.bond/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apinexApiKey}`
      },
      body: JSON.stringify({
        model: "free/minimax-m3.1-flash",
        messages,
        temperature: 0.2,
        max_tokens: 1024
      }),
      signal: AbortSignal.timeout(6000)
    });

    if (apinexRes.ok) {
      const data: any = await apinexRes.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply) {
        return res.json({ text: reply, model: "free/minimax-m3.1-flash" });
      }
    }
  } catch (err: any) {
    console.warn("Primary model free/minimax-m3.1-flash failed:", err.message);
  }

  // Step 2: Call Fallback Apinex model: free/deepseek-v4.1-flash
  try {
    const fallbackRes = await fetch("https://api.apinex.bond/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apinexApiKey}`
      },
      body: JSON.stringify({
        model: "free/deepseek-v4.1-flash",
        messages,
        temperature: 0.2,
        max_tokens: 1024
      }),
      signal: AbortSignal.timeout(6000)
    });

    if (fallbackRes.ok) {
      const data: any = await fallbackRes.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply) {
        return res.json({ text: reply, model: "free/deepseek-v4.1-flash" });
      }
    }
  } catch (err: any) {
    console.warn("Fallback model free/deepseek-v4.1-flash failed:", err.message);
  }

  // Step 3: Google Gemini API fallback
  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const fullPrompt = `Personnel Roster Dataset (Total: ${personnelData.length} records):\n${JSON.stringify(rosterContext, null, 1)}\n\nQuestion: ${prompt}`;
      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.2
        }
      });
      if (response.text) {
        return res.json({ text: response.text, model: "gemini-2.5-flash" });
      }
    } catch (error: any) {
      console.warn("Gemini API call failed:", error.message);
    }
  }

  // Step 4: Rule-based local crime branch intelligence engine (100% resilient)
  const localAnalysis = runLocalCrimeBranchIntelligence(prompt, personnelData);
  return res.json({ text: localAnalysis, model: "local-crime-branch-engine" });
});

// ---------------------------------------------------------------------------
// 8. Server Startup
// ---------------------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  const distPath = path.resolve(__dirname, "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));

  // Prevent browser caching
  app.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    next();
  });

  if (isProd || hasDist) {
    console.log(`Serving production bundle from ${distPath}`);
    app.use(
      express.static(distPath, {
        etag: false,
        maxAge: 0,
        setHeaders: (res) => {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        }
      })
    );
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log("Serving through Vite dev middleware");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${PORT} in use, retrying connection in 1 second...`);
      setTimeout(() => {
        server.close();
        server.listen(PORT, "0.0.0.0");
      }, 1000);
    } else {
      console.error("Server error:", err);
    }
  });

  const handleShutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", handleShutdown);
  process.on("SIGINT", handleShutdown);
}

startServer();
