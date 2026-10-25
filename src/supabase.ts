import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Personnel } from "./App";

export type UserRole = "super_admin" | "admin" | "squad" | "officer" | "viewer";

export interface RealtimeBroadcast {
  id: string;
  title: string;
  messageGu: string;
  messageEn: string;
  priority: "critical" | "high" | "normal";
  author: string;
  createdAt: string;
  active: boolean;
}

export interface SquadTask {
  id: string;
  title: string;
  description: string;
  squadCode: string;
  assignedOfficers: string[];
  periodicity: "daily" | "weekly" | "monthly";
  priority: "urgent" | "high" | "normal";
  dueDate: string;
  status: "pending" | "in_progress" | "completed";
  createdBy: string;
  createdAt: string;
}

export interface AppUserRecord {
  id: string;
  name: string;
  badgeNo: string;
  mobile: string;
  role: UserRole;
  lastActive: string;
  loginTime: string;
  device?: string;
}

// In-memory runtime configuration (ZERO localStorage / ZERO sessionStorage)
let memorySupabaseUrl = "";
let memorySupabaseAnonKey = "";
let cachedClient: SupabaseClient | null = null;
let realtimeChannel: any = null;

// Track broadcast IDs that have already been received/notified to prevent repeat alerts
const notifiedBroadcastIds = new Set<string>();

// ==============================================================================
// VERCEL / STATIC FRONTEND ENVIRONMENT VARIABLES CONFIGURATION:
// Add these in Vercel -> Project -> Settings -> Environment Variables:
// 
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-real-anon-key
// ==============================================================================

export function configureSupabase(url: string, anonKey: string): SupabaseClient | null {
  memorySupabaseUrl = (url || import.meta.env.VITE_SUPABASE_URL || "").trim();
  memorySupabaseAnonKey = (anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "").trim();
  cachedClient = null;

  if (realtimeChannel) {
    try {
      realtimeChannel.unsubscribe();
    } catch (e) {}
    realtimeChannel = null;
  }

  const targetUrl = memorySupabaseUrl;
  const targetKey = memorySupabaseAnonKey;

  if (targetUrl && targetKey) {
    try {
      cachedClient = createClient(targetUrl, targetKey, {
        auth: {
          persistSession: false, // ZERO localStorage or sessionStorage
          autoRefreshToken: false
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
      return cachedClient;
    } catch (err) {
      console.warn("Failed to create Supabase client:", err);
      return null;
    }
  }
  return null;
}

// Initialize Supabase prioritizing Vite Environment Variables (Vercel / Static Deployment)
export async function initSupabaseFromServer(): Promise<{ url: string; anonKey: string; isConfigured: boolean }> {
  // 1. First try Vite environment variables directly (Vercel deployment)
  const viteUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
  const viteAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || "";

  if (viteUrl.trim() && viteAnonKey.trim()) {
    configureSupabase(viteUrl, viteAnonKey);
    return { url: viteUrl.trim(), anonKey: viteAnonKey.trim(), isConfigured: true };
  }

  // 2. De-prioritized fallback to fetching from server Express API routes (/api/supabase/credentials)
  try {
    const res = await fetch("/api/supabase/credentials");
    if (res.ok) {
      const data = await res.json();
      if (data.url && data.anonKey) {
        configureSupabase(data.url, data.anonKey);
        return { url: data.url, anonKey: data.anonKey, isConfigured: true };
      }
    }
  } catch (err) {
    // 404 on Vercel is expected and safely ignored
  }

  // 3. Fall back to memory config
  return { url: memorySupabaseUrl, anonKey: memorySupabaseAnonKey, isConfigured: Boolean(memorySupabaseUrl && memorySupabaseAnonKey) };
}

export function getSupabaseConfig(): { url: string; hasKey: boolean; isConfigured: boolean } {
  const viteUrl = (import.meta.env.VITE_SUPABASE_URL as string) || memorySupabaseUrl;
  const viteAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || memorySupabaseAnonKey;

  return {
    url: viteUrl,
    hasKey: Boolean(viteAnonKey),
    isConfigured: Boolean(viteUrl && viteAnonKey)
  };
}

export function getSupabase(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  // Check Vite env variables first
  const viteUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
  const viteAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || "";

  if (viteUrl.trim() && viteAnonKey.trim()) {
    return configureSupabase(viteUrl, viteAnonKey);
  }

  if (!memorySupabaseUrl || !memorySupabaseAnonKey) return null;
  return configureSupabase(memorySupabaseUrl, memorySupabaseAnonKey);
}

// ---------------------------------------------------------------------------
// 1. REAL-TIME BROADCASTS (Supabase Realtime Channel + Deduplicated Alerting)
// ---------------------------------------------------------------------------
export function subscribeToRealtimeBroadcasts(
  onBroadcastReceived: (broadcast: RealtimeBroadcast) => void
): () => void {
  const client = getSupabase();

  if (!client) {
    // Server polling fallback ONLY notifies when a brand new ID appears (NO spamming!)
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/broadcasts");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.broadcasts)) {
            data.broadcasts.forEach((b: RealtimeBroadcast) => {
              if (b && b.id && !notifiedBroadcastIds.has(b.id)) {
                notifiedBroadcastIds.add(b.id);
                onBroadcastReceived(b);
              }
            });
          }
        }
      } catch (e) {}
    }, 10000);
    return () => clearInterval(interval);
  }

  try {
    const channel = client
      .channel("crime_branch_broadcasts")
      .on("broadcast", { event: "new_alert" }, (payload) => {
        if (payload?.payload) {
          const b = payload.payload as RealtimeBroadcast;
          if (b && b.id && !notifiedBroadcastIds.has(b.id)) {
            notifiedBroadcastIds.add(b.id);
            onBroadcastReceived(b);
          }
        }
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "operational_broadcasts" },
        (payload) => {
          if (payload?.new) {
            const raw = payload.new as any;
            const b: RealtimeBroadcast = {
              id: raw.id || String(Date.now()),
              title: raw.title,
              messageGu: raw.message_gu || raw.messageGu || "",
              messageEn: raw.message_en || raw.messageEn || "",
              priority: raw.priority || "normal",
              author: raw.author || "Super Admin",
              createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
              active: raw.active !== false
            };
            if (!notifiedBroadcastIds.has(b.id)) {
              notifiedBroadcastIds.add(b.id);
              onBroadcastReceived(b);
            }
          }
        }
      )
      .subscribe();

    realtimeChannel = channel;

    return () => {
      try {
        client.removeChannel(channel);
      } catch (e) {}
    };
  } catch (err) {
    console.warn("Realtime channel subscription error:", err);
    return () => {};
  }
}

