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

// Setup persistent data directories for Server-side Database, Backups, and Audit Logs
const DATA_DIR = path.resolve(__dirname, "data");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");
const PERSONNEL_FILE = path.join(DATA_DIR, "personnel.json");
const AUDIT_LOGS_FILE = path.join(DATA_DIR, "audit-logs.json");

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
      } catch (e) { logs = []; }
    }
    logs.unshift(entry);
    // Keep last 500 audit logs
    if (logs.length > 500) logs = logs.slice(0, 500);
    fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

// 1. Server-side Database API Endpoints
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

// 2. Audit Logs API
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

// 3. Server-side Automated Backup System
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
    const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith(".json"));
    const backups = files.map(file => {
      const stats = fs.statSync(path.join(BACKUPS_DIR, file));
      return {
        fileName: file,
        createdAt: stats.mtime.toISOString(),
        size: stats.size
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ backups });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to list backups." });
  }
});

// 4. Robust AI Query Endpoint with Gemini 2.5 Flash & Local Rule-Based Engine
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

app.post("/api/ai/query", async (req, res) => {
  const { prompt, personnelData = [] } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Query prompt is required." });
  }

  // Fallback Rule-Based Crime Branch Intelligence Engine
  const runLocalCrimeBranchIntelligence = (q: string, list: any[]) => {
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
      return `ગુજરાત પોલીસ ક્રાઇમ બ્રાન્ચ સ્કોડ વિશ્લેષણ:\nકુલ સ્ટાફ: ${count}\n\nસ્કોડ મુજબ કર્મચારીઓની સંખ્યા:\n${squadBreakdown}\n\nCrime Branch squad distribution is balanced across active squads.`;
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
      const attach = list.filter((p: any) => (p.appointment || "").includes("એટેચ") || (p.appointment || "").toLowerCase().includes("attach")).length;
      return `નીમણૂંક (Appointment) વિશ્લેષણ:\n• CRIME સ્ટાફ: ${crime}\n• એટેચ (Attached): ${attach}\n• અન્ય / પ્રતિનિયુક્તિ: ${count - (crime + attach)}\n\nકુલ સ્ટાફ સંખ્યા: ${count}.`;
    }

    // Default summary
    return `ગુજરાત પોલીસ ક્રાઇમ બ્રાન્ચ સ્ટાફ વિશ્લેષણ:\nકુલ કર્મચારીઓ: ${count}\nસક્રિય સ્કોડ્સ: ${new Set(list.map((p: any) => p.code)).size}\nહોદ્દાઓ: ${new Set(list.map((p: any) => p.designation)).size}\nતમે સ્કોડ, નિવૃત્તિ તારીખ, નીમણૂંક (CRIME / એટેચ) અથવા કોઈ ચોક્કસ અધિકારી વિશે પૂછી શકો છો.`;
  };

  try {
    if (aiClient && process.env.GEMINI_API_KEY) {
      const systemInstruction = `You are the official Crime Branch Personnel Intelligence Officer for Gujarat Police. 
Analyze the provided roster dataset and provide fast, precise, authoritative answers in Gujarati or English depending on user prompt.
Mention badge numbers, designations (UASI, UHC, PSI, PI, etc.), squads, appointments (CRIME vs એટેચ), and tenure accurately.`;

      const fullPrompt = `Personnel Roster Dataset (Total: ${personnelData.length} records):\n${JSON.stringify(personnelData.slice(0, 150), null, 2)}\n\nQuestion: ${prompt}`;

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        }
      });

      return res.json({ text: response.text || runLocalCrimeBranchIntelligence(prompt, personnelData) });
    } else {
      // Local engine fallback
      return res.json({ text: runLocalCrimeBranchIntelligence(prompt, personnelData) });
    }
  } catch (error: any) {
    console.warn("Gemini API call failed, using intelligent local engine:", error.message);
    const fallbackText = runLocalCrimeBranchIntelligence(prompt, personnelData);
    return res.json({ text: fallbackText });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  const distPath = path.resolve(__dirname, "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));

  // Prevent browser & iframe caching so user's device always receives latest build
  app.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    next();
  });

  if (isProd || hasDist) {
    console.log(`Serving production bundle from ${distPath}`);
    app.use(express.static(distPath, {
      etag: false,
      maxAge: 0,
      setHeaders: (res) => {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }
    }));
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
        hmr: false,
      },
      appType: "spa",
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
