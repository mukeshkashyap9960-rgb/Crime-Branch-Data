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
  assignedOfficers: string[]; // names or badge numbers
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

// In-memory runtime configuration (NO localStorage / NO sessionStorage)
let memorySupabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
let memorySupabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";
let cachedClient: SupabaseClient | null = null;
let realtimeChannel: any = null;

export function configureSupabase(url: string, anonKey: string) {
  memorySupabaseUrl = url.trim();
  memorySupabaseAnonKey = anonKey.trim();
  cachedClient = null;
  if (realtimeChannel) {
    try {
      realtimeChannel.unsubscribe();
    } catch (e) {
      /* ignore */
    }
    realtimeChannel = null;
  }
}

export function getSupabaseConfig(): { url: string; hasKey: boolean; isConfigured: boolean } {
  return {
    url: memorySupabaseUrl,
    hasKey: Boolean(memorySupabaseAnonKey),
    isConfigured: Boolean(memorySupabaseUrl && memorySupabaseAnonKey)
  };
}

export function getSupabase(): SupabaseClient | null {
  if (cachedClient) return cachedClient;
  if (!memorySupabaseUrl || !memorySupabaseAnonKey) return null;
  try {
    cachedClient = createClient(memorySupabaseUrl, memorySupabaseAnonKey, {
      auth: {
        persistSession: false, // NO localStorage or sessionStorage!
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
    console.warn("Failed to initialize Supabase client:", err);
    return null;
  }
}

// -------------------------------------------------------------
// 1. REAL-TIME BROADCASTS (Supabase Realtime Channel + DB Sync)
// -------------------------------------------------------------
export function subscribeToRealtimeBroadcasts(
  onBroadcastReceived: (broadcast: RealtimeBroadcast) => void
): () => void {
  const client = getSupabase();
  if (!client) {
    // If Supabase credentials not set, fallback to server event polling
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/broadcasts");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.broadcasts) && data.broadcasts.length > 0) {
            // notify latest
            onBroadcastReceived(data.broadcasts[0]);
          }
        }
      } catch (e) {
        /* ignore */
      }
    }, 8000);
    return () => clearInterval(interval);
  }

  try {
    const channel = client
      .channel("crime_branch_broadcasts")
      .on("broadcast", { event: "new_alert" }, (payload) => {
        if (payload?.payload) {
          onBroadcastReceived(payload.payload as RealtimeBroadcast);
        }
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "operational_broadcasts" },
        (payload) => {
          if (payload?.new) {
            onBroadcastReceived(payload.new as RealtimeBroadcast);
          }
        }
      )
      .subscribe();

    realtimeChannel = channel;

    return () => {
      try {
        client.removeChannel(channel);
      } catch (e) {
        /* ignore */
      }
    };
  } catch (err) {
    console.warn("Realtime channel subscription error:", err);
    return () => {};
  }
}

export async function dispatchRealtimeBroadcast(
  broadcast: RealtimeBroadcast
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  
  // 1. Send via Supabase if client exists
  if (client) {
    try {
      // Send real-time broadcast message to all active tabs/devices
      await client.channel("crime_branch_broadcasts").send({
        type: "broadcast",
        event: "new_alert",
        payload: broadcast
      });

      // Insert into Supabase table
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

  // 2. Also sync to backend server for guaranteed persistence & fallback
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
        return data.map((b: any) => ({
          id: b.id || String(b.created_at),
          title: b.title,
          messageGu: b.message_gu || b.messageGu || "",
          messageEn: b.message_en || b.messageEn || "",
          priority: b.priority || "normal",
          author: b.author || "Super Admin",
          createdAt: b.created_at || b.createdAt,
          active: b.active !== false
        }));
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
      return json.broadcasts || [];
    }
  } catch (e) {
    /* ignore */
  }
  return [];
}

