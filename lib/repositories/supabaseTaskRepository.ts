import { supabase } from '@/lib/supabase/config'
import { Task, TaskFilter, TaskSort, SmartListType } from '@/lib/types/task'
import { Database } from '@/lib/types/database'

type TaskRow = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export class SupabaseTaskRepository {
  private familyId: string
  private isDemoMode: boolean

  constructor(familyId: string) {
    this.familyId = familyId
    this.isDemoMode = typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true'
  }

  // Convert database row to Task interface
  private mapRowToTask(row: TaskRow): Task {
    return {
      id: row.id,
      family_id: row.family_id,
      title: row.title,
      description: row.description || undefined,
      assigned_to: row.assigned_to,
      created_by: row.created_by,
      priority: row.priority,
      status: row.status,
      due_date: row.due_date || undefined,
      due_time: row.due_time || undefined,
      estimated_duration: row.estimated_duration || undefined,
      actual_duration: row.actual_duration || undefined,
      tags: row.tags,
      category: row.category || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at || undefined,
    }
  }

  // Create task
  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const insertData: TaskInsert = {
      family_id: this.familyId,
      title: taskData.title,
      description: taskData.description || null,
      assigned_to: taskData.assigned_to,
      created_by: taskData.created_by,
      priority: taskData.priority,
      status: taskData.status,
      due_date: taskData.due_date || null,
      due_time: taskData.due_time || null,
      estimated_duration: taskData.estimated_duration || null,
      tags: taskData.tags,
      category: taskData.category || null,
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`)
    }

    return this.mapRowToTask(data)
  }

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const updateData: TaskUpdate = {
      ...(updates.title && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.assigned_to && { assigned_to: updates.assigned_to }),
      ...(updates.priority && { priority: updates.priority }),
      ...(updates.status && { status: updates.status }),
      ...(updates.due_date !== undefined && { due_date: updates.due_date }),
      ...(updates.due_time !== undefined && { due_time: updates.due_time }),
      ...(updates.estimated_duration !== undefined && { estimated_duration: updates.estimated_duration }),
      ...(updates.actual_duration !== undefined && { actual_duration: updates.actual_duration }),
      ...(updates.tags && { tags: updates.tags }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.completed_at !== undefined && { completed_at: updates.completed_at }),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('family_id', this.familyId)

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`)
    }
  }

  // Delete task (soft delete)
  async deleteTask(taskId: string): Promise<void> {
    await this.updateTask(taskId, { status: 'cancelled' })
  }

  // Hard delete (admin only)
  async permanentDeleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('family_id', this.familyId)

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`)
    }
  }

  // Get single task
  async getTask(taskId: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('family_id', this.familyId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to get task: ${error.message}`)
    }

    return this.mapRowToTask(data)
  }

  // Get tasks with filtering and sorting
  async getTasks(filter?: TaskFilter, sort?: TaskSort): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('family_id', this.familyId)

    // Apply filters
    if (filter) {
      if (filter.status && filter.status.length > 0) {
        query = query.in('status', filter.status)
      }
      if (filter.priority && filter.priority.length > 0) {
        query = query.in('priority', filter.priority)
      }
      if (filter.assignedTo && filter.assignedTo.length > 0) {
        query = query.overlaps('assigned_to', filter.assignedTo)
      }
      if (filter.tags && filter.tags.length > 0) {
        query = query.overlaps('tags', filter.tags)
      }
      if (filter.search) {
        query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`)
      }
      if (filter.dueDate) {
        if (filter.dueDate.start) {
          query = query.gte('due_date', filter.dueDate.start)
        }
        if (filter.dueDate.end) {
          query = query.lte('due_date', filter.dueDate.end)
        }
      }
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' })
    } else {
      // Default sort by due date, then priority
      query = query.order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get tasks: ${error.message}`)
    }

    return data.map(row => this.mapRowToTask(row))
  }

  // Real-time subscription
  onTasksChange(
    callback: (tasks: Task[]) => void,
    filter?: TaskFilter,
    userId?: string
  ): () => void {
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `family_id=eq.${this.familyId}`,
        },
        async () => {
          // Refetch tasks when any change occurs
          try {
            const tasks = await this.getTasks(filter)
            callback(tasks)
          } catch (error) {
            console.error('Error in real-time callback:', error)
          }
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel)
    }
  }

  // Smart lists implementation
  async getSmartList(type: SmartListType, userId?: string): Promise<Task[]> {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    switch (type) {
      case 'today':
        return this.getTasks({
          status: ['pending', 'in_progress'],
          dueDate: {
            start: today.toISOString().split('T')[0],
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        }, { field: 'due_date', direction: 'asc' })

      case 'this_week':
        return this.getTasks({
          status: ['pending', 'in_progress'],
          dueDate: {
            start: today.toISOString().split('T')[0],
            end: weekEnd.toISOString().split('T')[0]
          }
        }, { field: 'due_date', direction: 'asc' })

      case 'overdue':
        return this.getTasks({
          status: ['pending', 'in_progress'],
          dueDate: {
            end: today.toISOString().split('T')[0]
          }
        }, { field: 'due_date', direction: 'asc' })

      case 'assigned_to_me':
        if (!userId) return []
        return this.getTasks({
          assignedTo: [userId],
          status: ['pending', 'in_progress']
        })

      case 'high_priority':
        return this.getTasks({
          priority: ['urgent', 'high'],
          status: ['pending', 'in_progress']
        }, { field: 'priority', direction: 'desc' })

      case 'completed':
        return this.getTasks({
          status: ['completed']
        }, { field: 'completed_at', direction: 'desc' })

      default:
        return []
    }
  }

  // Complete task
  async completeTask(taskId: string, actualDuration?: number): Promise<void> {
    const updates: Partial<Task> = {
      status: 'completed',
      completed_at: new Date().toISOString()
    }

    if (actualDuration) {
      updates.actual_duration = actualDuration
    }

    await this.updateTask(taskId, updates)
  }

  // Batch operations
  async batchUpdateTasks(updates: Array<{ taskId: string; data: Partial<Task> }>): Promise<void> {
    const promises = updates.map(({ taskId, data }) => this.updateTask(taskId, data))
    await Promise.all(promises)
  }
}