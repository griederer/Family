'use client'

import { useState } from 'react'
import { Task } from '@/lib/types/task'
import { cn } from '@/lib/utils/cn'
import { 
  Circle, 
  CheckCircle2,
  Clock,
  Calendar,
  Flag,
  Paperclip,
  MessageSquare,
  Users
} from 'lucide-react'
import { format } from 'date-fns'

interface TaskItemProps {
  task: Task
  onComplete: (taskId: string) => void
  onEdit: (task: Task) => void
  familyMembers: Record<string, { name: string; avatar?: string }>
}

const priorityColors = {
  urgent: 'text-red-500',
  high: 'text-orange-500', 
  normal: 'text-blue-500',
  low: 'text-gray-400'
}

export function TaskItem({ task, onComplete, onEdit, familyMembers }: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isCompleted = task.status === 'completed'
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onComplete(task.id)
  }

  const handleClick = () => {
    onEdit(task)
  }

  const formatDueDate = () => {
    if (!task.due_date) return null
    const date = new Date(task.due_date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return task.due_time ? `Today at ${task.due_time}` : 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return task.due_time ? `Tomorrow at ${task.due_time}` : 'Tomorrow'
    } else {
      return format(date, 'MMM d')
    }
  }

  return (
    <div 
      className={cn(
        'task-item px-4 py-3 cursor-pointer group',
        isCompleted && 'opacity-60'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Completion Circle */}
        <button
          onClick={handleComplete}
          className={cn(
            'mt-0.5 transition-colors',
            isCompleted 
              ? 'text-green-500' 
              : 'text-gray-300 hover:text-gray-500'
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center justify-between">
            <h3 className={cn(
              'text-sm font-medium text-foreground',
              isCompleted && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </h3>
            
            {/* Quick Actions - shown on hover */}
            <div className={cn(
              'flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity',
              isHovered && 'opacity-100'
            )}>
              {task.priority !== 'normal' && (
                <Flag className={cn('w-3 h-3', priorityColors[task.priority])} />
              )}
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              {/* Due Date */}
              {task.due_date && (
                <div className={cn(
                  'flex items-center space-x-1',
                  isOverdue && 'text-destructive'
                )}>
                  <Calendar className="w-3 h-3" />
                  <span>{formatDueDate()}</span>
                </div>
              )}

              {/* Time Estimate */}
              {task.estimated_duration && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{task.estimated_duration}m</span>
                </div>
              )}

              {/* Project/Category */}
              {task.category && (
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>{task.category}</span>
                </div>
              )}
            </div>

            {/* Assigned Users */}
            {task.assigned_to.length > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {task.assigned_to.length === 1 
                    ? familyMembers[task.assigned_to[0]]?.name || 'Someone'
                    : `${task.assigned_to.length} people`
                  }
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{task.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}