export async function dispatchRealtimeBroadcast(
  broadcast: RealtimeBroadcast
): Promise<{ success: boolean; error?: string }> {
  // Add to notified list immediately so dispatcher does not spam self
  notifiedBroadcastIds.add(broadcast.id);

  const client = getSupabase();

  if (client) {
    try {
      // 1. Broadcast to all active clients via Supabase Realtime channel
      await client.channel("crime_branch_broadcasts").send({
        type: "broadcast",
        event: "new_alert",
        payload: broadcast
      });

      // 2. Persist into Supabase table operational_broadcasts
      await client.from("operational_broadcasts").insert([
        {
          id: broadcast.id,
          title: broadcast.title,
          message_gu: broadcast.messageGu,
          message_en: broadcast.messageEn,
          priority: broadcast.priority,
          author: broadcast.author,
          created_at: broadcast.createdAt,
          active: broadcast.active
        }
      ]);
    } catch (e: any) {
      console.warn("Supabase broadcast dispatch error:", e?.message);
    }
  }

  // Also sync to server route for persistence
  try {
    const res = await fetch("/api/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(broadcast)
    });
    return { success: res.ok };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchBroadcasts(): Promise<RealtimeBroadcast[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("operational_broadcasts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((b: any) => ({
          id: b.id || String(b.created_at),
          title: b.title,
          messageGu: b.message_gu || b.messageGu || "",
          messageEn: b.message_en || b.messageEn || "",
          priority: b.priority || "normal",
          author: b.author || "Super Admin",
          createdAt: b.created_at || b.createdAt,
          active: b.active !== false
        }));

        // Mark all existing broadcasts as seen on initial load so they don't trigger alert chime
        mapped.forEach((b) => notifiedBroadcastIds.add(b.id));
        return mapped;
      }
    } catch (e) {
      console.warn("Supabase fetch broadcasts error:", e);
    }
  }

  // Fallback to server route
  try {
    const res = await fetch("/api/broadcasts");
    if (res.ok) {
      const json = await res.json();
      const list = json.broadcasts || [];
      list.forEach((b: any) => notifiedBroadcastIds.add(b.id));
      return list;
    }
  } catch (e) {}
  return [];
}

