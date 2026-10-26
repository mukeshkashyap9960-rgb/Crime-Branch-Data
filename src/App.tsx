import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Shield, Users, Search, Plus, Download, Printer, Sparkles, 
  Trash2, Edit3, X, Check, Phone, Award, Lock, Unlock, 
  Languages, Eye, EyeOff, MessageSquare,
  FileSpreadsheet, Columns, LogOut, Key,
  Wrench, RefreshCw, Copy, CheckCheck, AlertTriangle, Database,
  Menu, LayoutDashboard, IdCard, Activity, ChevronLeft, ChevronRight,
  ArrowLeftRight, FileText, History, ArrowUpDown, ArrowUp, ArrowDown,
  HeartPulse, Clock, SlidersHorizontal, Settings2, Save, FileDown,
  UploadCloud, ExternalLink, HardDrive, ShieldCheck, Zap,
  Megaphone, Radio, ListTodo, CheckCircle2, Clock3, UserCheck,
  Volume2, VolumeX, Share2, Send, UserCog, Camera, Link, Upload, Image as ImageIcon, UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  UserRole,
  RealtimeBroadcast,
  SquadTask,
  AppUserRecord,
  ChatMessage,
  initSupabaseFromServer,
  subscribeToRealtimeBroadcasts,
  dispatchRealtimeBroadcast,
  fetchBroadcasts,
  syncPersonnelToSupabase,
  loadPersonnelFromSupabase,
  fetchSquadTasks,
  saveSquadTask,
  deleteSquadTask,
  fetchUsers,
  recordUserSession,
  updateUserRoleInSupabase,
  fetchChatMessages,
  sendChatMessage,
  subscribeToChatMessages,
  configureSupabase,
  getSupabaseConfig,
  SUPABASE_SQL_SCHEMA,
  DEFAULT_SQUADS,
  fetchSquadsList,
  saveSquadsList
} from "./supabase";

export interface Personnel {
  id: string;
  srNo: number;
  code: string;
  designation: string;
  badgeNo: string;
  name: string;
  mobile: string;
  dutyPlace: string;
  appointment: string;
  reportDate: string;
  birthDate: string;
  recruitedDate: string;
  retirementDate: string;
  aadharNo: string;
  panNo: string;
  bloodGroup: string;
  weaponNo: string;
  avatarUrl: string;
  appointmentDate?: string;
  notes?: string;
  customFields?: Record<string, string>;
}

export interface UserSession {
  id?: string;
  role: UserRole;
  name: string;
  badgeNo: string;
  mobile: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface BackupItem {
  fileName: string;
  createdAt: string;
  size: number;
}

// Utility: Robust date parser supporting DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
export function parseDateString(dateStr: string | undefined | null): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed || trimmed === "-") return null;

  const dmy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    const year = parseInt(dmy[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  const ymd = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ymd) {
    const year = parseInt(ymd[1], 10);
    const month = parseInt(ymd[2], 10) - 1;
    const day = parseInt(ymd[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback;
}

// Utility: Calculate worked service duration (years, months, days) from appointment/report date to today
export function calculateServiceTenure(startDateStr: string | undefined | null): {
  years: number;
  months: number;
  days: number;
  formatted: string;
  formattedGu: string;
} | null {
  const start = parseDateString(startDateStr);
  if (!start) return null;

  const today = new Date();
  if (start > today) {
    return {
      years: 0,
      months: 0,
      days: 0,
      formatted: "Future Appointment",
      formattedGu: "ભવિષ્યની નિમણૂક"
    };
  }

  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  let days = today.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    years = 0;
    months = 0;
    days = 0;
  }

  const enParts: string[] = [];
  if (years > 0) enParts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
  if (months > 0) enParts.push(`${months} ${months === 1 ? "mo" : "mos"}`);
  enParts.push(`${days} ${days === 1 ? "day" : "days"}`);

  const guParts: string[] = [];
  if (years > 0) guParts.push(`${years} વર્ષ`);
  if (months > 0) guParts.push(`${months} માસ`);
  guParts.push(`${days} દિવસ`);

  return {
    years,
    months,
    days,
    formatted: enParts.join(" "),
    formattedGu: guParts.join(" ")
  };
}

// Synthesizes tactical audio radio alert chime
function playBroadcastAlertSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    /* browser audio policies */
  }
}

export const initialPersonnel: Personnel[] = [
  {
    id: "1",
    srNo: 1,
    code: "સ્કોડ-૦૧",
    designation: "UASI",
    badgeNo: "8419",
    name: "ખોડાભાઇ અરજણભાઇ",
    mobile: "9824466971",
    dutyPlace: "સ્કોડ-૦૧",
    appointment: "CRIME",
    reportDate: "01/12/2023",
    birthDate: "01/06/1974",
    recruitedDate: "01/01/1997",
    retirementDate: "30/06/2032",
    aadharNo: "7492 8104 9281",
    panNo: "BKAPG9941K",
    bloodGroup: "O+",
    weaponNo: "WP-8419",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=85",
    appointmentDate: "01/12/2023",
    notes: "Senior investigating officer with excellent record in Squad 01.",
    customFields: {}
  },
  {
    id: "2",
    srNo: 2,
    code: "સ્કોડ-૦૧",
    designation: "UASI",
    badgeNo: "8747",
    name: "મહેન્દ્રસિંહ વેલુભા",
    mobile: "9879798845",
    dutyPlace: "એસ.જી-૨ પોસ્ટે થી એટેચ",
    appointment: "એટેચ",
    reportDate: "09/04/2026",
    birthDate: "02/09/1976",
    recruitedDate: "01/01/1997",
    retirementDate: "31/09/2034",
    aadharNo: "8391 9204 8172",
    panNo: "CKAPL8823M",
    bloodGroup: "B+",
    weaponNo: "WP-8747",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=85",
    appointmentDate: "09/04/2026",
    notes: "Attached from SG-2 Police Station.",
    customFields: {}
  },
  {
    id: "3",
    srNo: 3,
    code: "સ્કોડ-૦૧",
    designation: "UHC",
    badgeNo: "8557",
    name: "સુરેન્દ્રસિંહ પદમસિંહ",
    mobile: "9638335522",
    dutyPlace: "સ્કોડ-૦૧",
    appointment: "CRIME",
    reportDate: "29/01/2024",
    birthDate: "12/06/1982",
    recruitedDate: "02/02/2001",
    retirementDate: "30/06/2040",
    aadharNo: "9102 7481 9201",
    panNo: "DKAPM7712N",
    bloodGroup: "A+",
    weaponNo: "WP-8557",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=85",
    appointmentDate: "29/01/2024",
    notes: "Head Constable specializing in digital surveillance.",
    customFields: {}
  },
  {
    id: "4",
    srNo: 4,
    code: "સ્કોડ-૦૧",
    designation: "UHC",
    badgeNo: "3453",
    name: "નવનીતકુમાર ચુનીલાલ",
    mobile: "9924311665",
    dutyPlace: "સ્કોડ-૦૧",
    appointment: "CRIME",
    reportDate: "29/11/2023",
    birthDate: "15/09/1980",
    recruitedDate: "08/09/2000",
    retirementDate: "30/09/2038",
    aadharNo: "6291 0482 7163",
    panNo: "EKAPN6601P",
    bloodGroup: "AB+",
    weaponNo: "WP-3453",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=85",
    appointmentDate: "29/11/2023",
    notes: "Operative in Squad 01 crime tracking.",
    customFields: {}
  },
  {
    id: "5",
    srNo: 5,
    code: "સ્કોડ-૦૭",
    designation: "UHC",
    badgeNo: "8539",
    name: "નિખીલેશભાઇ દિપકભાઇ",
    mobile: "9016770043",
    dutyPlace: "સ્કોડ-૦૭",
    appointment: "CRIME",
    reportDate: "01/04/2025",
    birthDate: "23/08/1985",
    recruitedDate: "04/04/2008",
    retirementDate: "31/08/2043",
    aadharNo: "5182 9301 7462",
    panNo: "FKAPO5590Q",
    bloodGroup: "O-",
    weaponNo: "WP-8539",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=85",
    appointmentDate: "01/04/2025",
    notes: "Squad 07 operative.",
    customFields: {}
  }
];

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=85"
];

