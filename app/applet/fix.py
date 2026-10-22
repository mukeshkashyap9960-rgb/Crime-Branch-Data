with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace the import replace buttons block with clean JSX
start_marker = '<div className="flex gap-3 pt-1">'
end_marker = '</form>'

idx_start = content.find(start_marker)
if idx_start != -1:
    idx_end = content.find(end_marker, idx_start)
    if idx_end != -1:
        replacement = '''<div className="flex gap-3 pt-1">
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
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">Import Bulk Records</button>
                </div>
              '''
        content = content[:idx_start] + replacement + content[idx_end + len(end_marker):]

with open('src/App.tsx', 'w') as f:
    f.write(content)
print('Successfully fixed import buttons via fix.py')
