import { Draggable } from "@hello-pangea/dnd";

function formatDueDate(dueDate) {
  if (!dueDate) return "No date";
  const date = new Date(dueDate);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TaskCard({ task, index, onDelete, onEdit }) { 
  return ( 
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div 
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all"
        > 
          {/* TOP SECTION */}
          <div className="flex items-start justify-between gap-2 mb-1.5"> 
            
            <div className="flex items-start gap-2">
              {task.completed && ( 
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5 shrink-0"> 
                  ✓ 
                </div> 
              )} 
              <h4 className="text-slate-800 font-bold text-sm leading-snug">
                {task.title}
              </h4> 
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(task)}
                className="text-xs text-blue-500 hover:underline"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(task.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div> 
    
          {/* DESCRIPTION */}
          <p className="text-slate-500 text-xs mb-3 line-clamp-2">
            {task.description}
          </p> 
    
          {/* FOOTER */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100"> 
            
            <div className="flex items-center gap-1.5 flex-wrap"> 
              {task.category && ( 
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${task.categoryColor}`}> 
                  {task.category} 
                </span> 
              )} 
              {task.priority && ( 
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${task.priorityColor}`}> 
                  {task.priority} 
                </span> 
              )} 
            </div> 
    
            <div className="flex items-center gap-2"> 
              <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1"> 
                📅 {formatDueDate(task.dueDate)} 
              </span> 
              <img 
                src={task.assignee} 
                alt="Assignee" 
                className="w-6 h-6 rounded-full object-cover border border-slate-200" 
              /> 
            </div> 
          </div> 
        </div> 
      )}
    </Draggable>
  ); 
}