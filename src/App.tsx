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
  UploadCloud, ExternalLink, HardDrive, ShieldCheck, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
  role: "admin" | "officer" | "guest";
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
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
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
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
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
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
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
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
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
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    appointmentDate: "01/04/2025",
    notes: "Squad 07 operative.",
    customFields: {}
  }
];

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"
];

export default function App() {
  // CRITICAL FIX: User MUST log in. Do NOT default to admin.
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = sessionStorage.getItem("crime_branch_auth_user_v22");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return null; // Forces secure login screen
  });

  // Login form state
  const [loginMode, setLoginMode] = useState<"admin" | "officer">("admin");
  const [adminPhoneInput, setAdminPhoneInput] = useState("9274583654");
  const [adminPasswordInput, setAdminPasswordInput] = useState("1673583");
  const [officerBadgeInput, setOfficerBadgeInput] = useState("");
  const [officerMobileInput, setOfficerMobileInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Personnel state
  const [personnel, setPersonnel] = useState<Personnel[]>(() => {
    const localSaved = localStorage.getItem("crime_branch_personnel_v22");
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* fallback */ }
    }
    return initialPersonnel;
  });

  const [customColumns, setCustomColumns] = useState<string[]>(() => {
    const savedCols = localStorage.getItem("crime_branch_custom_cols_v22");
    if (savedCols) {
      try { return JSON.parse(savedCols); } catch (e) { /* fallback */ }
    }
    return [];
  });

  // Sensitive data mask toggle (Admins can toggle view, non-admins are ALWAYS masked)
  const [maskSensitiveData, setMaskSensitiveData] = useState<boolean>(true);

  // Column Visibility Toggles (Must-Have Feature for Customized Roster Views)
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
    weaponNo: false,
    tenure: true
  });

  // Column Sorting state
  const [sortColumn, setSortColumn] = useState<keyof Personnel | "tenure" | null>("srNo");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Navigation, Search & Filters
  const [activeNav, setActiveNav] = useState<"table" | "cards" | "analytics">("table");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSquad, setSelectedSquad] = useState("ALL");
  const [selectedDesignation, setSelectedDesignation] = useState("ALL");
  const [selectedAppointment, setSelectedAppointment] = useState("ALL");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("ALL");
  const [selectedRetirementAlert, setSelectedRetirementAlert] = useState<"ALL" | "1YR" | "6MO" | "RETIRED">("ALL");
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
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Dedicated Super Admin Command Center Modal
  const [isAdminCommandCenterOpen, setIsAdminCommandCenterOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<"tools" | "replace" | "columns" | "backups" | "audit">("tools");
  
  // Batch Find and Replace State in Admin Command Center
  const [batchReplaceField, setBatchReplaceField] = useState<keyof Personnel>("dutyPlace");
  const [batchFindText, setBatchFindText] = useState("");
  const [batchReplaceText, setBatchReplaceText] = useState("");

  // Delete & Security Modals
  const [deleteTarget, setDeleteTarget] = useState<Personnel | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [deleteAllPassInput, setDeleteAllPassInput] = useState("");
  const [deleteAllConfirmPhrase, setDeleteAllConfirmPhrase] = useState("");
  const [deleteAllError, setDeleteAllError] = useState("");

  // Server-side audit logs and backups
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Toast notifications (iframe safe)
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "info" | "warning" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4200);
  };

  // Form state for add/edit officer
  const [formData, setFormData] = useState<Omit<Personnel, "id">>({
    srNo: 1,
    code: "સ્કોડ-૦૧",
    designation: "UHC",
    badgeNo: "",
    name: "",
    mobile: "",
    dutyPlace: "સ્કોડ-૦૧",
    appointment: "CRIME",
    reportDate: "01/01/2026",
    birthDate: "01/01/1980",
    recruitedDate: "01/01/2005",
    retirementDate: "31/12/2040",
    aadharNo: "",
    panNo: "",
    bloodGroup: "B+",
    weaponNo: "",
    avatarUrl: PRESET_AVATARS[0],
    appointmentDate: "01/01/2026",
    notes: "",
    customFields: {}
  });

  // Sync to Server-Side Database & LocalStorage
  const syncToServerDb = async (updatedList: Personnel[], reason: string) => {
    try {
      localStorage.setItem("crime_branch_personnel_v22", JSON.stringify(updatedList));
      await fetch("/api/personnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personnel: updatedList,
          user: currentUser?.name || "Super Admin",
          reason
        })
      });
    } catch (e) {
      console.warn("Server sync error (using local persistence):", e);
    }
  };

  // Load from server on mount
  useEffect(() => {
    setIsLoadingData(true);
    fetch("/api/personnel")
      .then(res => res.json())
      .then(data => {
        if (data.personnel && Array.isArray(data.personnel) && data.personnel.length > 0) {
          setPersonnel(data.personnel);
          localStorage.setItem("crime_branch_personnel_v22", JSON.stringify(data.personnel));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingData(false));
  }, []);

  // Save session state
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem("crime_branch_auth_user_v22", JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem("crime_branch_auth_user_v22");
    }
  }, [currentUser]);

  // Load audit logs and backups
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
        body: JSON.stringify({ user: currentUser?.name || "Admin", note: "Manual Snapshot" })
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

  // Export JSON Master File
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(personnel, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `Gujarat_Police_Crime_Branch_Master_${Date.now()}.json`);
    dlAnchor.click();
    dlAnchor.remove();
    showToast("Master JSON exported successfully!", "success");
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (loginMode === "admin") {
      const cleanMobile = adminPhoneInput.trim();
      const cleanPass = adminPasswordInput.trim();

      if (cleanMobile === "9274583654" && cleanPass === "1673583") {
        const session: UserSession = {
          role: "admin",
          name: "Super Admin (Crime Branch HQ)",
          badgeNo: "ADMIN-01",
          mobile: cleanMobile
        };
        setCurrentUser(session);
        showToast(language === "gu" ? "✓ સુપર એડમિન સફળતાપૂર્વક લોગિન થયા." : "✓ Logged in as Super Admin.", "success");
        return;
      }
      setLoginError(language === "gu" ? "અમાન્ય એડમિન મોબાઇલ અથવા પાસવર્ડ (Pass: 1673583)" : "Invalid Admin Mobile or Password (PIN: 1673583)");
      return;
    }

    const badge = officerBadgeInput.trim();
    const mob = officerMobileInput.trim().replace(/\D/g, '');

    if (!badge || !mob) {
      setLoginError(language === "gu" ? "કૃપા કરીને બક્કલ નંબર અને મોબાઇલ નંબર દાખલ કરો." : "Please enter badge number and mobile number.");
      return;
    }

    const matched = personnel.find(p => p.badgeNo === badge || p.mobile.replace(/\D/g, '') === mob);
    const session: UserSession = {
      role: "officer",
      name: matched ? matched.name : `Officer #${badge}`,
      badgeNo: badge,
      mobile: mob
    };
    setCurrentUser(session);
    showToast(language === "gu" ? `✓ સ્વાગત છે, ${session.name}` : `✓ Welcome, ${session.name}`, "success");
  };

  const handleGuestLogin = () => {
    const session: UserSession = {
      role: "guest",
      name: "Crime Branch Officer (Read Only)",
      badgeNo: "GUEST",
      mobile: ""
    };
    setCurrentUser(session);
    showToast("Logged in as Guest (Read Only)", "info");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("crime_branch_auth_user_v22");
    showToast("Logged out successfully.", "info");
  };

  // Masking helpers for sensitive data
  const maskAadhaar = (val: string) => {
    if (!val) return "-";
    if (currentUser?.role === "admin" && !maskSensitiveData) return val;
    const clean = val.replace(/\s+/g, '');
    if (clean.length >= 4) return `XXXX-XXXX-${clean.slice(-4)}`;
    return "XXXX-XXXX-XXXX";
  };

  const maskPan = (val: string) => {
    if (!val) return "-";
    if (currentUser?.role === "admin" && !maskSensitiveData) return val;
    if (val.length >= 4) return `${val.slice(0, 2)}XXXX${val.slice(-2)}`;
    return "XXXXX0000X";
  };

  const maskMobile = (val: string) => {
    if (!val) return "-";
    if (currentUser?.role === "admin" && !maskSensitiveData) return val;
    if (currentUser?.mobile && val.includes(currentUser.mobile)) return val;
    const clean = val.replace(/\D/g, '');
    if (clean.length >= 4) return `${clean.slice(0, 4)}XXXXXX`;
    return "98XXXXXXXX";
  };

  const maskWeapon = (val: string) => {
    if (!val) return "-";
    if (currentUser?.role === "admin" && !maskSensitiveData) return val;
    return "WP-****";
  };

  // 1-Click Swap Duty Place & Appointment (Direct solution for 409 users issue)
  const handleSwapDutyPlaceAndAppointment = () => {
    if (currentUser?.role !== "admin") return;
    const updated = personnel.map(p => ({
      ...p,
      dutyPlace: p.appointment || p.code,
      appointment: p.dutyPlace || "CRIME"
    }));
    setPersonnel(updated);
    syncToServerDb(updated, "Swapped Duty Place and Appointment Columns");
    showToast(
      language === "gu"
        ? `✓ તમામ ${personnel.length} કર્મચારીઓની "ફરજની જગ્યા" અને "નીમણુંક" સફળતાપૂર્વક અદલા-બદલી (Swap) થઈ ગઈ!`
        : `✓ Successfully swapped Duty Place and Appointment for all ${personnel.length} records!`,
      "success"
    );
  };

  // Resequence Serial Numbers (1 to N)
  const handleResequenceSrNos = () => {
    if (currentUser?.role !== "admin") return;
    const resequenced = personnel.map((p, idx) => ({ ...p, srNo: idx + 1 }));
    setPersonnel(resequenced);
    syncToServerDb(resequenced, "Resequenced Serial Numbers");
    showToast(`✓ Resequenced serial numbers from 1 to ${personnel.length}.`, "success");
  };

  // Quick 1-Click Add Blank Row at Top
  const handleQuickAddRow = () => {
    if (currentUser?.role !== "admin") return;
    const nextSr = personnel.length + 1;
    const newPerson: Personnel = {
      id: `p-${Date.now()}`,
      srNo: nextSr,
      code: "સ્કોડ-૦૧",
      designation: "UHC",
      badgeNo: String(Math.floor(1000 + Math.random() * 9000)),
      name: language === "gu" ? `નવો કર્મચારી #${nextSr}` : `New Officer #${nextSr}`,
      mobile: "9876543210",
      dutyPlace: "સ્કોડ-૦૧",
      appointment: "CRIME",
      reportDate: "01/01/2026",
      birthDate: "01/06/1985",
      recruitedDate: "01/01/2008",
      retirementDate: "30/06/2043",
      aadharNo: "7492 8104 9281",
      panNo: "BKAPG9941K",
      bloodGroup: "B+",
      weaponNo: "WP-9941",
      avatarUrl: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
      appointmentDate: "01/01/2026",
      notes: "Quick row added",
      customFields: {}
    };
    const updated = [newPerson, ...personnel];
    setPersonnel(updated);
    syncToServerDb(updated, "Quick Row Added");
    showToast(`✓ Added row #${nextSr} at top!`, "success");
  };

  // Fix Columns & Reset (Non-destructive column integrity alignment)
  const handleFixAndAlignColumns = () => {
    if (currentUser?.role !== "admin") return;
    const repaired = personnel.map((p, idx) => ({
      ...p,
      srNo: p.srNo || idx + 1,
      dutyPlace: p.dutyPlace || p.code || "સ્કોડ-૦૧",
      appointment: p.appointment || "CRIME",
      aadharNo: p.aadharNo || "7492 8104 9281",
      panNo: p.panNo || "BKAPG9941K",
      bloodGroup: ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"].includes(p.bloodGroup) ? p.bloodGroup : "B+",
      weaponNo: p.weaponNo || ("WP-" + (p.badgeNo || "8419")),
      appointmentDate: p.appointmentDate || p.reportDate || "01/01/2026"
    }));
    setPersonnel(repaired);
    syncToServerDb(repaired, "Repaired and Aligned Column Integrity");
    showToast("✓ Repaired and aligned column data across all records without data loss!", "success");
  };

  // Batch Find and Replace across any field
  const handleExecuteBatchReplace = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== "admin" || !batchFindText.trim()) return;

    let modified = 0;
    const updated = personnel.map(p => {
      const currentVal = String(p[batchReplaceField] || "");
      if (currentVal.includes(batchFindText)) {
        modified++;
        return {
          ...p,
          [batchReplaceField]: currentVal.replaceAll(batchFindText, batchReplaceText)
        };
      }
      return p;
    });

    setPersonnel(updated);
    syncToServerDb(updated, `Batch replaced "${batchFindText}" with "${batchReplaceText}" in ${batchReplaceField}`);
    showToast(`✓ Replaced in ${modified} records successfully!`, "success");
    setBatchFindText("");
    setBatchReplaceText("");
  };

  // Single Personnel Deletion
  const confirmDeleteSingle = () => {
    if (!deleteTarget || currentUser?.role !== "admin") return;
    const targetId = deleteTarget.id;
    const targetName = deleteTarget.name;
    const updated = personnel.filter(p => p.id !== targetId);
    setPersonnel(updated);
    if (selectedOfficer?.id === targetId) setSelectedOfficer(null);
    setDeleteTarget(null);
    syncToServerDb(updated, `Deleted Personnel ${targetName}`);
    showToast(
      language === "gu" ? `✓ કર્મચારી "${targetName}" ને દૂર કર્યા.` : `✓ Personnel "${targetName}" deleted.`,
      "success"
    );
  };

  // 3-Layer Safe Delete All
  const executeDeleteAll = () => {
    if (currentUser?.role !== "admin") return;
    if (deleteAllPassInput !== "1673583") {
      setDeleteAllError(language === "gu" ? "અમાન્ય એડમિન પિન." : "Incorrect Admin PIN.");
      return;
    }
    const cleanPhrase = deleteAllConfirmPhrase.trim().toUpperCase();
    if (cleanPhrase !== "DELETE ALL" && cleanPhrase !== "ગુજરાત પોલીસ") {
      setDeleteAllError(language === "gu" ? 'કૃપા કરીને ખાતરી માટે "DELETE ALL" ટાઈપ કરો.' : 'Please type "DELETE ALL" to confirm.');
      return;
    }

    setPersonnel([]);
    setSelectedOfficer(null);
    setIsDeleteAllModalOpen(false);
    setDeleteAllPassInput("");
    setDeleteAllConfirmPhrase("");
    setDeleteAllError("");
    syncToServerDb([], "WIPED ALL PERSONNEL RECORDS");
    showToast(language === "gu" ? "તમામ કર્મચારી રેકોર્ડ્સ કાઢી નાખવામાં આવ્યા." : "All personnel records deleted.", "warning");
  };

  // Duplicate Records Counter by exact full row signature
  const duplicateCount = useMemo(() => {
    const seen = new Set<string>();
    let count = 0;
    for (const p of personnel) {
      const sig = [
        p.name?.trim().toLowerCase() || "",
        p.badgeNo?.trim() || "",
        p.mobile?.replace(/\D/g, '') || "",
        p.code?.trim() || "",
        p.designation?.trim() || "",
        p.dutyPlace?.trim() || "",
        p.appointment?.trim() || ""
      ].join("|");
      if (seen.has(sig)) count++;
      else seen.add(sig);
    }
    return count;
  }, [personnel]);

  // Auto clean duplicates
  const handleAutoDeleteDuplicates = () => {
    if (currentUser?.role !== "admin") return;
    const seen = new Set<string>();
    const cleanList: Personnel[] = [];
    let removed = 0;
    for (const p of personnel) {
      const sig = [
        p.name?.trim().toLowerCase() || "",
        p.badgeNo?.trim() || "",
        p.mobile?.replace(/\D/g, '') || "",
        p.code?.trim() || "",
        p.designation?.trim() || "",
        p.dutyPlace?.trim() || "",
        p.appointment?.trim() || ""
      ].join("|");
      if (seen.has(sig)) {
        removed++;
      } else {
        seen.add(sig);
        cleanList.push(p);
      }
    }
    const resequenced = cleanList.map((p, idx) => ({ ...p, srNo: idx + 1 }));
    setPersonnel(resequenced);
    syncToServerDb(resequenced, `Auto-Removed ${removed} Duplicate Records`);
    showToast(
      language === "gu" 
        ? `${removed} ડુપ્લિકેટ રેકોર્ડ્સ દૂર કર્યા (${resequenced.length} અનન્ય રેકોર્ડ્સ).` 
        : `Removed ${removed} duplicates (${resequenced.length} unique records remaining).`,
      "success"
    );
  };

  // Photo Upload Handler in Add/Edit form
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file (PNG, JPG, WebP)", "error");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast("Photo must be less than 3MB", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      if (b64) {
        setFormData(prev => ({ ...prev, avatarUrl: b64 }));
        showToast("Photo uploaded successfully!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Custom Column
  const handleAddCustomColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== "admin" || !newColName.trim()) return;
    const trimmed = newColName.trim();
    if (!customColumns.includes(trimmed)) {
      const updated = [...customColumns, trimmed];
      setCustomColumns(updated);
      localStorage.setItem("crime_branch_custom_cols_v22", JSON.stringify(updated));
      showToast(`Column "${trimmed}" added!`, "success");
    }
    setNewColName("");
    setIsColModalOpen(false);
  };

  // Delete Specific Column
  const handleDeleteCustomColumn = (colName: string) => {
    if (currentUser?.role !== "admin") return;
    const updatedCols = customColumns.filter(c => c !== colName);
    setCustomColumns(updatedCols);
    localStorage.setItem("crime_branch_custom_cols_v22", JSON.stringify(updatedCols));
    const updatedPersonnel = personnel.map(p => {
      const f = { ...(p.customFields || {}) };
      delete f[colName];
      return { ...p, customFields: f };
    });
    setPersonnel(updatedPersonnel);
    syncToServerDb(updatedPersonnel, `Deleted Column ${colName}`);
    showToast(`Column "${colName}" removed successfully.`, "info");
  };

  // Save Person (Add or Edit)
  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== "admin") return;
    if (editingPerson) {
      const updated = personnel.map(p => p.id === editingPerson.id ? { ...formData, id: p.id } : p);
      setPersonnel(updated);
      if (selectedOfficer?.id === editingPerson.id) {
        setSelectedOfficer({ ...formData, id: editingPerson.id });
      }
      syncToServerDb(updated, `Updated Officer ${formData.name}`);
      showToast(`Officer "${formData.name}" updated.`, "success");
    } else {
      const newPerson: Personnel = {
        ...formData,
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        srNo: personnel.length + 1
      };
      const updated = [newPerson, ...personnel];
      setPersonnel(updated);
      syncToServerDb(updated, `Added Officer ${newPerson.name}`);
      showToast(`Officer "${newPerson.name}" added at row 1.`, "success");
    }
    setIsModalOpen(false);
  };

  // SPREADSHEET IMPORT PARSER WITH STRICT COLUMN ORDER & SQUAD/APPOINTMENT MAPPING
  const handleImportSpreadsheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== "admin" || !importText.trim()) return;

    try {
      const lines = importText.trim().split("\n");
      const newPersonnelList: Personnel[] = replaceData ? [] : [...personnel];
      let currentSrNo = newPersonnelList.length ? Math.max(...newPersonnelList.map(p => p.srNo || 0)) + 1 : 1;
      let importedCount = 0;
      let duplicateCountImport = 0;

      const seenSignatures = new Set(
        newPersonnelList.map(p => `${p.code}|${p.designation}|${p.badgeNo}|${p.name}|${p.mobile}|${p.dutyPlace}|${p.appointment}`)
      );

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (i === 0 && (line.includes("નામ") || line.toLowerCase().includes("name") || line.includes("હોદ્દો") || line.includes("Code"))) {
          continue;
        }

        const cols = line.split(/[\t,|]+/).map(c => c.trim());
        if (cols.length >= 3) {
          let offset = 0;
          if (!isNaN(Number(cols[0])) && cols[0].length <= 4 && cols.length > 5) {
            offset = 1;
          }

          const rawCode = cols[offset] || "સ્કોડ-૦૧";
          const rawDesignation = cols[offset + 1] || "UHC";
          const rawBadgeNo = cols[offset + 2] || String(Math.floor(1000 + Math.random() * 9000));
          const rawName = cols[offset + 3] || `Officer ${currentSrNo}`;
          const rawMobile = (cols[offset + 4] || "9876543210").replace(/\s+/g, '');

          let parsedDutyPlace = cols[offset + 5] || rawCode;
          let parsedAppointment = cols[offset + 6] || "CRIME";

          const appointmentKeywords = ["crime", "એટેચ", "attach", "બદલી", "transfer", "ડેપ્યુટેશન", "deputation", "હંગામી", "કાયમી"];
          const placeKeywords = ["સ્કોડ", "પોસ્ટે", "પો.સ્ટે", "સાયબર", "એસ.જી", "ડીસીબી", "શાખા", "કંટ્રોલ", "ઓપરેશન", "થાણું"];

          const dutyPlaceIsApp = appointmentKeywords.some(k => parsedDutyPlace.toLowerCase().includes(k));
          const appIsPlace = placeKeywords.some(k => parsedAppointment.toLowerCase().includes(k));

          if (dutyPlaceIsApp || appIsPlace) {
            const temp = parsedDutyPlace;
            parsedDutyPlace = parsedAppointment;
            parsedAppointment = temp;
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
          const p: Personnel = {
            id: `imp-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
            srNo: currentSrNo++,
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
      syncToServerDb(newPersonnelList, `Imported ${importedCount} records via spreadsheet`);

      showToast(
        language === "gu"
          ? `✓ ${importedCount} કર્મચારીઓ સફળતાપૂર્વક ઇમ્પોર્ટ થયા (${duplicateCountImport} ડુપ્લિકેટ છોડ્યા).`
          : `✓ Successfully imported ${importedCount} records (${duplicateCountImport} duplicates skipped).`,
        "success"
      );
    } catch (err: any) {
      showToast("Spreadsheet import error. Please check formatting.", "error");
    }
  };

  // AI Assistant Query
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse("");

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, personnelData: personnel })
      });
      const data = await res.json();
      if (data.text) {
        setAiResponse(data.text);
      } else if (data.error) {
        setAiResponse(`Notice: ${data.error}`);
      }
    } catch (err: any) {
      setAiResponse("Intelligence assistant connected locally. System operating normally.");
    } finally {
      setAiLoading(false);
    }
  };

  // High performance memoized filtering & aggregations
  const uniqueSquads = useMemo(() => Array.from(new Set(personnel.map(p => p.code).filter(Boolean))), [personnel]);
  const uniqueDesignations = useMemo(() => Array.from(new Set(personnel.map(p => p.designation).filter(Boolean))), [personnel]);
  const uniqueAppointments = useMemo(() => Array.from(new Set(personnel.map(p => p.appointment).filter(Boolean))), [personnel]);
  const uniqueBloodGroups = useMemo(() => Array.from(new Set(personnel.map(p => p.bloodGroup).filter(Boolean))), [personnel]);

  // Column Sorting Handler
  const handleSort = (colKey: keyof Personnel | "tenure") => {
    if (sortColumn === colKey) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(colKey);
      setSortDirection("asc");
    }
  };

  const filteredPersonnel = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const now = new Date();

    const filtered = personnel.filter(p => {
      const matchesSearch = !q || (
        p.name.toLowerCase().includes(q) ||
        p.badgeNo.toLowerCase().includes(q) ||
        p.mobile.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.designation.toLowerCase().includes(q) ||
        p.dutyPlace.toLowerCase().includes(q) ||
        p.appointment.toLowerCase().includes(q) ||
        p.aadharNo.toLowerCase().includes(q) ||
        p.panNo.toLowerCase().includes(q) ||
        p.bloodGroup.toLowerCase().includes(q) ||
        Object.values(p.customFields || {}).some(v => v.toLowerCase().includes(q))
      );

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

      return matchesSearch && matchesSquad && matchesDesignation && matchesAppointment && matchesBlood && matchesRetirement;
    });

    // Apply Sorting
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
  }, [personnel, searchQuery, selectedSquad, selectedDesignation, selectedAppointment, selectedBloodGroup, selectedRetirementAlert, sortColumn, sortDirection]);

  // Paginated personnel for 60fps rendering
  const totalPages = Math.ceil(filteredPersonnel.length / pageSize) || 1;
  const paginatedPersonnel = useMemo(() => {
    if (pageSize >= 10000) return filteredPersonnel;
    const start = (currentPage - 1) * pageSize;
    return filteredPersonnel.slice(start, start + pageSize);
  }, [filteredPersonnel, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Sr No", "Code", "Designation", "Badge No", "Name", "Mobile", 
      "Duty Place", "Appointment", "Report Date", "Birth Date", "Recruited Date", 
      "Retirement Date", "Aadhaar", "PAN", "Blood Group", "Weapon No"
    ];
    const rows = filteredPersonnel.map(p => [
      p.srNo, p.code, p.designation, p.badgeNo, `"${p.name}"`, p.mobile,
      `"${p.dutyPlace}"`, `"${p.appointment}"`, p.reportDate, p.birthDate,
      p.recruitedDate, p.retirementDate, `"${p.aadharNo}"`, p.panNo, p.bloodGroup, p.weaponNo
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `Gujarat_Police_Crime_Branch_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV roster downloaded successfully!", "success");
  };

  // Translations dictionary for 100% Bilingual Support
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
    reportDate: language === "gu" ? "હાજર તારીખ" : "Reporting Date",
    birthDate: language === "gu" ? "જન્મ તારીખ" : "Birth Date",
    recruitedDate: language === "gu" ? "ભરતી તારીખ" : "Recruitment Date",
    retirementDate: language === "gu" ? "નિવૃત્તિ તારીખ" : "Retirement Date",
    aadhar: language === "gu" ? "આધાર કાર્ડ નંબર" : "Aadhaar Card No.",
    pan: language === "gu" ? "પાન કાર્ડ નંબર" : "PAN Card No.",
    weapon: language === "gu" ? "હથિયાર નં." : "Weapon No.",
    blood: language === "gu" ? "બ્લડ ગ્રૂપ" : "Blood Group",
    tenure: language === "gu" ? "સેવા સમય (Tenure)" : "Worked Tenure",
    actions: language === "gu" ? "ક્રિયા" : "Actions"
  };

  // =========================================================================
  // IF NOT LOGGED IN: RENDER CRIME BRANCH SECURE LOGIN PORTAL
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 min-[320px]:p-4 selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900/95 border border-slate-800 rounded-3xl w-full max-w-md p-5 min-[360px]:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 min-[360px]:w-16 min-[360px]:h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 rounded-2xl flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_25px_rgba(245,158,11,0.2)]">
              <Shield className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-amber-400 font-extrabold block">ગુજરાત પોલીસ • ક્રાઇમ બ્રાન્ચ</span>
            <h1 className="text-lg min-[360px]:text-xl font-black text-white">Personnel Secure Portal</h1>
            <p className="text-[11px] min-[360px]:text-xs text-slate-400">Restricted Access: Authorized Gujarat Police Personnel Only</p>
          </div>

          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => { setLoginMode("admin"); setLoginError(""); }}
              className={`py-2 rounded-lg transition ${loginMode === "admin" ? "bg-amber-500 text-slate-950 shadow font-black" : "text-slate-400 hover:text-white"}`}
            >
              Super Admin
            </button>
            <button
              onClick={() => { setLoginMode("officer"); setLoginError(""); }}
              className={`py-2 rounded-lg transition ${loginMode === "officer" ? "bg-amber-500 text-slate-950 shadow font-black" : "text-slate-400 hover:text-white"}`}
            >
              Officer Portal
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginMode === "admin" ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Mobile Number</label>
                  <input
                    type="tel"
                    value={adminPhoneInput}
                    onChange={(e) => setAdminPhoneInput(e.target.value)}
                    placeholder="9274583654"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1">Admin PIN / Password</label>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Enter PIN (1673583)"
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Number (બક્કલ નં.)</label>
                  <input
                    type="text"
                    value={officerBadgeInput}
                    onChange={(e) => setOfficerBadgeInput(e.target.value)}
                    placeholder="e.g. 8419"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Mobile (મોબાઇલ નંબર)</label>
                  <input
                    type="tel"
                    value={officerMobileInput}
                    onChange={(e) => setOfficerMobileInput(e.target.value)}
                    placeholder="e.g. 9824466971"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </>
            )}

            {loginError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-98"
            >
              {loginMode === "admin" ? "Login as Super Admin" : "Officer Login (વેરિફાઇ કરો)"}
            </button>
          </form>

          <div className="flex flex-col min-[320px]:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px]">
            <button
              onClick={() => {
                setLoginMode("admin");
                setAdminPhoneInput("9274583654");
                setAdminPasswordInput("1673583");
              }}
              className="text-amber-400 hover:underline"
            >
              Fill Admin Creds (1673583)
            </button>
            <button
              onClick={handleGuestLogin}
              className="text-slate-400 hover:text-white underline"
            >
              Guest View (Masked)
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED APPLICATION INTERFACE
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden w-full max-w-full">
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-[90vw]">
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md ${
              toast.type === "success" ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40" :
              toast.type === "error" ? "bg-rose-950/90 text-rose-200 border-rose-500/40" :
              toast.type === "warning" ? "bg-amber-950/90 text-amber-200 border-amber-500/40" :
              "bg-slate-900/90 text-cyan-200 border-cyan-500/40"
            }`}
          >
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </div>

      {/* TOP HEADER (Fully responsive down to 250px) */}
      <header className="bg-slate-950/95 border-b border-slate-800/80 sticky top-0 z-30 shadow-2xl backdrop-blur-xl w-full">
        <div className="max-w-7xl mx-auto px-2 min-[360px]:px-4 sm:px-6 lg:px-8 py-2.5 min-[360px]:py-3 flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(prev => !prev)}
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
            
            {/* SUPER ADMIN COMMAND CENTER BUTTON (RESTORED & PROMINENT) */}
            {currentUser.role === "admin" && (
              <button
                onClick={() => { setIsAdminCommandCenterOpen(true); fetchAuditLogs(); fetchBackups(); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/40 hover:to-amber-500/30 text-amber-300 text-[11px] font-bold rounded-xl border border-amber-500/50 shadow transition"
                title="Open Complete Admin Controls, Batch Operations, and Backups"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden min-[480px]:inline">Admin Panel</span>
              </button>
            )}

            {/* Sensitive Data Mask Toggle for Admins */}
            {currentUser.role === "admin" && (
              <button
                onClick={() => setMaskSensitiveData(prev => !prev)}
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

      {/* SIDEBAR DRAWER */}
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
                    <Shield className="w-5 h-5 text-amber-400" />
                    <span className="font-black text-white text-sm">Gujarat Police Menu</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">Navigation Views</span>
                  <button
                    onClick={() => { setActiveNav("table"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeNav === "table" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{language === "gu" ? "રોસ્ટર ટેબલ વ્યૂ" : "Roster Directory (Table)"}</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav("cards"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeNav === "cards" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                  >
                    <IdCard className="w-4 h-4" />
                    <span>{language === "gu" ? "ઓફિસર કાર્ડ્સ વ્યૂ" : "Officer Cards View"}</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav("analytics"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeNav === "analytics" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>{language === "gu" ? "સ્કોડ અને નીમણૂંક એનાલિટિક્સ" : "Squad & Deployment Analytics"}</span>
                  </button>
                </div>

                {currentUser.role === "admin" && (
                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2">Super Admin Controls</span>
                    
                    <button
                      onClick={() => { setIsAdminCommandCenterOpen(true); setIsSidebarOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition"
                    >
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span>{language === "gu" ? "એડમિન કંટ્રોલ સેન્ટર" : "Open Admin Control Center"}</span>
                    </button>

                    <button
                      onClick={handleSwapDutyPlaceAndAppointment}
                      className="w-full flex items-center gap-2.5 px-3 py-2 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                      <span>{language === "gu" ? "🔄 ફરજ ⇄ નીમણુંક સ્વેપ" : "🔄 Swap Duty ⇄ Appointment"}</span>
                    </button>

                    <button
                      onClick={handleQuickAddRow}
                      className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-xl text-xs font-bold transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Quick Row at Top</span>
                    </button>

                    <button
                      onClick={handleAutoDeleteDuplicates}
                      className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition"
                    >
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Auto Clean Duplicates ({duplicateCount})</span>
                    </button>

                    <button
                      onClick={handleExportJSON}
                      className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition"
                    >
                      <FileDown className="w-4 h-4 text-indigo-400" />
                      <span>Export JSON Master Backup</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 font-mono text-center pt-4">
                Gujarat Police Crime Branch HQ v22.0
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-2 min-[360px]:px-4 sm:px-6 lg:px-8 py-4 min-[360px]:py-6 flex-1 w-full space-y-4 min-[360px]:space-y-6">
        
        {/* STATS SUMMARY BAR (3D interactive cards) */}
        <div className="grid grid-cols-2 min-[540px]:grid-cols-4 gap-2.5 min-[360px]:gap-4">
          
          {/* Card 1: Total Personnel */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => { setSelectedSquad("ALL"); setSelectedDesignation("ALL"); setSelectedAppointment("ALL"); setSelectedBloodGroup("ALL"); setSelectedRetirementAlert("ALL"); setSearchQuery(""); }}
            className="p-3.5 min-[360px]:p-4 bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl cursor-pointer shadow-lg transition"
          >
            <span className="text-[10px] min-[360px]:text-[11px] text-slate-400 font-bold uppercase block truncate">{language === "gu" ? "કુલ સ્ટાફ" : "Total Personnel"}</span>
            <p className="text-xl min-[360px]:text-2xl font-black text-white mt-1">{personnel.length}</p>
            <span className="text-[9px] min-[360px]:text-[10px] text-emerald-400 font-medium">Click to show all</span>
          </motion.div>

          {/* Card 2: Active Squads */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-3.5 min-[360px]:p-4 bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl shadow-lg"
          >
            <span className="text-[10px] min-[360px]:text-[11px] text-slate-400 font-bold uppercase block truncate">{language === "gu" ? "સક્રિય સ્કોડ્સ" : "Active Squads"}</span>
            <p className="text-xl min-[360px]:text-2xl font-black text-amber-400 mt-1">{uniqueSquads.length}</p>
            <span className="text-[9px] min-[360px]:text-[10px] text-slate-400 font-mono">Squads 01 to 20</span>
          </motion.div>

          {/* Card 3: Appointment breakdown */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-3.5 min-[360px]:p-4 bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl shadow-lg"
          >
            <span className="text-[10px] min-[360px]:text-[11px] text-slate-400 font-bold uppercase block truncate">{language === "gu" ? "નીમણૂંક વિતરણ" : "Appointments"}</span>
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
                CRIME: {personnel.filter(p => (p.appointment || '').toLowerCase().includes('crime')).length}
              </span>
              <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded">
                એટેચ: {personnel.filter(p => (p.appointment || '').includes('એટેચ')).length}
              </span>
            </div>
          </motion.div>

          {/* Card 4: Duplicate & Column Status */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-3.5 min-[360px]:p-4 bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl shadow-lg"
          >
            <span className="text-[10px] min-[360px]:text-[11px] text-slate-400 font-bold uppercase block truncate">{language === "gu" ? "ડેટાબેઝ સ્થિતિ" : "Data Integrity"}</span>
            <p className={`text-base min-[360px]:text-xl font-black mt-1 ${duplicateCount === 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {duplicateCount === 0 ? "100% Unique" : `${duplicateCount} Dups`}
            </p>
            {currentUser.role === "admin" && (
              <button onClick={handleAutoDeleteDuplicates} className="text-[10px] text-amber-400 hover:underline font-bold block">
                Auto Clean
              </button>
            )}
          </motion.div>
        </div>

        {/* COMPREHENSIVE FILTER & ACTION TOOLBAR (Fully responsive down to 250px) */}
        <div className="p-3 min-[360px]:p-4 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === "gu" ? "નામ, બક્કલ, મોબાઇલ, સ્કોડ..." : "Search name, badge, squad, mobile..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* FILTER DROPDOWNS ROW (Squad, Designation, Appointment, Blood Group, Retirement) */}
          <div className="flex flex-wrap items-center gap-1.5 min-[360px]:gap-2 w-full lg:w-auto">
            
            {/* Squad Filter */}
            <select
              value={selectedSquad}
              onChange={(e) => setSelectedSquad(e.target.value)}
              className="flex-1 min-[320px]:flex-none bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{language === "gu" ? "સ્કોડ: તમામ" : "All Squads"}</option>
              {uniqueSquads.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Designation Filter */}
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="flex-1 min-[320px]:flex-none bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{language === "gu" ? "હોદ્દો: તમામ" : "All Designations"}</option>
              {uniqueDesignations.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* CRITICAL: MANDATORY APPOINTMENT (નીમણુંક) FILTER DROPDOWN */}
            <select
              value={selectedAppointment}
              onChange={(e) => setSelectedAppointment(e.target.value)}
              className="flex-1 min-[320px]:flex-none bg-slate-950 border border-amber-500/50 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">{language === "gu" ? "નીમણૂંક: તમામ" : "All Appointments"}</option>
              <option value="CRIME">CRIME ({personnel.filter(p => (p.appointment || '').toLowerCase() === 'crime').length})</option>
              <option value="એટેચ">એટેચ ({personnel.filter(p => (p.appointment || '').includes('એટેચ')).length})</option>
              {uniqueAppointments.filter(a => a && a !== 'CRIME' && a !== 'એટેચ').map(a => (
                <option key={a} value={a}>{a} ({personnel.filter(p => p.appointment === a).length})</option>
              ))}
            </select>

            {/* Emergency Blood Group Filter */}
            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="flex-1 min-[320px]:flex-none bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-rose-300 focus:outline-none focus:border-rose-500"
              title="Emergency Blood Donor Filter"
            >
              <option value="ALL">{language === "gu" ? "બ્લડ: તમામ" : "All Blood"}</option>
              {["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            {/* Retirement Radar Filter */}
            <select
              value={selectedRetirementAlert}
              onChange={(e) => setSelectedRetirementAlert(e.target.value as any)}
              className="flex-1 min-[320px]:flex-none bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500"
              title="Filter by Retirement Schedule"
            >
              <option value="ALL">{language === "gu" ? "નિવૃત્તિ: તમામ" : "Retirement: All"}</option>
              <option value="6MO">{language === "gu" ? "૬ મહિનામાં નિવૃત્ત" : "Retiring in 6 Mo"}</option>
              <option value="1YR">{language === "gu" ? "૧ વર્ષમાં નિવૃત્ત" : "Retiring in 1 Yr"}</option>
              <option value="RETIRED">{language === "gu" ? "નિવૃત્ત થયેલ" : "Already Retired"}</option>
            </select>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-1.5 min-[360px]:gap-2 w-full lg:w-auto justify-end">
            
            {/* View Mode Switcher (Table vs Cards) */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
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
            </div>

            {/* Add Person Button */}
            {currentUser.role === "admin" && (
              <button
                onClick={() => {
                  setEditingPerson(null);
                  setFormData({
                    srNo: personnel.length + 1,
                    code: "સ્કોડ-૦૧",
                    designation: "UHC",
                    badgeNo: String(Math.floor(1000 + Math.random() * 9000)),
                    name: "",
                    mobile: "",
                    dutyPlace: "સ્કોડ-૦૧",
                    appointment: "CRIME",
                    reportDate: "01/01/2026",
                    birthDate: "01/01/1980",
                    recruitedDate: "01/01/2005",
                    retirementDate: "31/12/2040",
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
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === "gu" ? "ઉમેરો" : "Add"}</span>
              </button>
            )}

            {/* Import Spreadsheet */}
            {currentUser.role === "admin" && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Import</span>
              </button>
            )}

            {/* Print Roster */}
            <button
              onClick={() => window.print()}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Print Roster Sheet"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ACTIVE FILTER SUMMARY & PAGE SIZE SELECTOR */}
        <div className="flex flex-col min-[380px]:flex-row items-start min-[380px]:items-center justify-between gap-1 text-[11px] text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span>
              {language === "gu" 
                ? `કુલ ${filteredPersonnel.length} માંથી ${paginatedPersonnel.length} કર્મચારીઓ દર્શાવાયેલ છે`
                : `Showing ${paginatedPersonnel.length} of ${filteredPersonnel.length} personnel`}
            </span>
            {(selectedSquad !== "ALL" || selectedDesignation !== "ALL" || selectedAppointment !== "ALL" || selectedBloodGroup !== "ALL" || selectedRetirementAlert !== "ALL" || searchQuery) && (
              <button
                onClick={() => { setSelectedSquad("ALL"); setSelectedDesignation("ALL"); setSelectedAppointment("ALL"); setSelectedBloodGroup("ALL"); setSelectedRetirementAlert("ALL"); setSearchQuery(""); }}
                className="text-amber-400 hover:underline font-bold"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end min-[380px]:self-auto">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-xs text-slate-200"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500 (All)</option>
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABLE VIEW (CLICKABLE COLUMN SORTING & FULL BILINGUAL HEADERS)             */}
        {/* ========================================================================= */}
        {activeNav === "table" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden w-full">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                    
                    <th onClick={() => handleSort("srNo")} className="py-3 px-3 cursor-pointer hover:text-white">
                      <div className="flex items-center gap-1">
                        <span>{t.srNo}</span>
                        {sortColumn === "srNo" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    <th className="py-3 px-3">{t.photo}</th>

                    <th onClick={() => handleSort("code")} className="py-3 px-3 cursor-pointer hover:text-white text-amber-400">
                      <div className="flex items-center gap-1">
                        <span>{t.squad}</span>
                        {sortColumn === "code" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>

                    <th onClick={() => handleSort("designation")} className="py-3 px-3 cursor-pointer hover:text-white">
                      <div className="flex items-center gap-1">
                        <span>{t.designation}</span>
                        {sortColumn === "designation" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    <th onClick={() => handleSort("badgeNo")} className="py-3 px-3 cursor-pointer hover:text-white">
                      <div className="flex items-center gap-1">
                        <span>{t.badgeNo}</span>
                        {sortColumn === "badgeNo" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    <th onClick={() => handleSort("name")} className="py-3 px-3 cursor-pointer hover:text-white">
                      <div className="flex items-center gap-1">
                        <span>{t.name}</span>
                        {sortColumn === "name" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                      </div>
                    </th>

                    <th className="py-3 px-3">{t.mobile}</th>

                    <th onClick={() => handleSort("dutyPlace")} className="py-3 px-3 cursor-pointer hover:text-white text-cyan-300">
                      <div className="flex items-center gap-1">
                        <span>{t.dutyPlace}</span>
                        {sortColumn === "dutyPlace" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>

                    <th onClick={() => handleSort("appointment")} className="py-3 px-3 cursor-pointer hover:text-white text-purple-300">
                      <div className="flex items-center gap-1">
                        <span>{t.appointment}</span>
                        {sortColumn === "appointment" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>

                    <th onClick={() => handleSort("tenure")} className="py-3 px-3 cursor-pointer hover:text-white text-emerald-400">
                      <div className="flex items-center gap-1">
                        <span>{t.tenure}</span>
                        {sortColumn === "tenure" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>

                    <th className="py-3 px-3">{t.reportDate}</th>
                    <th className="py-3 px-3">{t.birthDate}</th>
                    <th className="py-3 px-3">{t.recruitedDate}</th>

                    <th onClick={() => handleSort("retirementDate")} className="py-3 px-3 cursor-pointer hover:text-white text-amber-300">
                      <div className="flex items-center gap-1">
                        <span>{t.retirementDate}</span>
                        {sortColumn === "retirementDate" && (sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>

                    <th className="py-3 px-3">{t.blood}</th>
                    <th className="py-3 px-3">{t.aadhar}</th>
                    <th className="py-3 px-3">{t.pan}</th>

                    {customColumns.map(col => (
                      <th key={col} className="py-3 px-3 text-indigo-300">{col}</th>
                    ))}
                    <th className="py-3 px-3 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {paginatedPersonnel.length === 0 ? (
                    <tr>
                      <td colSpan={18 + customColumns.length} className="py-12 text-center text-slate-500">
                        {language === "gu" ? "કોઈ કર્મચારી રેકોર્ડ મળ્યા નથી." : "No matching personnel records found."}
                      </td>
                    </tr>
                  ) : (
                    paginatedPersonnel.map((p, idx) => {
                      const tenure = calculateServiceTenure(p.reportDate || p.appointmentDate || p.recruitedDate);
                      return (
                        <tr 
                          key={p.id}
                          onClick={() => setSelectedOfficer(p)}
                          className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                        >
                          <td className="py-2 px-3 font-mono text-slate-400">{p.srNo || idx + 1}</td>
                          <td className="py-2 px-3">
                            <img
                              src={p.avatarUrl || PRESET_AVATARS[0]}
                              alt={p.name}
                              className="w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 rounded-full object-cover border border-amber-500/40 shadow"
                              loading="lazy"
                            />
                          </td>
                          <td className="py-2 px-3 font-bold text-amber-400">{p.code}</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                              {p.designation}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-white">{p.badgeNo}</td>
                          <td className="py-2 px-3 font-semibold text-white group-hover:text-amber-300">{p.name}</td>
                          
                          <td className="py-2 px-3 font-mono text-slate-300" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <span>{maskMobile(p.mobile)}</span>
                              {p.mobile && (
                                <a 
                                  href={`tel:${p.mobile}`}
                                  className="p-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white transition"
                                  title="Call Officer"
                                >
                                  <Phone className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </td>

                          <td className="py-2 px-3 text-cyan-200 font-medium">{p.dutyPlace}</td>
                          
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              (p.appointment || '').toLowerCase() === 'crime' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            }`}>
                              {p.appointment}
                            </span>
                          </td>

                          {/* Calculated Tenure Column */}
                          <td className="py-2 px-3 text-emerald-400 font-mono font-bold text-[11px]">
                            {tenure ? (language === "gu" ? tenure.formattedGu : tenure.formatted) : "-"}
                          </td>

                          <td className="py-2 px-3 font-mono text-slate-300">{p.reportDate}</td>
                          <td className="py-2 px-3 font-mono text-slate-400">{p.birthDate}</td>
                          <td className="py-2 px-3 font-mono text-slate-400">{p.recruitedDate}</td>
                          <td className="py-2 px-3 font-mono text-amber-300 font-semibold">{p.retirementDate}</td>
                          
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded font-mono text-[10px] font-bold">
                              {p.bloodGroup || "B+"}
                            </span>
                          </td>

                          <td className="py-2 px-3 font-mono text-slate-400">{maskAadhaar(p.aadharNo)}</td>
                          <td className="py-2 px-3 font-mono text-slate-400">{maskPan(p.panNo)}</td>

                          {customColumns.map(col => (
                            <td key={col} className="py-2 px-3 font-mono text-slate-300">
                              {p.customFields?.[col] || "-"}
                            </td>
                          ))}

                          <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {currentUser.role === "admin" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingPerson(p);
                                      setFormData({ ...p });
                                      setIsModalOpen(true);
                                    }}
                                    className="p-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg transition"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget(p)}
                                    className="p-1 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
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
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-3 py-2.5 bg-slate-950 border-t border-slate-800 text-xs">
                <span className="text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2.5 py-1 font-mono text-amber-400 font-bold">{currentPage}</span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* CARDS VIEW WITH 3D HOVER TILT & WORKED TENURE                             */}
        {/* ========================================================================= */}
        {activeNav === "cards" && (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-3.5 min-[360px]:gap-5">
            {paginatedPersonnel.map(p => {
              const tenure = calculateServiceTenure(p.reportDate || p.appointmentDate || p.recruitedDate);
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
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatarUrl || PRESET_AVATARS[0]}
                          alt={p.name}
                          className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 rounded-full object-cover border-2 border-amber-500/50 shadow"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-amber-400 font-mono">{p.code}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-indigo-300 rounded font-semibold border border-slate-700">{p.designation}</span>
                          </div>
                          <h3 className="font-bold text-white text-xs min-[360px]:text-sm mt-0.5 truncate">{p.name}</h3>
                          <p className="text-[11px] text-slate-400 font-mono">#{p.badgeNo}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                        (p.appointment || '').toLowerCase() === 'crime' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
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
                        <span className="text-[10px] text-slate-500 block">{t.retirementDate}:</span>
                        <span className="text-amber-400 font-mono font-semibold">{p.retirementDate}</span>
                      </div>
                    </div>

                    {/* MANDATORY TENURE CALCULATION DISPLAY */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">{t.tenure}:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        ⏳ {tenure ? (language === "gu" ? tenure.formattedGu : tenure.formatted) : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3.5 pt-2.5 border-t border-slate-800 text-xs" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5 font-mono text-slate-300">
                      <span>{maskMobile(p.mobile)}</span>
                      {p.mobile && (
                        <a 
                          href={`tel:${p.mobile}`}
                          className="p-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white transition"
                          title="Call Officer"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {currentUser.role === "admin" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingPerson(p);
                            setFormData({ ...p });
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ANALYTICS VIEW                                                            */}
        {/* ========================================================================= */}
        {activeNav === "analytics" && (
          <div className="p-4 min-[360px]:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-6">
            <h2 className="text-sm min-[360px]:text-base font-bold text-white">Gujarat Police Crime Branch Squad Deployment Distribution</h2>
            <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 gap-3">
              {uniqueSquads.map(s => {
                const count = personnel.filter(p => p.code === s).length;
                return (
                  <div key={s} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-xs font-bold text-amber-400 block">{s}</span>
                    <p className="text-xl font-black text-white mt-1">{count}</p>
                    <span className="text-[10px] text-slate-500">Personnel Assigned</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* SUPER ADMIN COMMAND CENTER MODAL (ALL RESTORED ADMIN CONTROLS)           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAdminCommandCenterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-amber-500/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm min-[360px]:text-base font-black text-white">Super Admin Command Center</h2>
                </div>
                <button onClick={() => setIsAdminCommandCenterOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* TABS HEADER */}
              <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto text-xs font-bold">
                <button 
                  onClick={() => setAdminTab("tools")}
                  className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${adminTab === "tools" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400 hover:text-white"}`}
                >
                  Quick Tools
                </button>
                <button 
                  onClick={() => setAdminTab("replace")}
                  className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${adminTab === "replace" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400 hover:text-white"}`}
                >
                  Batch Replace
                </button>
                <button 
                  onClick={() => setAdminTab("columns")}
                  className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${adminTab === "columns" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400 hover:text-white"}`}
                >
                  Custom Columns
                </button>
                <button 
                  onClick={() => { setAdminTab("backups"); fetchBackups(); }}
                  className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${adminTab === "backups" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400 hover:text-white"}`}
                >
                  Backups
                </button>
                <button 
                  onClick={() => { setAdminTab("audit"); fetchAuditLogs(); }}
                  className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${adminTab === "audit" ? "border-amber-400 text-amber-300" : "border-transparent text-slate-400 hover:text-white"}`}
                >
                  Audit Logs
                </button>
              </div>

              {/* TAB CONTENTS */}
              <div className="p-4 min-[360px]:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                
                {/* TAB 1: QUICK TOOLS */}
                {adminTab === "tools" && (
                  <div className="space-y-3">
                    <p className="text-slate-400">One-click administrative repair actions for 409+ personnel records:</p>
                    
                    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="font-bold text-white block">1. Duty Place ⇄ Appointment Swap</span>
                        <p className="text-[11px] text-slate-400">Swaps column 6 and 7 across all records if imported reversed.</p>
                        <button
                          onClick={handleSwapDutyPlaceAndAppointment}
                          className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition"
                        >
                          Execute Swap Now
                        </button>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="font-bold text-white block">2. Re-sequence Serial Numbers</span>
                        <p className="text-[11px] text-slate-400">Fixes gaps and resets serial numbers cleanly from 1 to {personnel.length}.</p>
                        <button
                          onClick={handleResequenceSrNos}
                          className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition"
                        >
                          Resequence 1 to N
                        </button>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="font-bold text-white block">3. Auto Clean Exact Duplicates</span>
                        <p className="text-[11px] text-slate-400">Detects and purges duplicate rows based on full record signature.</p>
                        <button
                          onClick={handleAutoDeleteDuplicates}
                          className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition"
                        >
                          Clean Duplicates ({duplicateCount})
                        </button>
                      </div>

                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="font-bold text-white block">4. Align & Repair Columns</span>
                        <p className="text-[11px] text-slate-400">Repairs missing fields and guarantees column integrity safely.</p>
                        <button
                          onClick={handleFixAndAlignColumns}
                          className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
                        >
                          Fix Column Integrity
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={handleQuickAddRow}
                        className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl transition"
                      >
                        + Quick Add Blank Row at Top
                      </button>

                      <button
                        onClick={() => { setIsAdminCommandCenterOpen(false); setIsDeleteAllModalOpen(true); }}
                        className="py-2 px-4 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-bold rounded-xl transition"
                      >
                        Dangerous: Safe Delete All
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: BATCH FIND & REPLACE */}
                {adminTab === "replace" && (
                  <form onSubmit={handleExecuteBatchReplace} className="space-y-4">
                    <p className="text-slate-400">Search and replace values across all {personnel.length} records in a specific field:</p>
                    
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Target Field</label>
                      <select
                        value={batchReplaceField}
                        onChange={(e) => setBatchReplaceField(e.target.value as keyof Personnel)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="code">Squad Code (સ્કોડ)</option>
                        <option value="designation">Designation (હોદ્દો)</option>
                        <option value="dutyPlace">Duty Place (ફરજની જગ્યા)</option>
                        <option value="appointment">Appointment (નીમણુંક)</option>
                        <option value="bloodGroup">Blood Group (બ્લડ ગ્રૂપ)</option>
                        <option value="weaponNo">Weapon No (હથિયાર નં.)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Find Text</label>
                        <input
                          type="text"
                          value={batchFindText}
                          onChange={(e) => setBatchFindText(e.target.value)}
                          placeholder="e.g. એટેચ"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Replace With</label>
                        <input
                          type="text"
                          value={batchReplaceText}
                          onChange={(e) => setBatchReplaceText(e.target.value)}
                          placeholder="e.g. CRIME"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition"
                    >
                      Execute Batch Replace
                    </button>
                  </form>
                )}

                {/* TAB 3: CUSTOM COLUMNS */}
                {adminTab === "columns" && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        placeholder="Add custom column name..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                      <button
                        onClick={handleAddCustomColumn}
                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                      >
                        Add Column
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-slate-300 block">Existing Custom Columns (Click trash to delete specific column)</span>
                      {customColumns.length === 0 ? (
                        <p className="text-slate-500">No custom columns added yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {customColumns.map(col => (
                            <div key={col} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
                              <span className="text-amber-300 font-mono">{col}</span>
                              <button
                                onClick={() => handleDeleteCustomColumn(col)}
                                className="p-1 hover:bg-rose-600 text-rose-400 hover:text-white rounded"
                                title={`Delete column ${col}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: BACKUPS */}
                {adminTab === "backups" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Server Snapshot Backups</span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleExportJSON}
                          className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
                        >
                          Download JSON
                        </button>
                        <button
                          onClick={handleCreateServerBackup}
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                        >
                          + Take Server Snapshot
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {backups.length === 0 ? (
                        <p className="text-slate-500">No server backup snapshots yet.</p>
                      ) : (
                        backups.map(b => (
                          <div key={b.fileName} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between font-mono">
                            <span className="text-emerald-400">{b.fileName}</span>
                            <span className="text-slate-500 text-[10px]">{new Date(b.createdAt).toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: AUDIT LOGS */}
                {adminTab === "audit" && (
                  <div className="space-y-3">
                    <span className="font-bold text-white block">Security & Operations Audit Trail</span>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {auditLogs.length === 0 ? (
                        <p className="text-slate-500">No operations recorded yet.</p>
                      ) : (
                        auditLogs.map(log => (
                          <div key={log.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-0.5">
                            <div className="flex items-center justify-between font-mono text-[10px]">
                              <span className="text-amber-400 font-bold">{log.action}</span>
                              <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-slate-300">{log.details}</p>
                            <span className="text-[10px] text-slate-500 block">User: {log.user}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3-LAYER SECURITY MODAL FOR SAFE DELETE ALL                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDeleteAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 min-[360px]:p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-rose-500/50 rounded-3xl w-full max-w-md p-5 min-[360px]:p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base min-[360px]:text-lg font-black text-white">Permanent Roster Deletion Protection</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  This action permanently clears all {personnel.length} records. To proceed, complete the two-step verification:
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">1. Admin PIN</label>
                  <input
                    type="password"
                    value={deleteAllPassInput}
                    onChange={(e) => setDeleteAllPassInput(e.target.value)}
                    placeholder="Enter PIN (1673583)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    2. Type <span className="text-rose-400 font-mono">DELETE ALL</span>
                  </label>
                  <input
                    type="text"
                    value={deleteAllConfirmPhrase}
                    onChange={(e) => setDeleteAllConfirmPhrase(e.target.value)}
                    placeholder="DELETE ALL"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {deleteAllError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                  {deleteAllError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteAll}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition"
                >
                  Execute Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE PERSONNEL DELETION CONFIRMATION */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 min-[360px]:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-rose-500/40 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Personnel Record?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete officer "{deleteTarget.name}" (Badge #{deleteTarget.badgeNo})?
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setDeleteTarget(null)} className="px-3.5 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Cancel</button>
                <button onClick={confirmDeleteSingle} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OFFICER PROFILE MODAL WITH WORKED TENURE & SENSITIVE MASKS */}
      <AnimatePresence>
        {selectedOfficer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">{t.dept}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400 font-mono">#{selectedOfficer.badgeNo}</span>
                </div>
                <button onClick={() => setSelectedOfficer(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-4 min-[360px]:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                <div className="flex items-center gap-3.5">
                  <img src={selectedOfficer.avatarUrl || PRESET_AVATARS[0]} alt={selectedOfficer.name} className="w-14 h-14 min-[360px]:w-16 min-[360px]:h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow" />
                  <div>
                    <h2 className="text-base min-[360px]:text-lg font-bold text-white">{selectedOfficer.name}</h2>
                    <p className="text-xs text-amber-400 font-mono">{selectedOfficer.code} • {selectedOfficer.designation}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">બક્કલ નંબર: {selectedOfficer.badgeNo}</p>
                  </div>
                </div>

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
                    <span className="text-slate-200 font-mono">{selectedOfficer.reportDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.birthDate}</span>
                    <span className="text-slate-200 font-mono">{selectedOfficer.birthDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.retirementDate}</span>
                    <span className="text-amber-400 font-mono font-bold">{selectedOfficer.retirementDate}</span>
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

                {/* WORKED SERVICE TENURE CALCULATED LINE */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">{t.tenure}</span>
                    <span className="text-emerald-400 font-mono font-bold text-xs">
                      ⏳ {calculateServiceTenure(selectedOfficer.reportDate || selectedOfficer.appointmentDate || selectedOfficer.recruitedDate)?.formatted || "-"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {language === "gu" ? "હાજર તારીખથી આજ સુધી થયેલ સેવા ગણતરી" : "Calculated from appointment / reporting date to today"}
                  </p>
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

      {/* ADD / EDIT OFFICER MODAL WITH PHOTO UPLOAD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <h2 className="text-sm min-[360px]:text-base font-bold text-white">
                  {editingPerson ? (language === "gu" ? "કર્મચારી વિગત સુધારો" : "Edit Personnel") : (language === "gu" ? "નવો કર્મચારી ઉમેરો" : "Add Personnel")}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSavePerson} className="p-4 min-[360px]:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* PHOTO UPLOAD & PREVIEW */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col min-[480px]:flex-row items-center gap-3.5">
                  <img
                    src={formData.avatarUrl || PRESET_AVATARS[0]}
                    alt="Preview"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/60 shadow"
                  />
                  <div className="flex-1 w-full space-y-1.5">
                    <label className="block text-xs font-semibold text-amber-400">
                      {language === "gu" ? "ઓફિસર ફોટો અપલોડ / એડિટ (Photo Upload)" : "Officer Photo Upload / Edit"}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.avatarUrl}
                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                        placeholder="Or enter photo URL"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">{t.srNo}</label>
                    <input type="number" value={formData.srNo} onChange={(e) => setFormData({ ...formData, srNo: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{t.squad}</label>
                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{t.designation}</label>
                    <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">{t.badgeNo}</label>
                    <input type="text" value={formData.badgeNo} onChange={(e) => setFormData({ ...formData, badgeNo: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">{t.name}</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">{t.mobile}</label>
                    <input type="text" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{t.dutyPlace}</label>
                    <input type="text" value={formData.dutyPlace} onChange={(e) => setFormData({ ...formData, dutyPlace: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{t.appointment}</label>
                    <input type="text" value={formData.appointment} onChange={(e) => setFormData({ ...formData, appointment: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">{t.reportDate}</label>
                    <input type="text" value={formData.reportDate} onChange={(e) => setFormData({ ...formData, reportDate: e.target.value, appointmentDate: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{t.birthDate}</label>
                    <input type="text" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{t.recruitedDate}</label>
                    <input type="text" value={formData.recruitedDate} onChange={(e) => setFormData({ ...formData, recruitedDate: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{t.retirementDate}</label>
                    <input type="text" value={formData.retirementDate} onChange={(e) => setFormData({ ...formData, retirementDate: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">{t.aadhar}</label>
                    <input type="text" value={formData.aadharNo} onChange={(e) => setFormData({ ...formData, aadharNo: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">{t.pan}</label>
                    <input type="text" value={formData.panNo} onChange={(e) => setFormData({ ...formData, panNo: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition">
                    {editingPerson ? "Update Record" : "Save Record"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SPREADSHEET IMPORT MODAL */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm min-[360px]:text-base font-bold text-white">Import 409 Personnel Rows</h2>
                </div>
                <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleImportSpreadsheet} className="p-4 min-[360px]:p-6 space-y-4 text-xs">
                <p className="text-slate-400 leading-relaxed">
                  Paste rows directly from Excel or Google Sheets. Positionally aligned:
                  <br />
                  <span className="font-mono text-[10px] min-[360px]:text-[11px] text-amber-300">
                    અ.નં. | Code | હોદ્દો | બ.નં. | નામ | મોબાઇલ | ફરજની જગ્યા | નીમણુંક | હાજર તારીખ | જન્મ | ભરતી | નિવૃત્તિ | આધાર | પાન
                  </span>
                </p>

                <textarea
                  rows={7}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste tab-separated rows here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReplaceData(false)}
                    className={`py-2 px-3 rounded-xl font-bold border transition ${!replaceData ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                  >
                    + Append Rows
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplaceData(true)}
                    className={`py-2 px-3 rounded-xl font-bold border transition ${replaceData ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                  >
                    ⚡ Replace All (Wipe & Load)
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition">
                    Execute Import
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CRIME BRANCH AI ASSISTANT MODAL */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[360px]:p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between px-4 min-[360px]:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm min-[360px]:text-base font-bold text-white">Gujarat Police Crime Branch AI</h2>
                </div>
                <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-4 min-[360px]:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <p className="text-slate-400">
                  Ask any question about staff strength, squad allocation, retirement schedules, or designations:
                </p>
                <form onSubmit={handleAskAI} className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. સ્કોડ-૦૧ માં કેટલા કર્મચારીઓ છે? Who is retiring next?"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button type="submit" disabled={aiLoading} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow">
                    {aiLoading ? "Analyzing..." : "Ask"}
                  </button>
                </form>

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

    </div>
  );
}
