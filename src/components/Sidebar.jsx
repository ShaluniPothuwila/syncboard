export default function Sidebar({ stats, team, upcomingDeadlines }) {
  return (
    <div className="w-72 shrink-0 flex flex-col gap-4">
      {/* Project Overview Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-3">
          📊 Project Overview
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full border-4 border-emerald-500 border-t-slate-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-black text-slate-800">{stats.progress}%</span>
          </div>
          <div>
            <div className="text-slate-800 font-bold text-sm">Project Progress</div>
            <div className="text-slate-500 text-xs mb-1.5">
              {stats.completed} of {stats.total} tasks completed
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${stats.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-3">
          👥 Team Members
        </div>
        <div className="flex flex-col gap-2.5">
          {team.map((member, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="text-slate-800 font-bold text-xs">{member.name}</div>
                  <div className="text-slate-400 text-[11px]">{member.role}</div>
                </div>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  member.status === "online"
                    ? "bg-emerald-500"
                    : member.status === "away"
                    ? "bg-amber-500"
                    : "bg-slate-300"
                }`}
              ></span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-3">
          📅 Upcoming Deadlines
        </div>
        <div className="flex flex-col gap-2.5">
          {upcomingDeadlines.map((item, i) => (
            <div key={i} className={`border-l-2 pl-2.5 ${item.color}`}>
              <div className="text-slate-800 font-bold text-xs">{item.date}</div>
              <div className="text-slate-500 text-xs">{item.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}