// ---------------------------------------------------------------------------
// 2. PERSONNEL ROSTER (SAVED & LOADED FROM SUPABASE TABLES ONLY)
// ---------------------------------------------------------------------------
export async function syncPersonnelToSupabase(
  personnelList: Personnel[],
  user = "Super Admin"
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabase();

  if (client) {
    try {
      // 1. Deduplicate by unique primary key or composite identity (NEVER filter by badge alone!)
      const seenIds = new Set<string>();
      const uniqueList: Personnel[] = [];

      personnelList.forEach((p, idx) => {
        const rowId = (p.id || "").trim();
        // If an ID already exists, prevent duplicate in-payload collisions
        if (rowId && seenIds.has(rowId)) return;
        if (rowId) seenIds.add(rowId);
        uniqueList.push(p);
      });

      // 2. Assign stable deterministic ID incorporating sr_no and name slug to guarantee uniqueness for all 409 rows
      const rows = uniqueList.map((p, idx) => {
        const sr = p.srNo || idx + 1;
        const nameSlug = (p.name || "").trim().slice(0, 30).replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, "_");
        const cleanBadge = (p.badgeNo || "").trim();
        const hasValidBadge = cleanBadge && cleanBadge !== "-" && cleanBadge !== "0" && cleanBadge !== "NA" && /[a-zA-Z0-9]/.test(cleanBadge);

        // Keep existing valid ID, or generate guaranteed unique stable ID
        const stableId = (p.id && p.id !== "officer--" && !p.id.startsWith("officer-row-"))
          ? p.id
          : hasValidBadge
            ? `officer-${cleanBadge.replace(/[^a-zA-Z0-9]/g, "-")}-${sr}`
            : `officer-${sr}-${nameSlug || "rec"}`;

        return {
          id: stableId,
          sr_no: sr,
          code: p.code || "",
          designation: p.designation || "",
          badge_no: p.badgeNo || "",
          name: p.name || "",
          mobile: p.mobile || "",
          duty_place: p.dutyPlace || "",
          appointment: p.appointment || "",
          report_date: p.reportDate || "",
          birth_date: p.birthDate || "",
          recruited_date: p.recruitedDate || "",
          retirement_date: p.retirementDate || "",
          aadhar_no: p.aadharNo || "",
          pan_no: p.panNo || "",
          blood_group: p.bloodGroup || "B+",
          weapon_no: p.weaponNo || "",
          avatar_url: p.avatarUrl || "",
          notes: p.notes || "",
          custom_fields: p.customFields || {}
        };
      });

      const { error } = await client.from("crime_branch_personnel").upsert(rows, { onConflict: "id" });
      if (!error) {
        console.log(`[Supabase] Successfully synced ${rows.length} personnel records into table 'crime_branch_personnel'`);
        return { success: true, count: rows.length };
      } else {
        console.warn("[Supabase] Personnel upsert error:", error.message);
      }
    } catch (e: any) {
      console.warn("[Supabase] Personnel upsert exception:", e?.message);
    }
  }

  // Fallback for local Express dev server if client is not configured
  if (!client) {
    try {
      const res = await fetch("/api/personnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personnel: personnelList,
          user,
          reason: "Synced to Supabase table crime_branch_personnel"
        })
      });
      return { success: res.ok, count: personnelList.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message };
    }
  }

  return { success: false, count: 0 };
}

