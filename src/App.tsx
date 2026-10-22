import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, Users, Search, Plus, Filter, Download, Printer, Sparkles, 
  Trash2, Edit3, X, Check, Calendar, Phone, Award, UserCheck, AlertCircle, 
  Languages, BarChart3, Briefcase, FileText, Lock, Unlock, ShieldAlert,
  ChevronRight, ArrowUpDown, Upload, Image as ImageIcon, Eye, Clock, MessageSquare,
  FileSpreadsheet, ExternalLink, Send, Columns, LogOut, Key, UserCheck as UserVerified,
  Wrench, RefreshCw, Copy, CheckCheck, AlertTriangle, Layers, Settings, Sliders, Database,
  Menu, LayoutDashboard, UserPlus, IdCard, Activity, ChevronLeft
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

// Utility: Calculate remaining service until retirement date
export function calculateRetirementCountdown(retirementDateStr: string | undefined | null): {
  years: number;
  months: number;
  days: number;
  isRetired: boolean;
  formatted: string;
  formattedGu: string;
} | null {
  const retDate = parseDateString(retirementDateStr);
  if (!retDate) return null;

  const today = new Date();
  if (today >= retDate) {
    return {
      years: 0,
      months: 0,
      days: 0,
      isRetired: true,
      formatted: "Superannuated / Retired",
      formattedGu: "નિવૃત્ત થયેલ"
    };
  }

  let years = retDate.getFullYear() - today.getFullYear();
  let months = retDate.getMonth() - today.getMonth();
  let days = retDate.getDate() - today.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(retDate.getFullYear(), retDate.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const enParts: string[] = [];
  if (years > 0) enParts.push(`${years} yrs`);
  if (months > 0) enParts.push(`${months} mos`);
  enParts.push(`${days} days`);

  const guParts: string[] = [];
  if (years > 0) guParts.push(`${years} વર્ષ`);
  if (months > 0) guParts.push(`${months} માસ`);
  guParts.push(`${days} દિવસ`);

  return {
    years,
    months,
    days,
    isRetired: false,
    formatted: `${enParts.join(" ")} left`,
    formattedGu: `${guParts.join(" ")} બાકી`
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
    weaponNo: "GLK-8419",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
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
    aadharNo: "8823 4410 1928",
    panNo: "AXIPM8747M",
    bloodGroup: "B+",
    weaponNo: "REV-8747",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
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
    aadharNo: "9102 3847 5519",
    panNo: "CLQPS8557S",
    bloodGroup: "A+",
    weaponNo: "BER-8557",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    notes: "Reliable head constable assigned to special crime tracking.",
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
    aadharNo: "6519 2837 3453",
    panNo: "DMKPN3453N",
    bloodGroup: "AB+",
    weaponNo: "INS-3453",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    notes: "Active operative in Squad 01 crime branch.",
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
    aadharNo: "4429 8812 8539",
    panNo: "ERTND8539D",
    bloodGroup: "O-",
    weaponNo: "MP5-8539",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
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

interface UserSession {
  role: "admin" | "user";
  name: string;
  badgeNo: string;
  mobile: string;
}

export default function App() {
  // Auto-migrate to v18 to guarantee fresh column integrity, photo upload, and worked tenure calculation
  const [personnel, setPersonnel] = useState<Personnel[]>(() => {
    const isMigrated = localStorage.getItem("crime_branch_migrated_v18");
    if (!isMigrated) {
      localStorage.removeItem("crime_branch_personnel_v10");
      localStorage.removeItem("crime_branch_personnel_v11");
      localStorage.removeItem("crime_branch_personnel_v12");
      localStorage.removeItem("crime_branch_personnel_v15");
      localStorage.removeItem("crime_branch_custom_cols_v10");
      localStorage.removeItem("crime_branch_custom_cols_v12");
      localStorage.removeItem("crime_branch_custom_cols_v15");
      localStorage.setItem("crime_branch_migrated_v18", "true");
      return initialPersonnel;
    }
    const localSaved = localStorage.getItem("crime_branch_personnel_v18");
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].aadharNo !== undefined) return parsed;
      } catch (e) { /* fallback */ }
    }
    return initialPersonnel;
  });

  const [customColumns, setCustomColumns] = useState<string[]>(() => {
    const savedCols = localStorage.getItem("crime_branch_custom_cols_v18");
    if (savedCols) {
      try { return JSON.parse(savedCols); } catch (e) { /* fallback */ }
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const savedSession = sessionStorage.getItem("crime_branch_auth_user_v18");
    if (savedSession) {
      try { return JSON.parse(savedSession); } catch (e) { /* fallback */ }
    }
    return {
      role: "admin",
      name: "Super Admin (Crime Branch)",
      badgeNo: "ADMIN-01",
      mobile: "9274583654"
    };
  });

  // UI Navigation & View state - default sidebar to OPEN so it is immediately visible
  const [activeNav, setActiveNav] = useState<"table" | "cards" | "analytics">("table");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSquad, setSelectedSquad] = useState("ALL");
  const [selectedDesignation, setSelectedDesignation] = useState("ALL");
  const [selectedAppointment, setSelectedAppointment] = useState("ALL");
  const [language, setLanguage] = useState<"gu" | "en">("gu");

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

  // In-app deletion, duplicate removal & Admin Control modal states
  const [deleteTarget, setDeleteTarget] = useState<Personnel | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isAdminControlModalOpen, setIsAdminControlModalOpen] = useState(false);
  const [isAdminUnlockModalOpen, setIsAdminUnlockModalOpen] = useState(false);
  const [unlockPasswordInput, setUnlockPasswordInput] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [adminTab, setAdminTab] = useState<"quick" | "replace" | "backup">("quick");

  // Admin Batch replace state
  const [batchReplaceField, setBatchReplaceField] = useState<string>("code");
  const [batchReplaceFind, setBatchReplaceFind] = useState("");
  const [batchReplaceWith, setBatchReplaceWith] = useState("");
  const [bulkReplaceText, setBulkReplaceText] = useState("");

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warning" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const jsonBackupInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("crime_branch_personnel_v18", JSON.stringify(personnel));
      sessionStorage.setItem("crime_branch_personnel_v18", JSON.stringify(personnel));
    } catch (e) {
      console.error("Storage save error", e);
    }
  }, [personnel]);

  useEffect(() => {
    try {
      localStorage.setItem("crime_branch_custom_cols_v18", JSON.stringify(customColumns));
      sessionStorage.setItem("crime_branch_custom_cols_v18", JSON.stringify(customColumns));
    } catch (e) {
      console.error("Column save error", e);
    }
  }, [customColumns]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem("crime_branch_auth_user_v18", JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem("crime_branch_auth_user_v18");
    }
  }, [currentUser]);

  // Form state
  const [formData, setFormData] = useState<Omit<Personnel, "id">>({
    srNo: personnel.length + 1,
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

  // Admin Verification & Unlock
  const handleQuickUnlockAdmin = () => {
    setCurrentUser({
      role: "admin",
      name: "Super Admin (Crime Branch)",
      badgeNo: "ADMIN-01",
      mobile: "9274583654"
    });
    setIsAdminUnlockModalOpen(false);
    setUnlockPasswordInput("");
    setUnlockError("");
    showToast(language === "gu" ? "સુપર એડમિન મોડ સફળતાપૂર્વક અનલૉક થયો!" : "Super Admin Mode successfully unlocked!", "success");
    setIsAdminControlModalOpen(true);
  };

  const handlePasswordUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockPasswordInput.trim() === "1673583") {
      handleQuickUnlockAdmin();
    } else {
      setUnlockError(language === "gu" ? "અમાન્ય પાસવર્ડ! (ઓફિશિયલ પાસવર્ડ: 1673583)" : "Invalid Password! (Official Password: 1673583)");
    }
  };

  const openAdminPanel = () => {
    if (currentUser?.role === "admin") {
      setIsAdminControlModalOpen(true);
    } else {
      setIsAdminUnlockModalOpen(true);
    }
  };

  // In-App Deletion Handlers
  const requestDelete = (p: Personnel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentUser?.role !== "admin") {
      setIsAdminUnlockModalOpen(true);
      return;
    }
    setDeleteTarget(p);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    const targetName = deleteTarget.name;
    const updated = personnel.filter(p => p.id !== targetId);
    setPersonnel(updated);
    if (selectedOfficer?.id === targetId) {
      setSelectedOfficer(null);
    }
    setDeleteTarget(null);
    showToast(
      language === "gu"
        ? `કર્મચારી "${targetName}" ને સફળતાપૂર્વક દૂર કરવામાં આવ્યા.`
        : `Personnel "${targetName}" was removed successfully.`,
      "success"
    );
  };

  const requestDeleteAll = () => {
    if (currentUser?.role !== "admin") {
      setIsAdminUnlockModalOpen(true);
      return;
    }
    setIsDeleteAllModalOpen(true);
  };

  const confirmDeleteAll = () => {
    setPersonnel([]);
    setSelectedOfficer(null);
    setIsDeleteAllModalOpen(false);
    showToast(
      language === "gu"
        ? "તમામ કર્મચારીઓના રેકોર્ડ્સ સફળતાપૂર્વક કાઢી નાખ્યા."
        : "All personnel records have been permanently cleared.",
      "warning"
    );
  };

  // Duplicate Records Counter - Matches exact full data row signature (name, badge, mobile, aadhar, pan, designation, code)
  const getDuplicateCount = () => {
    const seenSignatures = new Set<string>();
    let count = 0;
    for (const p of personnel) {
      const sig = [
        p.name?.trim().toLowerCase() || "",
        p.badgeNo?.trim() || "",
        p.mobile?.replace(/\D/g, '').trim() || "",
        p.aadharNo?.replace(/\D/g, '').trim() || "",
        p.panNo?.trim().toUpperCase() || "",
        p.designation?.trim().toUpperCase() || "",
        p.code?.trim() || ""
      ].join("|");

      if (seenSignatures.has(sig)) {
        count++;
      } else {
        seenSignatures.add(sig);
      }
    }
    return count;
  };

  // Automatic Duplicate Deletion Tool - Matches exact full data row signature
  const handleAutoDeleteDuplicates = () => {
    if (currentUser?.role !== "admin") {
      setIsAdminUnlockModalOpen(true);
      return;
    }

    const seenSignatures = new Set<string>();
    const cleanList: Personnel[] = [];
    const removedList: Personnel[] = [];

    for (const p of personnel) {
      const sig = [
        p.name?.trim().toLowerCase() || "",
        p.badgeNo?.trim() || "",
        p.mobile?.replace(/\D/g, '').trim() || "",
        p.aadharNo?.replace(/\D/g, '').trim() || "",
        p.panNo?.trim().toUpperCase() || "",
        p.designation?.trim().toUpperCase() || "",
        p.code?.trim() || ""
      ].join("|");

      if (seenSignatures.has(sig)) {
        removedList.push(p);
      } else {
        seenSignatures.add(sig);
        cleanList.push(p);
      }
    }

    if (removedList.length === 0) {
      showToast(
        language === "gu"
          ? "કોઈ ડુપ્લિકેટ કર્મચારી મળ્યા નથી. ડેટા સંપૂર્ણ સ્વચ્છ છે."
          : "No duplicate records detected. All personnel records are unique.",
        "info"
      );
      return;
    }

    const resequenced = cleanList.map((p, idx) => ({ ...p, srNo: idx + 1 }));
    setPersonnel(resequenced);
    showToast(
      language === "gu"
        ? `${removedList.length} ડુપ્લિકેટ રેકોર્ડ્સ આપમેળે દૂર કરવામાં આવ્યા અને અ.નં. ક્રમબદ્ધ કરાયા.`
        : `Successfully removed ${removedList.length} duplicate record(s) and resequenced numbers.`,
      "success"
    );
  };

  // Fix & Normalize Columns (Repairs column alignment without deleting records)
  const handleResetToCleanDefault = () => {
    // Repair/Normalize existing records so that aadharNo, panNo, bloodGroup, weaponNo, and appointmentDate are correctly set
    const repaired = personnel.map((p, idx) => ({
      ...p,
      srNo: p.srNo || idx + 1,
      aadharNo: p.aadharNo && p.aadharNo.length > 5 ? p.aadharNo : (initialPersonnel[idx % initialPersonnel.length]?.aadharNo || "7492 8104 9281"),
      panNo: p.panNo && p.panNo.length > 4 ? p.panNo : (initialPersonnel[idx % initialPersonnel.length]?.panNo || "BKAPG9941K"),
      bloodGroup: ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"].includes(p.bloodGroup) ? p.bloodGroup : "B+",
      weaponNo: p.weaponNo && p.weaponNo.trim() ? p.weaponNo : ("WP-" + (p.badgeNo || "8419")),
      appointmentDate: p.appointmentDate || p.reportDate || "01/01/2026"
    }));

    setPersonnel(repaired);
    localStorage.setItem("crime_branch_personnel_v18", JSON.stringify(repaired));
    setSelectedOfficer(null);
    showToast(
      language === "gu"
        ? "કૉલમ્સ અને ડેટા સફળતાપૂર્વક સુધારી અને ગોઠવી દેવાયા! (કોઈ કર્મચારી ડેટા ડિલીટ થયો નથી)"
        : "Columns and rows repaired & aligned successfully! (No personnel records were deleted)",
      "success"
    );
  };

  // Re-sequence Sr. Nos (1 to N)
  const handleResequenceSrNos = () => {
    if (currentUser?.role !== "admin") {
      setIsAdminUnlockModalOpen(true);
      return;
    }
    const resequenced = personnel.map((p, idx) => ({ ...p, srNo: idx + 1 }));
    setPersonnel(resequenced);
    showToast(
      language === "gu"
        ? "તમામ અ.નં. (Sr. Nos) 1 થી શરૂ કરીને ક્રમબદ્ધ કરવામાં આવ્યા."
        : `Resequenced all ${personnel.length} serial numbers from 1 to ${personnel.length}.`,
      "success"
    );
  };

  // Batch Find and Replace
  const handleBatchReplace = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== "admin") {
      setIsAdminUnlockModalOpen(true);
      return;
    }
    if (!batchReplaceFind.trim()) {
      showToast("Please enter text to find.", "warning");
      return;
    }

    let updatedCount = 0;
    const targetKey = batchReplaceField as keyof Personnel;

    const updated = personnel.map(p => {
      if (customColumns.includes(batchReplaceField)) {
        const currentVal = p.customFields?.[batchReplaceField] || "";
        if (currentVal.includes(batchReplaceFind)) {
          updatedCount++;
          const newVal = currentVal.replaceAll(batchReplaceFind, batchReplaceWith);
          return {
            ...p,
            customFields: { ...(p.customFields || {}), [batchReplaceField]: newVal }
          };
        }
        return p;
      }

      const currentVal = String(p[targetKey] || "");
      if (currentVal.includes(batchReplaceFind)) {
        updatedCount++;
        const newVal = currentVal.replaceAll(batchReplaceFind, batchReplaceWith);
        return { ...p, [targetKey]: newVal };
      }
      return p;
    });

    setPersonnel(updated);
    showToast(
      language === "gu"
        ? `${updatedCount} રેકોર્ડ્સમાં "${batchReplaceFind}" ને "${batchReplaceWith}" સાથે બદલવામાં આવ્યું.`
        : `Replaced in ${updatedCount} personnel records successfully.`,
      "success"
    );
    setBatchReplaceFind("");
    setBatchReplaceWith("");
  };

  // Replace All with Bulk Text (JSON or CSV/TSV)
  const handleBulkReplaceAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== "admin") {
      setIsAdminUnlockModalOpen(true);
      return;
    }
    if (!bulkReplaceText.trim()) return;

    try {
      if (bulkReplaceText.trim().startsWith("[")) {
        const parsed = JSON.parse(bulkReplaceText.trim());
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPersonnel(parsed);
          setBulkReplaceText("");
          showToast(
            language === "gu"
              ? `સંપૂર્ણ ડેટા બદલાયો: ${parsed.length} કર્મચારીઓ લોડ થયા.`
              : `Successfully replaced all records with ${parsed.length} personnel from JSON.`,
            "success"
          );
          return;
        }
      }

      const lines = bulkReplaceText.trim().split("\n");
      const newPersonnelList: Personnel[] = [];
      let currentSrNo = 1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (i === 0 && (line.toLowerCase().includes("name") || line.includes("નામ") || line.toLowerCase().includes("designation"))) {
          continue;
        }
        const cols = line.split(/[\t,|]+/).map(c => c.trim()).filter(Boolean);
        if (cols.length >= 4) {
          let colOffset = 0;
          if (!isNaN(Number(cols[0])) && cols[0].length <= 4 && cols.length > 5) {
            colOffset = 1;
          }
          const p: Personnel = {
            id: `replace-${Date.now()}-${i}-${Math.random()}`,
            srNo: currentSrNo++,
            code: cols[colOffset] || "સ્કોડ-૦૧",
            designation: cols[colOffset + 1] || "UHC",
            badgeNo: cols[colOffset + 2] || String(Math.floor(1000 + Math.random() * 9000)),
            name: cols[colOffset + 3] || "Officer " + currentSrNo,
            mobile: (cols[colOffset + 4] || "9876543210").replace(/\s+/g, ''),
            aadharNo: cols[colOffset + 5] || "XXXX XXXX XXXX",
            panNo: cols[colOffset + 6] || "XXXXX0000X",
            bloodGroup: cols[colOffset + 7] || "B+",
            weaponNo: cols[colOffset + 8] || "WP-" + Math.floor(1000 + Math.random() * 9000),
            dutyPlace: cols[colOffset + 9] || "CRIME BRANCH",
            appointment: cols[colOffset + 10] || "CRIME",
            reportDate: cols[colOffset + 11] || "01/01/2026",
            birthDate: cols[colOffset + 12] || "01/06/1980",
            recruitedDate: cols[colOffset + 13] || "01/01/2005",
            retirementDate: cols[colOffset + 14] || "30/06/2040",
            avatarUrl: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
            notes: "Imported via Admin Replace-All.",
            customFields: {}
          };
          newPersonnelList.push(p);
        }
      }

      if (newPersonnelList.length === 0) {
        showToast("No valid rows detected. Please check your data format.", "error");
        return;
      }

      setPersonnel(newPersonnelList);
      setBulkReplaceText("");
      showToast(
        language === "gu"
          ? `સંપૂર્ણ રોસ્ટર બદલાયો: ${newPersonnelList.length} નવા કર્મચારીઓ લોડ થયા.`
          : `Successfully replaced entire roster with ${newPersonnelList.length} records.`,
        "success"
      );
    } catch (err: any) {
      showToast(`Replace-All Error: ${err.message}`, "error");
    }
  };

  // Export JSON Master Backup
  const handleExportJSONBackup = () => {
    const backupData = {
      app: "Gujarat Police Crime Branch Roster System",
      version: "v12",
      exportedAt: new Date().toISOString(),
      customColumns,
      personnel
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonStr);
    link.setAttribute("download", `crime_branch_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Master JSON backup downloaded.", "success");
  };

  // Restore JSON Backup file
  const handleImportJSONBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.personnel && Array.isArray(parsed.personnel)) {
          setPersonnel(parsed.personnel);
          if (parsed.customColumns && Array.isArray(parsed.customColumns)) {
            setCustomColumns(parsed.customColumns);
          }
          showToast(`Backup restored: ${parsed.personnel.length} records loaded.`, "success");
        } else if (Array.isArray(parsed)) {
          setPersonnel(parsed);
          showToast(`JSON restored: ${parsed.length} records loaded.`, "success");
        } else {
          showToast("Invalid backup JSON format.", "error");
        }
      } catch (err: any) {
        showToast("Error parsing JSON backup file.", "error");
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  const handleOpenAddModal = () => {
    if (currentUser?.role !== "admin") {
      setIsAdminUnlockModalOpen(true);
      return;
    }
    setEditingPerson(null);
    const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
    const initialCustom: Record<string, string> = {};
    customColumns.forEach(col => { initialCustom[col] = ""; });

    setFormData({
      srNo: personnel.length ? Math.max(...personnel.map(p => p.srNo)) + 1 : 1,
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
      avatarUrl: randomAvatar,
      appointmentDate: "01/01/2026",
      notes: "",
      customFields: initialCustom
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Personnel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentUser?.role !== "admin") {
      setIsAdminUnlockModalOpen(true);
      return;
    }
    setEditingPerson(p);
    const filledCustom: Record<string, string> = {};
    customColumns.forEach(col => {
      filledCustom[col] = p.customFields?.[col] || "";
    });

    setFormData({
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
      retirementDate: p.retirementDate,
      aadharNo: p.aadharNo || "",
      panNo: p.panNo || "",
      bloodGroup: p.bloodGroup || "B+",
      weaponNo: p.weaponNo || "",
      avatarUrl: p.avatarUrl || PRESET_AVATARS[0],
      appointmentDate: p.appointmentDate || p.reportDate || "",
      notes: p.notes || "",
      customFields: filledCustom
    });
    setIsModalOpen(true);
  };

  const handleAddCustomColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== "admin") {
      setIsAdminUnlockModalOpen(true);
      return;
    }
    if (!newColName.trim()) return;
    const trimmed = newColName.trim();
    if (!customColumns.includes(trimmed)) {
      const updatedCols = [...customColumns, trimmed];
      setCustomColumns(updatedCols);
      setPersonnel(personnel.map(p => ({
        ...p,
        customFields: { ...(p.customFields || {}), [trimmed]: "" }
      })));
      showToast(`Column "${trimmed}" added successfully.`, "success");
    }
    setNewColName("");
    setIsColModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast(language === "gu" ? "કૃપા કરીને માન્ય ફોટો ફાઇલ પસંદ કરો (JPG, PNG, WebP)" : "Please select an image file (JPG, PNG, WebP)", "error");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast(language === "gu" ? "ફોટો સાઈઝ 3MB કરતાં નાની હોવી જોઈએ." : "Photo size must be under 3MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setFormData(prev => ({ ...prev, avatarUrl: base64 }));
        showToast(language === "gu" ? "ઓફિસર ફોટો સફળતાપૂર્વક અપલોડ થયો!" : "Officer photo uploaded successfully!", "success");
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== "admin") return;
    if (editingPerson) {
      setPersonnel(personnel.map(p => p.id === editingPerson.id ? { ...formData, id: p.id } : p));
      if (selectedOfficer?.id === editingPerson.id) {
        setSelectedOfficer({ ...formData, id: editingPerson.id });
      }
      showToast(`Officer "${formData.name}" updated successfully.`, "success");
    } else {
      const newPerson: Personnel = {
        ...formData,
        id: Date.now().toString(),
      };
      setPersonnel([...personnel, newPerson]);
      showToast(`Officer "${formData.name}" added to roster.`, "success");
    }
    setIsModalOpen(false);
  };

  // Robust Spreadsheet Import Parser
  const handleImportSpreadsheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== "admin") return;
    if (!importText.trim()) return;

    try {
      const lines = importText.trim().split("\n");
      const newPersonnelList: Personnel[] = replaceData ? [] : [...personnel];
      let currentSrNo = newPersonnelList.length ? Math.max(...newPersonnelList.map(p => p.srNo)) + 1 : 1;
      let importedCount = 0;
      let detectedCols = [...customColumns];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (i === 0 && (line.toLowerCase().includes("name") || line.includes("નામ") || line.includes("હોદ્દો") || line.toLowerCase().includes("designation"))) {
          const headers = line.split(/[\t,|]+/).map(c => c.trim()).filter(Boolean);
          if (headers.length > 15) {
            const extraHeaders = headers.slice(15);
            extraHeaders.forEach(h => {
              if (!detectedCols.includes(h) && h.toLowerCase() !== "notes") {
                detectedCols.push(h);
              }
            });
            setCustomColumns(detectedCols);
          }
          continue;
        }

        const cols = line.split(/[\t,|]+/).map(c => c.trim()).filter(Boolean);
        if (cols.length >= 4) {
          let colOffset = 0;
          if (!isNaN(Number(cols[0])) && cols[0].length <= 4 && cols.length > 5) {
            colOffset = 1;
          }

          const code = cols[colOffset] || "સ્કોડ-૦૧";
          const designation = cols[colOffset + 1] || "UHC";
          const badgeNo = cols[colOffset + 2] || String(Math.floor(1000 + Math.random() * 9000));
          const name = cols[colOffset + 3] || "Officer " + currentSrNo;
          const mobile = (cols[colOffset + 4] || "9876543210").replace(/\s+/g, '');
          const aadharNo = cols[colOffset + 5] || "XXXX XXXX XXXX";
          const panNo = cols[colOffset + 6] || "XXXXX0000X";
          const bloodGroup = cols[colOffset + 7] || "B+";
          const weaponNo = cols[colOffset + 8] || "WP-" + badgeNo;
          const dutyPlace = cols[colOffset + 9] || code;
          const appointment = cols[colOffset + 10] || "CRIME";
          const reportDate = cols[colOffset + 11] || "01/01/2026";
          const appointmentDate = reportDate;
          const birthDate = cols[colOffset + 12] || "01/06/1980";
          const recruitedDate = cols[colOffset + 13] || "01/01/2005";
          const retirementDate = cols[colOffset + 14] || "30/06/2040";

          const customFields: Record<string, string> = {};
          detectedCols.forEach((colName, cIdx) => {
            const val = cols[colOffset + 15 + cIdx];
            if (val !== undefined) {
              customFields[colName] = val;
            }
          });

          const p: Personnel = {
            id: `import-${Date.now()}-${i}-${Math.random()}`,
            srNo: currentSrNo++,
            code,
            designation,
            badgeNo,
            name,
            mobile,
            aadharNo,
            panNo,
            bloodGroup,
            weaponNo,
            dutyPlace,
            appointment,
            reportDate,
            appointmentDate,
            birthDate,
            recruitedDate,
            retirementDate,
            avatarUrl: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
            notes: "Imported via spreadsheet.",
            customFields
          };
          newPersonnelList.push(p);
          importedCount++;
        }
      }

      setPersonnel(newPersonnelList);
      setIsImportModalOpen(false);
      setImportText("");
      showToast(
        language === "gu"
          ? `${importedCount} કર્મચારીઓ ${replaceData ? "(સંપૂર્ણ ડેટા બદલાયો)" : "(ઉમેરાયા)"} સફળતાપૂર્વક ઇમ્પોર્ટ થયા!`
          : `Successfully imported ${importedCount} records ${replaceData ? "(replaced all)" : "(appended)"}!`,
        "success"
      );
    } catch (err: any) {
      showToast("Error parsing spreadsheet data. Please check column format.", "error");
    }
  };

  const handleExportCSV = () => {
    const baseHeaders = [
      "Sr No", "Code", "Designation", "Badge No", "Name", "Mobile", 
      "Aadhar Card No", "PAN Card No", "Blood Group", "Weapon No", 
      "Duty Place", "Appointment", "Reporting Date", "Birth Date", "Recruitment Date", "Retirement Date"
    ];
    const headers = [...baseHeaders, ...customColumns, "Notes"];
    
    const rows = personnel.map(p => {
      const baseVals = [
        p.srNo, p.code, p.designation, p.badgeNo, `"${p.name}"`, p.mobile,
        `"${p.aadharNo}"`, `"${p.panNo}"`, p.bloodGroup, p.weaponNo,
        `"${p.dutyPlace}"`, p.appointment, p.reportDate, p.birthDate, p.recruitedDate, p.retirementDate
      ];
      const customVals = customColumns.map(col => `"${p.customFields?.[col] || ""}"`);
      return [...baseVals, ...customVals, `"${p.notes || ""}"`];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crime_branch_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV exported successfully.", "success");
  };

  const handlePrint = () => {
    window.print();
  };

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
      if (data.error) {
        setAiResponse(`Error: ${data.error}`);
      } else {
        setAiResponse(data.text);
      }
    } catch (err: any) {
      setAiResponse(`Failed to connect to AI server: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredPersonnel = personnel.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(query) ||
      p.badgeNo.toLowerCase().includes(query) ||
      p.mobile.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query) ||
      p.designation.toLowerCase().includes(query) ||
      p.dutyPlace.toLowerCase().includes(query) ||
      p.aadharNo.toLowerCase().includes(query) ||
      p.panNo.toLowerCase().includes(query) ||
      p.weaponNo.toLowerCase().includes(query) ||
      p.bloodGroup.toLowerCase().includes(query) ||
      Object.values(p.customFields || {}).some(val => val.toLowerCase().includes(query));
    
    const matchesSquad = selectedSquad === "ALL" || p.code === selectedSquad;
    const matchesDesignation = selectedDesignation === "ALL" || p.designation === selectedDesignation;
    const matchesAppointment = selectedAppointment === "ALL" || p.appointment === selectedAppointment;

    return matchesSearch && matchesSquad && matchesDesignation && matchesAppointment;
  });

  const uniqueSquads = Array.from(new Set(personnel.map(p => p.code)));
  const uniqueDesignations = Array.from(new Set(personnel.map(p => p.designation)));
  const duplicateCount = getDuplicateCount();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-row font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden relative">
      
      {/* Background Ambient Glow & Grid Matrix (Aceternity / React Bits effect) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      </div>

      {/* MOBILE SIDEBAR BACKDROP */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* DEDICATED SIDEBAR (DESKTOP + MOBILE DRAWER) */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-slate-950/98 border-r border-slate-800/90 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Sidebar Header Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-700/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">ગુજરાત ક્રાઇમ બ્રાન્ચ</span>
                <h2 className="text-base font-extrabold text-white tracking-tight leading-none">Crime Branch</h2>
                <span className="text-[10px] text-slate-400 font-mono">Gujarat Police HQ</span>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* User Role Card & Instant Admin Switch */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[130px]">
                  {currentUser?.name || "Crime Branch Officer"}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${
                currentUser?.role === "admin" 
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                  : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
              }`}>
                {currentUser?.role === "admin" ? "SUPER ADMIN" : "OFFICER"}
              </span>
            </div>

            {currentUser?.role !== "admin" ? (
              <button
                onClick={() => setIsAdminUnlockModalOpen(true)}
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Unlock Super Admin / એડમિન બનો</span>
              </button>
            ) : (
              <div className="flex items-center justify-between text-[10px] text-amber-400/80 font-mono px-1">
                <span>Authorization: Level 10</span>
                <span>PIN: 1673583</span>
              </div>
            )}
          </div>

          {/* SIDEBAR NAVIGATION ITEMS */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Main Navigation</span>
            
            <button
              onClick={() => { setActiveNav("table"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeNav === "table" 
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black" 
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>{language === "gu" ? "રોસ્ટર ડિરેક્ટરી (ટેબલ)" : "Roster Directory (Table)"}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${activeNav === "table" ? "bg-slate-950 text-amber-300" : "bg-slate-800 text-slate-400"}`}>
                {personnel.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveNav("cards"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeNav === "cards" 
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black" 
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <IdCard className="w-4 h-4" />
                <span>{language === "gu" ? "કાર્ડ્સ વ્યૂ (Cards)" : "Personnel Cards"}</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveNav("analytics"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeNav === "analytics" 
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black" 
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4" />
                <span>{language === "gu" ? "સ્કોડ એનાલિટિક્સ" : "Squad Analytics"}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                {uniqueSquads.length} Squads
              </span>
            </button>
          </div>

          {/* ADMIN CONTROL SECTION - ALWAYS VISIBLE */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 px-3 flex items-center justify-between">
              <span>Admin Management</span>
              <Wrench className="w-3 h-3 text-amber-400" />
            </span>

            {/* Always Visible Admin Control Panel Tab */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { openAdminPanel(); setIsSidebarOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl bg-gradient-to-r from-amber-600/25 via-rose-600/20 to-amber-600/20 hover:from-amber-600/35 hover:to-rose-600/30 border border-amber-500/40 text-amber-300 font-black text-xs shadow-xl transition group"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition duration-300" />
                <span>{language === "gu" ? "એડમિન કંટ્રોલ પેનલ" : "Admin Control Panel"}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold uppercase">
                Open
              </span>
            </motion.button>

            {/* Auto Delete Duplicates in Sidebar */}
            <button
              onClick={() => { handleAutoDeleteDuplicates(); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                duplicateCount > 0 
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25" 
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === "gu" ? "ડુપ્લિકેટ્સ ક્લીનર" : "Clean Duplicates"}</span>
              </div>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${duplicateCount > 0 ? "bg-rose-500 text-white font-bold" : "bg-slate-800 text-slate-400"}`}>
                {duplicateCount}
              </span>
            </button>

            {/* Add Officer Button */}
            <button
              onClick={() => { handleOpenAddModal(); setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === "gu" ? "કર્મચારી ઉમેરો" : "Add Officer"}</span>
            </button>

            {/* Spreadsheet Import */}
            <button
              onClick={() => { setIsImportModalOpen(true); setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === "gu" ? "એક્સેલ / CSV ઇમ્પોર્ટ" : "Import Excel / CSV"}</span>
            </button>

            {/* Fix & Reset Columns (Restores Aadhar, PAN, Blood Group, Weapon No) */}
            <button
              onClick={handleResetToCleanDefault}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition"
              title="Reset Roster and Normalize Aadhar, PAN, Blood Group, Weapon Columns"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === "gu" ? "કૉલમ્સ સુધારો અને રીસેટ" : "Fix Columns & Reset"}</span>
            </button>

            {/* Delete All Records Button in Sidebar */}
            <button
              onClick={() => { requestDeleteAll(); setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === "gu" ? "બધા રેકોર્ડ્સ કાઢી નાખો" : "Delete All Records"}</span>
            </button>
          </div>

          {/* AI ASSISTANT BUTTON */}
          <div className="pt-2">
            <button
              onClick={() => { setIsAiModalOpen(true); setIsSidebarOpen(false); }}
              className="w-full py-2.5 px-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crime Branch AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setLanguage(language === "gu" ? "en" : "gu")}
              className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === "gu" ? "English" : "ગુજરાતી"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-xl flex items-center justify-center transition"
              title="Print Roster"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-[10px] text-center text-slate-400 font-mono">
            Gujarat Police Crime Branch v12.0
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen relative z-10 transition-all duration-300 ${
        isSidebarOpen ? "lg:pl-80" : "pl-0"
      }`}>
        
        {/* RESPONSIVE TOP BAR */}
        <header className="bg-slate-950/90 border-b border-slate-800/80 sticky top-0 z-30 shadow-2xl backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
            
            {/* Left: 3-Bar Menu Button + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white shadow-lg transition cursor-pointer flex-shrink-0"
                title="Toggle Sidebar Menu (3-Bar Button)"
              >
                <Menu className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Menu</span>
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">ગુજરાત પોલીસ</span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">Crime Branch Personnel System</span>
                </div>
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-white truncate">
                  {language === "gu" ? "ક્રાઇમ બ્રાન્ચ સ્ટાફ અને સ્કોડ મેનેજમેન્ટ" : "Crime Branch Squad & Personnel System"}
                </h1>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
              {/* Quick Admin Control Center Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openAdminPanel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600/30 to-rose-600/30 hover:from-amber-600/40 hover:to-rose-600/40 text-amber-300 text-xs font-black rounded-xl border border-amber-500/50 transition shadow-lg shadow-amber-500/10"
                title="Open Admin Control Center"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>{language === "gu" ? "એડમિન કંટ્રોલ" : "Admin Panel"}</span>
              </motion.button>

              {/* Force Fresh Reload Button */}
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition"
                title="Purge cached app data and reload latest version"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Refresh App</span>
              </button>

              {/* Duplicate Cleaner Pill */}
              <button
                onClick={handleAutoDeleteDuplicates}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                  duplicateCount > 0 
                    ? "bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse" 
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
                title="Auto-Clean Duplicates"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Duplicates:</span>
                <span className={`px-1.5 rounded-full text-[10px] font-mono ${duplicateCount > 0 ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                  {duplicateCount}
                </span>
              </button>

              {/* View Switcher: Table vs Cards */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setActiveNav("table")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    activeNav === "table" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setActiveNav("cards")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    activeNav === "cards" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Cards
                </button>
              </div>

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
          
          {/* DASHBOARD STATS CARDS (Aceternity / React Bits Style - Non-overlapping) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Personnel */}
            <div 
              onClick={() => { setSelectedSquad("ALL"); setSelectedDesignation("ALL"); setSelectedAppointment("ALL"); setSearchQuery(""); }}
              className="relative overflow-hidden group rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] cursor-pointer"
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === "gu" ? "કુલ કર્મચારીઓ" : "Total Personnel"}
                  </p>
                  <p className="text-3xl font-black text-white mt-1">{personnel.length}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-2">
                <Check className="w-3.5 h-3.5" />
                <span>All Verified Police Officers</span>
              </div>
            </div>

            {/* Card 2: Squads Filter */}
            <div className="relative overflow-hidden group rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all" />
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === "gu" ? "સ્કોડ ફિલ્ટર" : "Active Squads"}
                </p>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSquad("ALL")}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition ${
                    selectedSquad === "ALL" ? "bg-amber-500 text-slate-950 border-amber-400" : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  All
                </button>
                {uniqueSquads.slice(0, 3).map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSquad(s)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition ${
                      selectedSquad === s ? "bg-amber-500 text-slate-950 border-amber-400" : "bg-slate-900 text-amber-300 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {s} ({personnel.filter(p => p.code === s).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Card 3: Designations */}
            <div className="relative overflow-hidden group rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all" />
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === "gu" ? "હોદ્દાઓ" : "Designations"}
                </p>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedDesignation("ALL")}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition ${
                    selectedDesignation === "ALL" ? "bg-indigo-500 text-white border-indigo-400" : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  All
                </button>
                {uniqueDesignations.slice(0, 3).map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDesignation(d)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition ${
                      selectedDesignation === d ? "bg-indigo-500 text-white border-indigo-400" : "bg-slate-900 text-indigo-300 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {d} ({personnel.filter(p => p.designation === d).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Card 4: Quick Action & Clean Status */}
            <div className="relative overflow-hidden group rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === "gu" ? "ડેટાબેઝ સ્થિતિ" : "Database Status"}
                  </p>
                  <p className="text-xl font-black text-emerald-400 mt-1">
                    {duplicateCount === 0 ? "100% Unique" : `${duplicateCount} Duplicates`}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAutoDeleteDuplicates}
                  className="text-[11px] text-amber-400 hover:underline font-bold"
                >
                  Clean Duplicates
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={handleResetToCleanDefault}
                  className="text-[11px] text-indigo-400 hover:underline font-bold"
                >
                  Reset Columns
                </button>
              </div>
            </div>

          </div>

          {/* SEARCH & FILTER CONTROLS TOOLBAR */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={language === "gu" ? "નામ, બક્કલ નં, આધાર, પાન, હથિયાર નં..." : "Search name, badge, aadhar, PAN, weapon..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={selectedSquad}
                onChange={(e) => setSelectedSquad(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">{language === "gu" ? "તમામ સ્કોડ" : "All Squads"}</option>
                {uniqueSquads.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">{language === "gu" ? "તમામ હોદ્દા" : "All Designations"}</option>
                {uniqueDesignations.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span>{language === "gu" ? "ઉમેરો" : "Add"}</span>
              </button>

              <button
                onClick={requestDeleteAll}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs rounded-xl border border-rose-500/30 transition"
                title="Delete All Records"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{language === "gu" ? "બધા કાઢી નાખો" : "Delete All"}</span>
              </button>
            </div>
          </div>

          {/* MAIN CONTENT VIEWS: TABLE / CARDS / ANALYTICS */}
          <AnimatePresence mode="wait">
            {activeNav === "table" && (
              <motion.div 
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-950/90 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-3">અ.નં.</th>
                        <th className="py-3 px-3">ફોટો</th>
                        <th className="py-3 px-3">સ્કોડ</th>
                        <th className="py-3 px-3">હોદ્દો</th>
                        <th className="py-3 px-3">બ.નં.</th>
                        <th className="py-3 px-3">નામ</th>
                        <th className="py-3 px-3">મોબાઇલ</th>
                        <th className="py-3 px-3 text-amber-300">આધાર કાર્ડ નંબર</th>
                        <th className="py-3 px-3 text-amber-300">પાન કાર્ડ નંબર</th>
                        <th className="py-3 px-3 text-rose-300">બ્લડ ગ્રૂપ</th>
                        <th className="py-3 px-3 text-indigo-300">હથિયાર નંબર</th>
                        <th className="py-3 px-3">ફરજની જગ્યા</th>
                        <th className="py-3 px-3">નીમણુંક</th>
                        <th className="py-3 px-3">હાજર તારીખ</th>
                        <th className="py-3 px-3">જન્મ તારીખ</th>
                        <th className="py-3 px-3">ભરતી તારીખ</th>
                        <th className="py-3 px-3 text-amber-400">નિવૃત્તિ તારીખ</th>
                        {customColumns.map(col => (
                          <th key={col} className="py-3 px-3 text-purple-300">{col}</th>
                        ))}
                        <th className="py-3 px-3 text-right">એડમિન એક્શન</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {filteredPersonnel.length === 0 ? (
                        <tr>
                          <td colSpan={18 + customColumns.length} className="py-12 text-center text-slate-500">
                            {language === "gu" ? "કોઈ કર્મચારી મળ્યા નથી." : "No personnel records found."}
                          </td>
                        </tr>
                      ) : (
                        filteredPersonnel.map((p, idx) => (
                          <tr 
                            key={p.id}
                            onClick={() => setSelectedOfficer(p)}
                            className="hover:bg-slate-900/70 transition cursor-pointer group"
                          >
                            <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <img 
                                src={p.avatarUrl || PRESET_AVATARS[0]} 
                                alt={p.name}
                                className="w-9 h-9 rounded-full object-cover border-2 border-amber-500/40 shadow-sm"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-bold text-amber-400">{p.code}</td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                                {p.designation}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-white">{p.badgeNo}</td>
                            <td className="py-2.5 px-3 font-bold text-white group-hover:text-amber-300 transition">{p.name}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-200">{p.mobile}</td>
                            <td className="py-2.5 px-3 font-mono text-amber-200 font-medium">{p.aadharNo || "-"}</td>
                            <td className="py-2.5 px-3 font-mono text-amber-200 font-medium">{p.panNo || "-"}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                {p.bloodGroup || "-"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-indigo-300">{p.weaponNo || "-"}</td>
                            <td className="py-2.5 px-3 text-slate-300">{p.dutyPlace}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.appointment.toLowerCase() === 'crime' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-purple-500/15 text-purple-400'
                              }`}>
                                {p.appointment}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-300">{p.reportDate}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-400">{p.birthDate}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-400">{p.recruitedDate}</td>
                            <td className="py-2.5 px-3 font-mono text-amber-300 font-bold">{p.retirementDate}</td>
                            
                            {customColumns.map(col => (
                              <td key={col} className="py-2.5 px-3 font-mono text-purple-200">
                                {p.customFields?.[col] || "-"}
                              </td>
                            ))}

                            <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={(e) => handleOpenEditModal(p, e)} 
                                  className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg transition" 
                                  title="Edit Officer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={(e) => requestDelete(p, e)} 
                                  className="p-1.5 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition" 
                                  title="Delete Officer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeNav === "cards" && (
              <motion.div 
                key="cards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filteredPersonnel.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedOfficer(p)}
                    className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative group overflow-hidden cursor-pointer hover:border-amber-500/50 transition duration-300"
                  >
                    <div>
                      <div className="flex items-start gap-3.5 mb-3">
                        <img 
                          src={p.avatarUrl || PRESET_AVATARS[0]} 
                          alt={p.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{p.code}</span>
                          <h3 className="text-base font-black text-white group-hover:text-amber-300 transition truncate">{p.name}</h3>
                          <p className="text-xs text-slate-400">Badge #{p.badgeNo} • <span className="text-indigo-300 font-bold">{p.designation}</span></p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mobile:</span>
                          <span className="font-mono text-white font-bold">{p.mobile}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Aadhar No:</span>
                          <span className="font-mono text-amber-200">{p.aadharNo || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">PAN No:</span>
                          <span className="font-mono text-amber-200">{p.panNo || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Blood Group / Weapon:</span>
                          <span className="font-semibold text-rose-300">{p.bloodGroup} • {p.weaponNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Duty Place:</span>
                          <span className="text-white truncate max-w-[170px]">{p.dutyPlace}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Retirement Date:</span>
                          <span className="font-mono text-amber-300 font-bold">{p.retirementDate}</span>
                        </div>
                        {calculateServiceTenure(p.appointmentDate || p.reportDate) && (
                          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] bg-slate-900/60 px-2.5 py-1.5 rounded-xl">
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Worked Tenure:</span>
                            </span>
                            <span className="font-mono font-bold text-emerald-400">
                              {language === "gu" 
                                ? calculateServiceTenure(p.appointmentDate || p.reportDate)?.formattedGu 
                                : calculateServiceTenure(p.appointmentDate || p.reportDate)?.formatted}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => handleOpenEditModal(p, e)} className="flex-1 py-1.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition flex items-center justify-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button onClick={(e) => requestDelete(p, e)} className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-semibold rounded-xl border border-rose-500/20 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeNav === "analytics" && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                {/* Squad distribution */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Squad Strength Distribution</span>
                  </h3>
                  <div className="space-y-3">
                    {uniqueSquads.map(squad => {
                      const count = personnel.filter(p => p.code === squad).length;
                      const pct = personnel.length ? Math.round((count / personnel.length) * 100) : 0;
                      return (
                        <div key={squad} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-white">{squad}</span>
                            <span className="font-mono text-amber-400">{count} officers ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Blood Group Readiness */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-400" />
                    <span>Emergency Blood Group Register</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"].map(bg => {
                      const count = personnel.filter(p => p.bloodGroup === bg).length;
                      return (
                        <div key={bg} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                          <span className="text-xs font-black text-rose-400 block">{bg}</span>
                          <span className="text-xl font-black text-white">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* QUICK ADMIN UNLOCK MODAL */}
      <AnimatePresence>
        {isAdminUnlockModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-amber-500/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Unlock Admin Privileges</h3>
                    <p className="text-xs text-amber-400 font-medium">સત્તાવાર એડમિન એક્સેસ</p>
                  </div>
                </div>
                <button onClick={() => setIsAdminUnlockModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  {language === "gu"
                    ? "એડમિન કંટ્રોલ પેનલ ખોલવા, તમામ રેકોર્ડ્સ કાઢી નાખવા અથવા ડુપ્લિકેટ ક્લીન કરવા માટે સુપર એડમિન મોડ ચાલુ કરો."
                    : "Access full administrative commands, bulk replace-all, delete-all, and duplicate management."}
                </p>

                {/* Instant 1-Click Unlock */}
                <button
                  type="button"
                  onClick={handleQuickUnlockAdmin}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>⚡ 1-Click Instant Unlock (Super Admin)</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase">OR Enter PIN</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <form onSubmit={handlePasswordUnlock} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Official Admin Password (પાસવર્ડ: 1673583)
                    </label>
                    <input
                      type="password"
                      value={unlockPasswordInput}
                      onChange={(e) => setUnlockPasswordInput(e.target.value)}
                      placeholder="1673583"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {unlockError && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg">{unlockError}</p>
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAdminUnlockModalOpen(false)}
                      className="px-4 py-2 bg-slate-900 text-slate-300 text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-amber-500/30"
                    >
                      Verify Password
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE OFFICER DELETION CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              className="bg-slate-950 border border-rose-500/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {language === "gu" ? "કર્મચારી ડિલીટ કરો?" : "Delete Personnel Record?"}
                  </h3>
                  <p className="text-xs text-rose-400 font-medium">
                    {language === "gu" ? "આ ક્રિયા પૂર્વવત્ કરી શકાતી નથી." : "This action cannot be undone."}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
                <img 
                  src={deleteTarget.avatarUrl || PRESET_AVATARS[0]} 
                  alt={deleteTarget.name} 
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500/50 shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                    {deleteTarget.code} • {deleteTarget.designation}
                  </span>
                  <p className="text-base font-bold text-white truncate">{deleteTarget.name}</p>
                  <p className="text-xs text-slate-400 font-mono">
                    Badge #{deleteTarget.badgeNo} • {deleteTarget.mobile}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800 transition"
                >
                  {language === "gu" ? "રદ કરો" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{language === "gu" ? "હા, ડિલીટ કરો" : "Yes, Delete Record"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE ALL CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeleteAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              className="bg-slate-950 border border-rose-600/60 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {language === "gu" ? "તમામ કર્મચારીઓ કાઢી નાખો?" : "Delete All Personnel Records?"}
                  </h3>
                  <p className="text-xs text-rose-400 font-medium">
                    {language === "gu" ? "ચેતવણી: આ ક્રિયાથી સમગ્ર રોસ્ટર ખાલી થઈ જશે!" : "WARNING: This permanently removes all roster records!"}
                  </p>
                </div>
              </div>

              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl space-y-2 text-xs text-rose-200">
                <p className="font-semibold">
                  {language === "gu" 
                    ? `તમે હાલના તમામ ${personnel.length} કર્મચારીઓના રેકોર્ડ્સ કાઢી નાખવા જઈ રહ્યા છો.` 
                    : `You are about to delete all ${personnel.length} officer records from the system.`}
                </p>
                <p className="text-slate-400">
                  {language === "gu" 
                    ? "નોંધ: તમે પાછળથી સાઇડબારમાંથી ડિફોલ્ટ ક્રાઇમ બ્રાન્ચ રોસ્ટર રીસેટ કરી શકો છો અથવા નવો ડેટા ઇમ્પોર્ટ કરી શકો છો." 
                    : "Tip: You can restore default crime branch personnel or import a new spreadsheet at any time."}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800 transition"
                >
                  {language === "gu" ? "રદ કરો" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAll}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{language === "gu" ? "બધા રેકોર્ડ્સ કાઢી નાખો" : "Delete All Records"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL ADMIN CONTROL MODAL DIALOG */}
      <AnimatePresence>
        {isAdminControlModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-slate-950 border border-amber-500/40 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">ગુજરાત પોલીસ • Gujarat Crime Branch</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">SUPER ADMIN</span>
                    </div>
                    <h2 className="text-lg font-black text-white">
                      {language === "gu" ? "સંપૂર્ણ એડમિન કંટ્રોલ અને કમાન્ડ સેન્ટર" : "Full Admin Control & Command Center"}
                    </h2>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAdminControlModalOpen(false)} 
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 gap-2">
                <button
                  type="button"
                  onClick={() => setAdminTab("quick")}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                    adminTab === "quick" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>Admin Commands</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab("replace")}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                    adminTab === "replace" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Replace-All & Batch Replace</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab("backup")}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                    adminTab === "backup" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>Backup & Restore</span>
                </button>
              </div>

              {/* Modal Content Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
                {adminTab === "quick" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Total Records</span>
                        <span className="text-xl font-black text-white">{personnel.length}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Duplicate Records</span>
                        <span className={`text-xl font-black ${duplicateCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                          {duplicateCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Squads</span>
                        <span className="text-xl font-black text-amber-300">{uniqueSquads.length}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Custom Columns</span>
                        <span className="text-xl font-black text-indigo-300">{customColumns.length}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Command 1: Auto Delete Duplicates */}
                      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/40 transition">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 font-bold flex items-center gap-1.5 text-xs">
                              <Copy className="w-4 h-4" />
                              <span>Auto-Clean Duplicates</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${duplicateCount > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-300'}`}>
                              {duplicateCount} Duplicates
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-2">Delete Duplicates Automatically</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Scans badge and mobile numbers to automatically purge duplicates in 1 click.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAutoDeleteDuplicates}
                          className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>Clean Duplicates Now</span>
                        </button>
                      </div>

                      {/* Command 2: Re-sequence Sr. Nos */}
                      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/40 transition">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold flex items-center gap-1.5 text-xs">
                              <Sliders className="w-4 h-4" />
                              <span>Re-sequence Numbers</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-2">Re-sequence Serial Numbers (1 to N)</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Normalizes serial numbers from 1 to total records cleanly.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleResequenceSrNos}
                          className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                        >
                          <Sliders className="w-4 h-4" />
                          <span>Re-sequence Serial Nos</span>
                        </button>
                      </div>

                      {/* Command 3: Reset to Clean Initial Roster */}
                      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                              <Shield className="w-4 h-4" />
                              <span>Default Dataset</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-2">Reset to Clean Default Roster</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Restores Gujarat Crime Branch Squad officers dataset with proper Aadhar, PAN, Blood Group & Weapon numbers.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetToCleanDefault}
                          className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Reset & Normalize Columns</span>
                        </button>
                      </div>

                      {/* Command 4: Delete All Records */}
                      <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 flex flex-col justify-between hover:border-rose-500 transition">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 font-bold flex items-center gap-1.5 text-xs">
                              <Trash2 className="w-4 h-4" />
                              <span>Danger Action</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-2">Delete All Personnel Records</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Permanently wipes all personnel records from the active database.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={requestDeleteAll}
                          className="mt-4 w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete All Records</span>
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {adminTab === "replace" && (
                  <div className="space-y-6">
                    {/* Batch Find & Replace */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm font-bold text-white">Batch Find & Replace (Across All Records)</h3>
                      </div>
                      
                      <form onSubmit={handleBatchReplace} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Select Field</label>
                            <select
                              value={batchReplaceField}
                              onChange={(e) => setBatchReplaceField(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            >
                              <option value="code">Squad Code (સ્કોડ કોડ)</option>
                              <option value="dutyPlace">Duty Place (ફરજની જગ્યા)</option>
                              <option value="designation">Designation (હોદ્દો)</option>
                              <option value="appointment">Appointment (નીમણુંક)</option>
                              <option value="bloodGroup">Blood Group (બ્લડ ગ્રૂપ)</option>
                              <option value="weaponNo">Weapon No (હથિયાર નંબર)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Find Value</label>
                            <input
                              type="text"
                              value={batchReplaceFind}
                              onChange={(e) => setBatchReplaceFind(e.target.value)}
                              placeholder="e.g. સ્કોડ-૦૧"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Replace With</label>
                            <input
                              type="text"
                              value={batchReplaceWith}
                              onChange={(e) => setBatchReplaceWith(e.target.value)}
                              placeholder="e.g. સ્કોડ-૦૧ (મુખ્ય)"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Apply Replace-All</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Replace Entire Database */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-sm font-bold text-white">Replace Entire Roster with New Data</h3>
                      </div>

                      <form onSubmit={handleBulkReplaceAll} className="space-y-3">
                        <textarea
                          rows={5}
                          value={bulkReplaceText}
                          onChange={(e) => setBulkReplaceText(e.target.value)}
                          placeholder="Paste tab-separated Excel rows or JSON array here..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          required
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setBulkReplaceText("")}
                            className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                          >
                            Clear
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Replace Entire Roster</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {adminTab === "backup" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <Download className="w-6 h-6 text-amber-400" />
                      <h4 className="text-sm font-bold text-white">Download Master JSON Backup</h4>
                      <p className="text-xs text-slate-400">
                        Exports the full database with all custom fields and personnel in a single JSON file.
                      </p>
                      <button
                        type="button"
                        onClick={handleExportJSONBackup}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-amber-500/30 transition flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download JSON Backup</span>
                      </button>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <Upload className="w-6 h-6 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white">Restore from JSON Backup File</h4>
                      <p className="text-xs text-slate-400">
                        Restores personnel records and columns from a previously exported JSON file.
                      </p>
                      <input
                        ref={jsonBackupInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImportJSONBackup}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => jsonBackupInputRef.current?.click()}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload & Restore JSON</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Gujarat Police Crime Branch Admin Console</span>
                <button
                  type="button"
                  onClick={() => setIsAdminControlModalOpen(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Close Admin Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OFFICER DETAIL DOSSIER MODAL */}
      <AnimatePresence>
        {selectedOfficer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="relative bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <img 
                    src={selectedOfficer.avatarUrl || PRESET_AVATARS[0]} 
                    alt={selectedOfficer.name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-xl flex-shrink-0" 
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] sm:text-xs uppercase font-bold tracking-widest text-amber-400 block truncate">
                      {selectedOfficer.code} • {selectedOfficer.designation}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white truncate">{selectedOfficer.name}</h2>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      Badge Number: <span className="font-mono text-white font-bold">#{selectedOfficer.badgeNo}</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOfficer(null)} 
                  className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-sm">
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div>
                      <span className="text-xs text-slate-500 block">Mobile Number</span>
                      <span className="font-mono font-bold text-amber-400 text-base">{selectedOfficer.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`tel:${selectedOfficer.mobile}`} className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                      <a href={`https://wa.me/91${selectedOfficer.mobile.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                    <div>
                      <span className="text-slate-500 block">Aadhar Card No:</span>
                      <span className="font-mono font-bold text-amber-300">{selectedOfficer.aadharNo || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">PAN Card No:</span>
                      <span className="font-mono font-bold text-amber-300">{selectedOfficer.panNo || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Blood Group:</span>
                      <span className="font-bold text-rose-300">{selectedOfficer.bloodGroup || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Weapon Issued:</span>
                      <span className="font-mono font-bold text-indigo-300">{selectedOfficer.weaponNo || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Duty Place:</span>
                      <span className="font-medium text-white">{selectedOfficer.dutyPlace}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Appointment:</span>
                      <span className="font-medium text-white">{selectedOfficer.appointment}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Reporting Date:</span>
                      <span className="font-mono text-slate-300">{selectedOfficer.reportDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Retirement Date:</span>
                      <span className="font-mono text-amber-400 font-bold">{selectedOfficer.retirementDate}</span>
                    </div>
                  </div>

                  {calculateServiceTenure(selectedOfficer.appointmentDate || selectedOfficer.reportDate) && (
                    <div className="mt-4 pt-3 border-t border-slate-800 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide block">
                            {language === "gu" ? "કુલ સેવા સમય (Service Tenure)" : "Total Service Tenure"}
                          </span>
                          <span className="text-xs text-slate-300">
                            {language === "gu" ? "નિમણૂક તારીખથી આજ સુધી" : "From appointment date to today"}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-amber-300 text-sm px-3 py-1 bg-slate-900 rounded-xl border border-slate-800">
                        {language === "gu" 
                          ? calculateServiceTenure(selectedOfficer.appointmentDate || selectedOfficer.reportDate)?.formattedGu 
                          : calculateServiceTenure(selectedOfficer.appointmentDate || selectedOfficer.reportDate)?.formatted}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={(e) => requestDelete(selectedOfficer, e)}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-semibold rounded-xl border border-rose-500/20 transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Officer</span>
                </button>
                <button 
                  onClick={() => setSelectedOfficer(null)} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT PERSONNEL MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                <h2 className="text-lg font-bold text-white">{editingPerson ? "Edit Personnel" : "Add Personnel"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSavePerson} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Sr No</label>
                    <input type="number" value={formData.srNo} onChange={(e) => setFormData({ ...formData, srNo: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Squad Code</label>
                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Designation</label>
                    <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Badge No</label>
                    <input type="text" value={formData.badgeNo} onChange={(e) => setFormData({ ...formData, badgeNo: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-400 mb-1">Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Mobile</label>
                    <input type="text" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Duty Place</label>
                    <input type="text" value={formData.dutyPlace} onChange={(e) => setFormData({ ...formData, dutyPlace: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" required />
                  </div>
                </div>

                {/* PROPERLY NAMED DEDICATED COLUMNS: AADHAR, PAN, BLOOD GROUP, WEAPON */}
                <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Identity & Armament Details</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-amber-300 mb-1">Aadhar Card No (આધાર કાર્ડ નંબર)</label>
                      <input 
                        type="text" 
                        value={formData.aadharNo} 
                        onChange={(e) => setFormData({ ...formData, aadharNo: e.target.value })} 
                        placeholder="e.g. 7492 8104 9281"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" 
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-amber-300 mb-1">PAN Card No (પાન કાર્ડ નંબર)</label>
                      <input 
                        type="text" 
                        value={formData.panNo} 
                        onChange={(e) => setFormData({ ...formData, panNo: e.target.value })} 
                        placeholder="e.g. BKAPG9941K"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" 
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-rose-300 mb-1">Blood Group (બ્લડ ગ્રૂપ)</label>
                      <select 
                        value={formData.bloodGroup} 
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      >
                        {["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-indigo-300 mb-1">Weapon No (હથિયાર નંબર)</label>
                      <input 
                        type="text" 
                        value={formData.weaponNo} 
                        onChange={(e) => setFormData({ ...formData, weaponNo: e.target.value })} 
                        placeholder="e.g. GLK-8419 / REV-8747"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Appointment</label>
                    <input type="text" value={formData.appointment} onChange={(e) => setFormData({ ...formData, appointment: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Report Date</label>
                    <input type="text" value={formData.reportDate} onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Appointment Date (For Tenure)</label>
                    <input type="text" value={formData.appointmentDate || formData.reportDate} onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })} placeholder="DD/MM/YYYY" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block font-medium text-amber-300 mb-1">Retirement Date</label>
                    <input type="text" value={formData.retirementDate} onChange={(e) => setFormData({ ...formData, retirementDate: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold" />
                  </div>
                </div>

                {/* ADMIN PHOTO UPLOAD & EDIT SECTION */}
                <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Officer Photo / Avatar Upload</span>
                  <div className="flex items-center gap-4">
                    <img 
                      src={formData.avatarUrl || PRESET_AVATARS[0]} 
                      alt="Preview" 
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md flex-shrink-0"
                    />
                    <div className="flex-1 space-y-2">
                      <input 
                        type="file" 
                        ref={photoInputRef}
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-xl border border-amber-500/40 text-xs flex items-center gap-1.5 transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo File</span>
                        </button>
                        <input 
                          type="text" 
                          value={formData.avatarUrl}
                          onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                          placeholder="Or paste image URL..."
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">Supports JPG, PNG, WebP up to 3MB or direct image link.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">Save Record</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SPREADSHEET / EXCEL IMPORT MODAL */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                <h2 className="text-base font-bold text-white">Import Spreadsheet Data (Excel / CSV)</h2>
                <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleImportSpreadsheet} className="p-6 space-y-4 text-xs">
                <p className="text-slate-400">
                  Paste tab-separated or comma-separated rows. Columns: Code, Designation, Badge, Name, Mobile, Aadhar, PAN, Blood Group, Weapon No, Duty Place, Appointment, Report Date, Birth Date, Recruited Date, Retirement Date.
                </p>
                <textarea 
                  rows={6} 
                  value={importText} 
                  onChange={(e) => setImportText(e.target.value)} 
                  placeholder="Paste Excel rows here..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-white" 
                  required 
                />
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setReplaceData(false)}
                    className={`flex-1 py-2 px-3 rounded-xl font-semibold border transition ${!replaceData ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                  >
                    Append to Existing Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplaceData(true)}
                    className={`flex-1 py-2 px-3 rounded-xl font-semibold border transition ${replaceData ? "bg-rose-500/20 border-rose-500 text-rose-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                  >
                    Replace All Data
                  </button>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">Import Bulk Records</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI ASSISTANT MODAL */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold text-white">Crime Branch AI Assistant</h2>
                </div>
                <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <form onSubmit={handleAskAI} className="flex gap-2">
                  <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ask about squad assignments, upcoming retirements, weapons, or badges..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white" />
                  <button type="submit" disabled={aiLoading} className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                    {aiLoading ? "Thinking..." : "Ask AI"}
                  </button>
                </form>
                {aiResponse && <div className="bg-slate-900 p-4 rounded-xl text-xs whitespace-pre-wrap leading-relaxed text-slate-200 border border-slate-800">{aiResponse}</div>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING IN-APP TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md text-xs font-semibold max-w-md ${
              toast.type === "success" 
                ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200" 
                : toast.type === "warning"
                ? "bg-amber-950/90 border-amber-500/50 text-amber-200"
                : toast.type === "error"
                ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
                : "bg-slate-900/90 border-slate-700 text-slate-200"
            }`}
          >
            <div className="flex-1">{toast.message}</div>
            <button 
              onClick={() => setToast(null)} 
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
