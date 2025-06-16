'use client'

import { useState } from 'react'
import { Task, TaskPriority } from '@/lib/types/task'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import {
  Calendar,
  Clock,
  Flag,
  Tag,
  User,
  X,
  Plus,
  Repeat
} from 'lucide-react'

interface TaskFormProps {
  task?: Task
  onSave: (taskData: Partial<Task>) => void
  onCancel: () => void
  familyMembers: Record<string, { name: string; avatar?: string }>
}

const priorities: { value: TaskPriority; label: string; color: string; icon: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-400', icon: '⚪' },
  { value: 'normal', label: 'Normal', color: 'text-blue-500', icon: '🔵' },
  { value: 'high', label: 'High', color: 'text-orange-500', icon: '🟡' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-500', icon: '🔴' }
]

export function TaskForm({ task, onSave, onCancel, familyMembers }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'normal')
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate as any).toISOString().split('T')[0] : ''
  )
  const [dueTime, setDueTime] = useState(task?.dueTime || '')
  const [assignedTo, setAssignedTo] = useState<string[]>(task?.assignedTo || [])
  const [tags, setTags] = useState<string[]>(task?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState(
    task?.timeTracking?.estimatedDuration?.toString() || ''
  )

  const handleSave = () => {
    if (!title.trim()) return

    const taskData: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      assignedTo,
      tags,
      dueDate: dueDate ? new Date(dueDate + 'T00:00:00') as any : undefined,
      dueTime: dueTime || undefined,
      timeTracking: estimatedDuration ? {
        estimatedDuration: parseInt(estimatedDuration)
      } : undefined
    }

    onSave(taskData)
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const toggleAssignee = (userId: string) => {
    if (assignedTo.includes(userId)) {
      setAssignedTo(assignedTo.filter(id => id !== userId))
    } else {
      setAssignedTo([...assignedTo, userId])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg things-shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Title */}
          <div>
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-0 bg-transparent px-0 focus:ring-0 placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              placeholder="Notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-20 p-0 border-0 bg-transparent resize-none focus:outline-none text-sm text-muted-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Flag className="w-4 h-4" />
              <span>Priority</span>
            </div>
            <div className="flex space-x-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    priority === p.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Due Date</span>
              </div>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-input border-0"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Time</span>
              </div>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="bg-input border-0"
              />
            </div>
          </div>

          {/* Estimated Duration */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Estimated Duration (minutes)</span>
            </div>
            <Input
              type="number"
              placeholder="e.g., 30"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              className="bg-input border-0 w-32"
            />
          </div>

          {/* Assignees */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Assign to</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(familyMembers).map(([userId, member]) => (
                <button
                  key={userId}
                  onClick={() => toggleAssignee(userId)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    assignedTo.includes(userId)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-xs text-white">
                    {member.name.charAt(0)}
                  </div>
                  <span>{member.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Tag className="w-4 h-4" />
              <span>Tags</span>
            </div>
            
            {/* Existing Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-muted rounded-full text-xs"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add New Tag */}
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="bg-input border-0 flex-1"
              />
              <Button
                type="button"
                onClick={addTag}
                size="sm"
                variant="ghost"
                disabled={!newTag.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </div>
    </div>
  )
}