import { Task, TaskFilter, TaskSort, SmartListType } from '@/lib/types/task'

export class MockTaskRepository {
  private tasks: Task[] = []

  constructor() {
    // Initialize with some demo tasks
    this.tasks = [
      {
        id: '1',
        family_id: 'demo-family-123',
        title: 'Welcome to FamilyHub!',
        description: 'This is a demo task. Try creating, editing, or completing tasks.',
        assigned_to: ['demo-user-123'],
        created_by: 'demo-user-123',
        priority: 'high',
        status: 'pending',
        due_date: new Date().toISOString().split('T')[0],
        tags: ['demo', 'tutorial'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        family_id: 'demo-family-123',
        title: 'Explore the dashboard',
        description: 'Check out the different sections and features',
        assigned_to: ['demo-user-123'],
        created_by: 'demo-user-123',
        priority: 'normal',
        status: 'pending',
        tags: ['demo'],
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        family_id: 'demo-family-123',
        title: 'Try the Things 3 design',
        description: 'Notice the clean, minimal interface inspired by Things 3',
        assigned_to: ['demo-user-123'],
        created_by: 'demo-user-123',
        priority: 'low',
        status: 'completed',
        tags: ['demo', 'design'],
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        completed_at: new Date(Date.now() - 3600000).toISOString(),
      }
    ]
  }

  private saveToLocalStorage() {
    localStorage.setItem('demo_tasks', JSON.stringify(this.tasks))
  }

  private loadFromLocalStorage() {
    const saved = localStorage.getItem('demo_tasks')
    if (saved) {
      this.tasks = JSON.parse(saved)
    }
  }

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    this.loadFromLocalStorage()
    
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    this.tasks.unshift(newTask)
    this.saveToLocalStorage()
    
    return newTask
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    this.loadFromLocalStorage()
    
    const index = this.tasks.findIndex(t => t.id === taskId)
    if (index !== -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...updates,
        updated_at: new Date().toISOString(),
      }
      this.saveToLocalStorage()
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.updateTask(taskId, { status: 'cancelled' })
  }

  async permanentDeleteTask(taskId: string): Promise<void> {
    this.loadFromLocalStorage()
    this.tasks = this.tasks.filter(t => t.id !== taskId)
    this.saveToLocalStorage()
  }

  async getTask(taskId: string): Promise<Task | null> {
    this.loadFromLocalStorage()
    return this.tasks.find(t => t.id === taskId) || null
  }

  async getTasks(filter?: TaskFilter, sort?: TaskSort): Promise<Task[]> {
    this.loadFromLocalStorage()
    
    let filtered = [...this.tasks]
    
    // Apply filters
    if (filter) {
      if (filter.status && filter.status.length > 0) {
        filtered = filtered.filter(task => filter.status!.includes(task.status))
      }
      if (filter.priority && filter.priority.length > 0) {
        filtered = filtered.filter(task => filter.priority!.includes(task.priority))
      }
      if (filter.search) {
        const search = filter.search.toLowerCase()
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search)
        )
      }
    }
    
    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        const aVal = a[sort.field]
        const bVal = b[sort.field]
        
        if (aVal === bVal) return 0
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1
        
        const comparison = aVal < bVal ? -1 : 1
        return sort.direction === 'asc' ? comparison : -comparison
      })
    }
    
    return filtered
  }

  onTasksChange(callback: (tasks: Task[]) => void): () => void {
    // Mock real-time updates by checking localStorage periodically
    const interval = setInterval(() => {
      this.loadFromLocalStorage()
      callback(this.tasks)
    }, 1000)
    
    return () => clearInterval(interval)
  }

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
        })
      case 'completed':
        return this.getTasks({ status: ['completed'] })
      default:
        return this.getTasks()
    }
  }

  async completeTask(taskId: string, actualDuration?: number): Promise<void> {
    await this.updateTask(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      actual_duration: actualDuration
    })
  }

  async batchUpdateTasks(updates: Array<{ taskId: string; data: Partial<Task> }>): Promise<void> {
    for (const { taskId, data } of updates) {
      await this.updateTask(taskId, data)
    }
  }
}