with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add replaceData state after importText state
target_state = '  const [importText, setImportText] = useState("");'
replacement_state = '  const [importText, setImportText] = useState("");\n  const [replaceData, setReplaceData] = useState(false);'
if target_state in content and 'replaceData' not in content:
    content = content.replace(target_state, replacement_state, 1)

# 2. Update handleDelete to ensure storage is updated
old_del = '''  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentUser?.role !== "admin") return;
    if (window.confirm(language === "gu" ? "શું તમે આ કર્મચારીને દૂર કરવા માંગો છો?" : "Are you sure you want to delete this personnel?")) {
      setPersonnel(personnel.filter(p => p.id !== id));
      if (selectedOfficer?.id === id) setSelectedOfficer(null);
    }
  };'''

new_del = '''  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentUser?.role !== "admin") return;
    if (window.confirm(language === "gu" ? "શું તમે આ કર્મચારીને દૂર કરવા માંગો છો?" : "Are you sure you want to delete this personnel?")) {
      const updated = personnel.filter(p => p.id !== id);
      setPersonnel(updated);
      localStorage.setItem("crime_branch_personnel_v10", JSON.stringify(updated));
      sessionStorage.setItem("crime_branch_personnel_v10", JSON.stringify(updated));
      if (selectedOfficer?.id === id) setSelectedOfficer(null);
    }
  };'''
if old_del in content:
    content = content.replace(old_del, new_del, 1)

# 3. Update handleImportSpreadsheet to support replaceData & auto-detect custom columns
old_import = '''  // Robust Spreadsheet Import Parser for 10+ Custom Columns
  const handleImportSpreadsheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== "admin") return;
    if (!importText.trim()) return;

    try {
      const lines = importText.trim().split("\\n");
      const newPersonnelList: Personnel[] = [...personnel];
      let currentSrNo = newPersonnelList.length ? Math.max(...newPersonnelList.map(p => p.srNo)) + 1 : 1;'''

new_import = '''  // Robust Spreadsheet Import Parser for 10+ Custom Columns
  const handleImportSpreadsheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== "admin") return;
    if (!importText.trim()) return;

    try {
      const lines = importText.trim().split("\\n");
      let detectedCols = [...customColumns];
      let startIndex = 0;

      if (lines.length > 0) {
        const firstLineCols = lines[0].split(/[\\t,|]+/).map(c => c.trim()).filter(Boolean);
        if (firstLineCols.length > 11 || firstLineCols.some(c => /name|નામ|badge|b\\.no|designation|હોદ્દો|code|place|date/i.test(c))) {
          if (firstLineCols.length > 11) {
            const extraHeaders = firstLineCols.slice(11);
            extraHeaders.forEach(h => {
              if (!detectedCols.includes(h) && h.toLowerCase() !== "notes") {
                detectedCols.push(h);
              }
            });
          }
          startIndex = 1;
        }
      }

      setCustomColumns(detectedCols);

      const newPersonnelList: Personnel[] = replaceData ? [] : [...personnel];
      let currentSrNo = replaceData ? 1 : (newPersonnelList.length ? Math.max(...newPersonnelList.map(p => p.srNo)) + 1 : 1);'''

if old_import in content:
    content = content.replace(old_import, new_import, 1)

# 4. In handleImportSpreadsheet success, reset replaceData
old_success = '''      setPersonnel(newPersonnelList);
      setIsImportModalOpen(false);
      setImportText("");
      alert(language === "gu" ? `${importedCount} કર્મચારીઓ અને તમામ કસ્ટમ કૉલમ્સ સફળતાપૂર્વક ઇમ્પોર્ટ થયા!` : `Successfully imported ${importedCount} records with all 10+ custom columns!`);'''

new_success = '''      setPersonnel(newPersonnelList);
      setIsImportModalOpen(false);
      setImportText("");
      setReplaceData(false);
      alert(language === "gu" ? `${importedCount} કર્મચારીઓ અને તમામ કસ્ટમ કૉલમ્સ સફળતાપૂર્વક ઇમ્પોર્ટ થયા!` : `Successfully imported ${importedCount} records with all custom columns!`);'''

if old_success in content:
    content = content.replace(old_success, new_success, 1)

# 5. Remove laggy staggered delays in animations for instant performance
content = content.replace('transition={{ delay: idx * 0.02 }}', 'transition={{ duration: 0 }}')
content = content.replace('transition={{ delay: idx * 0.04 }}', 'transition={{ duration: 0 }}')

# 6. Add prominent replace toggle buttons in import modal if not already present
if 'Append to Existing Data' not in content:
    old_import_textarea = '''                <textarea rows={6} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste Excel rows here..." className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white" required />
                <div className="flex justify-end gap-3">'''

    new_import_textarea = '''                <textarea rows={6} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste Excel rows here..." className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white" required />
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setReplaceData(false)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition ${!replaceData ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    {language === "gu" ? "જૂના ડેટામાં ઉમેરો (Append Data)" : "Append to Existing Data"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplaceData(true)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition ${replaceData ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    {language === "gu" ? "નવા ડેટાથી બદલો (Replace All Data)" : "Replace All Data"}
                  </button>
                </div>
                <div className="flex justify-end gap-3">'''

    if old_import_textarea in content:
        content = content.replace(old_import_textarea, new_import_textarea, 1)

# 7. Add delete button in officer detail dossier modal footer for admin if not already present
if 'Delete Officer' not in content:
    old_dossier_footer = '''                <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 flex justify-end gap-3">
                  <button onClick={() => setSelectedOfficer(null)} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl">Close</button>
                </div>'''

    new_dossier_footer = '''                <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
                  {currentUser.role === "admin" ? (
                    <button
                      onClick={() => handleDelete(selectedOfficer.id)}
                      className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-semibold rounded-xl border border-rose-500/20 transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Officer</span>
                    </button>
                  ) : <div />}
                  <button onClick={() => setSelectedOfficer(null)} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl">Close</button>
                </div>'''

    if old_dossier_footer in content:
        content = content.replace(old_dossier_footer, new_dossier_footer, 1)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print('Successfully updated App.tsx via update_app.py')
