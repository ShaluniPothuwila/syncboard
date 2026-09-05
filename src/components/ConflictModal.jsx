export default function ConflictModal({ myChanges, serverTask, onKeepMine, onUseServer, onCancel }) {
  const fields = ["title", "description", "category", "priority", "dueDate"];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 w-[520px] rounded-lg">
        <h2 className="font-bold text-red-600 mb-1">Someone else edited this task</h2>
        <p className="text-xs text-slate-500 mb-4">
          This task changed on the server since you opened it. Review both versions below and choose which to keep.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="border border-indigo-200 bg-indigo-50/50 rounded-lg p-3">
            <p className="text-[11px] font-bold text-indigo-700 mb-2">Your changes</p>
            {fields.map((f) => (
              <div key={f} className="mb-1.5">
                <p className="text-[10px] uppercase text-slate-400 font-semibold">{f}</p>
                <p className="text-xs text-slate-800 break-words">{myChanges[f] || "—"}</p>
              </div>
            ))}
          </div>

          <div className="border border-slate-200 bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] font-bold text-slate-600 mb-2">Current on server</p>
            {fields.map((f) => (
              <div key={f} className="mb-1.5">
                <p className="text-[10px] uppercase text-slate-400 font-semibold">{f}</p>
                <p className="text-xs text-slate-800 break-words">{serverTask[f] || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="text-xs text-slate-500 px-3 py-1.5">
            Cancel
          </button>
          <button
            onClick={onUseServer}
            className="text-xs border border-slate-300 px-3 py-1.5 rounded"
          >
            Discard mine, keep server's
          </button>
          <button
            onClick={onKeepMine}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded font-bold"
          >
            Overwrite with mine
          </button>
        </div>
      </div>
    </div>
  );
}