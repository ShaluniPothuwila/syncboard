import TaskCard from "./TaskCard"; 
import { Droppable } from "@hello-pangea/dnd";
 
export default function Column({ column, onDelete, onEdit }) { 
  return ( 
    <div className={`rounded-2xl p-4 border flex-1 min-w-[280px] flex flex-col gap-3 ${column.bgColor}`}> 
      
      {/* Column Header */} 
      <div className="flex items-center justify-between px-1 pb-1"> 
        <h3 className="font-extrabold text-slate-800 text-base">
          {column.title}
        </h3> 
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${column.badgeColor}`}> 
          {column.tasks.length}
        </span> 
      </div> 
 
      {/* Task List (Droppable Area) */} 
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div 
            className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-220px)] min-h-[150px]"
            ref={provided.innerRef}
            {...provided.droppableProps}
          > 
            {column.tasks.map((task, index) => ( 
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index} // Added index for Draggable
                onDelete={onDelete}
                onEdit={onEdit}
              /> 
            ))} 
            {provided.placeholder}
          </div> 
        )}
      </Droppable>
    </div> 
  ); 
}