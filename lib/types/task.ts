export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Task {
  id: string
  family_id: string
  
  // Content
  title: string
  description?: string
  
  // Assignment
  assigned_to: string[] // user IDs
  created_by: string // user ID
  
  // Priority & Status
  priority: TaskPriority
  status: TaskStatus
  
  // Timing
  due_date?: string // ISO date string
  due_time?: string // HH:MM format
  estimated_duration?: number // minutes
  actual_duration?: number // minutes
  
  // Organization
  tags: string[]
  category?: string
  
  // Metadata
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
  completed_at?: string // ISO timestamp
}

export interface TaskFilter {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assignedTo?: string[]
  tags?: string[]
  dueDate?: {
    start?: string
    end?: string
  }
  search?: string
}

export interface TaskSort {
  field: 'due_date' | 'priority' | 'created_at' | 'title' | 'status' | 'completed_at'
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