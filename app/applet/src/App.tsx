import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Shield, Users, Search, Plus, Download, Printer, Sparkles, 
  Trash2, Edit3, X, Check, Phone,
  Languages, MessageSquare, FileSpreadsheet, Columns, LogOut,
  UserCheck as UserVerified, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight,
  Info, Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Personnel {
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
  avatarUrl: string;
  notes?: string;
  customFields?: Record<string, string>;
}

const initialPersonnel: Personnel[] = [
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
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    notes: "Senior investigating officer with excellent record in Squad 01.",
    customFields: { "Blood Group": "O+", "Weapon No": "99482" }
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
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    notes: "Attached from SG-2 Police Station.",
    customFields: { "Blood Group": "B+", "Weapon No": "88321" }
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
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    notes: "Reliable head constable assigned to special crime tracking.",
    customFields: { "Blood Group": "A+", "Weapon No": "77210" }
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
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    notes: "Active operative in Squad 01 crime branch.",
    customFields: { "Blood Group": "AB+", "Weapon No": "66409" }
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
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    notes: "Squad 07 operative.",
    customFields: { "Blood Group": "O-", "Weapon No": "55198" }
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

interface ToastInfo {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface DeleteConfirmState {
  type: "single" | "all";
  id?: string;
  name?: string;
  badgeNo?: string;
}

export default function App() {
  const [personnel, setPersonnel] = useState<Personnel[]>(() => {
    const localSaved = localStorage.getItem("crime_branch_personnel_v10");
    if (localSaved) {
      try { 
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* fallback */ }
    }
    return initialPersonnel;
  });

  const [customColumns, setCustomColumns] = useState<string[]>(() => {
    const savedCols = localStorage.getItem("crime_branch_custom_cols_v10");
    if (savedCols) {
      try { return JSON.parse(savedCols); } catch (e) { /* fallback */ }
    }
    return ["Blood Group", "Weapon No"];
  });

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const savedSession = sessionStorage.getItem("crime_branch_auth_user_v10");
    if (savedSession) {
      try { return JSON.parse(savedSession); } catch (e) { /* fallback */ }
    }
    // Default to admin for seamless experience if none set
    return {
      role: "admin",
      name: "Super Admin",
      badgeNo: "ADMIN",
      mobile: "9274583654"
    };
  });

  // Highlight freshly added row
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // In-App Toast System (Prevents window.alert in iframe)
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // In-App Delete Confirmation (Replaces broken window.confirm)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);

  // Replace Data Modal
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [replaceSpreadsheetText, setReplaceSpreadsheetText] = useState("");

  // Login form state
  const [loginBadgeNo, setLoginBadgeNo] = useState("");
  const [loginMobile, setLoginMobile] = useState("9274583654");
  const [loginIdDoc, setLoginIdDoc] = useState("");
  const [loginPassword, setLoginPassword] = useState("1673583");
  const [loginError, setLoginError] = useState("");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSquad, setSelectedSquad] = useState("ALL");
  const [selectedDesignation, setSelectedDesignation] = useState("ALL");
  const [selectedAppointment, setSelectedAppointment] = useState("ALL");
  const [language, setLanguage] = useState<"gu" | "en">("gu");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Pagination for supreme performance (60 FPS)
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState<Personnel | null>(null);

  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [replaceData, setReplaceData] = useState(false);

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to Storage
  useEffect(() => {
    try {
      localStorage.setItem("crime_branch_personnel_v10", JSON.stringify(personnel));
      sessionStorage.setItem("crime_branch_personnel_v10", JSON.stringify(personnel));
    } catch (e) {
      console.error("Storage save error", e);
    }
  }, [personnel]);

  useEffect(() => {
    try {
      localStorage.setItem("crime_branch_custom_cols_v10", JSON.stringify(customColumns));
      sessionStorage.setItem("crime_branch_custom_cols_v10", JSON.stringify(customColumns));
    } catch (e) {
      console.error("Column save error", e);
    }
  }, [customColumns]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem("crime_branch_auth_user_v10", JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem("crime_branch_auth_user_v10");
    }
  }, [currentUser]);

  // Form state
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
    avatarUrl: PRESET_AVATARS[0],
    notes: "",
    customFields: {}
  });

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const trimmedMobile = loginMobile.trim();

    // Admin login check
    if (trimmedMobile === "9274583654") {
      if (loginPassword !== "1673583") {
        setLoginError(language === "gu" ? "અયોગ્ય એડમિન પાસવર્ડ (પાસવર્ડ: 1673583)" : "Incorrect Admin Password (Password: 1673583)");
        return;
      }
      setCurrentUser({
        role: "admin",
        name: "Super Admin",
        badgeNo: "ADMIN",
        mobile: trimmedMobile
      });
      showToast("✓ Successfully logged in as Super Admin", "success");
      return;
    }

    // Regular user login verification
    const trimmedBadge = loginBadgeNo.trim();
    const trimmedIdDoc = loginIdDoc.trim();

    if (!trimmedBadge || !trimmedMobile || !trimmedIdDoc) {
      setLoginError(language === "gu" ? "કૃપા કરીને તમામ વિગતો ભરો." : "Please fill in badge number, mobile number, and Aadhar/PAN.");
      return;
    }

    // Find officer in personnel list
    const matched = personnel.find(p => p.badgeNo.toLowerCase() === trimmedBadge.toLowerCase() || p.mobile.includes(trimmedMobile));
    const officerName = matched ? matched.name : `Officer (${trimmedBadge})`;

    setCurrentUser({
      role: "user",
      name: officerName,
      badgeNo: trimmedBadge,
      mobile: trimmedMobile
    });
    showToast(`✓ Welcome ${officerName}`, "success");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("crime_branch_auth_user_v10");
    showToast("Logged out successfully", "info");
  };

  // Open Add Person Modal
  const handleOpenAddModal = () => {
    setEditingPerson(null);
    const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
    const initialCustom: Record<string, string> = {};
    customColumns.forEach(col => { initialCustom[col] = ""; });

    const nextSrNo = personnel.length ? Math.max(...personnel.map(p => p.srNo || 0)) + 1 : 1;

    setFormData({
      srNo: nextSrNo,
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
      avatarUrl: randomAvatar,
      notes: "",
      customFields: initialCustom
    });
    setIsModalOpen(true);
  };

  // Quick 1-Click Add Blank Row Directly into Table
  const handleQuickAddRow = () => {
    const nextSrNo = personnel.length ? Math.max(...personnel.map(p => p.srNo || 0)) + 1 : 1;
    const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
    const initialCustom: Record<string, string> = {};
    customColumns.forEach(col => { initialCustom[col] = "-"; });

    const newId = `quick-${Date.now()}`;
    const newPerson: Personnel = {
      id: newId,
      srNo: nextSrNo,
      code: "સ્કોડ-૦૧",
      designation: "UHC",
      badgeNo: String(Math.floor(1000 + Math.random() * 9000)),
      name: language === "gu" ? `નવો કર્મચારી #${nextSrNo}` : `New Officer #${nextSrNo}`,
      mobile: "9876543210",
      dutyPlace: "સ્કોડ-૦૧",
      appointment: "CRIME",
      reportDate: "01/01/2026",
      birthDate: "01/01/1985",
      recruitedDate: "01/01/2008",
      retirementDate: "31/12/2043",
      avatarUrl: randomAvatar,
      notes: "Quick added row",
      customFields: initialCustom
    };

    // Prepend to top so it's instantly visible at row 1!
    setPersonnel(prev => [newPerson, ...prev]);
    // Reset filters so it's guaranteed visible
    setSearchQuery("");
    setSelectedSquad("ALL");
    setSelectedDesignation("ALL");
    setSelectedAppointment("ALL");
    setCurrentPage(1);

    // Highlight row
    setHighlightedId(newId);
    setTimeout(() => setHighlightedId(null), 3000);

    showToast(
      language === "gu" ? `✓ નવી રો તરત ઉમેરાઈ ગઈ (ક્રમ #${nextSrNo})!` : `✓ New row added at top (Sr #${nextSrNo})!`,
      "success"
    );
  };

  const handleOpenEditModal = (p: Personnel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      avatarUrl: p.avatarUrl || PRESET_AVATARS[0],
      notes: p.notes || "",
      customFields: filledCustom
    });
    setIsModalOpen(true);
  };

  // Request In-App Delete Confirmation
  const promptDelete = (id: string, name: string, badgeNo?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirm({
      type: "single",
      id,
      name,
      badgeNo
    });
  };

  const promptDeleteAll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirm({
      type: "all"
    });
  };

  // Perform confirmed deletion (No window.confirm!)
  const executeDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === "single" && deleteConfirm.id) {
      const targetId = deleteConfirm.id;
      setPersonnel(prev => prev.filter(p => p.id !== targetId));
      if (selectedOfficer?.id === targetId) setSelectedOfficer(null);
      showToast(language === "gu" ? "✓ કર્મચારી દૂર કરવામાં આવ્યો." : "✓ Personnel deleted successfully.", "success");
    } else if (deleteConfirm.type === "all") {
      setPersonnel([]);
      setSelectedOfficer(null);
      showToast(language === "gu" ? "✓ તમામ કર્મચારીઓ સફળતાપૂર્વક કાઢી નાખ્યા." : "✓ All personnel records deleted.", "success");
    }

    setDeleteConfirm(null);
  };

  // Replace All Data with Official Gujarat Police Defaults
  const handleReplaceWithDefaults = () => {
    setPersonnel(initialPersonnel);
    setCustomColumns(["Blood Group", "Weapon No"]);
    setSelectedOfficer(null);
    setSearchQuery("");
    setSelectedSquad("ALL");
    setSelectedDesignation("ALL");
    setSelectedAppointment("ALL");
    setIsReplaceModalOpen(false);
    showToast(
      language === "gu" 
        ? "✓ મૂળ ગુજરાત પોલીસ ક્રાઇમ બ્રાન્ચ ડેટા સફળતાપૂર્વક રિપ્લેસ થયો!" 
        : "✓ Roster successfully replaced with official default personnel records!",
      "success"
    );
  };

  // Replace All Data with New Bulk Spreadsheet
  const handleExecuteReplaceWithSpreadsheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceSpreadsheetText.trim()) {
      showToast("Please paste spreadsheet rows to replace data.", "error");
      return;
    }

    try {
      const lines = replaceSpreadsheetText.trim().split("\n");
      const replacedPersonnelList: Personnel[] = [];
      let currentSrNo = 1;
      let importedCount = 0;
      let detectedCols = [...customColumns];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Header detection
        if (i === 0 && (line.toLowerCase().includes("name") || line.includes("નામ") || line.includes("હોદ્દો") || line.toLowerCase().includes("code"))) {
          const headers = line.split(/[\t,|]+/).map(c => c.trim()).filter(Boolean);
          if (headers.length > 11) {
            const extraHeaders = headers.slice(11);
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
        if (cols.length >= 3) {
          let colOffset = 0;
          if (!isNaN(Number(cols[0])) && cols[0].length <= 4 && cols.length > 4) {
            colOffset = 1;
          }

          const code = cols[colOffset] || "સ્કોડ-૦૧";
          const designation = cols[colOffset + 1] || "UHC";
          const badgeNo = cols[colOffset + 2] || String(Math.floor(1000 + Math.random() * 9000));
          const name = cols[colOffset + 3] || `Officer ${currentSrNo}`;
          const mobile = cols[colOffset + 4] || "9876543210";
          const dutyPlace = cols[colOffset + 5] || code;
          const appointment = cols[colOffset + 6] || "CRIME";
          const reportDate = cols[colOffset + 7] || "01/01/2026";
          const birthDate = cols[colOffset + 8] || "01/06/1980";
          const recruitedDate = cols[colOffset + 9] || "01/01/2005";
          const retirementDate = cols[colOffset + 10] || "30/06/2040";

          const customFields: Record<string, string> = {};
          detectedCols.forEach((colName, cIdx) => {
            const val = cols[colOffset + 11 + cIdx];
            if (val !== undefined) customFields[colName] = val;
          });

          const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
          const p: Personnel = {
            id: `replace-${Date.now()}-${i}-${Math.random()}`,
            srNo: currentSrNo++,
            code,
            designation,
            badgeNo,
            name,
            mobile: mobile.replace(/\s+/g, ''),
            dutyPlace,
            appointment,
            reportDate,
            birthDate,
            recruitedDate,
            retirementDate,
            avatarUrl: randomAvatar,
            notes: "Replaced via bulk input",
            customFields
          };
          replacedPersonnelList.push(p);
          importedCount++;
        }
      }

      if (replacedPersonnelList.length === 0) {
        showToast("No valid rows could be parsed. Check separator (tabs or commas).", "error");
        return;
      }

      // Replace completely!
      setPersonnel(replacedPersonnelList);
      setIsReplaceModalOpen(false);
      setReplaceSpreadsheetText("");
      setSelectedOfficer(null);
      setSearchQuery("");
      setSelectedSquad("ALL");
      setSelectedDesignation("ALL");
      setSelectedAppointment("ALL");
      setCurrentPage(1);

      showToast(
        language === "gu"
          ? `✓ તમામ જૂનો ડેટા દૂર કરી ${importedCount} નવા રેકોર્ડ્સ સફળતાપૂર્વક રિપ્લેસ થયા!`
          : `✓ Successfully replaced all data with ${importedCount} new personnel records!`,
        "success"
      );
    } catch (err: any) {
      showToast(`Error replacing data: ${err.message}`, "error");
    }
  };

  const handleAddCustomColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    const trimmed = newColName.trim();
    if (!customColumns.includes(trimmed)) {
      const updatedCols = [...customColumns, trimmed];
      setCustomColumns(updatedCols);
      setPersonnel(personnel.map(p => ({
        ...p,
        customFields: { ...(p.customFields || {}), [trimmed]: "" }
      })));
      showToast(`Column "${trimmed}" added!`, "success");
    }
    setNewColName("");
    setIsColModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormData({ ...formData, avatarUrl: reader.result as string });
          showToast("Photo updated!", "info");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Person (Add or Edit) - GUARANTEED to show new row!
  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPerson) {
      // Edit mode
      setPersonnel(prev => prev.map(p => p.id === editingPerson.id ? { ...formData, id: p.id } : p));
      if (selectedOfficer?.id === editingPerson.id) {
        setSelectedOfficer({ ...formData, id: editingPerson.id });
      }
      showToast(
        language === "gu" ? "✓ કર્મચારીની વિગત અપડેટ થઈ ગઈ!" : "✓ Officer updated successfully!",
        "success"
      );
    } else {
      // Add mode - Prepend to top so user sees the new row immediately at row #1!
      const newId = `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newPerson: Personnel = {
        ...formData,
        id: newId,
        srNo: formData.srNo || (personnel.length ? Math.max(...personnel.map(p => p.srNo || 0)) + 1 : 1)
      };

      setPersonnel(prev => [newPerson, ...prev]);

      // Clear filters so new row is not hidden!
      setSearchQuery("");
      setSelectedSquad("ALL");
      setSelectedDesignation("ALL");
      setSelectedAppointment("ALL");
      setCurrentPage(1);

      // Highlight new row
      setHighlightedId(newId);
      setTimeout(() => setHighlightedId(null), 3000);

      showToast(
        language === "gu" ? `✓ નવો કર્મચારી #${newPerson.badgeNo} સફળતાપૂર્વક ઉમેરાયો (પ્રથમ રો)!` : `✓ New officer #${newPerson.badgeNo} added at top of list!`,
        "success"
      );
    }

    setIsModalOpen(false);
  };

  // Robust Spreadsheet Import Parser with Exact Full Row Duplicate Matching & Replace Support
  const handleImportSpreadsheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    try {
      const lines = importText.trim().split("\n");
      const newPersonnelList: Personnel[] = replaceData ? [] : [...personnel];
      let currentSrNo = newPersonnelList.length ? Math.max(...newPersonnelList.map(p => p.srNo || 0)) + 1 : 1;
      let importedCount = 0;
      let duplicateCount = 0;
      let detectedCols = [...customColumns];

      // Build existing full row signatures for exact duplicate matching
      const existingSignatures = new Set(
        newPersonnelList.map(p => `${p.code}|${p.designation}|${p.badgeNo}|${p.name}|${p.mobile}|${p.dutyPlace}|${p.appointment}|${p.reportDate}|${p.birthDate}|${p.recruitedDate}|${p.retirementDate}`)
      );

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (i === 0 && (line.toLowerCase().includes("name") || line.includes("નામ") || line.includes("હોદ્દો") || line.toLowerCase().includes("code"))) {
          const headers = line.split(/[\t,|]+/).map(c => c.trim()).filter(Boolean);
          if (headers.length > 11) {
            const extraHeaders = headers.slice(11);
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
        if (cols.length >= 3) {
          let colOffset = 0;
          if (!isNaN(Number(cols[0])) && cols[0].length <= 4 && cols.length > 4) {
            colOffset = 1;
          }

          const code = cols[colOffset] || "સ્કોડ-૦૧";
          const designation = cols[colOffset + 1] || "UHC";
          const badgeNo = cols[colOffset + 2] || String(Math.floor(1000 + Math.random() * 9000));
          const name = cols[colOffset + 3] || `Officer ${currentSrNo}`;
          const mobile = cols[colOffset + 4] || "9876543210";
          const dutyPlace = cols[colOffset + 5] || code;
          const appointment = cols[colOffset + 6] || "CRIME";
          const reportDate = cols[colOffset + 7] || "01/01/2026";
          const birthDate = cols[colOffset + 8] || "01/06/1980";
          const recruitedDate = cols[colOffset + 9] || "01/01/2005";
          const retirementDate = cols[colOffset + 10] || "30/06/2040";

          const rowSig = `${code}|${designation}|${badgeNo}|${name}|${mobile.replace(/\s+/g, '')}|${dutyPlace}|${appointment}|${reportDate}|${birthDate}|${recruitedDate}|${retirementDate}`;
          if (existingSignatures.has(rowSig)) {
            duplicateCount++;
            continue;
          }
          existingSignatures.add(rowSig);

          const customFields: Record<string, string> = {};
          detectedCols.forEach((colName, cIdx) => {
            const val = cols[colOffset + 11 + cIdx];
            if (val !== undefined) customFields[colName] = val;
          });

          const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
          const p: Personnel = {
            id: `import-${Date.now()}-${i}-${Math.random()}`,
            srNo: currentSrNo++,
            code,
            designation,
            badgeNo,
            name,
            mobile: mobile.replace(/\s+/g, ''),
            dutyPlace,
            appointment,
            reportDate,
            birthDate,
            recruitedDate,
            retirementDate,
            avatarUrl: randomAvatar,
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
      setCurrentPage(1);

      showToast(
        language === "gu" 
          ? `${importedCount} કર્મચારીઓ સફળતાપૂર્વક ઇમ્પોર્ટ થયા (${duplicateCount} ડુપ્લિકેટ છોડ્યા).` 
          : `Successfully imported ${importedCount} records (${duplicateCount} exact row duplicates skipped).`,
        "success"
      );
    } catch (err: any) {
      showToast(`Spreadsheet parse error: ${err.message}`, "error");
    }
  };

  const handleExportCSV = () => {
    const baseHeaders = ["Sr No", "Code", "Designation", "Badge No", "Name", "Mobile", "Duty Place", "Appointment", "Reporting Date", "Birth Date", "Recruitment Date", "Retirement Date"];
    const headers = [...baseHeaders, ...customColumns, "Notes"];
    
    const rows = personnel.map(p => {
      const baseVals = [p.srNo, p.code, p.designation, p.badgeNo, p.name, p.mobile, p.dutyPlace, p.appointment, p.reportDate, p.birthDate, p.recruitedDate, p.retirementDate];
      const customVals = customColumns.map(col => p.customFields?.[col] || "");
      return [...baseVals, ...customVals, `"${p.notes || ""}"`];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "crime_branch_roster.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV Downloaded!", "success");
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

  function calculateServiceTenure(dateStr: string): string {
    if (!dateStr) return "-";
    let parts = dateStr.split(/[\/\-\.]/);
    let d: Date;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    } else {
      d = new Date(dateStr);
    }

    if (isNaN(d.getTime())) return "-";

    const now = new Date();
    let years = now.getFullYear() - d.getFullYear();
    let months = now.getMonth() - d.getMonth();
    let days = now.getDate() - d.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    if (years < 0) return "0 days";

    const partsArr = [];
    if (years > 0) partsArr.push(`${years} years`);
    if (months > 0) partsArr.push(`${months} months`);
    if (days > 0 || partsArr.length === 0) partsArr.push(`${days} days`);
    return partsArr.join(", ");
  }

  function getTenureText(dateStr: string, lang: "gu" | "en") {
    const tenure = calculateServiceTenure(dateStr);
    if (lang === "gu") {
      return tenure
        .replace(/years/g, "વર્ષ")
        .replace(/year/g, "વર્ષ")
        .replace(/months/g, "મહિના")
        .replace(/month/g, "મહિનો")
        .replace(/days/g, "દિવસ")
        .replace(/day/g, "દિવસ");
    }
    return tenure;
  }

  const handleDeleteCustomColumn = (colNameToDelete: string) => {
    if (customColumns.length <= 1) {
      showToast(language === "gu" ? "કમ સે કમ એક કૉલમ હોવી જરૂરી છે." : "Keep at least one custom column.", "info");
      return;
    }
    setCustomColumns(prev => prev.filter(c => c !== colNameToDelete));
    setPersonnel(prev => prev.map(p => {
      const updatedFields = { ...(p.customFields || {}) };
      delete updatedFields[colNameToDelete];
      return { ...p, customFields: updatedFields };
    }));
    showToast(language === "gu" ? `કૉલમ "${colNameToDelete}" દૂર કરવામાં આવી.` : `Column "${colNameToDelete}" deleted successfully.`, "success");
  };

  const uniqueAppointments = useMemo(() => Array.from(new Set(personnel.map(p => p.appointment).filter(Boolean))), [personnel]);

  // High-performance memoized filtering
  const filteredPersonnel = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return personnel.filter(p => {
      const matchesSearch = !q || (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.badgeNo && p.badgeNo.toLowerCase().includes(q)) ||
        (p.mobile && p.mobile.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.designation && p.designation.toLowerCase().includes(q)) ||
        (p.dutyPlace && p.dutyPlace.toLowerCase().includes(q)) ||
        (p.appointment && p.appointment.toLowerCase().includes(q)) ||
        Object.values(p.customFields || {}).some(val => val && String(val).toLowerCase().includes(q))
      );

      const matchesSquad = selectedSquad === "ALL" || p.code === selectedSquad;
      const matchesDesignation = selectedDesignation === "ALL" || p.designation === selectedDesignation;
      const matchesAppointment = selectedAppointment === "ALL" || p.appointment === selectedAppointment;

      return matchesSearch && matchesSquad && matchesDesignation && matchesAppointment;
    });
  }, [personnel, searchQuery, selectedSquad, selectedDesignation, selectedAppointment]);

  // High-performance memoized aggregations
  const uniqueSquads = useMemo(() => Array.from(new Set(personnel.map(p => p.code).filter(Boolean))), [personnel]);
  const uniqueDesignations = useMemo(() => Array.from(new Set(personnel.map(p => p.designation).filter(Boolean))), [personnel]);

  const crimeCount = useMemo(() => {
    return personnel.filter(p => (p.appointment || "").toLowerCase() === "crime").length;
  }, [personnel]);

  const attachCount = useMemo(() => {
    return personnel.filter(p => (p.appointment || "").includes("એટેચ") || (p.appointment || "").toLowerCase().includes("attach")).length;
  }, [personnel]);

  // Paginated personnel for instant 60 FPS table scrolling
  const totalPages = Math.ceil(filteredPersonnel.length / pageSize) || 1;
  const paginatedPersonnel = useMemo(() => {
    if (pageSize >= 1000) return filteredPersonnel;
    const start = (currentPage - 1) * pageSize;
    return filteredPersonnel.slice(start, start + pageSize);
  }, [filteredPersonnel, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSquad, selectedDesignation, selectedAppointment, pageSize]);

  // If not logged in, render Login Screen
  if (!currentUser) {
    const isAdminMobileAttempt = loginMobile.trim() === "9274583654";
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mx-auto shadow-inner">
              <Shield className="w-9 h-9" />
            </div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">ગુજરાત પોલીસ • ક્રાઇમ બ્રાન્ચ</span>
            <h1 className="text-2xl font-black text-white">Personnel Secure Login</h1>
            <p className="text-xs text-slate-400">Enter credentials or use Admin mode (Mobile: 9274583654 / Pass: 1673583)</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number (મોબાઇલ નંબર)</label>
              <input
                type="tel"
                value={loginMobile}
                onChange={(e) => setLoginMobile(e.target.value)}
                placeholder="e.g. 9274583654"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                required
              />
            </div>

            {isAdminMobileAttempt ? (
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">Admin Password (એડમિન પાસવર્ડ: 1673583)</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password (1673583)"
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition"
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Number (બક્કલ નંબર)</label>
                  <input
                    type="text"
                    value={loginBadgeNo}
                    onChange={(e) => setLoginBadgeNo(e.target.value)}
                    placeholder="e.g. 8419"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Aadhar or PAN Card Number (આધાર કે પાન કાર્ડ નંબર)</label>
                  <input
                    type="text"
                    value={loginIdDoc}
                    onChange={(e) => setLoginIdDoc(e.target.value)}
                    placeholder="Enter Aadhar or PAN No"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
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
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition active:scale-98"
            >
              Secure Login / વેરિફાઇ કરો
            </button>
          </form>

          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => {
                setLoginMobile("9274583654");
                setLoginPassword("1673583");
              }}
              className="text-[11px] text-amber-400/80 hover:text-amber-300 underline"
            >
              Fill Admin Credentials
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={() => {
                setLoginMobile("9824466971");
                setLoginBadgeNo("8419");
                setLoginIdDoc("1234-5678-9012");
              }}
              className="text-[11px] text-slate-400 hover:text-white underline"
            >
              Fill Officer Credentials
            </button>
          </div>

          <div className="text-center pt-2 text-xs text-slate-500">
            Gujarat Police Crime Branch Secured Portal
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md transition-all ${
              t.type === "success" 
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40" 
                : t.type === "error"
                ? "bg-rose-950/90 text-rose-200 border-rose-500/40"
                : "bg-slate-900/90 text-amber-200 border-amber-500/40"
            }`}
          >
            {t.type === "success" && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {t.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {t.type === "info" && <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 shadow-2xl backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedSquad("ALL"); setSelectedDesignation("ALL"); setSelectedAppointment("ALL"); setSearchQuery(""); }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner hover:scale-105 transition-transform"
              title="Reset Filters"
            >
              <Shield className="w-7 h-7" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-400 font-bold">ગુજરાત પોલીસ</span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Crime Branch</span>
              </div>
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white">
                {language === "gu" ? "ક્રાઇમ બ્રાન્ચ સ્ટાફ અને સ્કોડ મેનેજમેન્ટ" : "Crime Branch Squad & Personnel System"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <UserVerified className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">{currentUser.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${currentUser.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {currentUser.role.toUpperCase()}
              </span>
            </div>

            {/* Replace Button In Header */}
            <button
              onClick={() => setIsReplaceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/40 shadow-lg transition"
              title="Replace or Reset Personnel Data"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>{language === "gu" ? "🔄 ડેટા બદલો (Replace)" : "🔄 Replace Data"}</span>
            </button>

            {currentUser.role === "admin" && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/30 transition shadow-lg"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{language === "gu" ? "ઇમ્પોર્ટ" : "Import"}</span>
              </button>
            )}

            <button
              onClick={() => setLanguage(language === "gu" ? "en" : "gu")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
              title="Toggle Language"
            >
              <Languages className="w-4 h-4 text-amber-400" />
              <span>{language === "gu" ? "English" : "ગુજરાતી"}</span>
            </button>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "gu" ? "ક્રાઇમ બ્રાન્ચ એઆઈ" : "Crime Branch AI"}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs rounded-xl border border-rose-500/30 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Clickable Dashboard Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => { setSelectedSquad("ALL"); setSelectedDesignation("ALL"); setSelectedAppointment("ALL"); setSearchQuery(""); }}
            className={`bg-slate-950/60 border rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur flex items-center justify-between cursor-pointer transition hover:border-amber-500/50 ${
              selectedSquad === "ALL" && selectedDesignation === "ALL" && selectedAppointment === "ALL" && !searchQuery
                ? 'border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/30' 
                : 'border-slate-800/80'
            }`}
          >
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
                {language === "gu" ? "કુલ કર્મચારીઓ" : "Total Personnel"}
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{personnel.length}</p>
              <p className="text-[11px] text-emerald-400 mt-1">Click to View All</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
                {language === "gu" ? "સ્કોડ ફિલ્ટર" : "Squads"}
              </p>
              <span className="text-xs font-bold text-amber-400">{uniqueSquads.length} Squads</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2 max-h-16 overflow-y-auto">
              {uniqueSquads.slice(0, 4).map(squad => (
                <button
                  key={squad}
                  onClick={() => setSelectedSquad(squad)}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border transition ${selectedSquad === squad ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}
                >
                  {squad}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
                {language === "gu" ? "હોદ્દા ફિલ્ટર" : "Designations"}
              </p>
              <span className="text-xs font-bold text-indigo-400">{uniqueDesignations.length} Ranks</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2 max-h-16 overflow-y-auto">
              {uniqueDesignations.slice(0, 5).map(des => (
                <button
                  key={des}
                  onClick={() => setSelectedDesignation(des)}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border transition ${selectedDesignation === des ? 'bg-indigo-600 text-white font-bold border-indigo-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}
                >
                  {des}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
                {language === "gu" ? "નીમણુંક સ્થિતિ" : "Appointments"}
              </p>
              <span className="text-xs font-bold text-purple-400">Status</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setSelectedAppointment("CRIME")}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition ${selectedAppointment === "CRIME" ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-900 text-emerald-400 border-slate-800 hover:bg-slate-800'}`}
              >
                CRIME ({crimeCount})
              </button>
              <button
                onClick={() => setSelectedAppointment("એટેચ")}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition ${selectedAppointment === "એટેચ" ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 text-purple-300 border-slate-800 hover:bg-slate-800'}`}
              >
                એટેચ ({attachCount})
              </button>
            </div>
          </div>
        </div>

        {/* Action Toolbar & Search & Filters */}
        <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={language === "gu" ? "નામ, બક્કલ નંબર, સ્કોડ શોધો..." : "Search name, badge, squad..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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

              <select
                value={selectedAppointment}
                onChange={(e) => setSelectedAppointment(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">{language === "gu" ? "તમામ નીમણૂંક (Appointments)" : "All Appointments"}</option>
                <option value="CRIME">CRIME</option>
                <option value="એટેચ">એટેચ (Attach)</option>
                {uniqueAppointments.filter(app => app && app !== "CRIME" && app !== "એટેચ").map(app => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            
            {/* REPLACE BUTTON (HIGH VISIBILITY) */}
            <button
              onClick={() => setIsReplaceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              title="Replace All Data or Restore Defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === "gu" ? "🔄 ડેટા બદલો (Replace)" : "🔄 Replace Data"}</span>
            </button>

            {/* Quick 1-Click Add Row */}
            <button
              onClick={handleQuickAddRow}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              title="Quick Add Blank Row at Top"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === "gu" ? "+ નવી રો ઉમેરો (Quick Row)" : "+ Quick Row"}</span>
            </button>

            {/* Standard Add Officer Modal */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
              title="Add Full Officer Details"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === "gu" ? "ઉમેરો (Form)" : "Add Officer"}</span>
            </button>

            {/* Import Excel */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition shadow"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{language === "gu" ? "ઇમ્પોર્ટ" : "Import"}</span>
            </button>

            {/* Add Column */}
            <button
              onClick={() => setIsColModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-xs rounded-xl transition"
              title="Add Custom Column"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === "gu" ? "કૉલમ" : "Col"}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition ${viewMode === "table" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition ${viewMode === "cards" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"}`}
              >
                Cards
              </button>
            </div>

            {/* CSV & Print */}
            <button
              onClick={handleExportCSV}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
              title="Export CSV"
            >
              <Download className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
              title="Print Roster"
            >
              <Printer className="w-4 h-4 text-slate-400" />
            </button>

            {/* DELETE ALL BUTTON */}
            <button
              onClick={promptDeleteAll}
              className="flex items-center gap-1 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              title="Delete All Personnel Records"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === "gu" ? "બધા કાઢી નાખો" : "Delete All"}</span>
            </button>
          </div>
        </div>

        {/* Results Count & Quick Notice */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span>
              {language === "gu" 
                ? `કુલ ${filteredPersonnel.length} માંથી ${paginatedPersonnel.length} કર્મચારીઓ દર્શાવાયેલ છે`
                : `Showing ${paginatedPersonnel.length} of ${filteredPersonnel.length} personnel`}
            </span>
            {(selectedSquad !== "ALL" || selectedDesignation !== "ALL" || selectedAppointment !== "ALL" || searchQuery) && (
              <button
                onClick={() => { setSelectedSquad("ALL"); setSelectedDesignation("ALL"); setSelectedAppointment("ALL"); setSearchQuery(""); }}
                className="text-amber-400 hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Rows per page selector for 60fps performance */}
          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={10000}>All</option>
            </select>
          </div>
        </div>

        {/* CONTENT VIEW: TABLE OR CARD GRID */}
        {viewMode === "table" ? (
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">અ.નં.</th>
                    <th className="py-3 px-3">ફોટો</th>
                    <th className="py-3 px-3">સ્કોડ</th>
                    <th className="py-3 px-3">હોદ્દો</th>
                    <th className="py-3 px-3">બ.નં.</th>
                    <th className="py-3 px-3">નામ</th>
                    <th className="py-3 px-3">મોબાઇલ નંબર</th>
                    <th className="py-3 px-3">ફરજની જગ્યા</th>
                    <th className="py-3 px-3">નીમણુંક</th>
                    {customColumns.map(col => (
                      <th key={col} className="py-3 px-3 text-amber-300">{col}</th>
                    ))}
                    <th className="py-3 px-3">હાજર તારીખ</th>
                    <th className="py-3 px-3">જન્મ તારીખ</th>
                    <th className="py-3 px-3">ભરતી તારીખ</th>
                    <th className="py-3 px-3">નિવૃત્તિ તારીખ</th>
                    <th className="py-3 px-3 text-right">ક્રિયા / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {paginatedPersonnel.length === 0 ? (
                    <tr>
                      <td colSpan={15 + customColumns.length} className="py-12 text-center text-slate-500">
                        <div className="max-w-md mx-auto space-y-3">
                          <p className="text-sm">{language === "gu" ? "કોઈ કર્મચારી મળ્યા નથી." : "No personnel records found."}</p>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={handleQuickAddRow}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                            >
                              + Quick Add Row
                            </button>
                            <button
                              onClick={handleReplaceWithDefaults}
                              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold"
                            >
                              🔄 Restore Default Roster
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedPersonnel.map((p, idx) => {
                      const isSelf = currentUser.badgeNo === p.badgeNo || currentUser.role === "admin";
                      const displayMobile = isSelf ? p.mobile : `${(p.mobile || "").slice(0, 4)}XXXXXX`;
                      const isHighlighted = highlightedId === p.id;

                      return (
                        <tr 
                          key={p.id}
                          onClick={() => setSelectedOfficer(p)}
                          className={`hover:bg-slate-900/80 transition-colors cursor-pointer group ${
                            isHighlighted ? "bg-amber-500/20 ring-2 ring-amber-400 font-medium" : ""
                          }`}
                        >
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-xs">{p.srNo || idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <img 
                              src={p.avatarUrl || PRESET_AVATARS[0]} 
                              alt={p.name}
                              className="w-9 h-9 rounded-full object-cover border-2 border-amber-500/50 shadow-md inline-block hover:scale-110 transition-transform duration-150"
                              loading="lazy"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-amber-400 text-xs">{p.code}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-indigo-300 border border-slate-700">
                              {p.designation}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-white text-xs">{p.badgeNo}</td>
                          <td className="py-2.5 px-3 font-medium text-white group-hover:text-amber-300 transition-colors text-xs">{p.name}</td>
                          
                          <td className="py-2.5 px-3 font-mono text-slate-200 text-xs">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span>{displayMobile}</span>
                              {isSelf && (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <a href={`tel:${p.mobile}`} className="p-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition" title="Call">
                                    <Phone className="w-3 h-3" />
                                  </a>
                                  <a href={`https://wa.me/91${(p.mobile || "").replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white rounded-lg transition" title="WhatsApp">
                                    <MessageSquare className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 text-xs">{p.dutyPlace}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              (p.appointment || "").toLowerCase() === 'crime' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
                            }`}>
                              {p.appointment}
                            </span>
                          </td>
                          {customColumns.map(col => (
                            <td key={col} className="py-2.5 px-3 text-slate-300 font-mono text-xs">
                              {isSelf ? (p.customFields?.[col] || "-") : "🔒"}
                            </td>
                          ))}
                          <td className="py-2.5 px-3 text-slate-300 font-mono text-xs">{p.reportDate}</td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-xs">{p.birthDate}</td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-xs">{p.recruitedDate}</td>
                          <td className="py-2.5 px-3 font-mono text-xs text-amber-300 font-semibold">{p.retirementDate}</td>
                          
                          {/* DELETE & EDIT ACTIONS (ALWAYS FUNCTIONAL) */}
                          <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={(e) => handleOpenEditModal(p, e)} 
                                className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg transition" 
                                title="Edit Personnel"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => promptDelete(p.id, p.name, p.badgeNo, e)} 
                                className="p-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition" 
                                title="Delete Personnel"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-t border-slate-800 text-xs">
                <span className="text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-lg text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 font-mono text-amber-400 font-bold">{currentPage}</span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-lg text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedPersonnel.map((p, idx) => {
              const isSelf = currentUser.badgeNo === p.badgeNo || currentUser.role === "admin";
              const displayMobile = isSelf ? p.mobile : `${(p.mobile || "").slice(0, 4)}XXXXXX`;
              const isHighlighted = highlightedId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedOfficer(p)}
                  className={`bg-slate-950/70 border rounded-2xl p-5 shadow-xl hover:border-amber-500/50 transition cursor-pointer flex flex-col justify-between ${
                    isHighlighted ? "border-amber-400 bg-amber-500/10 ring-2 ring-amber-400" : "border-slate-800/80"
                  }`}
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
                            <span className="font-mono text-xs text-amber-400 font-bold">{p.code}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-indigo-300 rounded font-semibold border border-slate-700">{p.designation}</span>
                          </div>
                          <h3 className="font-bold text-white text-sm mt-0.5">{p.name}</h3>
                          <p className="text-xs text-slate-400 font-mono">બ.નં. {p.badgeNo}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        (p.appointment || "").toLowerCase() === 'crime' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {p.appointment}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">ફરજની જગ્યા:</span>
                        <span className="text-slate-300 font-medium">{p.dutyPlace}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">નિવૃત્તિ તારીખ:</span>
                        <span className="text-amber-400 font-mono font-semibold">{p.retirementDate}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">{language === "gu" ? "સેવા સમય:" : "Worked Tenure:"}</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        ⏳ {getTenureText(p.reportDate || p.recruitedDate, language)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                    <div className="font-mono text-xs text-slate-300">
                      {displayMobile}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => handleOpenEditModal(p, e)} 
                        className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg transition" 
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => promptDelete(p.id, p.name, p.badgeNo, e)} 
                        className="p-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition" 
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* IN-APP CONFIRMATION MODAL FOR DELETIONS (REPLACES BROKEN WINDOW.CONFIRM) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-rose-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                {deleteConfirm.type === "all" 
                  ? (language === "gu" ? "તમામ કર્મચારીઓ કાઢી નાખવા છે?" : "Delete All Personnel Records?")
                  : (language === "gu" ? "કર્મચારીને દૂર કરવા છે?" : "Delete Personnel Record?")}
              </h3>

              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                {deleteConfirm.type === "all" 
                  ? (language === "gu" 
                      ? "ચેતવણી: આ ક્રિયાથી ડેટાબેઝમાંથી તમામ કર્મચારીઓ દૂર થશે. શું તમે ખરેખર આગળ વધવા માંગો છો?" 
                      : "WARNING: This will permanently delete all personnel from your active roster. Are you sure you want to proceed?")
                  : (language === "gu"
                      ? `શું તમે ખરેખર "${deleteConfirm.name}" (બ.નં. ${deleteConfirm.badgeNo || "-"}) ને દૂર કરવા માંગો છો?`
                      : `Are you sure you want to delete officer "${deleteConfirm.name}" (Badge #${deleteConfirm.badgeNo || "-"})?`)}
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  {language === "gu" ? "રદ કરો (Cancel)" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
                >
                  {language === "gu" ? "હા, કાઢી નાખો (Delete)" : "Yes, Delete Now"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* REPLACE DATA MODAL (PROMINENT, GUARANTEED FUNCTIONAL)                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isReplaceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-cyan-500/40 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-cyan-950/40">
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-bold text-white">
                    {language === "gu" ? "🔄 ડેટા બદલો / રીસેટ કરો (Replace Data)" : "🔄 Replace Roster Data"}
                  </h2>
                </div>
                <button onClick={() => setIsReplaceModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Option 1: Replace with Official Gujarat Police Defaults */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">
                      {language === "gu" ? "વિકલ્પ ૧: મૂળ ક્રાઇમ બ્રાન્ચ ડેટાથી બદલો" : "Option 1: Restore Default Crime Branch Roster"}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === "gu"
                      ? "તમામ જૂના ફેરફારો સાફ કરી મૂળ ૫ અધિકૃત ગુજરાત પોલીસ ક્રાઇમ બ્રાન્ચ ઓફિસર્સ અને કસ્ટમ કૉલમ્સ ફરીથી લોડ કરો."
                      : "Reset all records back to the original Gujarat Police Crime Branch squad members and default columns."}
                  </p>
                  <button
                    type="button"
                    onClick={handleReplaceWithDefaults}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
                  >
                    🔄 {language === "gu" ? "મૂળ ડેટાથી બદલો (Replace with Default Police Data)" : "Replace with Official Default Roster"}
                  </button>
                </div>

                {/* Option 2: Replace All Data with New Spreadsheet Paste */}
                <form onSubmit={handleExecuteReplaceWithSpreadsheet} className="p-4 bg-slate-900 border border-cyan-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">
                      {language === "gu" ? "વિકલ્પ ૨: નવા સ્પ્રેડશીટ ડેટાથી તમામ બદલો" : "Option 2: Replace All with New Spreadsheet Rows"}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    {language === "gu" 
                      ? "Excel કે Google Sheets માંથી કૉપી કરેલ ડેટા અહીં પેસ્ટ કરો. જૂનો તમામ ડેટા ભૂંસાઈ જશે અને આ નવો ડેટા આવી જશે."
                      : "Paste tab-separated rows copied from Excel or Sheets. All existing rows will be wiped and replaced with this."}
                  </p>
                  
                  <textarea
                    rows={5}
                    value={replaceSpreadsheetText}
                    onChange={(e) => setReplaceSpreadsheetText(e.target.value)}
                    placeholder="1	સ્કોડ-૦૧	UASI	8419	ખોડાભાઇ અરજણભાઇ	9824466971	સ્કોડ-૦૧	CRIME	01/12/2023	01/06/1974	01/01/1997	30/06/2032"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReplaceModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
                    >
                      ⚡ {language === "gu" ? "નવા ડેટાથી તમામ બદલો (Replace All Now)" : "Replace All Rows Now"}
                    </button>
                  </div>
                </form>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* IMPORT SPREADSHEET MODAL WITH DISTINCT REPLACE TOGGLE                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                <h2 className="text-lg font-bold text-white">Import Excel / Spreadsheet Data</h2>
                <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleImportSpreadsheet} className="p-6 space-y-4">
                <p className="text-xs text-slate-400">Paste tab-separated rows copied from Excel or Google Sheets (supports 10+ columns):</p>
                <textarea 
                  rows={6} 
                  value={importText} 
                  onChange={(e) => setImportText(e.target.value)} 
                  placeholder="Paste Excel or CSV rows here..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-amber-500" 
                  required 
                />
                
                {/* CLEAR DISTINCT APPEND VS REPLACE BUTTONS */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setReplaceData(false)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      !replaceData 
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/40" 
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    + {language === "gu" ? "જૂના ડેટામાં ઉમેરો (Append)" : "Append to Current Data"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplaceData(true)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      replaceData 
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40" 
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    ⚡ {language === "gu" ? "નવા ડેટાથી બદલો (Replace All)" : "Replace All Existing Data"}
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Cancel</button>
                  <button 
                    type="submit" 
                    className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-lg transition ${
                      replaceData 
                        ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950" 
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                    }`}
                  >
                    {replaceData 
                      ? (language === "gu" ? "⚡ નવા ડેટાથી તમામ બદલો (Replace All)" : "⚡ Replace All Data Now") 
                      : (language === "gu" ? "+ રેકોર્ડ્સ ઉમેરો (Import Records)" : "+ Import Records")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* OFFICER DETAIL MODAL (INCLUDES WORKING DELETE BUTTON)                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedOfficer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">ઓફિસર પ્રોફાઇલ</span>
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
                    <span className="text-slate-500 block">ફરજની જગ્યા</span>
                    <span className="text-slate-200 font-medium">{selectedOfficer.dutyPlace}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">નીમણુંક સ્થિતિ</span>
                    <span className="text-emerald-400 font-bold">{selectedOfficer.appointment}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">મોબાઇલ</span>
                    <span className="text-slate-200 font-mono">{selectedOfficer.mobile}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">હાજર તારીખ</span>
                    <span className="text-slate-200 font-mono">{selectedOfficer.reportDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">જન્મ તારીખ</span>
                    <span className="text-slate-200 font-mono">{selectedOfficer.birthDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">નિવૃત્તિ તારીખ</span>
                    <span className="text-amber-400 font-mono font-bold">{selectedOfficer.retirementDate}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">{language === "gu" ? "કુલ સેવા સમય (Service Tenure)" : "Calculated Service Tenure"}</span>
                    <span className="text-emerald-400 font-mono font-bold text-xs">
                      ⏳ {getTenureText(selectedOfficer.reportDate || selectedOfficer.recruitedDate, language)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {language === "gu" ? "હાજર તારીખ / નીમણૂંકથી આજના દિવસ સુધી ગણતરી કરેલ" : "Calculated from appointment / reporting date until today"}
                  </p>
                </div>

                {customColumns.length > 0 && (
                  <div className="pt-3 border-t border-slate-800">
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold block mb-2">કસ્ટમ કૉલમ્સ</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {customColumns.map(col => (
                        <div key={col} className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">{col}</span>
                          <span className="text-slate-200 font-mono font-semibold">{selectedOfficer.customFields?.[col] || "-"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION FOOTER WITH WORKING DELETE AND EDIT */}
              <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => promptDelete(selectedOfficer.id, selectedOfficer.name, selectedOfficer.badgeNo)}
                  className="px-4 py-2 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Officer</span>
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const officerToEdit = selectedOfficer;
                      setSelectedOfficer(null);
                      handleOpenEditModal(officerToEdit);
                    }} 
                    className="px-4 py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button onClick={() => setSelectedOfficer(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl">Close</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ADD / EDIT OFFICER FORM MODAL                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                <h2 className="text-lg font-bold text-white">
                  {editingPerson ? (language === "gu" ? "કર્મચારી વિગત સુધારો" : "Edit Personnel") : (language === "gu" ? "નવો કર્મચારી ઉમેરો" : "Add Personnel")}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSavePerson} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Admin Photo Upload & Edit Section */}
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
                        placeholder={language === "gu" ? "અથવા ફોટો URL દાખલ કરો" : "Or enter photo URL"}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Sr No (અ.નં.)</label>
                    <input type="number" value={formData.srNo} onChange={(e) => setFormData({ ...formData, srNo: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Squad Code (સ્કોડ)</label>
                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Designation (હોદ્દો)</label>
                    <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Badge No (બક્કલ નં.)</label>
                    <input type="text" value={formData.badgeNo} onChange={(e) => setFormData({ ...formData, badgeNo: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Full Name (પૂરું નામ)</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Mobile (મોબાઇલ નંબર)</label>
                    <input type="text" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Duty Place (ફરજની જગ્યા)</label>
                    <input type="text" value={formData.dutyPlace} onChange={(e) => setFormData({ ...formData, dutyPlace: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Appointment (નીમણુંક)</label>
                    <input type="text" value={formData.appointment} onChange={(e) => setFormData({ ...formData, appointment: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Retirement Date (નિવૃત્તિ તારીખ)</label>
                    <input type="text" value={formData.retirementDate} onChange={(e) => setFormData({ ...formData, retirementDate: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                  </div>
                </div>

                {customColumns.length > 0 && (
                  <div className="border-t border-slate-800 pt-3 space-y-3">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Custom Fields</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {customColumns.map(col => (
                        <div key={col}>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{col}</label>
                          <input
                            type="text"
                            value={formData.customFields?.[col] || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              customFields: { ...(formData.customFields || {}), [col]: e.target.value }
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition">
                    {editingPerson ? "Update Officer" : "Save & Add Officer (રો ઉમેરો)"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Custom Column Modal */}
      <AnimatePresence>
        {isColModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                <h2 className="text-lg font-bold text-white">Add Custom Column</h2>
                <button onClick={() => setIsColModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddCustomColumn} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === "gu" ? "નવી કૉલમનું નામ" : "New Column Name"}
                  </label>
                  <input
                    type="text"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    placeholder="e.g. Belt No, Rank, Zone, Shift"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Manage & Delete Specific Columns */}
                {customColumns.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-amber-400">
                      {language === "gu" ? "વિશેષ કૉલમ કાઢી નાખો (Delete Specific Column)" : "Delete Specific Custom Column"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {customColumns.map(col => (
                        <div
                          key={col}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-xl text-xs text-slate-200"
                        >
                          <span className="font-mono text-amber-300">{col}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomColumn(col)}
                            className="p-1 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                            title={`Delete "${col}" column`}
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

      {/* Crime Branch AI Assistant Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Gujarat Police Crime Branch AI</h2>
                </div>
                <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <form onSubmit={handleAskAI} className="flex gap-2">
                  <input 
                    type="text" 
                    value={aiPrompt} 
                    onChange={(e) => setAiPrompt(e.target.value)} 
                    placeholder="e.g., How many officers are in Squad 01? Who is retiring soon?" 
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" 
                  />
                  <button type="submit" disabled={aiLoading} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">
                    {aiLoading ? "Thinking..." : "Ask"}
                  </button>
                </form>
                {aiResponse && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-sm whitespace-pre-wrap text-slate-200">
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
