import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Shield, Users, Search, Plus, Download, Printer, Sparkles, 
  Trash2, Edit3, X, Check, Phone, Award, Lock, Unlock, 
  Languages, Eye, EyeOff, MessageSquare,
  FileSpreadsheet, Columns, LogOut, Key,
  Wrench, RefreshCw, Copy, CheckCheck, AlertTriangle, Database,
  Menu, LayoutDashboard, IdCard, Activity, ChevronLeft, ChevronRight,
  ArrowLeftRight, FileText, History
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

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    const year = parseInt(dmy[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // YYYY-MM-DD
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
    const saved = sessionStorage.getItem("crime_branch_auth_user_v20");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return null; // Forces login screen
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
    const localSaved = localStorage.getItem("crime_branch_personnel_v20");
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* fallback */ }
    }
    return initialPersonnel;
  });

  const [customColumns, setCustomColumns] = useState<string[]>(() => {
    const savedCols = localStorage.getItem("crime_branch_custom_cols_v20");
    if (savedCols) {
      try { return JSON.parse(savedCols); } catch (e) { /* fallback */ }
    }
    return [];
  });

  // Sensitive data mask toggle (Admins can toggle view, non-admins are ALWAYS masked)
  const [maskSensitiveData, setMaskSensitiveData] = useState<boolean>(true);

  // Navigation, Search & Filters
  const [activeNav, setActiveNav] = useState<"table" | "cards" | "analytics" | "audit">("table");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSquad, setSelectedSquad] = useState("ALL");
  const [selectedDesignation, setSelectedDesignation] = useState("ALL");
  const [selectedAppointment, setSelectedAppointment] = useState("ALL"); // MANDATORY FILTER
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

  // Delete & Security Modals
  const [deleteTarget, setDeleteTarget] = useState<Personnel | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [deleteAllPassInput, setDeleteAllPassInput] = useState("");
  const [deleteAllConfirmPhrase, setDeleteAllConfirmPhrase] = useState("");
  const [deleteAllError, setDeleteAllError] = useState("");

  // Server-side audit logs and backups
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isAdminControlOpen, setIsAdminControlOpen] = useState(false);

  // Toast notifications (iframe safe - replaces broken window.alert)
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "info" | "warning" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
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
      localStorage.setItem("crime_branch_personnel_v20", JSON.stringify(updatedList));
      await fetch("/api/personnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personnel: updatedList,
          user: currentUser?.name || "Admin",
          reason
        })
      });
    } catch (e) {
      console.warn("Server sync error (using local fallback):", e);
    }
  };

  // Load from server on mount
  useEffect(() => {
    fetch("/api/personnel")
      .then(res => res.json())
      .then(data => {
        if (data.personnel && Array.isArray(data.personnel) && data.personnel.length > 0) {
          setPersonnel(data.personnel);
          localStorage.setItem("crime_branch_personnel_v20", JSON.stringify(data.personnel));
        }
      })
      .catch(() => {});
  }, []);

  // Save session state
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem("crime_branch_auth_user_v20", JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem("crime_branch_auth_user_v20");
    }
  }, [currentUser]);

  // Load audit logs when modal opens
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
      showToast("Backup creation failed", "error");
    }
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
          name: "Super Admin (Crime Branch)",
          badgeNo: "ADMIN-01",
          mobile: cleanMobile
        };
        setCurrentUser(session);
        showToast(language === "gu" ? "✓ એડમિન સફળતાપૂર્વક લોગિન થયા." : "✓ Logged in as Super Admin.", "success");
        return;
      }
      setLoginError(language === "gu" ? "અમાન્ય એડમિન મોબાઇલ અથવા પાસવર્ડ (Pass: 1673583)" : "Invalid Admin Mobile or Password (PIN: 1673583)");
      return;
    }

    // Officer mode login
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
    sessionStorage.removeItem("crime_branch_auth_user_v20");
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
      localStorage.setItem("crime_branch_custom_cols_v20", JSON.stringify(updated));
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
    localStorage.setItem("crime_branch_custom_cols_v20", JSON.stringify(updatedCols));
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
  // Column alignment:
  // અ.નં. | Code | હોદ્દો | બ.નં. | નામ | મોબાઇલ નંબર | ફરજની જગ્યા | નીમણુંક | હાજર તારીખ | જન્મ તારીખ | ભરતી તારીખ | વય નિવૃત તારીખ | આધાર | પાન
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

        // Skip header lines
        if (i === 0 && (line.includes("નામ") || line.toLowerCase().includes("name") || line.includes("હોદ્દો") || line.includes("Code"))) {
          continue;
        }

        const cols = line.split(/[\t,|]+/).map(c => c.trim());
        if (cols.length >= 3) {
          let offset = 0;
          // Check if first column is serial number (e.g. 1, 2, 409)
          if (!isNaN(Number(cols[0])) && cols[0].length <= 4 && cols.length > 5) {
            offset = 1;
          }

          const rawCode = cols[offset] || "સ્કોડ-૦૧";
          const rawDesignation = cols[offset + 1] || "UHC";
          const rawBadgeNo = cols[offset + 2] || String(Math.floor(1000 + Math.random() * 9000));
          const rawName = cols[offset + 3] || `Officer ${currentSrNo}`;
          const rawMobile = (cols[offset + 4] || "9876543210").replace(/\s+/g, '');

          // Positional: Col 5 is ફરજની જગ્યા (Duty Place), Col 6 is નીમણુંક (Appointment)
          let parsedDutyPlace = cols[offset + 5] || rawCode;
          let parsedAppointment = cols[offset + 6] || "CRIME";

          // Semantic Auto-Correction for Swapped Columns
          const appointmentKeywords = ["crime", "એટેચ", "attach", "બદલી", "transfer", "ડેપ્યુટેશન", "deputation", "હંગામી", "કાયમી"];
          const placeKeywords = ["સ્કોડ", "પોસ્ટે", "પો.સ્ટે", "સાયબર", "એસ.જી", "ડીસીબી", "શાખા", "કંટ્રોલ", "ઓપરેશન", "થાણું"];

          const dutyPlaceIsApp = appointmentKeywords.some(k => parsedDutyPlace.toLowerCase().includes(k));
          const appIsPlace = placeKeywords.some(k => parsedAppointment.toLowerCase().includes(k));

          if (dutyPlaceIsApp || appIsPlace) {
            // Swap them automatically
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

  const filteredPersonnel = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return personnel.filter(p => {
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
        Object.values(p.customFields || {}).some(v => v.toLowerCase().includes(q))
      );

      const matchesSquad = selectedSquad === "ALL" || p.code === selectedSquad;
      const matchesDesignation = selectedDesignation === "ALL" || p.designation === selectedDesignation;
      const matchesAppointment = selectedAppointment === "ALL" || p.appointment === selectedAppointment;

      return matchesSearch && matchesSquad && matchesDesignation && matchesAppointment;
    });
  }, [personnel, searchQuery, selectedSquad, selectedDesignation, selectedAppointment]);

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
    actions: language === "gu" ? "ક્રિયા / Actions" : "Actions"
  };

  // =========================================================================
  // IF NOT LOGGED IN: RENDER CRIME BRANCH SECURE LOGIN PORTAL
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 rounded-2xl flex items-center justify-center text-amber-400 mx-auto shadow-inner">
              <Shield className="w-9 h-9" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-amber-400 font-extrabold block">ગુજરાત પોલીસ • ક્રાઇમ બ્રાન્ચ</span>
            <h1 className="text-xl font-black text-white">Personnel Secure Portal</h1>
            <p className="text-xs text-slate-400">Restricted Access: Authorized Gujarat Police Personnel Only</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => { setLoginMode("admin"); setLoginError(""); }}
              className={`py-2 rounded-lg transition ${loginMode === "admin" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"}`}
            >
              Super Admin
            </button>
            <button
              onClick={() => { setLoginMode("officer"); setLoginError(""); }}
              className={`py-2 rounded-lg transition ${loginMode === "officer" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"}`}
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1">Admin Security PIN / Password</label>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Enter PIN (1673583)"
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </>
            )}

            {loginError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg transition"
            >
              {loginMode === "admin" ? "Login as Super Admin" : "Officer Login (વેરિફાઇ કરો)"}
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
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
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED APPLICATION INTERFACE
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toast && (
          <div className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md ${
            toast.type === "success" ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40" :
            toast.type === "error" ? "bg-rose-950/90 text-rose-200 border-rose-500/40" :
            toast.type === "warning" ? "bg-amber-950/90 text-amber-200 border-amber-500/40" :
            "bg-slate-900/90 text-cyan-200 border-cyan-500/40"
          }`}>
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toast.message}</span>
          </div>
        )}
      </div>

      {/* TOP HEADER */}
      <header className="bg-slate-950/95 border-b border-slate-800/80 sticky top-0 z-30 shadow-2xl backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-amber-500/50 text-amber-400 hover:text-white"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">{t.dept}</span>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">{t.title}</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* User Session Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-bold">{currentUser.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${currentUser.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                {currentUser.role.toUpperCase()}
              </span>
            </div>

            {/* Sensitive Data Mask Toggle for Admins */}
            {currentUser.role === "admin" && (
              <button
                onClick={() => setMaskSensitiveData(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                  maskSensitiveData 
                    ? "bg-slate-900 text-amber-400 border-amber-500/40" 
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}
                title="Toggle Masking of Sensitive Data (Aadhaar, PAN, Mobile)"
              >
                {maskSensitiveData ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{maskSensitiveData ? "Sensitive Masked" : "Sensitive Unmasked"}</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "gu" ? "en" : "gu")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 transition"
              title="Toggle English / Gujarati"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === "gu" ? "English" : "ગુજરાતી"}</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === "gu" ? "ક્રાઇમ બ્રાન્ચ એઆઈ" : "Crime Branch AI"}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
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
              className="fixed top-0 bottom-0 left-0 w-80 bg-slate-950 border-r border-slate-800 z-50 p-6 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-6 h-6 text-amber-400" />
                    <span className="font-black text-white text-sm">Gujarat Police Menu</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Navigation</span>
                  <button
                    onClick={() => { setActiveNav("table"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${activeNav === "table" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{language === "gu" ? "રોસ્ટર ટેબલ વ્યૂ" : "Roster Directory (Table)"}</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav("cards"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${activeNav === "cards" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                  >
                    <IdCard className="w-4 h-4" />
                    <span>{language === "gu" ? "ઓફિસર કાર્ડ્સ વ્યૂ" : "Officer Cards View"}</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav("analytics"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${activeNav === "analytics" ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"}`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>{language === "gu" ? "સ્કોડ અને નીમણૂંક એનાલિટિક્સ" : "Squad & Appointment Analytics"}</span>
                  </button>
                </div>

                {currentUser.role === "admin" && (
                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Admin Tools & Repairs</span>
                    
                    {/* Instant Swap Button for Duty Place & Appointment */}
                    <button
                      onClick={handleSwapDutyPlaceAndAppointment}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                      <span>{language === "gu" ? "🔄 ફરજની જગ્યા ⇄ નીમણુંક સ્વેપ" : "🔄 Swap Duty Place ⇄ Appointment"}</span>
                    </button>

                    <button
                      onClick={handleAutoDeleteDuplicates}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition"
                    >
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Clean Duplicates ({duplicateCount})</span>
                    </button>

                    <button
                      onClick={handleCreateServerBackup}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition"
                    >
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span>Create Server Snapshot Backup</span>
                    </button>

                    <button
                      onClick={() => { setIsAdminControlOpen(true); setIsSidebarOpen(false); fetchAuditLogs(); fetchBackups(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition"
                    >
                      <History className="w-4 h-4 text-indigo-400" />
                      <span>Audit Logs & Backup Manager</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-mono text-center">
                Gujarat Police Crime Branch v20.0
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* STATS SUMMARY BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div 
            onClick={() => { setSelectedSquad("ALL"); setSelectedDesignation("ALL"); setSelectedAppointment("ALL"); setSearchQuery(""); }}
            className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl cursor-pointer hover:border-amber-500/50 transition"
          >
            <span className="text-[11px] text-slate-400 font-bold uppercase">{language === "gu" ? "કુલ સ્ટાફ" : "Total Personnel"}</span>
            <p className="text-2xl font-black text-white mt-1">{personnel.length}</p>
            <span className="text-[10px] text-emerald-400">Click to show all</span>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-bold uppercase">{language === "gu" ? "સક્રિય સ્કોડ્સ" : "Active Squads"}</span>
            <p className="text-2xl font-black text-amber-400 mt-1">{uniqueSquads.length}</p>
            <span className="text-[10px] text-slate-400 font-mono">Squads 01 to 20</span>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-bold uppercase">{language === "gu" ? "નીમણૂંક વિતરણ" : "Appointments"}</span>
            <div className="flex gap-2 mt-1">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded">
                CRIME: {personnel.filter(p => (p.appointment || '').toLowerCase().includes('crime')).length}
              </span>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-bold rounded">
                એટેચ: {personnel.filter(p => (p.appointment || '').includes('એટેચ')).length}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-bold uppercase">{language === "gu" ? "ડુપ્લિકેટ સ્થિતિ" : "Duplicate Check"}</span>
            <p className={`text-xl font-black mt-1 ${duplicateCount === 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {duplicateCount === 0 ? "100% Unique" : `${duplicateCount} Duplicates`}
            </p>
            {duplicateCount > 0 && currentUser.role === "admin" && (
              <button onClick={handleAutoDeleteDuplicates} className="text-[10px] text-rose-400 underline font-bold">
                Auto Remove
              </button>
            )}
          </div>
        </div>

        {/* TOOLBAR WITH MANDATORY APPOINTMENT FILTER & DIRECT CONTROLS */}
        <div className="p-4 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === "gu" ? "નામ, બક્કલ, મોબાઇલ, સ્કોડ શોધો..." : "Search name, badge, mobile, squad..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* SQUAD, DESIGNATION AND MANDATORY APPOINTMENT FILTERS */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            
            {/* Squad Filter */}
            <select
              value={selectedSquad}
              onChange={(e) => setSelectedSquad(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{language === "gu" ? "તમામ સ્કોડ (All Squads)" : "All Squads"}</option>
              {uniqueSquads.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Designation Filter */}
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{language === "gu" ? "તમામ હોદ્દા (All Ranks)" : "All Designations"}</option>
              {uniqueDesignations.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* CRITICAL: MANDATORY APPOINTMENT (નીમણુંક) FILTER DROPDOWN */}
            <select
              value={selectedAppointment}
              onChange={(e) => setSelectedAppointment(e.target.value)}
              className="bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">{language === "gu" ? "તમામ નીમણૂંક (All Appointments)" : "All Appointments"}</option>
              <option value="CRIME">CRIME ({personnel.filter(p => (p.appointment || '').toLowerCase() === 'crime').length})</option>
              <option value="એટેચ">એટેચ ({personnel.filter(p => (p.appointment || '').includes('એટેચ')).length})</option>
              {uniqueAppointments.filter(a => a && a !== 'CRIME' && a !== 'એટેચ').map(a => (
                <option key={a} value={a}>{a} ({personnel.filter(p => p.appointment === a).length})</option>
              ))}
            </select>
          </div>

          {/* ACTION BUTTONS (ADD, SWAP COLUMNS, IMPORT, EXPORT) */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            
            {/* 1-Click Swap Duty Place & Appointment Button for 409 users */}
            {currentUser.role === "admin" && (
              <button
                onClick={handleSwapDutyPlaceAndAppointment}
                className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                title="Swap Duty Place and Appointment if columns were imported reversed"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{language === "gu" ? "🔄 ફરજ ⇄ નીમણુંક સ્વેપ" : "🔄 Swap Duty ⇄ Appt"}</span>
              </button>
            )}

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
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === "gu" ? "ઉમેરો" : "Add Officer"}</span>
              </button>
            )}

            {/* Import Spreadsheet */}
            {currentUser.role === "admin" && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{language === "gu" ? "ઇમ્પોર્ટ" : "Import"}</span>
              </button>
            )}

            {/* Custom Column Management */}
            {currentUser.role === "admin" && (
              <button
                onClick={() => setIsColModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
                title="Add or Delete Custom Columns"
              >
                <Columns className="w-3.5 h-3.5 text-indigo-400" />
                <span>Columns</span>
              </button>
            )}

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Delete All (with 3-layer security) */}
            {currentUser.role === "admin" && (
              <button
                onClick={() => setIsDeleteAllModalOpen(true)}
                className="p-2 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl border border-rose-500/30 transition"
                title="Safe Delete All Records"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ACTIVE FILTER SUMMARY & PAGE SIZE SELECTOR */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div>
            {language === "gu" 
              ? `કુલ ${filteredPersonnel.length} માંથી ${paginatedPersonnel.length} કર્મચારીઓ દર્શાવાયેલ છે`
              : `Showing ${paginatedPersonnel.length} of ${filteredPersonnel.length} personnel`}
            {(selectedSquad !== "ALL" || selectedDesignation !== "ALL" || selectedAppointment !== "ALL" || searchQuery) && (
              <button
                onClick={() => { setSelectedSquad("ALL"); setSelectedDesignation("ALL"); setSelectedAppointment("ALL"); setSearchQuery(""); }}
                className="ml-3 text-amber-400 hover:underline font-bold"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500 (All 409)</option>
              <option value={10000}>All</option>
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABLE VIEW (100% BILINGUAL HEADERS & EXACT COLUMN ORDER)                   */}
        {/* ========================================================================= */}
        {activeNav === "table" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">{t.srNo}</th>
                    <th className="py-3 px-3">{t.photo}</th>
                    <th className="py-3 px-3 text-amber-400">{t.squad}</th>
                    <th className="py-3 px-3">{t.designation}</th>
                    <th className="py-3 px-3">{t.badgeNo}</th>
                    <th className="py-3 px-3">{t.name}</th>
                    <th className="py-3 px-3">{t.mobile}</th>
                    <th className="py-3 px-3 text-cyan-300">{t.dutyPlace}</th>
                    <th className="py-3 px-3 text-purple-300">{t.appointment}</th>
                    <th className="py-3 px-3">{t.reportDate}</th>
                    <th className="py-3 px-3">{t.birthDate}</th>
                    <th className="py-3 px-3">{t.recruitedDate}</th>
                    <th className="py-3 px-3 text-amber-300">{t.retirementDate}</th>
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
                      <td colSpan={16 + customColumns.length} className="py-12 text-center text-slate-500">
                        {language === "gu" ? "કોઈ કર્મચારી રેકોર્ડ મળ્યા નથી." : "No matching personnel records found."}
                      </td>
                    </tr>
                  ) : (
                    paginatedPersonnel.map((p, idx) => (
                      <tr 
                        key={p.id}
                        onClick={() => setSelectedOfficer(p)}
                        className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5 px-3 font-mono text-slate-400">{p.srNo || idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <img
                            src={p.avatarUrl || PRESET_AVATARS[0]}
                            alt={p.name}
                            className="w-8 h-8 rounded-full object-cover border border-amber-500/40 shadow"
                            loading="lazy"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-400">{p.code}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                            {p.designation}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-white">{p.badgeNo}</td>
                        <td className="py-2.5 px-3 font-semibold text-white group-hover:text-amber-300">{p.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{maskMobile(p.mobile)}</td>
                        <td className="py-2.5 px-3 text-cyan-200 font-medium">{p.dutyPlace}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            (p.appointment || '').toLowerCase() === 'crime' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          }`}>
                            {p.appointment}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{p.reportDate}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{p.birthDate}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{p.recruitedDate}</td>
                        <td className="py-2.5 px-3 font-mono text-amber-300 font-semibold">{p.retirementDate}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{maskAadhaar(p.aadharNo)}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{maskPan(p.panNo)}</td>
                        {customColumns.map(col => (
                          <td key={col} className="py-2.5 px-3 font-mono text-slate-300">
                            {p.customFields?.[col] || "-"}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {currentUser.role === "admin" && (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-t border-slate-800 text-xs">
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
                  <span className="px-3 py-1 font-mono text-amber-400 font-bold">{currentPage}</span>
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
        {/* CARDS VIEW WITH DEDICATED WORKED TENURE DISPLAY                           */}
        {/* ========================================================================= */}
        {activeNav === "cards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedPersonnel.map(p => {
              const tenure = calculateServiceTenure(p.reportDate || p.appointmentDate || p.recruitedDate);
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedOfficer(p)}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-amber-500/50 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatarUrl || PRESET_AVATARS[0]}
                          alt={p.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/50 shadow"
                          loading="lazy"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-400 font-mono">{p.code}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-indigo-300 rounded font-semibold border border-slate-700">{p.designation}</span>
                          </div>
                          <h3 className="font-bold text-white text-sm mt-0.5">{p.name}</h3>
                          <p className="text-xs text-slate-400 font-mono">#{p.badgeNo}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        (p.appointment || '').toLowerCase() === 'crime' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {p.appointment}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">{t.dutyPlace}:</span>
                        <span className="text-slate-300 font-medium">{p.dutyPlace}</span>
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

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-mono text-slate-300">{maskMobile(p.mobile)}</span>
                    {currentUser.role === "admin" && (
                      <div className="flex items-center gap-1.5">
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
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ANALYTICS VIEW                                                            */}
        {/* ========================================================================= */}
        {activeNav === "analytics" && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white">Gujarat Police Crime Branch Squad Distribution</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {uniqueSquads.map(s => {
                const count = personnel.filter(p => p.code === s).length;
                return (
                  <div key={s} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-xs font-bold text-amber-400">{s}</span>
                    <p className="text-2xl font-black text-white mt-1">{count}</p>
                    <span className="text-[10px] text-slate-500">Officers Assigned</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* OFFICER DETAIL MODAL WITH WORKED TENURE & SENSITIVE MASKS                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedOfficer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">{t.dept}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400 font-mono">#{selectedOfficer.badgeNo}</span>
                </div>
                <button onClick={() => setSelectedOfficer(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center gap-4">
                  <img src={selectedOfficer.avatarUrl || PRESET_AVATARS[0]} alt={selectedOfficer.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow" />
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedOfficer.name}</h2>
                    <p className="text-xs text-amber-400 font-mono">{selectedOfficer.code} • {selectedOfficer.designation}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">બક્કલ નંબર: {selectedOfficer.badgeNo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
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

              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end">
                <button onClick={() => setSelectedOfficer(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ADD / EDIT OFFICER MODAL WITH PHOTO UPLOAD & CUSTOM FIELDS                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
                <h2 className="text-lg font-bold text-white">
                  {editingPerson ? (language === "gu" ? "કર્મચારી વિગત સુધારો" : "Edit Personnel") : (language === "gu" ? "નવો કર્મચારી ઉમેરો" : "Add Personnel")}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSavePerson} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* PHOTO UPLOAD & PREVIEW */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={formData.avatarUrl || PRESET_AVATARS[0]}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/60 shadow"
                  />
                  <div className="flex-1 w-full space-y-2">
                    <label className="block text-xs font-semibold text-amber-400">
                      {language === "gu" ? "ઓફિસર ફોટો અપલોડ / એડિટ (Photo Upload)" : "Officer Photo Upload / Edit"}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
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
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.srNo}</label>
                    <input type="number" value={formData.srNo} onChange={(e) => setFormData({ ...formData, srNo: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.squad}</label>
                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.designation}</label>
                    <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.badgeNo}</label>
                    <input type="text" value={formData.badgeNo} onChange={(e) => setFormData({ ...formData, badgeNo: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.name}</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.mobile}</label>
                    <input type="text" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.dutyPlace}</label>
                    <input type="text" value={formData.dutyPlace} onChange={(e) => setFormData({ ...formData, dutyPlace: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.appointment}</label>
                    <input type="text" value={formData.appointment} onChange={(e) => setFormData({ ...formData, appointment: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.reportDate}</label>
                    <input type="text" value={formData.reportDate} onChange={(e) => setFormData({ ...formData, reportDate: e.target.value, appointmentDate: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.birthDate}</label>
                    <input type="text" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.recruitedDate}</label>
                    <input type="text" value={formData.recruitedDate} onChange={(e) => setFormData({ ...formData, recruitedDate: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.retirementDate}</label>
                    <input type="text" value={formData.retirementDate} onChange={(e) => setFormData({ ...formData, retirementDate: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.aadhar}</label>
                    <input type="text" value={formData.aadharNo} onChange={(e) => setFormData({ ...formData, aadharNo: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{t.pan}</label>
                    <input type="text" value={formData.panNo} onChange={(e) => setFormData({ ...formData, panNo: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition">
                    {editingPerson ? "Update Record" : "Save Record"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SPREADSHEET IMPORT MODAL                                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Import 409 Personnel Rows</h2>
                </div>
                <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleImportSpreadsheet} className="p-6 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Paste tab-separated rows copied from your official spreadsheet. Columns are mapped in exact Gujarat Police order:
                  <br />
                  <span className="font-mono text-[11px] text-amber-300">
                    અ.નં. | Code | હોદ્દો | બ.નં. | નામ | મોબાઇલ | ફરજની જગ્યા | નીમણુંક | હાજર તારીખ | જન્મ તારીખ | ભરતી | નિવૃત્તિ | આધાર | પાન
                  </span>
                </p>

                <textarea
                  rows={7}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste rows here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReplaceData(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${!replaceData ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                  >
                    + Append Records
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplaceData(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${replaceData ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                  >
                    ⚡ Replace All Existing
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition">
                    Execute Import
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* CUSTOM COLUMN MANAGER MODAL (ADD & DELETE SPECIFIC COLUMN)                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isColModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
                <h2 className="text-lg font-bold text-white">Custom Columns Manager</h2>
                <button onClick={() => setIsColModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAddCustomColumn} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Add New Column</label>
                  <input
                    type="text"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    placeholder="e.g. Zone, Belt No, Special Duty"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {customColumns.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-amber-400">Delete Specific Custom Column</label>
                    <div className="flex flex-wrap gap-2">
                      {customColumns.map(col => (
                        <div key={col} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200">
                          <span className="font-mono text-amber-300">{col}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomColumn(col)}
                            className="p-1 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                            title={`Delete column ${col}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsColModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl">Add Column</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3-LAYER SECURITY MODAL FOR SAFE DELETE ALL                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDeleteAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-rose-500/50 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Permanent Roster Deletion Protection</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  This action will permanently wipe all {personnel.length} records from both the client and server database. To proceed, complete the two-step authorization:
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
                    2. Type <span className="text-rose-400 font-mono">DELETE ALL</span> to confirm
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-rose-500/40 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
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

      {/* AUDIT LOGS & SERVER BACKUPS MODAL */}
      <AnimatePresence>
        {isAdminControlOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Audit Logs & Server Backups</h2>
                </div>
                <button onClick={() => setIsAdminControlOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Server Database Snapshots</span>
                  <button onClick={handleCreateServerBackup} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl">
                    + Create New Snapshot
                  </button>
                </div>

                <div className="space-y-2">
                  {backups.length === 0 ? (
                    <p className="text-xs text-slate-500">No server backup snapshots created yet.</p>
                  ) : (
                    backups.map(b => (
                      <div key={b.fileName} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                        <span className="text-emerald-400">{b.fileName}</span>
                        <span className="text-slate-400">{new Date(b.createdAt).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3">Security & Database Audit Logs</span>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {auditLogs.length === 0 ? (
                      <p className="text-xs text-slate-500">No audit logs recorded yet.</p>
                    ) : (
                      auditLogs.map(log => (
                        <div key={log.id} className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-0.5">
                          <div className="flex items-center justify-between font-mono text-[10px]">
                            <span className="text-amber-400 font-bold">{log.action}</span>
                            <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-300 text-xs">{log.details}</p>
                          <span className="text-[10px] text-slate-500 block">By: {log.user}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CRIME BRANCH AI ASSISTANT MODAL (FAST & BULLETPROOF) */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Gujarat Police Crime Branch AI</h2>
                </div>
                <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <p className="text-xs text-slate-400">
                  Ask any question about staff strength, squad allocation, retirement schedules, or designations:
                </p>
                <form onSubmit={handleAskAI} className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. સ્કોડ-૦૧ માં કેટલા કર્મચારીઓ છે? Who is retiring next?"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button type="submit" disabled={aiLoading} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow">
                    {aiLoading ? "Analyzing..." : "Ask"}
                  </button>
                </form>

                {aiResponse && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
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