// -------------------------------------------------------------
// 2. PERSONNEL ROSTER SYNC (Supabase-Only, No LocalStorage)
// -------------------------------------------------------------
export async function syncPersonnelToSupabase(
  personnelList: Personnel[],
  user = "Super Admin"
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabase();

  if (client) {
    try {
      // Upsert into Supabase table crime_branch_personnel
      const rows = personnelList.map((p) => ({
        id: p.id,
        sr_no: p.srNo,
        code: p.code,
        designation: p.designation,
        badge_no: p.badgeNo,
        name: p.name,
        mobile: p.mobile,
        duty_place: p.dutyPlace,
        appointment: p.appointment,
        report_date: p.reportDate,
        birth_date: p.birthDate,
        recruited_date: p.recruitedDate,
        retirement_date: p.retirementDate,
        aadhar_no: p.aadharNo,
        pan_no: p.panNo,
        blood_group: p.bloodGroup,
        weapon_no: p.weaponNo,
        avatar_url: p.avatarUrl,
        notes: p.notes,
        custom_fields: p.customFields || {}
      }));

      const { error } = await client.from("crime_branch_personnel").upsert(rows, { onConflict: "id" });
      if (!error) {
        console.log(`Synced ${rows.length} records to Supabase`);
      }
    } catch (e: any) {
      console.warn("Supabase personnel upsert error:", e?.message);
    }
  }

  // Always sync to server database as persistent cloud storage relay
  try {
    const res = await fetch("/api/personnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personnel: personnelList,
        user,
        reason: "Synced to Supabase & Central DB"
      })
    });
    return { success: res.ok, count: personnelList.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message };
  }
}

export async function loadPersonnelFromSupabase(): Promise<Personnel[] | null> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("crime_branch_personnel")
        .select("*")
        .order("sr_no", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          srNo: r.sr_no,
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
        }));
      }
    } catch (e) {
      console.warn("Failed to load from Supabase:", e);
    }
  }

  // Fallback to server DB
  try {
    const res = await fetch("/api/personnel");
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.personnel) && json.personnel.length > 0) {
        return json.personnel;
      }
    }
  } catch (e) {
    /* ignore */
  }
  return null;
}

// -------------------------------------------------------------
// 3. SQUAD TASKS (Daily, Weekly, Monthly)
// -------------------------------------------------------------
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

  // Server route fallback
  try {
    const res = await fetch("/api/squad-tasks");
    if (res.ok) {
      const json = await res.json();
      return json.tasks || [];
    }
  } catch (e) {
    /* ignore */
  }
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
    } catch (e) {
      /* ignore */
    }
  }

  try {
    const res = await fetch(`/api/squad-tasks/${taskId}`, { method: "DELETE" });
    return { success: res.ok };
  } catch (e) {
    return { success: false };
  }
}

// -------------------------------------------------------------
// 4. ACTIVE USERS & ROLE MANAGEMENT (Super Admin can change roles)
// -------------------------------------------------------------
export async function fetchUsers(): Promise<AppUserRecord[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("app_users").select("*").order("last_active", { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
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

  try {
    const res = await fetch("/api/users");
    if (res.ok) {
      const json = await res.json();
      return json.users || [];
    }
  } catch (e) {
    /* ignore */
  }
  return [];
}

export async function recordUserSession(user: AppUserRecord): Promise<void> {
  const client = getSupabase();
  if (client) {
    try {
      await client.from("app_users").upsert({
        id: user.id,
        name: user.name,
        badge_no: user.badgeNo,
        mobile: user.mobile,
        role: user.role,
        last_active: user.lastActive,
        login_time: user.loginTime,
        device: user.device
      });
    } catch (e) {
      /* ignore */
    }
  }

  try {
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });
  } catch (e) {
    /* ignore */
  }
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

// -------------------------------------------------------------
// 5. SQL SCHEMA HELPER FOR USER (for manual Supabase SQL Editor if desired)
// -------------------------------------------------------------
export const SUPABASE_SQL_SCHEMA = `-- Crime Branch Gujarat Police: Supabase Database Schema
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

-- Enable Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE operational_broadcasts;
`;
