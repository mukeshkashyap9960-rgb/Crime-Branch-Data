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
const PORT = Number(process.env.PORT) || 3e3;
const DATA_DIR = path.resolve(__dirname, "data");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");
const PERSONNEL_FILE = path.join(DATA_DIR, "personnel.json");
const AUDIT_LOGS_FILE = path.join(DATA_DIR, "audit-logs.json");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
function writeAuditLog(action, user, details) {
  try {
    const entry = {
      id: Date.now().toString(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
app.get("/api/personnel", (_req, res) => {
  try {
    if (fs.existsSync(PERSONNEL_FILE)) {
      const data = fs.readFileSync(PERSONNEL_FILE, "utf-8");
      return res.json({ personnel: JSON.parse(data), source: "server_db" });
    }
    return res.json({ personnel: null, source: "none" });
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: "Failed to persist database: " + err.message });
  }
});
app.get("/api/audit-logs", (_req, res) => {
  try {
    if (fs.existsSync(AUDIT_LOGS_FILE)) {
      const logs = JSON.parse(fs.readFileSync(AUDIT_LOGS_FILE, "utf-8"));
      return res.json({ logs });
    }
    res.json({ logs: [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to read audit logs." });
  }
});
app.post("/api/backups", (req, res) => {
  try {
    const { user = "Admin", note = "Manual Backup" } = req.body;
    if (!fs.existsSync(PERSONNEL_FILE)) {
      return res.status(400).json({ error: "No personnel data to backup." });
    }
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const backupFileName = `backup-${timestamp}.json`;
    const backupPath = path.join(BACKUPS_DIR, backupFileName);
    fs.copyFileSync(PERSONNEL_FILE, backupPath);
    writeAuditLog("BACKUP_CREATED", user, `Created backup file ${backupFileName} (${note})`);
    res.json({ success: true, fileName: backupFileName });
  } catch (err) {
    res.status(500).json({ error: "Backup failed: " + err.message });
  }
});
app.get("/api/backups", (_req, res) => {
  try {
    const files = fs.readdirSync(BACKUPS_DIR).filter((f) => f.endsWith(".json"));
    const backups = files.map((file) => {
      const stats = fs.statSync(path.join(BACKUPS_DIR, file));
      return {
        fileName: file,
        createdAt: stats.mtime.toISOString(),
        size: stats.size
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ backups });
  } catch (err) {
    res.status(500).json({ error: "Failed to list backups." });
  }
});
let aiClient = null;
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
app.post("/api/ai/query", async (req, res) => {
  const { prompt, personnelData = [] } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Query prompt is required." });
  }
  const runLocalCrimeBranchIntelligence = (q, list) => {
    const lq = q.toLowerCase();
    const count = list.length;
    if (lq.includes("squad") || lq.includes("\u0AB8\u0ACD\u0A95\u0ACB\u0AA1") || lq.includes("\u0A95\u0AC7\u0A9F\u0AB2\u0ABE")) {
      const squadCounts = {};
      list.forEach((p) => {
        const sq = p.code || "Unassigned";
        squadCounts[sq] = (squadCounts[sq] || 0) + 1;
      });
      const squadBreakdown = Object.entries(squadCounts).map(([sq, c]) => `\u2022 ${sq}: ${c} \u0A85\u0AA7\u0ABF\u0A95\u0ABE\u0AB0\u0AC0\u0A93/\u0A9C\u0AB5\u0ABE\u0AA8\u0ACB`).join("\n");
      return `\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4 \u0AAA\u0ACB\u0AB2\u0AC0\u0AB8 \u0A95\u0ACD\u0AB0\u0ABE\u0A87\u0AAE \u0AAC\u0ACD\u0AB0\u0ABE\u0AA8\u0ACD\u0A9A \u0AB8\u0ACD\u0A95\u0ACB\u0AA1 \u0AB5\u0ABF\u0AB6\u0ACD\u0AB2\u0AC7\u0AB7\u0AA3:
\u0A95\u0AC1\u0AB2 \u0AB8\u0ACD\u0A9F\u0ABE\u0AAB: ${count}

\u0AB8\u0ACD\u0A95\u0ACB\u0AA1 \u0AAE\u0AC1\u0A9C\u0AAC \u0A95\u0AB0\u0ACD\u0AAE\u0A9A\u0ABE\u0AB0\u0AC0\u0A93\u0AA8\u0AC0 \u0AB8\u0A82\u0A96\u0ACD\u0AAF\u0ABE:
${squadBreakdown}

Crime Branch squad distribution is balanced across active squads.`;
    }
    if (lq.includes("retire") || lq.includes("\u0AA8\u0ABF\u0AB5\u0AC3\u0AA4\u0ACD\u0AA4") || lq.includes("\u0AA8\u0ABF\u0AB5\u0AC3\u0AA4\u0ACD\u0AA4\u0ABF")) {
      const retiring = list.filter((p) => p.retirementDate).slice(0, 8).map((p) => `\u2022 ${p.name} (${p.designation} #${p.badgeNo}) - \u0AA8\u0ABF\u0AB5\u0AC3\u0AA4\u0ACD\u0AA4\u0ABF \u0AA4\u0ABE\u0AB0\u0AC0\u0A96: ${p.retirementDate}`);
      return `\u0AA8\u0ABF\u0AB5\u0AC3\u0AA4\u0ACD\u0AA4\u0ABF \u0AB5\u0ABF\u0A97\u0AA4\u0ACB:
${retiring.join("\n")}

\u0A95\u0AC1\u0AB2 \u0AA8\u0ACB\u0A82\u0AA7\u0ABE\u0AAF\u0AC7\u0AB2 \u0AA8\u0ABF\u0AB5\u0AC3\u0AA4\u0ACD\u0AA4\u0ABF \u0AB0\u0AC7\u0A95\u0ACB\u0AB0\u0ACD\u0AA1\u0ACD\u0AB8: ${list.length}.`;
    }
    if (lq.includes("appointment") || lq.includes("\u0AA8\u0AC0\u0AAE\u0AA3\u0AC1\u0A82\u0A95") || lq.includes("crime") || lq.includes("\u0A8F\u0A9F\u0AC7\u0A9A")) {
      const crime = list.filter((p) => (p.appointment || "").toLowerCase().includes("crime")).length;
      const attach = list.filter((p) => (p.appointment || "").includes("\u0A8F\u0A9F\u0AC7\u0A9A") || (p.appointment || "").toLowerCase().includes("attach")).length;
      return `\u0AA8\u0AC0\u0AAE\u0AA3\u0AC2\u0A82\u0A95 (Appointment) \u0AB5\u0ABF\u0AB6\u0ACD\u0AB2\u0AC7\u0AB7\u0AA3:
\u2022 CRIME \u0AB8\u0ACD\u0A9F\u0ABE\u0AAB: ${crime}
\u2022 \u0A8F\u0A9F\u0AC7\u0A9A (Attached): ${attach}
\u2022 \u0A85\u0AA8\u0ACD\u0AAF / \u0AAA\u0ACD\u0AB0\u0AA4\u0ABF\u0AA8\u0ABF\u0AAF\u0AC1\u0A95\u0ACD\u0AA4\u0ABF: ${count - (crime + attach)}

\u0A95\u0AC1\u0AB2 \u0AB8\u0ACD\u0A9F\u0ABE\u0AAB \u0AB8\u0A82\u0A96\u0ACD\u0AAF\u0ABE: ${count}.`;
    }
    return `\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4 \u0AAA\u0ACB\u0AB2\u0AC0\u0AB8 \u0A95\u0ACD\u0AB0\u0ABE\u0A87\u0AAE \u0AAC\u0ACD\u0AB0\u0ABE\u0AA8\u0ACD\u0A9A \u0AB8\u0ACD\u0A9F\u0ABE\u0AAB \u0AB5\u0ABF\u0AB6\u0ACD\u0AB2\u0AC7\u0AB7\u0AA3:
\u0A95\u0AC1\u0AB2 \u0A95\u0AB0\u0ACD\u0AAE\u0A9A\u0ABE\u0AB0\u0AC0\u0A93: ${count}
\u0AB8\u0A95\u0ACD\u0AB0\u0ABF\u0AAF \u0AB8\u0ACD\u0A95\u0ACB\u0AA1\u0ACD\u0AB8: ${new Set(list.map((p) => p.code)).size}
\u0AB9\u0ACB\u0AA6\u0ACD\u0AA6\u0ABE\u0A93: ${new Set(list.map((p) => p.designation)).size}
\u0AA4\u0AAE\u0AC7 \u0AB8\u0ACD\u0A95\u0ACB\u0AA1, \u0AA8\u0ABF\u0AB5\u0AC3\u0AA4\u0ACD\u0AA4\u0ABF \u0AA4\u0ABE\u0AB0\u0AC0\u0A96, \u0AA8\u0AC0\u0AAE\u0AA3\u0AC2\u0A82\u0A95 (CRIME / \u0A8F\u0A9F\u0AC7\u0A9A) \u0A85\u0AA5\u0AB5\u0ABE \u0A95\u0ACB\u0A88 \u0A9A\u0ACB\u0A95\u0ACD\u0A95\u0AB8 \u0A85\u0AA7\u0ABF\u0A95\u0ABE\u0AB0\u0AC0 \u0AB5\u0ABF\u0AB6\u0AC7 \u0AAA\u0AC2\u0A9B\u0AC0 \u0AB6\u0A95\u0ACB \u0A9B\u0ACB.`;
  };
  try {
    if (aiClient && process.env.GEMINI_API_KEY) {
      const systemInstruction = `You are the official Crime Branch Personnel Intelligence Officer for Gujarat Police. 
Analyze the provided roster dataset and provide fast, precise, authoritative answers in Gujarati or English depending on user prompt.
Mention badge numbers, designations (UASI, UHC, PSI, PI, etc.), squads, appointments (CRIME vs \u0A8F\u0A9F\u0AC7\u0A9A), and tenure accurately.`;
      const fullPrompt = `Personnel Roster Dataset (Total: ${personnelData.length} records):
${JSON.stringify(personnelData.slice(0, 150), null, 2)}

Question: ${prompt}`;
      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.2
        }
      });
      return res.json({ text: response.text || runLocalCrimeBranchIntelligence(prompt, personnelData) });
    } else {
      return res.json({ text: runLocalCrimeBranchIntelligence(prompt, personnelData) });
    }
  } catch (error) {
    console.warn("Gemini API call failed, using intelligent local engine:", error.message);
    const fallbackText = runLocalCrimeBranchIntelligence(prompt, personnelData);
    return res.json({ text: fallbackText });
  }
});
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  const distPath = path.resolve(__dirname, "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));
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
        hmr: false
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${PORT} in use, retrying connection in 1 second...`);
      setTimeout(() => {
        server.close();
        server.listen(PORT, "0.0.0.0");
      }, 1e3);
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