export async function loadPersonnelFromSupabase(): Promise<Personnel[] | null> {
  const client = getSupabase();
  if (client) {
    try {
      // Fetch ALL rows from Supabase using .range(0, 9999) to prevent PostgREST default limit clipping
      const { data, error } = await client
        .from("crime_branch_personnel")
        .select("*")
        .order("sr_no", { ascending: true, nullsFirst: false })
        .range(0, 9999);

      if (error) {
        console.warn("[Supabase] Query error loading 'crime_branch_personnel':", error.message);
      }

      // Log exact count received from Supabase
      console.log(`[Supabase] Received ${data ? data.length : 0} records from 'crime_branch_personnel'`);

      if (!error && Array.isArray(data) && data.length > 0) {
        const seenIds = new Set<string>();
        const list: Personnel[] = [];

        data.forEach((r: any, idx: number) => {
          const rowId = (r.id ? String(r.id).trim() : `officer-row-${idx + 1}`);
          if (seenIds.has(rowId)) return;
          seenIds.add(rowId);

          // Preserve sr_no if present; if null or non-numeric, fallback gracefully
          const sr = (typeof r.sr_no === "number" && !isNaN(r.sr_no) && r.sr_no > 0)
            ? r.sr_no
            : idx + 1;

          list.push({
            id: rowId,
            srNo: sr,
            code: r.code || "",
            designation: r.designation || "",
            badgeNo: r.badge_no || "",
            name: r.name || "",
            mobile: r.mobile || "",
            dutyPlace: r.duty_place || "",
            appointment: r.appointment || "",
            reportDate: r.report_date || "",
            birthDate: r.birth_date || "",
            recruitedDate: r.recruited_date || "",
            retirementDate: r.retirement_date || "",
            aadharNo: r.aadhar_no || "",
            panNo: r.pan_no || "",
            bloodGroup: r.blood_group || "B+",
            weaponNo: r.weapon_no || "",
            avatarUrl: r.avatar_url || "",
            notes: r.notes || "",
            customFields: r.custom_fields || {}
          });
        });

        console.log(`[Supabase] Successfully mapped ${list.length} total personnel records.`);
        return list;
      } else {
        return [];
      }
    } catch (e) {
      console.warn("[Supabase] Failed to load from table crime_branch_personnel:", e);
      return [];
    }
  }

  // Fallback to local server DB if client is not configured
  if (!client) {
    try {
      const res = await fetch("/api/personnel");
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.personnel) && json.personnel.length > 0) {
          return json.personnel;
        }
      }
    } catch (e) {}
  }
  return null;
}

// ---------------------------------------------------------------------------
// 3. SQUAD TASKS (DAILY, WEEKLY, MONTHLY)
// ---------------------------------------------------------------------------
export async function fetchSquadTasks(): Promise<SquadTask[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("squad_tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description || "",
          squadCode: t.squad_code || t.squadCode,
          assignedOfficers: t.assigned_officers || t.assignedOfficers || [],
          periodicity: t.periodicity || "daily",
          priority: t.priority || "normal",
          dueDate: t.due_date || t.dueDate || "",
          status: t.status || "pending",
          createdBy: t.created_by || t.createdBy || "Super Admin",
          createdAt: t.created_at || t.createdAt
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch squad tasks error:", e);
    }
  }

  try {
    const res = await fetch("/api/squad-tasks");
    if (res.ok) {
      const json = await res.json();
      return json.tasks || [];
    }
  } catch (e) {}
  return [];
}

export async function saveSquadTask(task: SquadTask): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (client) {
    try {
      await client.from("squad_tasks").upsert({
        id: task.id,
        title: task.title,
        description: task.description,
        squad_code: task.squadCode,
        assigned_officers: task.assignedOfficers,
        periodicity: task.periodicity,
        priority: task.priority,
        due_date: task.dueDate,
        status: task.status,
        created_by: task.createdBy,
        created_at: task.createdAt
      });
    } catch (e: any) {
      console.warn("Supabase save task error:", e?.message);
    }
  }

  try {
    const res = await fetch("/api/squad-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task)
    });
    return { success: res.ok };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteSquadTask(taskId: string): Promise<{ success: boolean }> {
  const client = getSupabase();
  if (client) {
    try {
      await client.from("squad_tasks").delete().eq("id", taskId);
    } catch (e) {}
  }

  try {
    const res = await fetch(`/api/squad-tasks/${taskId}`, { method: "DELETE" });
    return { success: res.ok };
  } catch (e) {
    return { success: false };
  }
}

