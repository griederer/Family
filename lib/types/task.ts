import { Timestamp } from 'firebase/firestore'

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

export interface TaskRecurrence {
  type: RecurrenceType
  interval: number // e.g., every 3 days
  daysOfWeek?: number[] // 0-6, Sunday=0
  endDate?: Timestamp
  occurrences?: number
}

export interface TaskTimeTracking {
  estimatedDuration: number // minutes
  actualDuration?: number // minutes
  startedAt?: Timestamp
  completedAt?: Timestamp
}

export interface Task {
  id: string
  familyId: string
  
  // Content
  title: string
  description?: string
  
  // Assignment
  assignedTo: string[] // user IDs
  createdBy: string // user ID
  
  // Priority & Status
  priority: TaskPriority
  status: TaskStatus
  
  // Timing
  dueDate?: Timestamp
  dueTime?: string // HH:MM format
  timeTracking?: TaskTimeTracking
  
  // Organization
  tags: string[]
  category?: string
  
  // Recurrence
  recurrence?: TaskRecurrence
  parentTaskId?: string // for recurring task instances
  
  // Collaboration & Sync (from DeepSeek recommendations)
  lastModified: Timestamp
  modifiedBy: string
  version: number
  
  // Metadata
  createdAt: Timestamp
  completedAt?: Timestamp
  
  // Attachments
  attachments?: TaskAttachment[]
  
  // Comments for family collaboration
  comments?: TaskComment[]
}

export interface TaskAttachment {
  id: string
  name: string
  url: string
  type: 'image' | 'document' | 'link'
  uploadedBy: string
  uploadedAt: Timestamp
}

export interface TaskComment {
  id: string
  text: string
  authorId: string
  authorName: string
  createdAt: Timestamp
}

export interface TaskFilter {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assignedTo?: string[]
  tags?: string[]
  dueDate?: {
    start?: Timestamp
    end?: Timestamp
  }
  search?: string
}

export interface TaskSort {
  field: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'status' | 'completedAt'
  direction: 'asc' | 'desc'
}

// Smart lists based on PRD requirements
export type SmartListType = 'today' | 'this_week' | 'overdue' | 'assigned_to_me' | 'high_priority' | 'completed'

export interface SmartList {
  type: SmartListType
  name: string
  filter: TaskFilter
  sort?: TaskSort
}