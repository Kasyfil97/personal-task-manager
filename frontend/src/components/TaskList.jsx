import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from './TaskCard'

function SortableTask({ task, onEdit, onDelete, onComplete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onComplete={onComplete}
        dragHandle={attributes && { ...attributes, ...listeners }}
      />
    </div>
  )
}

export default function TaskList({ tasks, onEdit, onDelete, onComplete, onReorder }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = tasks.findIndex((t) => t.id === active.id)
    const newIndex = tasks.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(tasks, oldIndex, newIndex)
    onReorder(reordered.map((t, i) => ({ id: t.id, position: i + 1 })))
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No tasks yet. Add one above!
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onComplete={onComplete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