// ---------------------------------------------------------------------------
// 4. ACTIVE USERS & ROLE MANAGEMENT
// ---------------------------------------------------------------------------
export async function fetchUsers(): Promise<AppUserRecord[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("app_users").select("*").order("last_active", { ascending: false });
      if (!error && Array.isArray(data)) {
        return data.map((u: any) => ({
          id: u.id,
          name: u.name,
          badgeNo: u.badge_no || u.badgeNo,
          mobile: u.mobile,
          role: u.role as UserRole,
          lastActive: u.last_active || u.lastActive,
          loginTime: u.login_time || u.loginTime,
          device: u.device || "Web Browser"
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch users error:", e);
    }
  }

  // Fallback for local Express dev server if client is not configured
  if (!client) {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const json = await res.json();
        return json.users || [];
      }
    } catch (e) {}
  }
  return [];
}

export async function recordUserSession(user: AppUserRecord): Promise<void> {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from("app_users").upsert(
        {
          id: user.id,
          name: user.name,
          badge_no: user.badgeNo,
          mobile: user.mobile,
          role: user.role,
          last_active: user.lastActive,
          login_time: user.loginTime,
          device: user.device
        },
        { onConflict: "id" }
      );
      if (error) {
        console.warn("Supabase recordUserSession error:", error.message);
      }
    } catch (e: any) {
      console.warn("Supabase recordUserSession exception:", e?.message);
    }
  }
  // Removed fallback fetch("/api/users") to prevent 404 errors on Vercel static hosting
}

export async function updateUserRoleInSupabase(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (client) {
    try {
      await client.from("app_users").update({ role: newRole }).eq("id", userId);
    } catch (e: any) {
      console.warn("Supabase update user role error:", e?.message);
    }
  }

  try {
    const res = await fetch("/api/users/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole })
    });
    return { success: res.ok };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// 5. REALTIME CHAT MESSAGES
// ---------------------------------------------------------------------------
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export async function fetchChatMessages(): Promise<ChatMessage[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("chat_messages").select("*").order("created_at", { ascending: true });
      if (!error && Array.isArray(data)) {
        return data.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id || m.senderId,
          senderName: m.sender_name || m.senderName,
          senderRole: m.sender_role || m.senderRole,
          message: m.message,
          createdAt: m.created_at || m.createdAt
        }));
      }
    } catch (e) {}
  }

  try {
    const res = await fetch("/api/chat");
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.messages)) {
        return json.messages.map((m: any) => ({
          id: m.id,
          senderId: m.senderId || m.sender_id,
          senderName: m.senderName || m.sender_name,
          senderRole: m.senderRole || m.sender_role,
          message: m.message,
          createdAt: m.createdAt || m.created_at
        }));
      }
    }
  } catch (e) {}
  return [];
}

export async function sendChatMessage(msg: ChatMessage): Promise<{ success: boolean }> {
  const client = getSupabase();
  if (client) {
    try {
      await client.from("chat_messages").insert({
        id: msg.id,
        sender_id: msg.senderId,
        sender_name: msg.senderName,
        sender_role: msg.senderRole,
        message: msg.message,
        created_at: msg.createdAt
      });
    } catch (e) {}
  }

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg)
    });
    return { success: res.ok };
  } catch (e) {
    return { success: false };
  }
}

export function subscribeToChatMessages(onNewMessage: (msg: ChatMessage) => void): () => void {
  const client = getSupabase();
  if (!client) {
    // Polling fallback
    const interval = setInterval(async () => {
      try {
        const list = await fetchChatMessages();
        if (list.length > 0) {
          onNewMessage(list[list.length - 1]);
        }
      } catch (e) {}
    }, 4000);
    return () => clearInterval(interval);
  }

  try {
    const channel = client
      .channel("crime_branch_chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          if (payload?.new) {
            const raw = payload.new as any;
            const m: ChatMessage = {
              id: raw.id,
              senderId: raw.sender_id || raw.senderId,
              senderName: raw.sender_name || raw.senderName,
              senderRole: raw.sender_role || raw.senderRole,
              message: raw.message,
              createdAt: raw.created_at || raw.createdAt
            };
            onNewMessage(m);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        client.removeChannel(channel);
      } catch (e) {}
    };
  } catch (err) {
    return () => {};
  }
}

