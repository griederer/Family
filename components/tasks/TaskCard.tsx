'use client'

import { useState } from 'react'
import { Task, TaskPriority } from '@/lib/types/task'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  Calendar,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  Flag,
  Timer
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { format } from 'date-fns'

interface TaskCardProps {
  task: Task
  onComplete: (taskId: string) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onSelect?: (taskId: string) => void
  isSelected?: boolean
  familyMembers: Record<string, { name: string; avatar?: string }>
}

const priorityConfig = {
  urgent: { color: 'text-red-500', bg: 'bg-red-50', icon: '🔴' },
  high: { color: 'text-orange-500', bg: 'bg-orange-50', icon: '🟡' },
  normal: { color: 'text-green-500', bg: 'bg-green-50', icon: '🟢' },
  low: { color: 'text-gray-500', bg: 'bg-gray-50', icon: '⚪' }
}

export function TaskCard({ 
  task, 
  onComplete, 
  onEdit, 
  onDelete, 
  onSelect,
  isSelected = false,
  familyMembers 
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isCompleted = task.status === 'completed'
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onComplete(task.id)
  }

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(task.id)
    } else {
      onEdit(task)
    }
  }

  const getPriorityConfig = (priority: TaskPriority) => priorityConfig[priority]

  return (
    <Card 
      className={cn(
        'p-4 transition-smooth cursor-pointer hover:scale-[1.02] group',
        isSelected && 'ring-2 ring-primary',
        isCompleted && 'opacity-60',
        isOverdue && 'border-destructive/50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="flex items-start space-x-3">
        {/* Completion Toggle */}
        <button
          onClick={handleComplete}
          className={cn(
            'mt-1 transition-smooth',
            isCompleted ? 'text-green-500' : 'text-muted-foreground hover:text-primary'
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
          {/* Title and Priority */}
          <div className="flex items-center justify-between mb-2">
            <h3 className={cn(
              'font-medium transition-smooth',
              isCompleted && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </h3>
            
            <div className="flex items-center space-x-2">
              {/* Priority */}
              <span className="text-sm">
                {getPriorityConfig(task.priority).icon}
              </span>
              
              {/* More Actions */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'w-6 h-6 opacity-0 group-hover:opacity-100 transition-smooth',
                  isHovered && 'opacity-100'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle more actions
                }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              {/* Due Date */}
              {task.due_date && (
                <div className={cn(
                  'flex items-center space-x-1',
                  isOverdue && 'text-destructive'
                )}>
                  <Calendar className="w-3 h-3" />
                  <span>
                    {format(new Date(task.due_date), 'MMM d')}
                    {task.due_time && ` at ${task.due_time}`}
                  </span>
                </div>
              )}

              {/* Time Tracking */}
              {task.estimated_duration && (
                <div className="flex items-center space-x-1">
                  <Timer className="w-3 h-3" />
                  <span>{task.estimated_duration}m</span>
                </div>
              )}


            </div>

            {/* Assigned Users */}
            <div className="flex items-center space-x-1">
              {task.assigned_to.slice(0, 3).map((userId, index) => {
                const member = familyMembers[userId]
                return (
                  <div
                    key={userId}
                    className={cn(
                      'w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-xs font-medium text-white',
                      index > 0 && '-ml-2'
                    )}
                    title={member?.name || 'Unknown'}
                  >
                    {member?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )
              })}
              {task.assigned_to.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground -ml-2">
                  +{task.assigned_to.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar for Time Tracking */}
      {task.estimated_duration && task.actual_duration && (
        <div className="mt-3 pt-3 border-t border-muted">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Time Progress</span>
            <span>
              {task.actual_duration}/{task.estimated_duration}m
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-smooth"
              style={{
                width: `${Math.min(
                  (task.actual_duration / task.estimated_duration) * 100,
                  100
                )}%`
              }}
            />
          </div>
        </div>
      )}
    </Card>
  )
}