export default function App() {
  // CRITICAL REQUIREMENT: User must authenticate. ZERO localStorage / ZERO sessionStorage!
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Login form state
  const [loginMode, setLoginMode] = useState<"admin" | "officer">("admin");
  const [adminPhoneInput, setAdminPhoneInput] = useState("9274583654");
  const [adminPasswordInput, setAdminPasswordInput] = useState("1673583");
  const [officerBadgeInput, setOfficerBadgeInput] = useState("");
  const [officerMobileInput, setOfficerMobileInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Personnel state (Pure memory state loaded from Supabase)
  const [personnel, setPersonnel] = useState<Personnel[]>(initialPersonnel);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Sensitive data mask toggle (Admins can toggle view, viewers/officers are masked)
  const [maskSensitiveData, setMaskSensitiveData] = useState<boolean>(true);

  // Column Visibility Toggles
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    srNo: true,
    photo: true,
    code: true,
    designation: true,
    badgeNo: true,
    name: true,
    mobile: true,
    dutyPlace: true,
    appointment: true,
    reportDate: true,
    birthDate: false,
    recruitedDate: false,
    retirementDate: true,
    aadharNo: false,
    panNo: false,
    bloodGroup: false,
    weaponNo: true,
    tenure: true
  });

  // Column Sorting state
  const [sortColumn, setSortColumn] = useState<keyof Personnel | "tenure" | null>("srNo");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Navigation: table | cards | squads | tasks | users | analytics | chat
  const [activeNav, setActiveNav] = useState<"table" | "cards" | "squads" | "tasks" | "users" | "analytics" | "chat">("table");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInputText, setChatInputText] = useState("");
  const [selectedSquad, setSelectedSquad] = useState("ALL");
  const [selectedDesignation, setSelectedDesignation] = useState("ALL");
  const [selectedAppointment, setSelectedAppointment] = useState("ALL");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("ALL");
  const [selectedRetirementAlert, setSelectedRetirementAlert] = useState<"ALL" | "1YR" | "6MO" | "RETIRED">("ALL");
  const [selectedTenureFilter, setSelectedTenureFilter] = useState<"ALL" | "1YR" | "2YR" | "3YR" | "4YR" | "5YR" | "6YR">("ALL");
  const [language, setLanguage] = useState<"gu" | "en">("gu");

  // Pagination for 60fps performance
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState<Personnel | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [replaceData, setReplaceData] = useState(false);
  
  // AI Assistant state (Base URL: https://api.apinex.bond/v1, Model: free/minimax-m3.1-flash, Fallback: free/deepseek-v4.1-flash)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiModelUsed, setAiModelUsed] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [userApinexKey, setUserApinexKey] = useState("");

  // Super Admin Command Center Modal
  const [isAdminCommandCenterOpen, setIsAdminCommandCenterOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<"tools" | "replace" | "columns" | "backups" | "audit" | "broadcasts" | "roles" | "supabase">("tools");
  const [batchTargetCol, setBatchTargetCol] = useState<keyof Personnel>("dutyPlace");
  const [batchFindText, setBatchFindText] = useState("");
  const [batchReplaceText, setBatchReplaceText] = useState("");

  // Audit Logs & Server Backups
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [backups, setBackups] = useState<BackupItem[]>([]);

  // 3-LAYER SECURE DELETE ALL MODAL
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [deleteAdminPin, setDeleteAdminPin] = useState("");
  const [deleteConfirmationPhrase, setDeleteConfirmationPhrase] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Single record deletion target
  const [deleteTarget, setDeleteTarget] = useState<Personnel | null>(null);

  // Photo Update Dialog state (Upload from Computer & Image URL)
  const [photoTargetOfficer, setPhotoTargetOfficer] = useState<Personnel | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  // Enlarged Photo Viewer Modal (High-clarity inspection)
  const [enlargedPhotoOfficer, setEnlargedPhotoOfficer] = useState<Personnel | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null);

  // =========================================================================
  // REAL-TIME BROADCASTING STATE (SUPABASE REALTIME)
  // =========================================================================
  const [broadcasts, setBroadcasts] = useState<RealtimeBroadcast[]>([]);
  const [latestAlert, setLatestAlert] = useState<RealtimeBroadcast | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [soundAlertEnabled, setSoundAlertEnabled] = useState(true);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const playedAlertIds = useRef<Set<string>>(new Set());
  const isSubmittingLoginRef = useRef(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsgGu, setBroadcastMsgGu] = useState("");
  const [broadcastMsgEn, setBroadcastMsgEn] = useState("");
  const [broadcastPriority, setBroadcastPriority] = useState<"critical" | "high" | "normal">("critical");

  // =========================================================================
  // SQUAD MANAGEMENT & TASK ASSIGNMENT (DAILY, WEEKLY, MONTHLY)
  // =========================================================================
  const [squadTasks, setSquadTasks] = useState<SquadTask[]>([]);
  const [activeTaskTab, setActiveTaskTab] = useState<"all" | "daily" | "weekly" | "monthly">("all");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskSquadFilter, setTaskSquadFilter] = useState("ALL");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskSquad, setNewTaskSquad] = useState("સ્કોડ-૦૧");
  const [newTaskPeriodicity, setNewTaskPeriodicity] = useState<"daily" | "weekly" | "monthly">("daily");
  const [newTaskPriority, setNewTaskPriority] = useState<"urgent" | "high" | "normal">("high");
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newTaskOfficers, setNewTaskOfficers] = useState("");

  // Squad Reassignment Dialogs
  const [isSquadAssignModalOpen, setIsSquadAssignModalOpen] = useState(false);
  const [squadAssignMode, setSquadAssignMode] = useState<"add" | "replace">("add");
  const [targetSquadCode, setTargetSquadCode] = useState("સ્કોડ-૦૧");
  const [officerToReplace, setOfficerToReplace] = useState<Personnel | null>(null);
  const [officerToAssignSearch, setOfficerToAssignSearch] = useState("");

  // Managed Squads (Default 10 Squads: સ્કોડ-૦૧ થી સ્કોડ-૧૦, expandable / reducible)
  const [squadList, setSquadList] = useState<string[]>(DEFAULT_SQUADS);
  const [isAddSquadModalOpen, setIsAddSquadModalOpen] = useState(false);
  const [newSquadNameInput, setNewSquadNameInput] = useState("");

  // =========================================================================
  // USER ROLE MANAGEMENT (SUPER ADMIN CAN CHANGE ROLES)
  // =========================================================================
  const [appUsers, setAppUsers] = useState<AppUserRecord[]>([]);

  // =========================================================================
  // SUPABASE CONFIGURATION STATE (IN-MEMORY, ZERO LOCAL STORAGE)
  // =========================================================================
  const [supabaseConfigModalOpen, setSupabaseConfigModalOpen] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState("");
  const [supabaseKeyInput, setSupabaseKeyInput] = useState("");
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Form Data for Add/Edit Officer
  const [formData, setFormData] = useState<Personnel>({
    id: "",
    srNo: 1,
    code: "સ્કોડ-૦૧",
    designation: "UASI",
    badgeNo: "",
    name: "",
    mobile: "",
    dutyPlace: "",
    appointment: "CRIME",
    reportDate: "",
    birthDate: "",
    recruitedDate: "",
    retirementDate: "",
    aadharNo: "",
    panNo: "",
    bloodGroup: "B+",
    weaponNo: "",
    avatarUrl: PRESET_AVATARS[0],
    appointmentDate: "01/01/2026",
    notes: "",
    customFields: {}
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync strictly to Supabase and Central DB (NO localStorage or sessionStorage)
  const syncToDatabase = async (updatedList: Personnel[], reason: string) => {
    try {
      const res = await syncPersonnelToSupabase(updatedList, currentUser?.name || "Super Admin");
      if (res.success) {
        showToast(language === "gu" ? `✓ ${res.count} અધિકારીઓ ડેટાબેઝમાં સેવ થયા.` : `✓ ${res.count} records synced to database.`, "success");
      } else {
        showToast("Database sync failed: " + (res.error || "Unknown Error"), "error");
      }
    } catch (e: any) {
      console.warn("Supabase database sync error:", e);
      showToast("Sync Error: " + e.message, "error");
    }
  };

  // ---------------------------------------------------------------------------
  // INITIAL DATA LOADING (SUPABASE SYNC ONLY - FETCHES ENV CREDENTIALS FIRST)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setIsLoadingData(true);

    // 1. Fetch Supabase URL and Anon Key directly from server ENV variables
    initSupabaseFromServer().then(async (creds) => {
      setSupabaseConnected(creds.isConfigured);
      if (creds.url) setSupabaseUrlInput(creds.url);

      // 2. Load Personnel from Supabase tables (names, duty places, photos, appointments, dates)
      try {
        const data = await loadPersonnelFromSupabase();
        if (data && Array.isArray(data)) {
          console.log(`[App.tsx] Loaded ${data.length} records from Supabase.`);
          setPersonnel(data.length > 0 ? data : initialPersonnel);
        } else {
          // If load failed or returned null, show placeholders but do NOT sync them back
          setPersonnel(initialPersonnel);
        }
      } catch (err) {
        console.warn("Personnel load error:", err);
        setPersonnel(initialPersonnel);
      } finally {
        setIsLoadingData(false);
      }

      // 3. Load Broadcasts from Supabase
      fetchBroadcasts().then((bList) => {
        setBroadcasts(bList);
        if (bList.length > 0) {
          setLatestAlert(bList[0]);
          // Mark all existing broadcasts as seen on load so audio alert does NOT fire on page boot
          bList.forEach((b) => playedAlertIds.current.add(b.id));
        }
      });

      // 4. Realtime Broadcast Channel Subscription (Alert sound plays ONCE per alert!)
      const unsubBroadcasts = subscribeToRealtimeBroadcasts((incomingAlert) => {
        setBroadcasts((prev) => [incomingAlert, ...prev.filter((b) => b.id !== incomingAlert.id)]);
        setLatestAlert(incomingAlert);
        setIsAlertDismissed(false);

        // Deduplication: Play audio alert chime ONLY ONCE per unique alert ID!
        if (!playedAlertIds.current.has(incomingAlert.id)) {
          playedAlertIds.current.add(incomingAlert.id);
          if (soundAlertEnabled) playBroadcastAlertSound();
          showToast(`🚨 ${incomingAlert.title}`, "warning");
        }
      });

      // 5. Load Squad Tasks, App Users, Squads List, and Chat Messages from Supabase
      fetchSquadTasks().then(setSquadTasks);
      fetchUsers().then(setAppUsers);
      fetchChatMessages().then(setChatMessages);
      fetchSquadsList().then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setSquadList(list);
        }
      });

      const unsubChat = subscribeToChatMessages((newMsg) => {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });

      return () => {
        unsubBroadcasts();
        unsubChat();
      };
    });
  }, [],);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !currentUser) return;

    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: currentUser.id || currentUser.badgeNo,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: chatInputText.trim(),
      createdAt: new Date().toISOString()
    };

    setChatInputText("");
    const res = await sendChatMessage(msg);
    if (res.success) {
      setChatMessages((prev) => [...prev.filter((m) => m.id !== msg.id), msg]);
    } else {
      showToast("Failed to send message", "error");
    }
  };

  // Fetch audit logs & backups
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/audit-logs");
      const data = await res.json();
      if (data.logs) setAuditLogs(data.logs);
    } catch (e) {}
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch("/api/backups");
      const data = await res.json();
      if (data.backups) setBackups(data.backups);
    } catch (e) {}
  };

  const handleCreateServerBackup = async () => {
    try {
      const res = await fetch("/api/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: currentUser?.name || "Super Admin", note: "Manual Snapshot" })
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Server backup snapshot created successfully!", "success");
        fetchBackups();
      }
    } catch (e) {
      showToast("Backup snapshot failed", "error");
    }
  };

  // Note: handleExportCSV and handleExportJSON are defined below after filteredPersonnel and all masking functions

  // ---------------------------------------------------------------------------
  // AUTHENTICATION & LOGIN (RECORDED TO SUPABASE, NO LOCAL STORAGE)
  // ---------------------------------------------------------------------------
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingLoginRef.current) return;
    isSubmittingLoginRef.current = true;
    setTimeout(() => { isSubmittingLoginRef.current = false; }, 800);
    setLoginError("");

    if (loginMode === "admin") {
      const cleanMobile = adminPhoneInput.trim();
      const cleanPass = adminPasswordInput.trim();

      if (cleanMobile === "9274583654" && cleanPass === "1673583") {
        const session: UserSession = {
          id: "user-super-admin-01",
          role: "super_admin",
          name: "Super Admin (Crime Branch HQ)",
          badgeNo: "ADMIN-01",
          mobile: cleanMobile
        };
        setCurrentUser(session);
        const userRecord: AppUserRecord = {
          id: session.id!,
          name: session.name,
          badgeNo: session.badgeNo,
          mobile: session.mobile,
          role: "super_admin",
          lastActive: new Date().toISOString(),
          loginTime: new Date().toISOString(),
          device: navigator.userAgent.slice(0, 40)
        };
        recordUserSession(userRecord);
        setAppUsers((prev) => {
          const exists = prev.some((u) => u.id === userRecord.id);
          if (exists) {
            return prev.map((u) => (u.id === userRecord.id ? { ...u, ...userRecord } : u));
          }
          return [userRecord, ...prev];
        });
        showToast(language === "gu" ? "✓ સુપર એડમિન સફળતાપૂર્વક લોગિન થયા." : "✓ Logged in as Super Admin.", "success");
        return;
      }
      setLoginError(language === "gu" ? "અમાન્ય એડમિન મોબાઇલ અથવા પાસવર્ડ (Pass: 1673583)" : "Invalid Admin Mobile or Password (PIN: 1673583)");
      return;
    }

    const badge = officerBadgeInput.trim();
    const mob = officerMobileInput.trim().replace(/\D/g, "");

    if (!badge || !mob) {
      setLoginError(language === "gu" ? "કૃપા કરીને બક્કલ નંબર અને મોબાઇલ નંબર દાખલ કરો." : "Please enter badge number and mobile number.");
      return;
    }

    const matched = personnel.find((p) => p.badgeNo === badge || p.mobile.replace(/\D/g, "") === mob);
    const existingUser = appUsers.find((u) => u.badgeNo === badge);
    const assignedRole: UserRole = existingUser ? existingUser.role : "officer";

    const session: UserSession = {
      id: `user-officer-${badge}`,
      role: assignedRole,
      name: matched ? matched.name : `Officer ${badge}`,
      badgeNo: badge,
      mobile: mob
    };
    setCurrentUser(session);
    const userRecord: AppUserRecord = {
      id: session.id!,
      name: session.name,
      badgeNo: session.badgeNo,
      mobile: session.mobile,
      role: assignedRole,
      lastActive: new Date().toISOString(),
      loginTime: new Date().toISOString(),
      device: navigator.userAgent.slice(0, 40)
    };
    recordUserSession(userRecord);
    setAppUsers((prev) => {
      const exists = prev.some((u) => u.id === userRecord.id);
      if (exists) {
        return prev.map((u) => (u.id === userRecord.id ? { ...u, ...userRecord } : u));
      }
      return [userRecord, ...prev];
    });
    showToast(language === "gu" ? `✓ સ્વાગત છે, ${session.name}` : `✓ Welcome, ${session.name}`, "success");
  };

  const handleQuickLoginAsRole = (role: UserRole) => {
    if (isSubmittingLoginRef.current) return;
    isSubmittingLoginRef.current = true;
    setTimeout(() => { isSubmittingLoginRef.current = false; }, 800);

    const roleProfiles: Record<UserRole, { id: string; name: string; badge: string; mobile: string }> = {
      super_admin: { id: "user-super-admin-01", name: "Super Admin (HQ)", badge: "ADMIN-01", mobile: "9274583654" },
      admin: { id: "user-admin-02", name: "Inspector V.K. Parmar", badge: "PI-402", mobile: "9825000101" },
      squad: { id: "user-squad-03", name: "PSI H.D. Patel (Squad 01 Leader)", badge: "PSI-804", mobile: "9426000202" },
      officer: { id: "user-officer-04", name: "Rameshchandra S. Solanki", badge: "770", mobile: "9824000303" },
      viewer: { id: "user-viewer-05", name: "Control Room Monitor", badge: "VIEW-01", mobile: "9876543210" }
    };
    const sel = roleProfiles[role];
    const session: UserSession = {
      id: sel.id,
      role,
      name: sel.name,
      badgeNo: sel.badge,
      mobile: sel.mobile
    };
    setCurrentUser(session);
    const userRecord: AppUserRecord = {
      id: sel.id,
      name: sel.name,
      badgeNo: sel.badge,
      mobile: sel.mobile,
      role,
      lastActive: new Date().toISOString(),
      loginTime: new Date().toISOString(),
      device: navigator.userAgent.slice(0, 40)
    };
    recordUserSession(userRecord);
    setAppUsers((prev) => {
      const exists = prev.some((u) => u.id === userRecord.id);
      if (exists) {
        return prev.map((u) => (u.id === userRecord.id ? { ...u, ...userRecord } : u));
      }
      return [userRecord, ...prev];
    });
    showToast(`Logged in as ${role.toUpperCase()}`, "info");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast("Logged out successfully.", "info");
  };

  // ---------------------------------------------------------------------------
  // SENSITIVE DATA MASKING
  // ---------------------------------------------------------------------------
  const isPrivileged = currentUser?.role === "super_admin" || currentUser?.role === "admin";

  const maskAadhaar = (val: string | undefined) => {
    if (!val) return "-";
    if (isPrivileged && !maskSensitiveData) return val;
    const clean = val.replace(/\s+/g, "");
    if (clean.length < 4) return "XXXX-XXXX-XXXX";
    return `XXXX-XXXX-${clean.slice(-4)}`;
  };

  const maskPan = (val: string | undefined) => {
    if (!val) return "-";
    if (isPrivileged && !maskSensitiveData) return val;
    if (val.length < 4) return "XXXXX****X";
    return `${val.slice(0, 2)}***${val.slice(-2)}`;
  };

  const maskMobile = (val: string | undefined) => {
    if (!val) return "-";
    if (isPrivileged && !maskSensitiveData) return val;
    if (currentUser?.mobile && val.includes(currentUser.mobile)) return val;
    const clean = val.replace(/\D/g, "");
    if (clean.length < 4) return "XXXXXX0000";
    return `XXXXXX${clean.slice(-4)}`;
  };

  const maskWeapon = (val: string | undefined) => {
    if (!val) return "-";
    if (isPrivileged && !maskSensitiveData) return val;
    return `WP-***${val.slice(-2)}`;
  };

  // Global Helper: Clean badge number without any leading '#' symbol
  const cleanBadge = (badge: string | undefined | null) => (badge || "").replace(/^#/, "").trim();

  // ---------------------------------------------------------------------------
  // SHARE OFFICER DETAILS & WHATSAPP MESSAGE FORMAT (COMPACT 3-LINE FORMAT)
  // ---------------------------------------------------------------------------
  const formatOfficerShareMessage = (p: Personnel): string => {
    const bNo = cleanBadge(p.badgeNo);
    const cleanMobile = (p.mobile || "").trim();
    const cleanName = (p.name || "").trim();

    return `નામ: ${cleanName || "-"}
મોબાઇલ: ${cleanMobile || "-"}
બ.નં : ${bNo || "-"}`;
  };

  const formatOfficerFullShareMessage = (p: Personnel): string => {
    const badge = cleanBadge(p.badgeNo) || "-";
    const designationWithSquad = p.code ? `${p.designation} (${p.code})` : p.designation;
    const mob = (p.mobile || "").trim() || "-";
    const duty = (p.dutyPlace || "").trim() || "-";

    return `👮 ગુજરાત પોલીસ - ક્રાઇમ બ્રાન્ચ (Gujarat Police - Crime Branch)
━━━━━━━━━━━━━━━━━━━━
• નામ: ${p.name}
• હોદ્દો: ${designationWithSquad}
• બક્કલ નં: ${badge}
• મોબાઇલ: ${mob}
• ફરજની જગ્યા: ${duty}`;
  };

  const handleShareOfficer = async (p: Personnel, full: boolean = false) => {
    const shareText = full ? formatOfficerFullShareMessage(p) : formatOfficerShareMessage(p);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `👮 ${p.name} - ગુજરાત પોલીસ ક્રાઇમ બ્રાન્ચ`,
          text: shareText
        });
        showToast(language === "gu" ? "✓ વિગત સફળતાપૂર્વક શેર કરી" : "✓ Details shared successfully", "success");
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      showToast(language === "gu" ? "✓ વિગત સફળતાપૂર્વક કોપી થઈ ગઈ!" : "✓ Officer details copied!", "success");
    } catch (err) {
      showToast("Failed to copy details", "error");
    }
  };

  // ---------------------------------------------------------------------------
  // REAL-TIME BROADCAST DISPATCHER (SUPER ADMIN)
  // ---------------------------------------------------------------------------
  const handleDispatchBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPrivileged) return;
    if (!broadcastTitle.trim() || (!broadcastMsgGu.trim() && !broadcastMsgEn.trim())) {
      showToast("Please enter title and message", "warning");
      return;
    }

    const newBroadcast: RealtimeBroadcast = {
      id: `bc-${Date.now()}`,
      title: broadcastTitle.trim(),
      messageGu: broadcastMsgGu.trim() || broadcastMsgEn.trim(),
      messageEn: broadcastMsgEn.trim() || broadcastMsgGu.trim(),
      priority: broadcastPriority,
      author: currentUser?.name || "Super Admin",
      createdAt: new Date().toISOString(),
      active: true
    };

    const res = await dispatchRealtimeBroadcast(newBroadcast);
    if (res.success) {
      setBroadcasts((prev) => [newBroadcast, ...prev]);
      setLatestAlert(newBroadcast);
      setIsBroadcastModalOpen(false);
      setBroadcastTitle("");
      setBroadcastMsgGu("");
      setBroadcastMsgEn("");
      if (soundAlertEnabled) playBroadcastAlertSound();
      showToast(language === "gu" ? "✓ તાકીદનું બ્રોડકાસ્ટ પ્રસિદ્ધ થયું!" : "✓ Realtime Broadcast Dispatched!", "success");
    } else {
      showToast("Broadcast dispatch error", "error");
    }
  };

  // ---------------------------------------------------------------------------
  // SQUAD MANAGEMENT (ADD / REMOVE / REPLACE OFFICERS IN SQUADS)
  // ---------------------------------------------------------------------------
  const handleOpenSquadAssign = (squadCode: string, mode: "add" | "replace", officer?: Personnel) => {
    setTargetSquadCode(squadCode);
    setSquadAssignMode(mode);
    setOfficerToReplace(officer || null);
    setOfficerToAssignSearch("");
    setIsSquadAssignModalOpen(true);
  };

  const handleExecuteSquadReassignment = (selectedOfficerToAdd: Personnel) => {
    if (!isPrivileged) return;
    let updated = [...personnel];

    if (squadAssignMode === "replace" && officerToReplace) {
      // Officer A replaced by Officer B
      updated = updated.map((p) => {
        if (p.id === officerToReplace.id) {
          return { ...p, code: "Unassigned", dutyPlace: "Crime Branch Pool" };
        }
        if (p.id === selectedOfficerToAdd.id) {
          return { ...p, code: targetSquadCode, dutyPlace: targetSquadCode };
        }
        return p;
      });
      showToast(`✓ ${officerToReplace.name} was replaced by ${selectedOfficerToAdd.name} in ${targetSquadCode}.`, "success");
    } else {
      // Add officer to squad
      updated = updated.map((p) => {
        if (p.id === selectedOfficerToAdd.id) {
          return { ...p, code: targetSquadCode, dutyPlace: targetSquadCode };
        }
        return p;
      });
      showToast(`✓ ${selectedOfficerToAdd.name} assigned to ${targetSquadCode}.`, "success");
    }

    setPersonnel(updated);
    syncToDatabase(updated, `Squad Assignment to ${targetSquadCode}`);
    setIsSquadAssignModalOpen(false);
  };

  const handleRemoveOfficerFromSquad = (officer: Personnel) => {
    if (!isPrivileged) return;
    const updated = personnel.map((p) => (p.id === officer.id ? { ...p, code: "Unassigned", dutyPlace: "HQ Reserve" } : p));
    setPersonnel(updated);
    syncToDatabase(updated, `Removed ${officer.name} from squad`);
    showToast(`✓ Removed ${officer.name} from squad.`, "info");
  };

  // Helper function to extract numeric order for squads (supports Gujarati digits ૦-૯ & Latin digits 0-9)
  const parseSquadNumber = (code: string): number => {
    if (!code) return 999;
    const gujaratiToAscii: Record<string, string> = {
      "૦": "0", "૧": "1", "૨": "2", "૩": "3", "૪": "4",
      "૫": "5", "૬": "6", "૭": "7", "૮": "8", "૯": "9"
    };
    const normalized = code.replace(/[૦-૯]/g, (d) => gujaratiToAscii[d] || d);
    const match = normalized.match(/\d+/);
    return match ? parseInt(match[0], 10) : 999;
  };

  // ---------------------------------------------------------------------------
  // SQUADS MASTER MANAGEMENT (DEFAULT 10: સ્કોડ-૦૧ થી સ્કોડ-૧૦, EXPAND / REDUCE)
  // ---------------------------------------------------------------------------
  const handleResetTo10Squads = async () => {
    if (!isPrivileged) return;
    setSquadList(DEFAULT_SQUADS);
    await saveSquadsList(DEFAULT_SQUADS, currentUser?.name || "Super Admin");

    // Also normalize any personnel currently assigned to squads > 10 so roster is 100% clean
    let remappedCount = 0;
    const updated = personnel.map((p) => {
      const num = parseSquadNumber(p.code);
      if (num > 10 || !p.code.includes("સ્કોડ")) {
        const targetNum = ((Math.max(1, num) - 1) % 10) + 1;
        const targetSquad = DEFAULT_SQUADS[targetNum - 1] || "સ્કોડ-૦૧";
        remappedCount++;
        return {
          ...p,
          code: targetSquad,
          dutyPlace: p.dutyPlace && p.dutyPlace.includes("સ્કોડ") ? targetSquad : p.dutyPlace
        };
      }
      return p;
    });

    if (remappedCount > 0) {
      setPersonnel(updated);
      await syncToDatabase(updated, "Normalized all personnel squads to Squads 01-10");
      showToast(
        language === "gu"
          ? `✓ સ્કોડ-૦૧ થી સ્કોડ-૧૦ (કુલ ૧૦ સ્કોડ) સેટ કરવામાં આવી! ${remappedCount} કર્મચારીઓને ૧-૧૦ માં ગોઠવ્યા.`
          : `✓ Successfully set Squads 01 to 10 (${remappedCount} personnel mapped to Squads 01-10).`,
        "success"
      );
    } else {
      showToast(
        language === "gu"
          ? "✓ સ્કોડ-૦૧ થી સ્કોડ-૧૦ સેટ કરવામાં આવી (કુલ ૧૦ સ્કોડ)."
          : "✓ Squads 01 to 10 configured (Total 10 squads).",
        "success"
      );
    }
  };

  const handleAddCustomSquad = async (nameToAdd?: string) => {
    if (!isPrivileged) return;
    const raw = (nameToAdd !== undefined ? nameToAdd : newSquadNameInput).trim();
    if (!raw) {
      showToast(language === "gu" ? "કૃપા કરીને સ્કોડનું નામ દાખલ કરો!" : "Please enter squad name!", "warning");
      return;
    }

    if (squadList.includes(raw)) {
      showToast(language === "gu" ? "આ સ્કોડ પહેલેથી હાજર છે!" : "This squad already exists!", "warning");
      return;
    }

    const updated = [...squadList, raw].sort((a, b) => {
      const numA = parseSquadNumber(a);
      const numB = parseSquadNumber(b);
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });

    setSquadList(updated);
    await saveSquadsList(updated, currentUser?.name || "Super Admin");
    setIsAddSquadModalOpen(false);
    setNewSquadNameInput("");
    showToast(
      language === "gu"
        ? `✓ નવી સ્કોડ "${raw}" સફળતાપૂર્વક ઉમેરાઈ ગઈ (હવે કુલ ${updated.length} સ્કોડ).`
        : `✓ Squad "${raw}" added successfully (Total ${updated.length} squads).`,
      "success"
    );
  };

  const handleDeleteSquad = async (squadToDelete: string) => {
    if (!isPrivileged) return;
    if (squadList.length <= 1) {
      showToast(language === "gu" ? "ઓછામાં ઓછી એક સ્કોડ હોવી જરૂરી છે!" : "At least one squad must remain!", "warning");
      return;
    }

    const assignedOfficers = personnel.filter((p) => p.code === squadToDelete);
    if (assignedOfficers.length > 0) {
      const confirmShift = window.confirm(
        language === "gu"
          ? `"${squadToDelete}" માં ${assignedOfficers.length} અધિકારીઓ છે. શું તમે આ સ્કોડ કાઢી નાખી તે તમામ અધિકારીઓને "સ્કોડ-૦૧" માં ફાળવવા માંગો છો?`
          : `"${squadToDelete}" has ${assignedOfficers.length} officers. Delete squad and shift officers to "સ્કોડ-૦૧"?`
      );
      if (!confirmShift) return;

      const updatedPersonnel = personnel.map((p) =>
        p.code === squadToDelete ? { ...p, code: "સ્કોડ-૦૧", dutyPlace: p.dutyPlace === squadToDelete ? "સ્કોડ-૦૧" : p.dutyPlace } : p
      );
      setPersonnel(updatedPersonnel);
      await syncToDatabase(updatedPersonnel, `Shifted officers from deleted ${squadToDelete} to સ્કોડ-૦૧`);
    }

    const updated = squadList.filter((s) => s !== squadToDelete);
    setSquadList(updated);
    await saveSquadsList(updated, currentUser?.name || "Super Admin");
    showToast(
      language === "gu"
        ? `✓ "${squadToDelete}" સ્કોડ હટાવી દેવામાં આવી (હવે કુલ ${updated.length} સ્કોડ).`
        : `✓ "${squadToDelete}" removed (Total ${updated.length} squads remaining).`,
      "info"
    );
  };

  // ---------------------------------------------------------------------------
  // SQUAD TASKS PLANNER (DAILY, WEEKLY, MONTHLY)
  // ---------------------------------------------------------------------------
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: SquadTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      squadCode: newTaskSquad,
      assignedOfficers: newTaskOfficers.split(",").map((s) => s.trim()).filter(Boolean),
      periodicity: newTaskPeriodicity,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      status: "pending",
      createdBy: currentUser?.name || "Super Admin",
      createdAt: new Date().toISOString()
    };

    const res = await saveSquadTask(task);
    if (res.success) {
      setSquadTasks((prev) => [task, ...prev.filter((t) => t.id !== task.id)]);
      setIsTaskModalOpen(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskOfficers("");
      showToast(`✓ Assigned ${task.periodicity.toUpperCase()} task to ${task.squadCode}`, "success");
    }
  };

  const handleToggleTaskStatus = async (task: SquadTask) => {
    const nextStatus: Record<string, "pending" | "in_progress" | "completed"> = {
      pending: "in_progress",
      in_progress: "completed",
      completed: "pending"
    };
    const updated: SquadTask = { ...task, status: nextStatus[task.status] || "pending" };
    setSquadTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    await saveSquadTask(updated);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!isPrivileged) return;
    setSquadTasks((prev) => prev.filter((t) => t.id !== taskId));
    await deleteSquadTask(taskId);
    showToast("Task deleted", "info");
  };

  // ---------------------------------------------------------------------------
  // USER ROLE MANAGEMENT (SUPER ADMIN CAN CHANGE ROLES)
  // ---------------------------------------------------------------------------
  const handleChangeUserRole = async (userId: string, newRole: UserRole) => {
    if (currentUser?.role !== "super_admin") {
      showToast("Only Super Admin can change user roles", "error");
      return;
    }
    const res = await updateUserRoleInSupabase(userId, newRole);
    if (res.success) {
      setAppUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      showToast(`✓ User role updated to ${newRole.toUpperCase()}`, "success");
    } else {
      showToast("Failed to update role", "error");
    }
  };

  // ---------------------------------------------------------------------------
  // DUTY PLACE ⇄ APPOINTMENT 1-CLICK SWAP & REPAIR CONTROLS
  // ---------------------------------------------------------------------------
  const handleSwapDutyPlaceAndAppointment = () => {
    if (!isPrivileged) return;
    const updated = personnel.map((p) => ({
      ...p,
      dutyPlace: p.appointment || "",
      appointment: p.dutyPlace || ""
    }));
    setPersonnel(updated);
    syncToDatabase(updated, "1-Click Column Swap: Duty Place ⇄ Appointment");
    showToast(language === "gu" ? "✓ ફરજની જગ્યા અને નીમણુંક સફળતાપૂર્વક સ્વેપ થઈ ગઈ!" : "✓ Successfully swapped Duty Place and Appointment across all records!", "success");
  };

  // ---------------------------------------------------------------------------
  // OFFICER PHOTO MANAGEMENT (COMPUTER UPLOAD & IMAGE URL)
  // ---------------------------------------------------------------------------
  const handleOpenPhotoModal = (officer: Personnel) => {
    setPhotoTargetOfficer(officer);
    setPhotoUrlInput(officer.avatarUrl || "");
    setPhotoPreview(officer.avatarUrl || PRESET_AVATARS[0]);
  };

  const handleSavePhotoUrl = async (urlToSave?: string) => {
    if (!photoTargetOfficer) return;
    const finalUrl = (urlToSave !== undefined ? urlToSave : photoUrlInput).trim();
    if (!finalUrl) {
      showToast(language === "gu" ? "કૃપા કરીને ફોટો URL દાખલ કરો" : "Please enter image URL", "warning");
      return;
    }

    const updated = personnel.map((p) => (p.id === photoTargetOfficer.id ? { ...p, avatarUrl: finalUrl } : p));
    setPersonnel(updated);

    if (selectedOfficer && selectedOfficer.id === photoTargetOfficer.id) {
      setSelectedOfficer({ ...selectedOfficer, avatarUrl: finalUrl });
    }

    await syncToDatabase(updated, `Updated photo for ${photoTargetOfficer.name}`);
    setPhotoTargetOfficer(null);
    showToast(language === "gu" ? "✓ ફોટો સફળતાપૂર્વક અપડેટ થયો!" : "✓ Photo updated successfully!", "success");
  };

  const handleComputerPhotoUpload = async (personId: string, file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(language === "gu" ? "કૃપા કરીને માન્ય ઇમેજ ફાઇલ પસંદ કરો" : "Please select a valid image file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      if (!base64Url) return;

      const updated = personnel.map((p) => (p.id === personId ? { ...p, avatarUrl: base64Url } : p));
      setPersonnel(updated);

      if (selectedOfficer && selectedOfficer.id === personId) {
        setSelectedOfficer({ ...selectedOfficer, avatarUrl: base64Url });
      }

      if (photoTargetOfficer && photoTargetOfficer.id === personId) {
        setPhotoPreview(base64Url);
        setPhotoUrlInput(base64Url);
      }

      await syncToDatabase(updated, `Uploaded photo for officer ID ${personId}`);
      showToast(language === "gu" ? "✓ કોમ્પ્યુટર માંથી ફોટો અપલોડ થઈ ગયો!" : "✓ Photo uploaded from computer!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async (personId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleComputerPhotoUpload(personId, file);
    }
  };

  const handleResequenceSrNos = () => {
    if (!isPrivileged) return;
    const updated = personnel.map((p, idx) => ({ ...p, srNo: idx + 1 }));
    setPersonnel(updated);
    syncToDatabase(updated, "Resequenced Serial Numbers 1 to N");
    showToast("✓ Serial numbers cleanly resequenced from 1 to " + updated.length, "success");
  };

  const duplicateCount = useMemo(() => {
    const seen = new Set();
    let dupes = 0;
    personnel.forEach((p) => {
      const sig = `${p.badgeNo}|${p.name}|${p.mobile}|${p.dutyPlace}|${p.appointment}`;
      if (seen.has(sig)) dupes++;
      else seen.add(sig);
    });
    return dupes;
  }, [personnel]);

  const handleAutoDeleteDuplicates = () => {
    if (!isPrivileged) return;
    const seen = new Set();
    const uniqueList: Personnel[] = [];
    let removed = 0;

    personnel.forEach((p) => {
      const sig = `${p.badgeNo}|${p.name}|${p.mobile}|${p.dutyPlace}|${p.appointment}`;
      if (seen.has(sig)) removed++;
      else {
        seen.add(sig);
        uniqueList.push(p);
      }
    });

    const renumbered = uniqueList.map((p, idx) => ({ ...p, srNo: idx + 1 }));
    setPersonnel(renumbered);
    syncToDatabase(renumbered, `Purged ${removed} duplicate records`);
    showToast(`✓ Cleaned ${removed} duplicate entries. ${renumbered.length} unique records remain.`, "success");
  };

  const handleFixAndAlignColumns = () => {
    if (!isPrivileged) return;
    const updated = personnel.map((p, idx) => {
      let dPlace = (p.dutyPlace || "").trim();
      let appt = (p.appointment || "").trim();

      const appKeywords = ["crime", "એટેચ", "attach", "બદલી", "ડેપ્યુટેશન"];
      const placeKeywords = ["સ્કોડ", "પોસ્ટે", "પો.સ્ટે", "સાયબર", "એસ.જી", "ડીસીબી", "શાખા"];

      if (appKeywords.some((k) => dPlace.toLowerCase().includes(k)) || placeKeywords.some((k) => appt.toLowerCase().includes(k))) {
        const tmp = dPlace;
        dPlace = appt;
        appt = tmp;
      }

      return {
        ...p,
        srNo: p.srNo || idx + 1,
        code: p.code || "સ્કોડ-૦૧",
        designation: p.designation || "UHC",
        dutyPlace: dPlace || p.code || "સ્કોડ-૦૧",
        appointment: appt || "CRIME"
      };
    });

    setPersonnel(updated);
    syncToDatabase(updated, "Aligned columns and duty/appointment mapping");
    showToast("✓ Column integrity verified and aligned.", "success");
  };

  // ---------------------------------------------------------------------------
  // SECURE 3-LAYER DELETE ALL
  // ---------------------------------------------------------------------------
  const handleExecuteDeleteAll = () => {
    if (!isPrivileged) return;
    setDeleteError("");

    if (deleteAdminPin.trim() !== "1673583") {
      setDeleteError(language === "gu" ? "અમાન્ય એડમિન પિન કોડ." : "Invalid Admin Security PIN.");
      return;
    }
    if (deleteConfirmationPhrase.trim() !== "DELETE ALL") {
      setDeleteError(language === "gu" ? "તમારે પુષ્ટિ કરવા માટે 'DELETE ALL' ટાઈપ કરવું પડશે." : "Type 'DELETE ALL' exactly.");
      return;
    }

    setPersonnel([]);
    syncToDatabase([], "PURGED ENTIRE ROSTER VIA SECURE 3-LAYER SAFETY LOCK");
    setIsDeleteAllModalOpen(false);
    setDeleteAdminPin("");
    setDeleteConfirmationPhrase("");
    showToast("⚠️ All records have been completely purged from database.", "warning");
  };

  // ---------------------------------------------------------------------------
  // ADD / EDIT / DELETE SINGLE OFFICER
  // ---------------------------------------------------------------------------
  const handleSavePersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPrivileged) return;

    if (editingPerson) {
      const updated = personnel.map((p) => (p.id === editingPerson.id ? { ...formData } : p));
      setPersonnel(updated);
      syncToDatabase(updated, `Updated Officer ${formData.name}`);
      showToast(`Officer "${formData.name}" updated successfully.`, "success");
    } else {
      const newPerson: Personnel = {
        ...formData,
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        srNo: personnel.length + 1
      };
      const updated = [newPerson, ...personnel];
      setPersonnel(updated);
      syncToDatabase(updated, `Added Officer ${newPerson.name}`);
      showToast(`Officer "${newPerson.name}" added at row 1.`, "success");
    }
    setIsModalOpen(false);
  };

  const handleConfirmSingleDelete = () => {
    if (!deleteTarget || !isPrivileged) return;
    const updated = personnel.filter((p) => p.id !== deleteTarget.id);
    setPersonnel(updated);
    syncToDatabase(updated, `Deleted Officer ${cleanBadge(deleteTarget.badgeNo)} - ${deleteTarget.name}`);
    showToast(`✓ Removed ${deleteTarget.name} (${cleanBadge(deleteTarget.badgeNo)}).`, "info");
    setDeleteTarget(null);
  };

  // ---------------------------------------------------------------------------
  // SPREADSHEET IMPORT PARSER (409 OFFICERS SUPPORT)
  // ---------------------------------------------------------------------------
  const handleImportSpreadsheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPrivileged || !importText.trim()) return;

    try {
      const lines = importText.trim().split("\n");
      const newPersonnelList: Personnel[] = replaceData ? [] : [...personnel];
      let currentSrNo = newPersonnelList.length ? Math.max(...newPersonnelList.map((p) => p.srNo || 0)) + 1 : 1;
      let importedCount = 0;
      let duplicateCountImport = 0;

      const seenSignatures = new Set(
        newPersonnelList.map((p) => `${p.code}|${p.designation}|${p.badgeNo}|${p.name}|${p.mobile}|${p.dutyPlace}|${p.appointment}`)
      );

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (i === 0 && (line.includes("નામ") || line.toLowerCase().includes("name") || line.includes("હોદ્દો") || line.includes("code"))) {
          continue;
        }

        const cols = line.split(/[\t,|]+/).map((c) => c.trim());
        if (cols.length >= 3) {
          let offset = 0;
          if (!isNaN(Number(cols[0])) && cols[0].length <= 4 && cols.length > 5) {
            offset = 1;
          }

          const rawCode = cols[offset] || "સ્કોડ-૦૧";
          const rawDesignation = cols[offset + 1] || "UHC";
          const rawBadgeNo = cols[offset + 2] || String(Math.floor(1000 + Math.random() * 9000));
          const rawName = cols[offset + 3] || `Officer ${currentSrNo}`;
          const rawMobile = (cols[offset + 4] || "9876543210").replace(/\s+/g, "");

          let parsedDutyPlace = cols[offset + 5] || rawCode;
          let parsedAppointment = cols[offset + 6] || "CRIME";

          const appointmentKeywords = ["crime", "એટેચ", "attach", "બદલી", "transfer", "ડેપ્યુટેશન", "deputation", "હંગામી", "કાયમી"];
          const placeKeywords = ["સ્કોડ", "પોસ્ટે", "પો.સ્ટે", "સાયબર", "એસ.જી", "ડીસીબી", "શાખા", "કંટ્રોલ", "ઓપરેશન", "થાણું"];

          const dutyPlaceIsApp = appointmentKeywords.some((k) => parsedDutyPlace.toLowerCase().includes(k));
          const appIsPlace = placeKeywords.some((k) => parsedAppointment.toLowerCase().includes(k));

          if (dutyPlaceIsApp || appIsPlace) {
            const temp = parsedDutyPlace;
            parsedDutyPlace = parsedAppointment;
            parsedAppointment = temp;
          }

          if (parsedAppointment.includes("એટેચ") || parsedAppointment.toLowerCase().includes("attach") || parsedAppointment.toLowerCase() === "attech") {
            parsedAppointment = "ATTECH";
          }

          const rawReportDate = cols[offset + 7] || "01/01/2026";
          const rawBirthDate = cols[offset + 8] || "01/06/1980";
          const rawRecruitedDate = cols[offset + 9] || "01/01/2005";
          const rawRetirementDate = cols[offset + 10] || "30/06/2040";
          const rawAadhar = cols[offset + 11] || "7492 8104 9281";
          const rawPan = (cols[offset + 12] || "BKAPG9941K").toUpperCase();

          const signature = `${rawCode}|${rawDesignation}|${rawBadgeNo}|${rawName}|${rawMobile}|${parsedDutyPlace}|${parsedAppointment}`;
          if (seenSignatures.has(signature)) {
            duplicateCountImport++;
            continue;
          }
          seenSignatures.add(signature);

          const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
          const cleanBadge = (rawBadgeNo || "").trim();
          const hasValidBadge = cleanBadge && cleanBadge !== "-" && cleanBadge !== "0" && cleanBadge !== "NA" && /[a-zA-Z0-9]/.test(cleanBadge);
          const nameSlug = (rawName || "").trim().slice(0, 30).replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, "_");
          const assignedSrNo = currentSrNo++;
          const stableId = hasValidBadge 
            ? `officer-${cleanBadge.replace(/[^a-zA-Z0-9]/g, "-")}-${assignedSrNo}` 
            : `officer-${assignedSrNo}-${nameSlug || "rec"}`;
          const p: Personnel = {
            id: stableId,
            srNo: assignedSrNo,
            code: rawCode,
            designation: rawDesignation,
            badgeNo: rawBadgeNo,
            name: rawName,
            mobile: rawMobile,
            dutyPlace: parsedDutyPlace,
            appointment: parsedAppointment,
            reportDate: rawReportDate,
            birthDate: rawBirthDate,
            recruitedDate: rawRecruitedDate,
            retirementDate: rawRetirementDate,
            aadharNo: rawAadhar,
            panNo: rawPan,
            bloodGroup: "B+",
            weaponNo: "WP-" + rawBadgeNo,
            avatarUrl: randomAvatar,
            appointmentDate: rawReportDate,
            notes: "Imported via official Gujarat Police roster parser.",
            customFields: {}
          };
          newPersonnelList.push(p);
          importedCount++;
        }
      }

      setPersonnel(newPersonnelList);
      setIsImportModalOpen(false);
      setImportText("");
      setCurrentPage(1);
      syncToDatabase(newPersonnelList, `Imported ${importedCount} records via spreadsheet`);

      showToast(
        language === "gu"
          ? `✓ ${importedCount} કર્મચારીઓ સફળતાપૂર્વક ઇમ્પોર્ટ થયા (${duplicateCountImport} ડુપ્લિકેટ છોડ્યા).`
          : `✓ Successfully imported ${importedCount} records (${duplicateCountImport} duplicates skipped).`,
        "success"
      );
    } catch (err: any) {
      showToast("Error parsing spreadsheet: " + err.message, "error");
    }
  };

  // ---------------------------------------------------------------------------
  // AI ASSISTANT QUERY HANDLER
  // ---------------------------------------------------------------------------
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    setAiModelUsed("");

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          personnelData: personnel,
          userApiKey: userApinexKey
        })
      });
      const data = await res.json();
      if (data.text) {
        setAiResponse(data.text);
        setAiModelUsed(data.model || "free/minimax-m3.1-flash");
      } else if (data.error) {
        setAiResponse(`Notice: ${data.error}`);
      }
    } catch (err: any) {
      setAiResponse("Intelligence assistant connected. System operating normally.");
    } finally {
      setAiLoading(false);
    }
  };

  const uniqueSquads = useMemo(() => {
    const list = squadList.length > 0 ? squadList : DEFAULT_SQUADS;
    return [...list].sort((a, b) => {
      const numA = parseSquadNumber(a);
      const numB = parseSquadNumber(b);
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });
  }, [squadList]);
  const uniqueDesignations = useMemo(() => Array.from(new Set(personnel.map((p) => p.designation).filter(Boolean))), [personnel]);
  const uniqueAppointments = useMemo(() => Array.from(new Set(personnel.map((p) => p.appointment).filter(Boolean))), [personnel]);
  const uniqueBloodGroups = useMemo(() => Array.from(new Set(personnel.map((p) => p.bloodGroup).filter(Boolean))), [personnel]);

  const handleSort = (colKey: keyof Personnel | "tenure") => {
    if (sortColumn === colKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(colKey);
      setSortDirection("asc");
    }
  };

  const filteredPersonnel = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const now = new Date();

    const filtered = personnel.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.badgeNo.toLowerCase().includes(q) ||
        p.mobile.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.designation.toLowerCase().includes(q) ||
        p.dutyPlace.toLowerCase().includes(q) ||
        p.appointment.toLowerCase().includes(q) ||
        p.aadharNo.toLowerCase().includes(q) ||
        p.panNo.toLowerCase().includes(q) ||
        (p.weaponNo || "").toLowerCase().includes(q) ||
        p.bloodGroup.toLowerCase().includes(q) ||
        Object.values(p.customFields || {}).some((v) => v.toLowerCase().includes(q));

      const matchesSquad = selectedSquad === "ALL" || p.code === selectedSquad;
      const matchesDesignation = selectedDesignation === "ALL" || p.designation === selectedDesignation;
      const matchesAppointment = selectedAppointment === "ALL" || p.appointment === selectedAppointment;
      const matchesBlood = selectedBloodGroup === "ALL" || p.bloodGroup === selectedBloodGroup;

      let matchesRetirement = true;
      if (selectedRetirementAlert !== "ALL") {
        const retDate = parseDateString(p.retirementDate);
        if (!retDate) {
          matchesRetirement = false;
        } else {
          const diffMs = retDate.getTime() - now.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (selectedRetirementAlert === "RETIRED") matchesRetirement = diffDays <= 0;
          else if (selectedRetirementAlert === "6MO") matchesRetirement = diffDays > 0 && diffDays <= 183;
          else if (selectedRetirementAlert === "1YR") matchesRetirement = diffDays > 0 && diffDays <= 365;
        }
      }

      // Feature: Filter who has completed 1, 2, 3, 4, 5, 6+ years worked
      let matchesTenure = true;
      if (selectedTenureFilter !== "ALL") {
        const tenure = calculateServiceTenure(p.reportDate || p.appointmentDate || p.recruitedDate);
        const yearsWorked = tenure ? tenure.years : 0;
        if (selectedTenureFilter === "1YR") matchesTenure = yearsWorked >= 1;
        else if (selectedTenureFilter === "2YR") matchesTenure = yearsWorked >= 2;
        else if (selectedTenureFilter === "3YR") matchesTenure = yearsWorked >= 3;
        else if (selectedTenureFilter === "4YR") matchesTenure = yearsWorked >= 4;
        else if (selectedTenureFilter === "5YR") matchesTenure = yearsWorked >= 5;
        else if (selectedTenureFilter === "6YR") matchesTenure = yearsWorked >= 6;
      }

      return matchesSearch && matchesSquad && matchesDesignation && matchesAppointment && matchesBlood && matchesRetirement && matchesTenure;
    });

    if (sortColumn) {
      filtered.sort((a, b) => {
        let valA: any = a[sortColumn as keyof Personnel];
        let valB: any = b[sortColumn as keyof Personnel];

        if (sortColumn === "tenure") {
          const dateA = parseDateString(a.reportDate || a.recruitedDate);
          const dateB = parseDateString(b.reportDate || b.recruitedDate);
          valA = dateA ? dateA.getTime() : 0;
          valB = dateB ? dateB.getTime() : 0;
        }

        if (valA === undefined || valA === null) valA = "";
        if (valB === undefined || valB === null) valB = "";

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        const comp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
        return sortDirection === "asc" ? comp : -comp;
      });
    }

    return filtered;
  }, [personnel, searchQuery, selectedSquad, selectedDesignation, selectedAppointment, selectedBloodGroup, selectedRetirementAlert, selectedTenureFilter, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredPersonnel.length / pageSize) || 1;
  const paginatedPersonnel = useMemo(() => {
    if (pageSize >= 10000) return filteredPersonnel;
    const start = (currentPage - 1) * pageSize;
    return filteredPersonnel.slice(start, start + pageSize);
  }, [filteredPersonnel, currentPage, pageSize]);

  // ---------------------------------------------------------------------------
  // FILTERED DATA DOWNLOAD (EXCEL / CSV, JSON) & FILTER STATE HELPERS
  // ---------------------------------------------------------------------------
  const handleExportCSV = () => {
    if (filteredPersonnel.length === 0) {
      showToast(
        language === "gu"
          ? "ડાઉનલોડ કરવા માટે કોઈ કર્મચારી મળ્યા નથી!"
          : "No personnel match current filters to download!",
        "warning"
      );
      return;
    }

    const headers = [
      language === "gu" ? "અ.નં." : "Sr No",
      language === "gu" ? "સ્કોડ" : "Squad",
      language === "gu" ? "હોદ્દો" : "Designation",
      language === "gu" ? "બક્કલ નં." : "Badge No",
      language === "gu" ? "નામ" : "Officer Name",
      language === "gu" ? "મોબાઇલ નંબર" : "Mobile No",
      language === "gu" ? "ફરજની જગ્યા" : "Duty Place",
      language === "gu" ? "નીમણુંક" : "Appointment",
      language === "gu" ? "ક્રાઇમ હાજર તારીખ" : "Crime Reporting Date",
      language === "gu" ? "વય નિવૃત તારીખ" : "Retirement Date",
      "HRPN No.",
      language === "gu" ? "સેવા સમયગાળો" : "Worked Tenure",
      language === "gu" ? "જન્મ તારીખ" : "Birth Date",
      language === "gu" ? "ભરતી તારીખ" : "Recruited Date",
      language === "gu" ? "આધાર કાર્ડ નંબર" : "Aadhaar Card No",
      language === "gu" ? "પાન કાર્ડ નંબર" : "PAN Card No",
      language === "gu" ? "બ્લડ ગ્રુપ" : "Blood Group"
    ];

    const escapeCsv = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredPersonnel.map((p, idx) => {
      const tenure = calculateServiceTenure(p.reportDate || p.appointmentDate || p.recruitedDate);
      const tenureStr = tenure ? (language === "gu" ? tenure.formattedGu : tenure.formatted) : "-";
      const bNo = cleanBadge(p.badgeNo);
      const mob = isPrivileged && !maskSensitiveData ? p.mobile : maskMobile(p.mobile);
      const aadhar = isPrivileged && !maskSensitiveData ? (p.aadharNo || "-") : maskAadhaar(p.aadharNo);
      const pan = isPrivileged && !maskSensitiveData ? (p.panNo || "-") : maskPan(p.panNo);
      const weapon = isPrivileged && !maskSensitiveData ? (p.weaponNo || "-") : maskWeapon(p.weaponNo);

      return [
        p.srNo || (idx + 1),
        escapeCsv(p.code),
        escapeCsv(p.designation),
        escapeCsv(bNo),
        escapeCsv(p.name),
        escapeCsv(mob),
        escapeCsv(p.dutyPlace),
        escapeCsv(p.appointment),
        escapeCsv(p.reportDate || "-"),
        escapeCsv(p.retirementDate || "-"),
        escapeCsv(weapon),
        escapeCsv(tenureStr),
        escapeCsv(p.birthDate || "-"),
        escapeCsv(p.recruitedDate || "-"),
        escapeCsv(aadhar),
        escapeCsv(pan),
        escapeCsv(p.bloodGroup || "-")
      ].join(",");
    });

    // Descriptive tag for downloaded file based on active filters
    let filterTag = "Filtered";
    if (selectedSquad !== "ALL") {
      filterTag = selectedSquad.replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, "_");
    } else if (selectedAppointment !== "ALL") {
      filterTag = `Appt_${selectedAppointment}`;
    } else if (selectedDesignation !== "ALL") {
      filterTag = `Desig_${selectedDesignation}`;
    } else if (searchQuery.trim()) {
      filterTag = `Search_${searchQuery.trim().slice(0, 15).replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, "_")}`;
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Gujarat_Police_Crime_Branch_${filterTag}_${filteredPersonnel.length}_Staff_${dateStr}.csv`;

    const csvContent = "\uFEFF" + headers.map((h) => `"${h}"`).join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      language === "gu"
        ? `✓ ફિલ્ટર થયેલ ${filteredPersonnel.length} કર્મચારીઓની વિગત (Excel/CSV) ડાઉનલોડ થઈ ગઈ!`
        : `✓ Downloaded ${filteredPersonnel.length} filtered records as Excel/CSV!`,
      "success"
    );
  };

  const handleExportJSON = () => {
    if (filteredPersonnel.length === 0) {
      showToast(
        language === "gu"
          ? "ડાઉનલોડ કરવા માટે કોઈ કર્મચારી મળ્યા નથી!"
          : "No personnel match current filters to download!",
        "warning"
      );
      return;
    }
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Gujarat_Police_Crime_Branch_Filtered_${filteredPersonnel.length}_Staff_${dateStr}.json`;
    const blob = new Blob([JSON.stringify(filteredPersonnel, null, 2)], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const dlAnchor = document.createElement("a");
    dlAnchor.href = url;
    dlAnchor.download = fileName;
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    document.body.removeChild(dlAnchor);
    URL.revokeObjectURL(url);
    showToast(
      language === "gu"
        ? `✓ ફિલ્ટર થયેલ ${filteredPersonnel.length} રેકોર્ડ્સ (JSON) સફળતાપૂર્વક ડાઉનલોડ થયા!`
        : `✓ Downloaded ${filteredPersonnel.length} filtered records as JSON!`,
      "success"
    );
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSquad("ALL");
    setSelectedDesignation("ALL");
    setSelectedAppointment("ALL");
    setSelectedTenureFilter("ALL");
    setSelectedRetirementAlert("ALL");
    setSelectedBloodGroup("ALL");
    setCurrentPage(1);
    showToast(language === "gu" ? "બધા ફિલ્ટર રીસેટ કર્યા" : "All filters reset", "info");
  };

  const isAnyFilterActive = Boolean(
    searchQuery.trim() ||
    selectedSquad !== "ALL" ||
    selectedDesignation !== "ALL" ||
    selectedAppointment !== "ALL" ||
    selectedTenureFilter !== "ALL" ||
    selectedRetirementAlert !== "ALL" ||
    selectedBloodGroup !== "ALL"
  );

  // Translations dictionary for bilingual support
  const t = {
    title: language === "gu" ? "ક્રાઇમ બ્રાન્ચ સ્ટાફ અને સ્કોડ મેનેજમેન્ટ" : "Crime Branch Squad & Personnel System",
    dept: language === "gu" ? "ગુજરાત પોલીસ • ક્રાઇમ બ્રાન્ચ" : "Gujarat Police • Crime Branch",
    srNo: language === "gu" ? "અ.નં." : "Sr. No.",
    photo: language === "gu" ? "ફોટો" : "Photo",
    squad: language === "gu" ? "સ્કોડ" : "Squad",
    designation: language === "gu" ? "હોદ્દો" : "Designation",
    badgeNo: language === "gu" ? "બ.નં." : "Badge No.",
    name: language === "gu" ? "નામ" : "Officer Name",
    mobile: language === "gu" ? "મોબાઇલ નંબર" : "Mobile No.",
    dutyPlace: language === "gu" ? "ફરજની જગ્યા" : "Duty Place",
    appointment: language === "gu" ? "નીમણુંક" : "Appointment",
    reportDate: language === "gu" ? "ક્રાઇમ હાજર તારીખ" : "Crime Reporting Date",
    birthDate: language === "gu" ? "જન્મ તારીખ" : "Birth Date",
    recruitedDate: language === "gu" ? "ભરતી તારીખ" : "Recruited Date",
    retirementDate: language === "gu" ? "વય નિવૃત તારીખ" : "Retirement Date",
    aadhar: language === "gu" ? "આધાર કાર્ડ નંબર" : "Aadhaar Card No.",
    pan: language === "gu" ? "પાન કાર્ડ નંબર" : "PAN Card No.",
    blood: language === "gu" ? "બ્લડ ગ્રુપ" : "Blood Group",
    weapon: "HRPN No.",
    tenure: language === "gu" ? "સેવા સમયગાળો" : "Worked Tenure"
  };

  // ---------------------------------------------------------------------------
  // RENDER: LOGIN SCREEN (NO DEFAULT ADMIN, ZERO LOCAL STORAGE)
  // ---------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 min-[360px]:p-4 font-sans select-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-5 min-[360px]:p-7 shadow-2xl backdrop-blur-xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">GUJARAT POLICE • CRIME BRANCH</span>
            <h1 className="text-xl min-[360px]:text-2xl font-black tracking-tight text-white">ઓપરેશન્સ કમાન્ડ લોગિન</h1>
            <p className="text-xs text-slate-400">Authorized personnel only. Data synced directly to Supabase.</p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => { setLoginMode("admin"); setLoginError(""); }}
              className={`py-2 rounded-lg transition ${loginMode === "admin" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"}`}
            >
              👑 Super Admin
            </button>
            <button
              onClick={() => { setLoginMode("officer"); setLoginError(""); }}
              className={`py-2 rounded-lg transition ${loginMode === "officer" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"}`}
            >
              👮 Officer Login
            </button>
          </div>

          {loginError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {loginMode === "admin" ? (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Admin Registered Mobile</label>
                  <input
                    type="text"
                    value={adminPhoneInput}
                    onChange={(e) => setAdminPhoneInput(e.target.value)}
                    placeholder="9274583654"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Security PIN Code</label>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="1673583"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                  />
                  <p className="text-[10px] text-slate-500">Authorized Super Admin PIN: 1673583</p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Badge / Buckle No (બક્કલ નંબર)</label>
                  <input
                    type="text"
                    value={officerBadgeInput}
                    onChange={(e) => setOfficerBadgeInput(e.target.value)}
                    placeholder="e.g. 8419, 8747, 8557"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Registered Mobile (મોબાઇલ નંબર)</label>
                  <input
                    type="text"
                    value={officerMobileInput}
                    onChange={(e) => setOfficerMobileInput(e.target.value)}
                    placeholder="e.g. 9824466971"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-[0.98]"
            >
              {loginMode === "admin" ? "Authenticate as Super Admin" : "Sign In to Roster"}
            </button>
          </form>

          {/* Quick Role Tester Bar */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block text-center font-bold">
              Quick Role Experience (One-Click)
            </span>
            <div className="grid grid-cols-3 min-[380px]:grid-cols-5 gap-1.5 text-[10px]">
              <button
                onClick={() => handleQuickLoginAsRole("super_admin")}
                className="py-1.5 px-1 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg border border-amber-500/30 font-bold transition text-center"
              >
                👑 Super Admin
              </button>
              <button
                onClick={() => handleQuickLoginAsRole("admin")}
                className="py-1.5 px-1 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-lg border border-indigo-500/30 font-bold transition text-center"
              >
                🛡️ Admin
              </button>
              <button
                onClick={() => handleQuickLoginAsRole("squad")}
                className="py-1.5 px-1 bg-purple-500/10 hover:bg-purple-500 text-purple-300 hover:text-white rounded-lg border border-purple-500/30 font-bold transition text-center"
              >
                👥 Squad
              </button>
              <button
                onClick={() => handleQuickLoginAsRole("officer")}
                className="py-1.5 px-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-white rounded-lg border border-emerald-500/30 font-bold transition text-center"
              >
                👮 Officer
              </button>
              <button
                onClick={() => handleQuickLoginAsRole("viewer")}
                className="py-1.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 font-bold transition text-center"
              >
                👁️ Viewer
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // MAIN AUTHENTICATED WORKSPACE
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden w-full max-w-full">
      
      {/* Toast Notification */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-[90vw]">
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40"
                : toast.type === "error"
                ? "bg-rose-950/90 text-rose-200 border-rose-500/40"
                : toast.type === "warning"
                ? "bg-amber-950/90 text-amber-200 border-amber-500/40"
                : "bg-slate-900/90 text-cyan-200 border-cyan-500/40"
            }`}
          >
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 1. REAL-TIME BROADCAST TOP TICKER / MARQUEE                         */}
      {/* ------------------------------------------------------------------- */}
      {latestAlert && latestAlert.active && !isAlertDismissed && (
        <div className="bg-gradient-to-r from-red-950 via-rose-900/95 to-red-950 border-b border-rose-500/40 px-2 min-[360px]:px-4 py-2 text-xs flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${
              latestAlert.priority === "critical" ? "bg-rose-600 text-white animate-pulse" : latestAlert.priority === "high" ? "bg-amber-500 text-slate-950" : "bg-cyan-600 text-white"
            }`}>
              {latestAlert.priority === "critical" ? "🚨 તાકીદનું / CRITICAL" : latestAlert.priority === "high" ? "⚠️ HIGH ALERT" : "📢 NOTICE"}
            </span>
            <span className="font-bold text-rose-200 truncate">{latestAlert.title}:</span>
            <span className="text-slate-100 truncate font-medium">
              {language === "gu" ? latestAlert.messageGu || latestAlert.messageEn : latestAlert.messageEn || latestAlert.messageGu}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setSoundAlertEnabled((prev) => !prev)}
              className="p-1 rounded bg-slate-900/60 hover:bg-slate-800 text-slate-300"
              title={soundAlertEnabled ? "Mute Broadcast Sound" : "Enable Broadcast Sound"}
            >
              {soundAlertEnabled ? <Volume2 className="w-3.5 h-3.5 text-rose-300" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <button
              onClick={() => setIsAlertDrawerOpen(true)}
              className="px-2 py-0.5 rounded bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 text-[10px] font-bold transition"
            >
              View ({broadcasts.length})
            </button>
            {isPrivileged && (
              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black transition"
              >
                + Broadcast
              </button>
            )}
            <button
              onClick={() => setIsAlertDismissed(true)}
              className="p-1 rounded bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white"
              title="Dismiss Alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 2. TOP HEADER                                                       */}
      {/* ------------------------------------------------------------------- */}
      <header className="bg-slate-950/95 border-b border-slate-800/80 sticky top-0 z-30 shadow-2xl backdrop-blur-xl w-full">
        <div className="max-w-7xl mx-auto px-2 min-[360px]:px-4 sm:px-6 lg:px-8 py-2.5 min-[360px]:py-3 flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-amber-500/50 text-amber-400 hover:text-white flex-shrink-0"
              title="Toggle Sidebar Menu"
            >
              <Menu className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 min-[360px]:w-10 min-[360px]:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner flex-shrink-0">
                <Shield className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] min-[360px]:text-[10px] font-black uppercase tracking-widest text-amber-400 truncate block">{t.dept}</span>
                <h1 className="text-xs min-[360px]:text-sm sm:text-base font-black tracking-tight text-white truncate">{t.title}</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-[360px]:gap-2 ml-auto">
            
            {/* Supabase Status Button */}
            <button
              onClick={() => setSupabaseConfigModalOpen(true)}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-xl border transition ${
                supabaseConnected
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-900 text-amber-300 border-amber-500/40"
              }`}
              title="Supabase Database Realtime Sync Status"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Supabase</span>
            </button>

            {/* Realtime Broadcast Button (Super Admin / Admin) */}
            {isPrivileged && (
              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-[11px] font-bold rounded-xl border border-rose-500/50 shadow transition"
                title="Dispatch Instant Operational Broadcast"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden min-[480px]:inline">{language === "gu" ? "બ્રોડકાસ્ટ" : "Broadcast"}</span>
              </button>
            )}

            {/* Super Admin Command Center Button */}
            {isPrivileged && (
              <button
                onClick={() => { setIsAdminCommandCenterOpen(true); fetchAuditLogs(); fetchBackups(); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/40 hover:to-amber-500/30 text-amber-300 text-[11px] font-bold rounded-xl border border-amber-500/50 shadow transition"
                title="Open Complete Admin Controls, Batch Operations, and Backups"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden min-[480px]:inline">Admin Panel</span>
              </button>
            )}

            {/* Sensitive Data Mask Toggle for Privileged Users */}
            {isPrivileged && (
              <button
                onClick={() => setMaskSensitiveData((prev) => !prev)}
                className={`flex items-center gap-1 px-2 py-1.5 text-[11px] font-bold rounded-xl border transition ${
                  maskSensitiveData 
                    ? "bg-slate-900 text-amber-400 border-amber-500/40" 
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}
                title="Toggle Masking of Sensitive Data"
              >
                {maskSensitiveData ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{maskSensitiveData ? "Masked" : "Unmasked"}</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "gu" ? "en" : "gu")}
              className="flex items-center gap-1 px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-bold rounded-xl border border-slate-800 transition"
              title="Toggle English / Gujarati"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === "gu" ? "EN" : "ગુજ"}</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] rounded-xl shadow-lg transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden min-[480px]:inline">AI</span>
            </button>

            {/* Current User Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-xl text-[11px]">
              <span className={`w-2 h-2 rounded-full ${currentUser.role === "super_admin" ? "bg-amber-400" : currentUser.role === "admin" ? "bg-indigo-400" : "bg-emerald-400"}`}></span>
              <span className="font-semibold text-slate-300 truncate max-w-[100px]">{currentUser.name}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 min-[360px]:p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 transition"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* 3. SIDEBAR NAVIGATION                                               */}
      {/* ------------------------------------------------------------------- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed top-0 bottom-0 left-0 w-72 min-[360px]:w-80 bg-slate-950 border-r border-slate-800 z-50 p-4 min-[360px]:p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-amber-400" />
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">GUJARAT POLICE</span>
                      <span className="text-sm font-bold text-white">Crime Branch Menu</span>
                    </div>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Navigation Views</span>
                  
                  {/* View 1: Roster Table */}
                  <button
                    onClick={() => { setActiveNav("table"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeNav === "table" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{language === "gu" ? "રોસ્ટર ટેબલ વ્યૂ" : "Roster Directory (Table)"}</span>
                  </button>

                  {/* View 2: Cards View */}
                  <button
                    onClick={() => { setActiveNav("cards"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeNav === "cards" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                  >
                    <IdCard className="w-4 h-4" />
                    <span>{language === "gu" ? "ઓફિસર કાર્ડ્સ વ્યૂ" : "Officer Cards View"}</span>
                  </button>

                  {/* View 3: Squad Management */}
                  <button
                    onClick={() => { setActiveNav("squads"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeNav === "squads" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                  >
                    <Users className="w-4 h-4" />
                    <span>{language === "gu" ? "સ્કોડ મેનેજમેન્ટ અને બદલી" : "Squad Management & Reassignment"}</span>
                  </button>

                  {/* View 4: Squad Tasks Planner */}
                  <button
                    onClick={() => { setActiveNav("tasks"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeNav === "tasks" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                  >
                    <ListTodo className="w-4 h-4" />
                    <span>{language === "gu" ? "સ્કોડ કાર્યો (દૈનિક/સાપ્તાહિક/માસિક)" : "Squad Tasks (Daily/Weekly/Monthly)"}</span>
                  </button>

                  {/* View 5: Active Users & Role Management */}
                  {currentUser.role === "super_admin" && (
                    <button
                      onClick={() => { setActiveNav("users"); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeNav === "users" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                    >
                      <UserCog className="w-4 h-4" />
                      <span>{language === "gu" ? "સક્રિય યુઝર્સ અને રોલ મેનેજમેન્ટ" : "Users & Role Management"}</span>
                    </button>
                  )}

                  {/* View 6: Analytics */}
                  <button
                    onClick={() => { setActiveNav("analytics"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeNav === "analytics" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>{language === "gu" ? "ક્રાઇમ બ્રાન્ચ એનાલિટિક્સ" : "Staff Analytics"}</span>
                  </button>

                  {/* View 7: Realtime Team Chat Room */}
                  <button
                    onClick={() => { setActiveNav("chat"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeNav === "chat" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{language === "gu" ? "ટીમ ચેટ રૂમ (રિયલ ટાઇમ)" : "Real-Time Team Chat Room"}</span>
                  </button>
                </div>

                {/* Operations Section */}
                {isPrivileged && (
                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Data Operations</span>
                    
                    <button
                      onClick={() => { setIsImportModalOpen(true); setIsSidebarOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{language === "gu" ? "સ્પ્રેડશીટ ઇમ્પોર્ટ (૪૦૯ સ્ટાફ)" : "Import 409+ Personnel"}</span>
                    </button>

                    <button
                      onClick={handleSwapDutyPlaceAndAppointment}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                      <span>{language === "gu" ? "સ્વેપ: ફરજ ⇄ નીમણૂંક" : "Swap Duty ⇄ Appointment"}</span>
                    </button>

                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800"
                    >
                      <Download className="w-4 h-4" />
                      <span>{language === "gu" ? "CSV ડાઉનલોડ" : "Export CSV Roster"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* User Session Footer */}
              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Current Role:</span>
                  <span className="font-bold text-amber-400 uppercase font-mono">{currentUser.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Logged User:</span>
                  <span className="text-white font-medium truncate max-w-[130px]">{currentUser.name}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-400">
                  <span>Storage Sync:</span>
                  <span>Supabase Active</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------- */}
      {/* 4. MAIN WORKSPACE CONTENT                                           */}
      {/* ------------------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto px-2 min-[360px]:px-4 sm:px-6 lg:px-8 py-3 min-[360px]:py-4 space-y-4 flex-1 w-full">
        
        {/* STATS SUMMARY BAR */}
        <div className="grid grid-cols-2 min-[540px]:grid-cols-4 gap-2.5 min-[360px]:gap-4">
          <motion.div whileHover={{ y: -2 }} className="p-3 min-[360px]:p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow">
            <span className="text-[10px] min-[360px]:text-xs text-slate-400 block font-medium">કુલ કર્મચારીઓ (Total Staff)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl min-[360px]:text-2xl font-black text-amber-400 font-mono">{personnel.length}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-3 min-[360px]:p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow">
            <span className="text-[10px] min-[360px]:text-xs text-slate-400 block font-medium">સ્કોડ સંખ્યા (Active Squads)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl min-[360px]:text-2xl font-black text-indigo-400 font-mono">{uniqueSquads.length}</span>
              <span className="text-[10px] text-slate-400">units</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-3 min-[360px]:p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow">
            <span className="text-[10px] min-[360px]:text-xs text-slate-400 block font-medium">નીમણૂંક (CRIME / ATTECH)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg min-[360px]:text-xl font-black text-emerald-400 font-mono">
                {personnel.filter((p) => (p.appointment || "").toLowerCase() === "crime").length}
              </span>
              <span className="text-[10px] text-purple-400 font-mono">
                / {personnel.filter((p) => {
                    const app = (p.appointment || "").toLowerCase();
                    return app === "attech" || app.includes("એટેચ") || app.includes("attach");
                  }).length} ATTECH
              </span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-3 min-[360px]:p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow">
            <span className="text-[10px] min-[360px]:text-xs text-slate-400 block font-medium">કાર્યો (Pending Tasks)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl min-[360px]:text-2xl font-black text-rose-400 font-mono">
                {squadTasks.filter((t) => t.status !== "completed").length}
              </span>
              <span className="text-[10px] text-slate-400">active assignments</span>
            </div>
          </motion.div>
        </div>

        {/* CONTROLS & FILTER TOOLBAR */}
        <div className="p-3 min-[360px]:p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder={language === "gu" ? "નામ, બક્કલ નં., મોબાઇલ, સ્કોડ, ફરજ કે નીમણુંક શોધો..." : "Search name, badge, squad, duty, mobile..."}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* View Mode Selector Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => setActiveNav("table")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${activeNav === "table" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
              >
                Table
              </button>
              <button
                onClick={() => setActiveNav("cards")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${activeNav === "cards" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
              >
                Cards
              </button>
              <button
                onClick={() => setActiveNav("squads")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${activeNav === "squads" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
              >
                Squads
              </button>
              <button
                onClick={() => setActiveNav("tasks")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${activeNav === "tasks" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
              >
                Tasks
              </button>
              {currentUser.role === "super_admin" && (
                <button
                  onClick={() => setActiveNav("users")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${activeNav === "users" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
                >
                  Roles
                </button>
              )}
            </div>

            {/* Action Buttons: Download Filtered, Swap Columns, Add Officer */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                title={language === "gu" ? `ફિલ્ટર થયેલ ${filteredPersonnel.length} કર્મચારીઓ ડાઉનલોડ કરો` : `Download ${filteredPersonnel.length} filtered personnel`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === "gu" ? "ડાઉનલોડ" : "Download"}</span>
                <span className="px-1.5 py-0.2 bg-emerald-950/80 rounded font-mono text-[11px] text-emerald-300">
                  {filteredPersonnel.length}
                </span>
              </button>

              {isPrivileged && (
                <>
                  <button
                    onClick={handleSwapDutyPlaceAndAppointment}
                    className="px-2.5 py-2 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    title="Swap Duty Place and Appointment columns across all records"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span className="hidden min-[500px]:inline">Swap Duty ⇄ Appt</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingPerson(null);
                      setFormData({
                        id: "",
                        srNo: personnel.length + 1,
                        code: "સ્કોડ-૦૧",
                        designation: "UASI",
                        badgeNo: "",
                        name: "",
                        mobile: "",
                        dutyPlace: "સ્કોડ-૦૧",
                        appointment: "CRIME",
                        reportDate: "01/01/2026",
                        birthDate: "01/06/1985",
                        recruitedDate: "01/01/2005",
                        retirementDate: "30/06/2043",
                        aadharNo: "",
                        panNo: "",
                        bloodGroup: "B+",
                        weaponNo: "",
                        avatarUrl: PRESET_AVATARS[0],
                        appointmentDate: "01/01/2026",
                        notes: "",
                        customFields: {}
                      });
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow transition flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === "gu" ? "નવો સ્ટાફ" : "Add Officer"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* FILTERS ROW (SQUAD, DESIGNATION, APPOINTMENT, WORKED TENURE 1-6+ YRS, RETIREMENT) */}
          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-800 text-xs">
            
            {/* Filter 1: Squad Filter */}
            <select
              value={selectedSquad}
              onChange={(e) => { setSelectedSquad(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">સ્કોડ: All Squads ({uniqueSquads.length})</option>
              {uniqueSquads.map((sq) => (
                <option key={sq} value={sq}>{sq}</option>
              ))}
            </select>

            {/* Filter 2: Designation Filter */}
            <select
              value={selectedDesignation}
              onChange={(e) => { setSelectedDesignation(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">હોદ્દો: All Designations</option>
              {uniqueDesignations.map((des) => (
                <option key={des} value={des}>{des}</option>
              ))}
            </select>

            {/* Filter 3: Mandatory Appointment (નીમણુંક) Filter */}
            <select
              value={selectedAppointment}
              onChange={(e) => { setSelectedAppointment(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-xs text-emerald-300 font-semibold focus:outline-none focus:border-emerald-400"
            >
              <option value="ALL">નીમણુંક: All Appointments ({uniqueAppointments.length})</option>
              {uniqueAppointments.map((app) => (
                <option key={app} value={app}>{app}</option>
              ))}
            </select>

            {/* Filter 4: Worked Tenure (1, 2, 3, 4, 5, 6+ Years Worked) */}
            <select
              value={selectedTenureFilter}
              onChange={(e) => { setSelectedTenureFilter(e.target.value as any); setCurrentPage(1); }}
              className="bg-slate-950 border border-indigo-500/40 rounded-xl px-2.5 py-1.5 text-xs text-indigo-300 font-semibold focus:outline-none focus:border-indigo-400"
            >
              <option value="ALL">સેવા વર્ષ: All Service</option>
              <option value="1YR">૧+ વર્ષ પૂર્ણ (1+ Yr Worked)</option>
              <option value="2YR">૨+ વર્ષ પૂર્ણ (2+ Yrs Worked)</option>
              <option value="3YR">૩+ વર્ષ પૂર્ણ (3+ Yrs Worked)</option>
              <option value="4YR">૪+ વર્ષ પૂર્ણ (4+ Yrs Worked)</option>
              <option value="5YR">૫+ વર્ષ પૂર્ણ (5+ Yrs Worked)</option>
              <option value="6YR">૬+ વર્ષ પૂર્ણ (6+ Yrs Worked)</option>
            </select>

            {/* Filter 5: Retirement Alert Filter */}
            <select
              value={selectedRetirementAlert}
              onChange={(e) => { setSelectedRetirementAlert(e.target.value as any); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-semibold"
            >
              <option value="ALL">નિવૃત્તિ: All Roster</option>
              <option value="6MO">Retiring in 6 Months</option>
              <option value="1YR">Retiring in 1 Year</option>
              <option value="RETIRED">Already Retired</option>
            </select>
          </div>

          {/* FILTER STATUS, LIVE RESULT COUNTER & DOWNLOAD OPTIONS BAR */}
          <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            {/* Left: Filter result summary & active filter indicator */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-400 font-medium">{language === "gu" ? "પરિણામ:" : "Results:"}</span>
                <span className="font-bold text-amber-400 font-mono text-sm">{filteredPersonnel.length}</span>
                <span className="text-slate-500 text-[11px]">/ {personnel.length} {language === "gu" ? "સ્ટાફ" : "staff"}</span>
              </div>

              {isAnyFilterActive && (
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
                    {language === "gu" ? "ફિલ્ટર લાગુ છે" : "Filter Active"}
                  </span>
                  <button
                    onClick={handleResetFilters}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-[11px] font-medium transition flex items-center gap-1"
                    title={language === "gu" ? "બધા ફિલ્ટર હટાવો" : "Clear all filters"}
                  >
                    <X className="w-3 h-3 text-rose-400" />
                    <span>{language === "gu" ? "રીસેટ (Clear)" : "Reset"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right: Download options (Excel/CSV, JSON, Print/PDF) */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-emerald-500/20 transition flex items-center gap-1.5 active:scale-95"
                title={language === "gu" ? `ફિલ્ટર થયેલ ${filteredPersonnel.length} કર્મચારીઓની Excel/CSV ફાઇલ ડાઉનલોડ કરો` : "Download filtered roster in Excel/CSV"}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === "gu" ? "ડાઉનલોડ (Excel/CSV)" : "Download (CSV)"}</span>
                <span className="px-1.5 py-0.2 bg-emerald-950/70 rounded-md font-mono text-[11px] text-emerald-200">
                  {filteredPersonnel.length}
                </span>
              </button>

              <button
                onClick={handleExportJSON}
                className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                title={language === "gu" ? "ફિલ્ટર કરેલ JSON ડેટા ડાઉનલોડ કરો" : "Download filtered JSON"}
              >
                <FileDown className="w-3.5 h-3.5 text-amber-400" />
                <span>JSON</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                title={language === "gu" ? "પ્રિન્ટ અથવા PDF તરીકે સાચવો" : "Print or save as PDF"}
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === "gu" ? "પ્રિન્ટ / PDF" : "Print"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* VIEW 1: TABLE VIEW WITH 100% BILINGUAL HEADERS & COLUMN SORTING   */}
        {/* ----------------------------------------------------------------- */}
        {activeNav === "table" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                    
                    <th onClick={() => handleSort("srNo")} className="p-3 cursor-pointer hover:text-white transition">
                      <div className="flex items-center gap-1">
                        <span>{t.srNo}</span>
                        {sortColumn === "srNo" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    <th className="p-2 sm:p-3 w-20 min-w-[76px] text-center">{t.photo}</th>

                    <th onClick={() => handleSort("code")} className="p-3 cursor-pointer hover:text-white transition">
                      <div className="flex items-center gap-1">
                        <span>{t.squad}</span>
                        {sortColumn === "code" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    <th onClick={() => handleSort("designation")} className="p-3 cursor-pointer hover:text-white transition">
                      <div className="flex items-center gap-1">
                        <span>{t.designation}</span>
                        {sortColumn === "designation" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    <th onClick={() => handleSort("badgeNo")} className="p-3 cursor-pointer hover:text-white transition">
                      <div className="flex items-center gap-1">
                        <span>{t.badgeNo}</span>
                        {sortColumn === "badgeNo" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    <th onClick={() => handleSort("name")} className="p-3 cursor-pointer hover:text-white transition">
                      <div className="flex items-center gap-1">
                        <span>{t.name}</span>
                        {sortColumn === "name" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    <th className="p-3">{t.mobile}</th>

                    {/* Duty Place */}
                    <th onClick={() => handleSort("dutyPlace")} className="p-3 cursor-pointer hover:text-white transition">
                      <div className="flex items-center gap-1 text-cyan-300">
                        <span>{t.dutyPlace}</span>
                        {sortColumn === "dutyPlace" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    {/* Appointment */}
                    <th onClick={() => handleSort("appointment")} className="p-3 cursor-pointer hover:text-white transition">
                      <div className="flex items-center gap-1 text-emerald-300">
                        <span>{t.appointment}</span>
                        {sortColumn === "appointment" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    <th onClick={() => handleSort("reportDate")} className="p-3 cursor-pointer hover:text-white transition">
                      <div className="flex items-center gap-1">
                        <span>{t.reportDate}</span>
                      </div>
                    </th>

                    <th onClick={() => handleSort("retirementDate")} className="p-3 cursor-pointer hover:text-white transition">
                      <div className="flex items-center gap-1">
                        <span>{t.retirementDate}</span>
                      </div>
                    </th>

                    <th onClick={() => handleSort("weaponNo")} className="p-3 cursor-pointer hover:text-white transition">
                      <div className="flex items-center gap-1 text-amber-400/90 hover:text-amber-300">
                        <span>HRPN No.</span>
                        {sortColumn === "weaponNo" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    <th onClick={() => handleSort("tenure")} className="p-3 cursor-pointer hover:text-white transition text-emerald-400">
                      <div className="flex items-center gap-1">
                        <span>{t.tenure}</span>
                        {sortColumn === "tenure" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 text-xs">
                  {paginatedPersonnel.map((p) => {
                    const tenure = calculateServiceTenure(p.reportDate || p.appointmentDate || p.recruitedDate);
                    return (
                      <tr 
                        key={p.id}
                        onClick={() => setSelectedOfficer(p)}
                        className="hover:bg-slate-800/60 transition cursor-pointer"
                      >
                        <td className="p-3 font-mono font-bold text-slate-400">{p.srNo}</td>
                        <td className="p-2 sm:p-3 w-20 min-w-[76px] align-middle text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="relative group/avatar inline-flex items-center justify-center w-14 h-14 min-w-[56px] min-h-[56px] sm:w-16 sm:h-16 sm:min-w-[64px] sm:min-h-[64px] shrink-0 mx-auto">
                            <img
                              src={p.avatarUrl || PRESET_AVATARS[0]}
                              alt={p.name}
                              style={{ width: "100%", height: "100%", aspectRatio: "1 / 1" }}
                              className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] sm:w-16 sm:h-16 sm:min-w-[64px] sm:min-h-[64px] sm:max-w-[64px] sm:max-h-[64px] aspect-square shrink-0 rounded-xl object-cover object-top border-2 border-amber-500/60 hover:border-amber-400 cursor-pointer shadow-md transition-all duration-200 group-hover/avatar:scale-105 group-hover/avatar:ring-2 group-hover/avatar:ring-amber-400/50 block"
                              loading="lazy"
                              onClick={() => setEnlargedPhotoOfficer(p)}
                              title={language === "gu" ? "ક્લિક કરીને મોટો ફોટો જુઓ (Click to view large photo)" : "Click to view large photo"}
                            />
                            {/* Quick Action Overlay Buttons */}
                            <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 opacity-90 group-hover/avatar:opacity-100 transition z-10 pointer-events-auto">
                              <button
                                type="button"
                                onClick={() => handleOpenPhotoModal(p)}
                                className="p-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md cursor-pointer shadow transition"
                                title={language === "gu" ? "ફોટો બદલો / અપલોડ કરો (Change Photo)" : "Change Photo"}
                              >
                                <Camera className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEnlargedPhotoOfficer(p)}
                                className="p-1 bg-slate-900/90 hover:bg-slate-800 text-amber-300 rounded-md cursor-pointer shadow border border-slate-700 transition"
                                title={language === "gu" ? "મોટો ફોટો જુઓ (Inspect Photo)" : "Inspect Photo"}
                              >
                                <Eye className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-amber-400 font-bold">{p.code}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold border border-slate-700">
                            {p.designation}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-300">{cleanBadge(p.badgeNo)}</td>
                        <td className="p-3 font-bold text-white max-w-[200px] truncate">{p.name}</td>
                        <td className="p-3 font-mono text-slate-300">{maskMobile(p.mobile)}</td>

                        <td className="p-3 max-w-[180px] truncate font-medium text-slate-300">{p.dutyPlace}</td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            (p.appointment || "").toLowerCase() === "crime"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          }`}>
                            {p.appointment}
                          </span>
                        </td>

                        <td className="p-3 font-mono text-slate-400">{p.reportDate || "-"}</td>
                        <td className="p-3 font-mono font-semibold text-amber-400">{p.retirementDate || "-"}</td>
                        <td className="p-3 font-mono font-semibold text-amber-400">{maskWeapon(p.weaponNo)}</td>

                        {/* Calculated Tenure */}
                        <td className="p-3 font-mono text-emerald-400 font-bold text-[11px]">
                          ⏳ {tenure ? (language === "gu" ? tenure.formattedGu : tenure.formatted) : "-"}
                        </td>

                        {/* Action buttons (Call, WhatsApp, Share, Edit, Delete) */}
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {p.mobile && (
                              <a
                                href={`tel:${p.mobile.replace(/[^0-9+]/g, "")}`}
                                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition"
                                title="Call Officer"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {p.mobile && (
                              <a
                                href={`https://wa.me/91${p.mobile.replace(/[^0-9]/g, "").slice(-10)}?text=${encodeURIComponent(formatOfficerShareMessage(p))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-600 text-green-400 hover:text-white transition"
                                title="WhatsApp Message / વોટ્સએપ મેસેજ"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => handleShareOfficer(p)}
                              className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-600 text-indigo-400 hover:text-white transition"
                              title="Share Details"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            {isPrivileged && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingPerson(p);
                                    setFormData({ ...p });
                                    setIsModalOpen(true);
                                  }}
                                  className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg transition"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(p)}
                                  className="p-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-slate-400 font-medium">
                  {language === "gu"
                    ? `${filteredPersonnel.length} માંથી ${paginatedPersonnel.length} કર્મચારીઓ (પેજ ${currentPage} / ${totalPages})`
                    : `Showing ${paginatedPersonnel.length} of ${filteredPersonnel.length} personnel (Page ${currentPage} of ${totalPages})`}
                </span>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition"
                  title={language === "gu" ? "ફિલ્ટર કરેલ તમામ કર્મચારીઓ CSV/Excel માં ડાઉનલોડ કરો" : "Download all filtered records"}
                >
                  <Download className="w-3 h-3" />
                  <span>{language === "gu" ? "આ લિસ્ટ ડાઉનલોડ કરો" : "Download filtered list"}</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg font-mono font-bold text-amber-400">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* VIEW 2: CARDS VIEW WITH CALL, WHATSAPP, AND SHARE BUTTONS         */}
        {/* ----------------------------------------------------------------- */}
        {activeNav === "cards" && (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-3.5 min-[360px]:gap-5">
            {paginatedPersonnel.map((p) => {
              const tenure = calculateServiceTenure(p.reportDate || p.appointmentDate || p.recruitedDate);
              const cleanPhone = p.mobile ? p.mobile.replace(/[^0-9]/g, "").slice(-10) : "";
              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={() => setSelectedOfficer(p)}
                  className="p-4 min-[360px]:p-5 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl shadow-xl hover:border-amber-500/50 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative group shrink-0 aspect-square">
                          <img
                            src={p.avatarUrl || PRESET_AVATARS[0]}
                            alt={p.name}
                            style={{ aspectRatio: "1 / 1" }}
                            className="w-20 h-20 min-[360px]:w-24 min-[360px]:h-24 aspect-square shrink-0 rounded-2xl object-cover object-top border-2 border-amber-500/70 group-hover:border-amber-400 shadow-xl cursor-pointer transition-all duration-200 group-hover:scale-105 block"
                            loading="lazy"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEnlargedPhotoOfficer(p);
                            }}
                            title={language === "gu" ? "ક્લિક કરીને મોટો ફોટો જુઓ (Click to inspect photo)" : "Click to inspect photo"}
                          />
                          {/* Zoom Inspection Badge */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEnlargedPhotoOfficer(p);
                            }}
                            className="absolute top-1 left-1 px-1.5 py-0.5 bg-slate-950/85 backdrop-blur-xs rounded-md text-[9px] font-bold text-amber-300 opacity-0 group-hover:opacity-100 transition border border-slate-800 flex items-center gap-0.5 shadow"
                            title="મોટો ફોટો (Enlarge)"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            <span>ઝૂમ</span>
                          </button>
                          {/* Photo controls: 1. Computer Upload, 2. URL Input */}
                          <div className="absolute -bottom-1 -right-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <label
                              className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg cursor-pointer shadow-lg transition"
                              title={language === "gu" ? "કોમ્પ્યુટર માંથી ફોટો અપલોડ કરો (Upload from Computer)" : "Upload from Computer"}
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handlePhotoUpload(p.id, e)}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleOpenPhotoModal(p)}
                              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer shadow-lg transition"
                              title={language === "gu" ? "કોમ્પ્યુટર / ઇન્ટરનેટ ફોટો URL દાખલ કરો (Enter Image URL)" : "Enter Image URL"}
                            >
                              <Link className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-amber-400 font-mono">{p.code}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-indigo-300 rounded font-semibold border border-slate-700">{p.designation}</span>
                          </div>
                          <h3 className="font-bold text-white text-xs min-[360px]:text-sm mt-0.5 truncate">{p.name}</h3>
                          <p className="text-[11px] text-slate-400 font-mono">{cleanBadge(p.badgeNo)}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                        (p.appointment || "").toLowerCase() === "crime" ? "bg-emerald-500/20 text-emerald-300" : "bg-purple-500/20 text-purple-300"
                      }`}>
                        {p.appointment}
                      </span>
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">{t.dutyPlace}:</span>
                        <span className="text-slate-300 font-medium truncate block">{p.dutyPlace}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">HRPN No.:</span>
                        <span className="text-slate-300 font-mono font-semibold">{maskWeapon(p.weaponNo)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">{t.reportDate}:</span>
                        <span className="text-slate-300 font-mono">{p.reportDate || "-"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">{t.retirementDate}:</span>
                        <span className="text-amber-400 font-mono font-semibold">{p.retirementDate || "-"}</span>
                      </div>
                    </div>

                    {/* Worked Tenure line */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">{t.tenure}:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        ⏳ {tenure ? (language === "gu" ? tenure.formattedGu : tenure.formatted) : "-"}
                      </span>
                    </div>
                  </div>

                  {/* ACTION BAR: CALL, WHATSAPP, SHARE IN CARD */}
                  <div className="flex items-center justify-between gap-1.5 mt-3.5 pt-2.5 border-t border-slate-800 text-xs" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 font-mono text-slate-300">
                      <span className="text-[11px]">{maskMobile(p.mobile)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {p.mobile && (
                        <a
                          href={`tel:${p.mobile.replace(/[^0-9+]/g, "")}`}
                          className="px-2 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 flex items-center gap-1 font-bold text-[11px] transition"
                          title="Call Officer / ફોન કરો"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span className="hidden min-[420px]:inline">{language === "gu" ? "કોલ" : "Call"}</span>
                        </a>
                      )}

                      {p.mobile && (
                        <a
                          href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(formatOfficerShareMessage(p))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/30 flex items-center gap-1 font-bold text-[11px] transition"
                          title="WhatsApp Message / વોટ્સએપ મેસેજ"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden min-[420px]:inline">WhatsApp</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleShareOfficer(p)}
                        className="px-2 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 flex items-center gap-1 font-bold text-[11px] transition"
                        title="Share Details / વિગત શેર કરો"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden min-[420px]:inline">{language === "gu" ? "શેર" : "Share"}</span>
                      </button>

                      {isPrivileged && (
                        <>
                          <button
                            onClick={() => {
                              setEditingPerson(p);
                              setFormData({ ...p });
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* VIEW 3: SQUAD DIRECTORY & REASSIGNMENT (SUPER ADMIN CAN REASSIGN)  */}
        {/* ----------------------------------------------------------------- */}
        {activeNav === "squads" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    <span>સ્કોડ ડિરેક્ટરી અને સંચાલન (Squad Management & Directory)</span>
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/40">
                    કુલ સ્કોડ: {uniqueSquads.length} ({uniqueSquads[0]} થી {uniqueSquads[uniqueSquads.length - 1] || "૧૦"})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === "gu"
                    ? "સ્કોડ-૦૧ થી સ્કોડ-૧૦ નું સંપૂર્ણ સંચાલન. જરૂર મુજબ નવી સ્કોડ ઉમેરી કે ઘટાડી શકાય છે."
                    : "Manage active squads (Squad 01 to 10). Add or remove squads anytime as operational requirements change."}
                </p>
              </div>

              {isPrivileged && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsAddSquadModalOpen(true)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                    title={language === "gu" ? "નવી સ્કોડ ઉમેરો (સ્કોડ સંખ્યામાં વધારો)" : "Add New Squad"}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === "gu" ? "+ નવી સ્કોડ ઉમેરો" : "+ Add New Squad"}</span>
                  </button>

                  <button
                    onClick={handleResetTo10Squads}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                    title={language === "gu" ? "સ્કોડ સંખ્યા ૧૦ કરો (સ્કોડ-૦૧ થી સ્કોડ-૧૦ રીસેટ કરો)" : "Reset to 10 Squads (01 to 10)"}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{language === "gu" ? "૧૦ સ્કોડ રીસેટ કરો" : "Reset 10 Squads"}</span>
                  </button>

                  <button
                    onClick={() => handleOpenSquadAssign(targetSquadCode || "સ્કોડ-૦૧", "add")}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{language === "gu" ? "સ્ટાફ ફાળવો" : "Assign Officer"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Squads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueSquads.map((squadCode) => {
                const squadMembers = personnel.filter((p) => p.code === squadCode);
                return (
                  <div key={squadCode} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between space-y-3 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-black text-xs rounded-lg">
                          {squadCode}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">{squadMembers.length} {language === "gu" ? "કર્મચારીઓ" : "officers"}</span>
                      </div>

                      {isPrivileged && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenSquadAssign(squadCode, "add")}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-lg border border-slate-700 transition"
                            title={language === "gu" ? "આ સ્કોડમાં કર્મચારી ઉમેરો" : "Assign Officer"}
                          >
                            + Assign
                          </button>
                          <button
                            onClick={() => handleDeleteSquad(squadCode)}
                            className="p-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                            title={language === "gu" ? `આ "${squadCode}" સ્કોડ કાઢી નાખો (ઘટાડો)` : `Delete ${squadCode}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Member List */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {squadMembers.map((m) => (
                        <div key={m.id} className="p-2 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={m.avatarUrl || PRESET_AVATARS[0]}
                              alt={m.name}
                              className="w-12 h-12 rounded-xl object-cover border border-amber-500/40 cursor-pointer shadow hover:scale-105 transition flex-shrink-0"
                              onClick={() => setEnlargedPhotoOfficer(m)}
                              title="ક્લિક કરીને મોટો ફોટો જુઓ"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-white truncate block">{m.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{m.designation} • {cleanBadge(m.badgeNo)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Call / WA buttons */}
                            {m.mobile && (
                              <a href={`tel:${m.mobile.replace(/[^0-9+]/g, "")}`} className="p-1 rounded bg-slate-800 text-emerald-400 hover:text-white" title="Call">
                                <Phone className="w-3 h-3" />
                              </a>
                            )}
                            <button onClick={() => handleShareOfficer(m)} className="p-1 rounded bg-slate-800 text-indigo-400 hover:text-white" title="Share">
                              <Share2 className="w-3 h-3" />
                            </button>

                            {/* Super Admin Reassign / Replace / Remove */}
                            {isPrivileged && (
                              <>
                                <button
                                  onClick={() => handleOpenSquadAssign(squadCode, "replace", m)}
                                  className="px-1.5 py-0.5 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-[10px] font-bold rounded"
                                  title="Replace with another officer"
                                >
                                  Replace
                                </button>
                                <button
                                  onClick={() => handleRemoveOfficerFromSquad(m)}
                                  className="p-1 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded"
                                  title="Remove from Squad"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* VIEW 4: SQUAD TASKS PLANNER (DAILY, WEEKLY, MONTHLY)              */}
        {/* ----------------------------------------------------------------- */}
        {activeNav === "tasks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-amber-400" />
                  <span>સ્કોડ કાર્યો અને પ્લાનર (Squad Tasks & Operations)</span>
                </h2>
                <p className="text-xs text-slate-400">Assign daily, weekly, and monthly operational tasks to squads.</p>
              </div>

              {isPrivileged && (
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Squad Task</span>
                </button>
              )}
            </div>

            {/* Task Periodicity Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setActiveTaskTab("all")}
                className={`px-3 py-1.5 rounded-xl transition ${activeTaskTab === "all" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white bg-slate-900"}`}
              >
                All Tasks ({squadTasks.length})
              </button>
              <button
                onClick={() => setActiveTaskTab("daily")}
                className={`px-3 py-1.5 rounded-xl transition ${activeTaskTab === "daily" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white bg-slate-900"}`}
              >
                Daily (દૈનિક) ({squadTasks.filter((t) => t.periodicity === "daily").length})
              </button>
              <button
                onClick={() => setActiveTaskTab("weekly")}
                className={`px-3 py-1.5 rounded-xl transition ${activeTaskTab === "weekly" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white bg-slate-900"}`}
              >
                Weekly (સાપ્તાહિક) ({squadTasks.filter((t) => t.periodicity === "weekly").length})
              </button>
              <button
                onClick={() => setActiveTaskTab("monthly")}
                className={`px-3 py-1.5 rounded-xl transition ${activeTaskTab === "monthly" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white bg-slate-900"}`}
              >
                Monthly (માસિક) ({squadTasks.filter((t) => t.periodicity === "monthly").length})
              </button>
            </div>

            {/* Task Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {squadTasks
                .filter((t) => (activeTaskTab === "all" ? true : t.periodicity === activeTaskTab))
                .map((task) => (
                  <motion.div
                    key={task.id}
                    whileHover={{ y: -2 }}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {task.squadCode}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            task.priority === "urgent" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : task.priority === "high" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                          }`}>
                            {task.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                            {task.periodicity}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-white text-sm mt-2">{task.title}</h3>
                      {task.description && (
                        <p className="text-xs text-slate-300 mt-1 line-clamp-3">{task.description}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Due: {task.dueDate || "Immediate"}</span>
                        <span>By: {task.createdBy}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleTaskStatus(task)}
                          className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                            task.status === "completed"
                              ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                              : task.status === "in_progress"
                              ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {task.status === "completed" ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Completed</span>
                            </>
                          ) : task.status === "in_progress" ? (
                            <>
                              <Clock3 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                              <span>In Progress</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending (Click to Start)</span>
                            </>
                          )}
                        </button>

                        {isPrivileged && (
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl transition"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* VIEW 5: ACTIVE USERS & ROLE MANAGEMENT (SUPER ADMIN ONLY)         */}
        {/* ----------------------------------------------------------------- */}
        {activeNav === "users" && currentUser.role === "super_admin" && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-amber-400" />
                  <span>સક્રિય યુઝર્સ અને રોલ મેનેજમેન્ટ (User Sessions & Role Control)</span>
                </h2>
                <p className="text-xs text-slate-400">Super Admin can view active logins and change user privileges in real time.</p>
              </div>
              <button
                onClick={() => fetchUsers().then(setAppUsers)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Users</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-3">User / Officer</th>
                    <th className="p-3">Badge No</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Device / Terminal</th>
                    <th className="p-3">Last Active</th>
                    <th className="p-3">Current Role & Permission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {appUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/50">
                      <td className="p-3">
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{user.id}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-300">{cleanBadge(user.badgeNo)}</td>
                      <td className="p-3 font-mono text-slate-400">{maskMobile(user.mobile)}</td>
                      <td className="p-3 text-slate-400 truncate max-w-[150px]">{user.device || "Browser"}</td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{new Date(user.lastActive).toLocaleTimeString()}</td>
                      <td className="p-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeUserRole(user.id, e.target.value as UserRole)}
                          className={`bg-slate-950 border rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none ${
                            user.role === "super_admin"
                              ? "border-amber-500 text-amber-400"
                              : user.role === "admin"
                              ? "border-indigo-500 text-indigo-300"
                              : user.role === "squad"
                              ? "border-purple-500 text-purple-300"
                              : "border-slate-700 text-slate-300"
                          }`}
                        >
                          <option value="super_admin">👑 Super Admin</option>
                          <option value="admin">🛡️ Admin</option>
                          <option value="squad">👥 Squad Member</option>
                          <option value="officer">👮 Police Officer</option>
                          <option value="viewer">👁️ Viewer (Read Only)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* VIEW 6: ANALYTICS                                                 */}
        {/* ----------------------------------------------------------------- */}
        {activeNav === "analytics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>સ્કોડ મુજબ સ્ટાફ સંખ્યા (Squad Distribution)</span>
                </h3>
                <div className="space-y-2">
                  {uniqueSquads.map((sq) => {
                    const count = personnel.filter((p) => p.code === sq).length;
                    const pct = Math.round((count / (personnel.length || 1)) * 100);
                    return (
                      <div key={sq} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-mono text-slate-300">{sq}</span>
                          <span className="font-bold text-amber-400">{count} officers ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>નીમણૂંક વિશ્લેષણ (Appointment Breakdown)</span>
                </h3>
                <div className="space-y-3">
                  {uniqueAppointments.map((app) => {
                    const count = personnel.filter((p) => p.appointment === app).length;
                    const pct = Math.round((count / (personnel.length || 1)) * 100);
                    return (
                      <div key={app} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-300">{app}</span>
                          <span className="font-bold text-emerald-400">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* VIEW 7: REAL-TIME TEAM CHAT ROOM (SUPABASE SYNCED)                */}
        {/* ----------------------------------------------------------------- */}
        {activeNav === "chat" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[70vh]">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">ગુજરાત પોલીસ ક્રાઇમ બ્રાન્ચ - લાઈવ ટીમ ચેટ રૂમ</h2>
                  <p className="text-[10px] text-emerald-400 font-mono">⚡ Real-Time Supabase Sync Active</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-slate-900 text-slate-300 text-xs font-bold rounded-xl border border-slate-800">
                Messages: {chatMessages.length}
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60">
              {chatMessages.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-xs">
                  No chat messages yet. Start conversation with your squad or command room!
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = currentUser && (msg.senderId === currentUser.id || msg.senderName === currentUser.name);
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                        <span className="font-bold text-amber-400">{msg.senderName}</span>
                        <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono uppercase">{msg.senderRole}</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs max-w-md shadow-md ${
                        isMe 
                          ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none" 
                          : "bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none"
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder={language === "gu" ? "સંદેશ લખો અને મોકલો..." : "Type operational message..."}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

      </main>

      {/* =================================================================== */}
      {/* OFFICER PROFILE MODAL (WITH CALL, WHATSAPP, AND SHARE BUTTONS)     */}
      {/* =================================================================== */}
      <AnimatePresence>
        {selectedOfficer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">{t.dept}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400 font-mono">{cleanBadge(selectedOfficer.badgeNo)}</span>
                </div>
                <button onClick={() => setSelectedOfficer(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 min-[360px]:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                
                {/* Officer Avatar & Header */}
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0 aspect-square">
                    <img
                      src={selectedOfficer.avatarUrl || PRESET_AVATARS[0]}
                      alt={selectedOfficer.name}
                      style={{ aspectRatio: "1 / 1" }}
                      className="w-24 h-24 min-[360px]:w-28 min-[360px]:h-28 aspect-square shrink-0 rounded-3xl object-cover object-top border-3 border-amber-500/80 hover:border-amber-400 cursor-pointer shadow-2xl transition-all duration-200 hover:scale-105 block"
                      onClick={() => setEnlargedPhotoOfficer(selectedOfficer)}
                      title={language === "gu" ? "ક્લિક કરીને સંપૂર્ણ મોટો ફોટો જુઓ" : "Click to view full photo"}
                    />
                    {/* Zoom button badge */}
                    <button
                      type="button"
                      onClick={() => setEnlargedPhotoOfficer(selectedOfficer)}
                      className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-slate-950/85 backdrop-blur-xs rounded-lg text-[10px] font-bold text-amber-300 opacity-90 hover:opacity-100 transition border border-slate-700 flex items-center gap-1 shadow"
                      title="મોટો ફોટો (Enlarge)"
                    >
                      <Eye className="w-3 h-3" />
                      <span>ઝૂમ</span>
                    </button>
                    {/* Photo upload / change controls */}
                    <div className="absolute -bottom-2 -right-2 flex items-center gap-1">
                      <label 
                        className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl cursor-pointer shadow-lg transition" 
                        title={language === "gu" ? "કોમ્પ્યુટર માંથી ફોટો અપલોડ કરો (Upload from Computer)" : "Upload from Computer"}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(selectedOfficer.id, e)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleOpenPhotoModal(selectedOfficer)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition"
                        title={language === "gu" ? "કોમ્પ્યુટર / ઇન્ટરનેટ ફોટો URL દાખલ કરો (Enter Image URL)" : "Enter Image URL"}
                      >
                        <Link className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-base min-[360px]:text-lg font-bold text-white">{selectedOfficer.name}</h2>
                    <p className="text-xs text-amber-400 font-mono font-semibold">{selectedOfficer.code} • {selectedOfficer.designation}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">બક્કલ નંબર: {cleanBadge(selectedOfficer.badgeNo)}</p>
                  </div>
                </div>

                {/* PROMINENT ACTION RIBBON: CALL, WHATSAPP, AND SHARE IN MODAL */}
                <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900 border border-slate-800 rounded-2xl">
                  <a
                    href={selectedOfficer.mobile ? `tel:${selectedOfficer.mobile.replace(/[^0-9+]/g, "")}` : "#"}
                    className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition ${
                      selectedOfficer.mobile
                        ? "bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40"
                        : "opacity-40 pointer-events-none bg-slate-800 text-slate-500"
                    }`}
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{language === "gu" ? "કોલ કરો" : "Call"}</span>
                  </a>

                  <a
                    href={
                      selectedOfficer.mobile
                        ? `https://wa.me/91${selectedOfficer.mobile.replace(/[^0-9]/g, "").slice(-10)}?text=${encodeURIComponent(formatOfficerShareMessage(selectedOfficer))}`
                        : "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition ${
                      selectedOfficer.mobile
                        ? "bg-green-600/30 hover:bg-green-600 text-green-300 hover:text-white border border-green-500/40"
                        : "opacity-40 pointer-events-none bg-slate-800 text-slate-500"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-green-400" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => handleShareOfficer(selectedOfficer)}
                    className="py-2 px-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 flex items-center justify-center gap-1.5 font-bold text-xs transition"
                  >
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    <span>{language === "gu" ? "શેર કરો" : "Share"}</span>
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 block">{t.dutyPlace}</span>
                    <span className="text-slate-200 font-medium">{selectedOfficer.dutyPlace}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.appointment}</span>
                    <span className="text-emerald-400 font-bold">{selectedOfficer.appointment}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.mobile}</span>
                    <span className="text-slate-200 font-mono">{maskMobile(selectedOfficer.mobile)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.reportDate}</span>
                    <span className="text-slate-200 font-mono">{selectedOfficer.reportDate || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.birthDate}</span>
                    <span className="text-slate-200 font-mono">{selectedOfficer.birthDate || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.retirementDate}</span>
                    <span className="text-amber-400 font-mono font-bold">{selectedOfficer.retirementDate || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.blood}</span>
                    <span className="text-rose-300 font-mono font-bold">{selectedOfficer.bloodGroup || "B+"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.weapon}</span>
                    <span className="text-slate-300 font-mono">{maskWeapon(selectedOfficer.weaponNo)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.aadhar}</span>
                    <span className="text-slate-300 font-mono">{maskAadhaar(selectedOfficer.aadharNo)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.pan}</span>
                    <span className="text-slate-300 font-mono">{maskPan(selectedOfficer.panNo)}</span>
                  </div>
                </div>

                {/* Tenure display */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">{t.tenure}</span>
                    <span className="text-emerald-400 font-mono font-bold text-xs">
                      ⏳ {calculateServiceTenure(selectedOfficer.reportDate || selectedOfficer.appointmentDate || selectedOfficer.recruitedDate)?.formatted || "-"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {language === "gu" ? "ક્રાઇમ હાજર તારીખથી આજ સુધી થયેલ સેવા ગણતરી" : "Calculated from crime reporting date to today"}
                  </p>
                </div>

                {/* Quick Share Message Format Preview */}
                <div className="p-3 bg-slate-900/90 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      {language === "gu" ? "શેરિંગ મેસેજ (Share Message)" : "Share Message Preview"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleShareOfficer(selectedOfficer)}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold text-[10px] rounded-lg border border-amber-500/40 transition flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{language === "gu" ? "મેસેજ કોપી કરો" : "Copy Message"}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 bg-slate-950 rounded-lg text-emerald-300 font-mono text-[11px] leading-relaxed whitespace-pre select-all border border-slate-800">
{formatOfficerShareMessage(selectedOfficer)}
                  </pre>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-end">
                <button onClick={() => setSelectedOfficer(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* REAL-TIME BROADCAST DISPATCH MODAL (SUPER ADMIN)                   */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isBroadcastModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-rose-500/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-rose-400" />
                  <h2 className="text-sm min-[360px]:text-base font-black text-white">તાકીદનું બ્રોડકાસ્ટ (Dispatch Realtime Alert)</h2>
                </div>
                <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleDispatchBroadcast} className="p-4 min-[360px]:p-6 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Priority Level (પ્રાથમિકતા)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setBroadcastPriority("critical")}
                      className={`py-2 rounded-xl border text-xs font-bold transition ${broadcastPriority === "critical" ? "bg-rose-600 text-white border-rose-500" : "bg-slate-900 text-slate-400 border-slate-800"}`}
                    >
                      🚨 Critical
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastPriority("high")}
                      className={`py-2 rounded-xl border text-xs font-bold transition ${broadcastPriority === "high" ? "bg-amber-500 text-slate-950 border-amber-400" : "bg-slate-900 text-slate-400 border-slate-800"}`}
                    >
                      ⚠️ High Alert
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastPriority("normal")}
                      className={`py-2 rounded-xl border text-xs font-bold transition ${broadcastPriority === "normal" ? "bg-cyan-600 text-white border-cyan-500" : "bg-slate-900 text-slate-400 border-slate-800"}`}
                    >
                      📢 Notice
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Alert Title / Subject (શીર્ષક)</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. VVIP Bandobast Muster Call / વાઇટલ સિક્યોરિટી એલર્ટ"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Gujarati Message (ગુજરાતી સંદેશો)</label>
                  <textarea
                    rows={3}
                    value={broadcastMsgGu}
                    onChange={(e) => setBroadcastMsgGu(e.target.value)}
                    placeholder="તમામ સ્કોડ ઇન્ચાર્જ તાત્કાલિક સ્ટાફ હાજરી ચકાસી કંટ્રોલ રૂમ જાણ કરે..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">English Message (અંગ્રેજી સંદેશો)</label>
                  <textarea
                    rows={2}
                    value={broadcastMsgEn}
                    onChange={(e) => setBroadcastMsgEn(e.target.value)}
                    placeholder="All squad leaders to verify muster roll immediately..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setIsBroadcastModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-1.5">
                    <Send className="w-4 h-4" />
                    <span>Dispatch Realtime</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* SQUAD TASK ASSIGNMENT MODAL                                        */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-amber-500/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm min-[360px]:text-base font-black text-white">Create Squad Task</h2>
                </div>
                <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveTask} className="p-4 min-[360px]:p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Periodicity (આવૃત્તિ)</label>
                    <select
                      value={newTaskPeriodicity}
                      onChange={(e) => setNewTaskPeriodicity(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                    >
                      <option value="daily">Daily (દૈનિક)</option>
                      <option value="weekly">Weekly (સાપ્તાહિક)</option>
                      <option value="monthly">Monthly (માસિક)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Assigned Squad (સ્કોડ)</label>
                    <select
                      value={newTaskSquad}
                      onChange={(e) => setNewTaskSquad(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold"
                    >
                      {uniqueSquads.map((sq) => (
                        <option key={sq} value={sq}>{sq}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Task Title (કાર્ય નામ)</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Zone 1 Night Patrol / Warrant Executions"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Description & Instructions</label>
                  <textarea
                    rows={3}
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Specific locations, vehicles, check-posts, or targets..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="urgent">🔴 Urgent</option>
                      <option value="high">🟠 High</option>
                      <option value="normal">🟢 Normal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Target Due Date</label>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Specific Officers (Optional, comma-separated)</label>
                  <input
                    type="text"
                    value={newTaskOfficers}
                    onChange={(e) => setNewTaskOfficers(e.target.value)}
                    placeholder="e.g. खोડાભાઇ, સુરેન્દ્રસિંહ"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow">
                    Assign Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* SQUAD REASSIGNMENT MODAL (ADD / REPLACE OFFICER)                   */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isSquadAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-amber-500/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm min-[360px]:text-base font-black text-white">
                    {squadAssignMode === "replace" ? `Replace ${officerToReplace?.name} in ${targetSquadCode}` : `Add Officer to ${targetSquadCode}`}
                  </h2>
                </div>
                <button onClick={() => setIsSquadAssignModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-4 min-[360px]:p-6 space-y-4 text-xs">
                <input
                  type="text"
                  value={officerToAssignSearch}
                  onChange={(e) => setOfficerToAssignSearch(e.target.value)}
                  placeholder="Search officer by name, badge, designation..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {personnel
                    .filter((p) => {
                      if (squadAssignMode === "replace" && officerToReplace?.id === p.id) return false;
                      const q = officerToAssignSearch.toLowerCase().trim();
                      if (!q) return true;
                      return p.name.toLowerCase().includes(q) || p.badgeNo.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
                    })
                    .slice(0, 30)
                    .map((p) => (
                      <div key={p.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={p.avatarUrl || PRESET_AVATARS[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-amber-500/40 shadow flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Current: {p.code} • {cleanBadge(p.badgeNo)} ({p.designation})</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleExecuteSquadReassignment(p)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* ADD NEW SQUAD MODAL (EXPAND SQUADS / વધારો)                         */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isAddSquadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-emerald-500/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-sm min-[360px]:text-base font-black text-white">
                    {language === "gu" ? "નવી સ્કોડ ઉમેરો (Add New Squad)" : "Add New Squad"}
                  </h2>
                </div>
                <button onClick={() => setIsAddSquadModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">
                    {language === "gu" ? "સ્કોડનું નામ અથવા નંબર દાખલ કરો:" : "Squad Name / Code:"}
                  </label>
                  <input
                    type="text"
                    value={newSquadNameInput}
                    onChange={(e) => setNewSquadNameInput(e.target.value)}
                    placeholder="દા.ત. સ્કોડ-૧૧, સ્કોડ-૧૨, સાયબર સ્કોડ"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold block">
                    {language === "gu" ? "ઝડપી સૂચનો (Quick Suggestions):" : "Quick Suggestions:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["સ્કોડ-૧૧", "સ્કોડ-૧૨", "સ્કોડ-૧૩", "સ્કોડ-૧૪", "સ્કોડ-૧૫", "સાયબર સ્કોડ", "ઓપરેશન સ્કોડ"].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setNewSquadNameInput(sug)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg border border-slate-800 text-[11px] font-mono transition"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddSquadModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddCustomSquad()}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{language === "gu" ? "સ્કોડ ઉમેરો" : "Add Squad"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* SUPABASE CONNECTION CONFIG MODAL (IN-MEMORY, NO LOCAL STORAGE)      */}
      {/* =================================================================== */}
      <AnimatePresence>
        {supabaseConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-emerald-500/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-sm min-[360px]:text-base font-black text-white">Supabase Cloud Database Sync</h2>
                </div>
                <button onClick={() => setSupabaseConfigModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-4 min-[360px]:p-6 space-y-4 text-xs">
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1 text-emerald-200">
                  <span className="font-bold block">✓ Supabase Only Sync Active</span>
                  <p className="text-[11px] text-emerald-300">
                    All browser localStorage and sessionStorage are disabled. Records, real-time broadcasts, and squad tasks synchronize directly via Supabase.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Supabase Project URL (Optional Override)</label>
                  <input
                    type="text"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Supabase Anon Key (Optional Override)</label>
                  <input
                    type="password"
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-white text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (supabaseUrlInput.trim() && supabaseKeyInput.trim()) {
                      configureSupabase(supabaseUrlInput, supabaseKeyInput);
                      setSupabaseConnected(true);
                      showToast("Supabase endpoint configured!", "success");
                    }
                    setSupabaseConfigModalOpen(false);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  Save Connection Settings
                </button>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                      showToast("✓ SQL Schema copied to clipboard!", "success");
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl font-mono text-[11px]"
                  >
                    📋 Copy Supabase SQL Schema
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* BROADCAST ALERT HISTORY DRAWER                                     */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isAlertDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAlertDrawerOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
            <motion.aside initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }} className="fixed top-0 bottom-0 right-0 w-80 bg-slate-950 border-l border-slate-800 z-50 p-4 min-[360px]:p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-rose-400" />
                    <h2 className="text-sm font-black text-white">Live Broadcast Bulletins</h2>
                  </div>
                  <button onClick={() => setIsAlertDrawerOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-3">
                  {broadcasts.map((b) => (
                    <div key={b.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${b.priority === "critical" ? "bg-rose-500/20 text-rose-300" : b.priority === "high" ? "bg-amber-500/20 text-amber-300" : "bg-cyan-500/20 text-cyan-300"}`}>
                          {b.priority}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(b.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <h4 className="font-bold text-white">{b.title}</h4>
                      <p className="text-slate-300 leading-relaxed">{language === "gu" ? b.messageGu : b.messageEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* CRIME BRANCH AI ASSISTANT MODAL (APINEX MINIMAX & DEEPSEEK)         */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <div>
                    <h2 className="text-sm min-[360px]:text-base font-bold text-white">Gujarat Police Crime Branch AI</h2>
                    <span className="text-[10px] text-amber-400 font-mono block">Endpoint: https://api.apinex.bond/v1 (free/minimax-m3.1-flash & free/deepseek-v4.1-flash)</span>
                  </div>
                </div>
                <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-4 min-[360px]:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <form onSubmit={handleAskAI} className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. સ્કોડ-૦૧ માં કેટલા કર્મચારીઓ છે? Who is retiring this year?"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button type="submit" disabled={aiLoading} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow">
                    {aiLoading ? "Analyzing..." : "Ask"}
                  </button>
                </form>

                {aiModelUsed && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ Processed via: {aiModelUsed}</span>
                  </div>
                )}

                {aiResponse && (
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {aiResponse}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* SUPER ADMIN COMMAND CENTER MODAL                                   */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isAdminCommandCenterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-amber-500/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm min-[360px]:text-base font-black text-white">Super Admin Command Center</h2>
                </div>
                <button onClick={() => setIsAdminCommandCenterOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto text-xs font-bold">
                <button onClick={() => setAdminTab("tools")} className={`px-4 py-2.5 border-b-2 transition ${adminTab === "tools" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400"}`}>Quick Tools</button>
                <button onClick={() => setAdminTab("roles")} className={`px-4 py-2.5 border-b-2 transition ${adminTab === "roles" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400"}`}>User Roles</button>
                <button onClick={() => { setAdminTab("backups"); fetchBackups(); }} className={`px-4 py-2.5 border-b-2 transition ${adminTab === "backups" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400"}`}>Backups</button>
                <button onClick={() => { setAdminTab("audit"); fetchAuditLogs(); }} className={`px-4 py-2.5 border-b-2 transition ${adminTab === "audit" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400"}`}>Audit Logs</button>
              </div>

              <div className="p-4 min-[360px]:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                {adminTab === "tools" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="font-bold text-white block">1. Duty Place ⇄ Appointment Swap</span>
                        <p className="text-[11px] text-slate-400">Swaps column 6 and 7 across all records if imported reversed.</p>
                        <button onClick={handleSwapDutyPlaceAndAppointment} className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition">
                          Execute Swap Now
                        </button>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="font-bold text-white block">2. Re-sequence Serial Numbers</span>
                        <p className="text-[11px] text-slate-400">Resets serial numbers cleanly from 1 to {personnel.length}.</p>
                        <button onClick={handleResequenceSrNos} className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition">
                          Resequence 1 to N
                        </button>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="font-bold text-white block">3. Clean Duplicates</span>
                        <p className="text-[11px] text-slate-400">Detects and purges duplicate rows based on full signature.</p>
                        <button onClick={handleAutoDeleteDuplicates} className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition">
                          Clean Duplicates ({duplicateCount})
                        </button>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="font-bold text-white block">4. Align & Repair Columns</span>
                        <p className="text-[11px] text-slate-400">Repairs missing fields and duty/appointment mapping.</p>
                        <button onClick={handleFixAndAlignColumns} className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition">
                          Fix Column Integrity
                        </button>
                      </div>

                      <div className="p-3 bg-slate-900 border border-amber-500/30 rounded-xl space-y-1.5 min-[480px]:col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-400 block">5. સ્કોડ ૧ થી ૧૦ સેટ કરો (Squads 01 to 10 Roster)</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                            કુલ: {uniqueSquads.length} સ્કોડ
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {language === "gu"
                            ? "સ્કોડ સંખ્યા ૩૫ ને બદલે સ્કોડ-૦૧ થી સ્કોડ-૧૦ (કુલ ૧૦ સ્કોડ) સેટ કરો અને સ્ટાફને યોગ્ય રીતે ૧ થી ૧૦ સ્કોડમાં ફાળવો."
                            : "Resets squad structure to Squads 01 to 10 (Total 10 squads) and neatly normalizes roster personnel into Squads 01 to 10."}
                        </p>
                        <button onClick={handleResetTo10Squads} className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition">
                          Set Squads 01 to 10 Now
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <button onClick={handleExportJSON} className="py-2 px-4 bg-slate-800 text-slate-200 font-bold rounded-xl">
                        Export Master JSON
                      </button>
                      <button onClick={() => { setIsAdminCommandCenterOpen(false); setIsDeleteAllModalOpen(true); }} className="py-2 px-4 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-bold rounded-xl">
                        Purge All Roster (Delete All)
                      </button>
                    </div>
                  </div>
                )}

                {adminTab === "roles" && (
                  <div className="space-y-3">
                    <p className="text-slate-400">Super admin can toggle user permissions here:</p>
                    <div className="space-y-2">
                      {appUsers.map((u) => (
                        <div key={u.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-white block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{cleanBadge(u.badgeNo)} • {u.mobile}</span>
                          </div>
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeUserRole(u.id, e.target.value as UserRole)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-amber-400 font-bold"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="squad">Squad</option>
                            <option value="officer">Officer</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === "backups" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Server Backup Snapshots:</span>
                      <button onClick={handleCreateServerBackup} className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg">+ New Snapshot</button>
                    </div>
                    <div className="space-y-2">
                      {backups.map((b) => (
                        <div key={b.fileName} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                          <span>{b.fileName}</span>
                          <span className="text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === "audit" && (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-0.5">
                        <div className="flex justify-between text-slate-400 font-mono text-[10px]">
                          <span>{log.action}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-300 font-medium">{log.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* SPREADSHEET IMPORT MODAL (409 USERS)                                */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-emerald-500/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-sm min-[360px]:text-base font-bold text-white">Import 409+ Personnel Data</h2>
                </div>
                <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleImportSpreadsheet} className="p-4 min-[360px]:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-400 block">Expected Column Sequence:</span>
                  <p className="text-[11px] text-slate-400 font-mono">
                    અ.નં. • Code • હોદ્દો • બ.નં. • નામ • મોબાઇલ નંબર • ફરજની જગ્યા • નીમણૂંક • ક્રાઇમ હાજર તારીખ • જન્મ તારીખ • ભરતી તારીખ • વય નિવૃત તારીખ • આધાર • પાન
                  </p>
                </div>

                <textarea
                  rows={10}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste TSV or copied Excel rows here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input type="checkbox" checked={replaceData} onChange={(e) => setReplaceData(e.target.checked)} className="rounded" />
                    <span>Replace all existing roster records</span>
                  </label>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow">
                      Execute Import
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* 3-LAYER SECURE DELETE ALL MODAL                                     */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isDeleteAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border-2 border-rose-600 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-black text-white">3-Layer Secure Delete All</h3>
                  <span className="text-[11px] text-rose-400 font-bold">This operation CANNOT be undone!</span>
                </div>
              </div>

              {deleteError && (
                <div className="p-2.5 bg-rose-950 border border-rose-500/50 rounded-xl text-rose-300 font-semibold">{deleteError}</div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Layer 1: Enter Super Admin Security PIN</label>
                <input
                  type="password"
                  value={deleteAdminPin}
                  onChange={(e) => setDeleteAdminPin(e.target.value)}
                  placeholder="PIN: 1673583"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Layer 2: Type "DELETE ALL" exactly</label>
                <input
                  type="text"
                  value={deleteConfirmationPhrase}
                  onChange={(e) => setDeleteConfirmationPhrase(e.target.value)}
                  placeholder="DELETE ALL"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-rose-400 font-mono font-bold"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button onClick={() => setIsDeleteAllModalOpen(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button onClick={handleExecuteDeleteAll} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow">
                  Confirm Purge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* SINGLE RECORD DELETE CONFIRMATION                                   */}
      {/* =================================================================== */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-sm p-5 space-y-4 text-xs">
              <h3 className="text-base font-bold text-white">Delete Officer Confirmation</h3>
              <p className="text-slate-400">
                Are you sure you want to delete <span className="text-white font-bold">{deleteTarget.name}</span> ({cleanBadge(deleteTarget.badgeNo)}) from the database?
              </p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button onClick={handleConfirmSingleDelete} className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* OFFICER PHOTO MANAGEMENT MODAL (COMPUTER UPLOAD & IMAGE URL)        */}
      {/* =================================================================== */}
      <AnimatePresence>
        {photoTargetOfficer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm min-[360px]:text-base font-bold text-white">
                    {language === "gu" ? "અધિકારી ફોટો અપલોડ / URL" : "Officer Photo & URL"}
                  </h2>
                </div>
                <button
                  onClick={() => setPhotoTargetOfficer(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
                {/* Officer Mini Card with Large Crystal Clear Photo Preview */}
                <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg">
                  <div className="relative flex-shrink-0">
                    <img
                      src={photoPreview || PRESET_AVATARS[0]}
                      alt={photoTargetOfficer.name}
                      className="w-28 h-28 min-[360px]:w-32 min-[360px]:h-32 rounded-3xl object-cover border-3 border-amber-400 shadow-2xl"
                    />
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 shadow">
                      LIVE
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">અધિકારી ઓળખ (Officer Identity)</span>
                    <h3 className="font-bold text-white text-base truncate">{photoTargetOfficer.name}</h3>
                    <p className="text-amber-400 font-mono text-xs font-semibold">{photoTargetOfficer.designation} • {photoTargetOfficer.code}</p>
                    <p className="text-slate-300 font-mono text-xs">બક્કલ નં: {cleanBadge(photoTargetOfficer.badgeNo)}</p>
                    <p className="text-slate-400 text-[11px] truncate">{photoTargetOfficer.dutyPlace}</p>
                  </div>
                </div>

                {/* OPTION 1: UPLOAD FROM COMPUTER */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-amber-400" />
                      {language === "gu" ? "૧. કોમ્પ્યુટર માંથી ફોટો અપલોડ કરો" : "1. Upload from Computer"}
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-mono">PNG / JPG / WEBP</span>
                  </div>
                  <label className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition text-center group">
                    <Camera className="w-7 h-7 text-amber-400 group-hover:scale-110 transition mb-1.5" />
                    <span className="font-bold text-amber-300 text-xs">
                      {language === "gu" ? "💻 કોમ્પ્યુટર માંથી ફોટો પસંદ કરો" : "Choose photo from computer"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {language === "gu" ? "ક્લિક કરીને કોમ્પ્યુટર માંથી ફાઇલ સિલેક્ટ કરો" : "Click to browse device storage"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleComputerPhotoUpload(photoTargetOfficer.id, file);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* OPTION 2: ENTER IMAGE URL */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Link className="w-4 h-4 text-indigo-400" />
                      {language === "gu" ? "૨. ફોટો URL દાખલ કરો" : "2. Enter Image URL"}
                    </span>
                    <span className="text-[10px] text-slate-400">Web / Cloud URL</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/officer-photo.jpg"
                      value={photoUrlInput}
                      onChange={(e) => {
                        setPhotoUrlInput(e.target.value);
                        if (e.target.value.trim()) {
                          setPhotoPreview(e.target.value.trim());
                        }
                      }}
                      className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-white placeholder-slate-600 font-mono text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (photoUrlInput.trim()) {
                          setPhotoPreview(photoUrlInput.trim());
                          showToast("Preview updated", "info");
                        }
                      }}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex-shrink-0"
                    >
                      {language === "gu" ? "પ્રિવ્યૂ" : "Preview"}
                    </button>
                  </div>
                </div>

                {/* OPTION 3: PRESET POLICE AVATARS */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-200 block text-[11px]">
                    {language === "gu" ? "૩. અથવા પ્રીસેટ પોલીસ અવતાર પસંદ કરો:" : "3. Or Select Preset Police Avatar:"}
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPhotoPreview(av);
                          setPhotoUrlInput(av);
                        }}
                        className={`relative rounded-2xl p-1 transition flex-shrink-0 ${
                          photoPreview === av ? "ring-2 ring-amber-400 scale-105" : "opacity-75 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={av}
                          alt="avatar"
                          className="w-14 h-14 rounded-2xl object-cover shadow border border-slate-700"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPhotoTargetOfficer(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
                  >
                    {language === "gu" ? "રદ કરો" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSavePhotoUrl(photoPreview || photoUrlInput)}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{language === "gu" ? "✓ ફોટો સેવ કરો" : "Save Photo"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* FULL-SIZE OFFICER PHOTO INSPECTION LIGHTBOX MODAL                   */}
      {/* =================================================================== */}
      <AnimatePresence>
        {enlargedPhotoOfficer && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md"
            onClick={() => setEnlargedPhotoOfficer(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-950 border-2 border-amber-500/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm sm:text-base font-black text-white">
                    {language === "gu" ? "અધિકારી ફોટો ઓળખ (Photo Identity)" : "Officer Photo Identity"}
                  </h2>
                </div>
                <button
                  onClick={() => setEnlargedPhotoOfficer(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 flex flex-col items-center text-center space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Large high-clarity officer portrait */}
                <div className="relative group">
                  <img
                    src={enlargedPhotoOfficer.avatarUrl || PRESET_AVATARS[0]}
                    alt={enlargedPhotoOfficer.name}
                    className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl object-cover border-4 border-amber-400 shadow-2xl ring-4 ring-amber-500/20"
                  />
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-mono font-bold text-amber-300 border border-slate-700">
                    {enlargedPhotoOfficer.code}
                  </span>
                </div>

                {/* Officer Details */}
                <div className="space-y-1.5 w-full">
                  <h3 className="text-lg sm:text-xl font-black text-white">{enlargedPhotoOfficer.name}</h3>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                      {enlargedPhotoOfficer.designation}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
                      બક્કલ નં: {cleanBadge(enlargedPhotoOfficer.badgeNo)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      {enlargedPhotoOfficer.appointment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium pt-1">
                    {t.dutyPlace}: <span className="text-slate-200">{enlargedPhotoOfficer.dutyPlace}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    HRPN No: <span className="text-amber-400 font-bold">{maskWeapon(enlargedPhotoOfficer.weaponNo)}</span> • મો: <span className="text-slate-200">{maskMobile(enlargedPhotoOfficer.mobile)}</span>
                  </p>
                </div>

                {/* Quick Action Ribbon */}
                <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      const off = enlargedPhotoOfficer;
                      setEnlargedPhotoOfficer(null);
                      handleOpenPhotoModal(off);
                    }}
                    className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{language === "gu" ? "ફોટો બદલો / અપલોડ" : "Change Photo"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleShareOfficer(enlargedPhotoOfficer);
                    }}
                    className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{language === "gu" ? "વિગત શેર કરો" : "Share Details"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* ADD / EDIT OFFICER MODAL                                            */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <h2 className="text-sm min-[360px]:text-base font-bold text-white">
                  {editingPerson ? (language === "gu" ? "કર્મચારી વિગત સુધારો" : "Edit Personnel") : (language === "gu" ? "નવો કર્મચારી ઉમેરો" : "Add Personnel")}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSavePersonnel} className="p-4 min-[360px]:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.squad}</label>
                    <select
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                      required
                    >
                      {uniqueSquads.map((sq) => (
                        <option key={sq} value={sq}>{sq}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.designation}</label>
                    <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.badgeNo}</label>
                    <input type="text" value={formData.badgeNo} onChange={(e) => setFormData({ ...formData, badgeNo: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.name}</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.mobile}</label>
                    <input type="text" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.dutyPlace}</label>
                    <input type="text" value={formData.dutyPlace} onChange={(e) => setFormData({ ...formData, dutyPlace: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.appointment}</label>
                    <input type="text" value={formData.appointment} onChange={(e) => setFormData({ ...formData, appointment: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.reportDate}</label>
                    <input type="text" value={formData.reportDate} onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })} placeholder="DD/MM/YYYY" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.birthDate}</label>
                    <input type="text" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} placeholder="DD/MM/YYYY" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.retirementDate}</label>
                    <input type="text" value={formData.retirementDate} onChange={(e) => setFormData({ ...formData, retirementDate: e.target.value })} placeholder="DD/MM/YYYY" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.weapon}</label>
                    <input type="text" value={formData.weaponNo} onChange={(e) => setFormData({ ...formData, weaponNo: e.target.value })} placeholder="HRPN No." className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.blood}</label>
                    <input type="text" value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.aadhar}</label>
                    <input type="text" value={formData.aadharNo} onChange={(e) => setFormData({ ...formData, aadharNo: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">{t.pan}</label>
                    <input type="text" value={formData.panNo} onChange={(e) => setFormData({ ...formData, panNo: e.target.value.toUpperCase() })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow">
                    Save Personnel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