// ---------------------------------------------------------------------------
// 6. SQL SCHEMA HELPER FOR USER
// ---------------------------------------------------------------------------
export const SUPABASE_SQL_SCHEMA = `-- Crime Branch Gujarat Police: Supabase Database Schema & Setup Instructions
-- 1. Get your Supabase Project URL and Publishable / Anon Key from your Supabase Dashboard (Settings > API).
-- 2. Set them in your server environment variables (.env):
--    SUPABASE_URL=https://your-project.supabase.co
--    SUPABASE_ANON_KEY=your-publishable-anon-key
--    APINEX_API_KEY=your-apinex-api-key
-- 3. Run the following SQL script in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS crime_branch_personnel (
  id TEXT PRIMARY KEY,
  sr_no INT,
  code TEXT,
  designation TEXT,
  badge_no TEXT,
  name TEXT,
  mobile TEXT,
  duty_place TEXT,
  appointment TEXT,
  report_date TEXT,
  birth_date TEXT,
  recruited_date TEXT,
  retirement_date TEXT,
  aadhar_no TEXT,
  pan_no TEXT,
  blood_group TEXT,
  weapon_no TEXT,
  avatar_url TEXT,
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operational_broadcasts (
  id TEXT PRIMARY KEY,
  title TEXT,
  message_gu TEXT,
  message_en TEXT,
  priority TEXT DEFAULT 'normal',
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS squad_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  squad_code TEXT,
  assigned_officers TEXT[],
  periodicity TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
  priority TEXT DEFAULT 'normal',    -- 'urgent', 'high', 'normal'
  due_date TEXT,
  status TEXT DEFAULT 'pending',     -- 'pending', 'in_progress', 'completed'
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  name TEXT,
  badge_no TEXT,
  mobile TEXT,
  role TEXT DEFAULT 'officer',       -- 'super_admin', 'admin', 'squad', 'officer', 'viewer'
  last_active TIMESTAMPTZ DEFAULT NOW(),
  login_time TIMESTAMPTZ DEFAULT NOW(),
  device TEXT
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT,
  sender_name TEXT,
  sender_role TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime publication for tables
ALTER PUBLICATION supabase_realtime ADD TABLE operational_broadcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE crime_branch_personnel;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR CRIME BRANCH TABLES
-- Allows anon key and authenticated users to SELECT, INSERT, UPDATE, DELETE
-- ==============================================================================

-- 1. crime_branch_personnel
ALTER TABLE crime_branch_personnel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access on crime_branch_personnel" ON crime_branch_personnel;
CREATE POLICY "Public full access on crime_branch_personnel"
ON crime_branch_personnel
FOR ALL
TO anon, authenticated, public
USING (true)
WITH CHECK (true);

-- 2. operational_broadcasts
ALTER TABLE operational_broadcasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access on operational_broadcasts" ON operational_broadcasts;
CREATE POLICY "Public full access on operational_broadcasts"
ON operational_broadcasts
FOR ALL
TO anon, authenticated, public
USING (true)
WITH CHECK (true);

-- 3. squad_tasks
ALTER TABLE squad_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access on squad_tasks" ON squad_tasks;
CREATE POLICY "Public full access on squad_tasks"
ON squad_tasks
FOR ALL
TO anon, authenticated, public
USING (true)
WITH CHECK (true);

-- 4. app_users
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access on app_users" ON app_users;
CREATE POLICY "Public full access on app_users"
ON app_users
FOR ALL
TO anon, authenticated, public
USING (true)
WITH CHECK (true);

-- 5. chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access on chat_messages" ON chat_messages;
CREATE POLICY "Public full access on chat_messages"
ON chat_messages
FOR ALL
TO anon, authenticated, public
USING (true)
WITH CHECK (true);

-- Grant schema permissions to anon and authenticated roles
GRANT ALL ON TABLE crime_branch_personnel TO anon, authenticated, service_role;
GRANT ALL ON TABLE operational_broadcasts TO anon, authenticated, service_role;
GRANT ALL ON TABLE squad_tasks TO anon, authenticated, service_role;
GRANT ALL ON TABLE app_users TO anon, authenticated, service_role;
GRANT ALL ON TABLE chat_messages TO anon, authenticated, service_role;
`;
