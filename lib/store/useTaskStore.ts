import { create } from 'zustand'
import { Task, TaskFilter, TaskSort, SmartListType } from '@/lib/types/task'
import { SupabaseTaskRepository } from '@/lib/repositories/supabaseTaskRepository'

interface TaskState {
  // Data
  tasks: Task[]
  filteredTasks: Task[]
  currentFilter: TaskFilter | null
  currentSort: TaskSort | null
  
  // UI State
  loading: boolean
  error: string | null
  selectedTasks: string[]
  
  // Repository
  repository: SupabaseTaskRepository | null
  unsubscribe: (() => void) | null
  
  // Actions
  initializeRepository: (familyId: string) => void
  loadTasks: (filter?: TaskFilter, sort?: TaskSort) => Promise<void>
  loadSmartList: (type: SmartListType, userId?: string) => Promise<void>
  createTask: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  completeTask: (taskId: string, actualDuration?: number) => Promise<void>
  
  // Real-time sync
  startRealTimeSync: (filter?: TaskFilter, userId?: string) => void
  stopRealTimeSync: () => void
  
  // Filtering and sorting
  setFilter: (filter: TaskFilter) => void
  setSort: (sort: TaskSort) => void
  applyFilterAndSort: () => void
  
  // Selection
  selectTask: (taskId: string) => void
  deselectTask: (taskId: string) => void
  selectAllTasks: () => void
  clearSelection: () => void
  
  // Batch operations
  batchUpdate: (updates: Array<{ taskId: string; data: Partial<Task>; userId: string }>) => Promise<void>
  
  // Utils
  clearError: () => void
  reset: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Initial state
  tasks: [],
  filteredTasks: [],
  currentFilter: null,
  currentSort: null,
  loading: false,
  error: null,
  selectedTasks: [],
  repository: null,
  unsubscribe: null,

  // Initialize repository
  initializeRepository: (familyId: string) => {
    const repository = new SupabaseTaskRepository(familyId)
    set({ repository })
  },

  // Load tasks
  loadTasks: async (filter?: TaskFilter, sort?: TaskSort) => {
    const { repository } = get()
    if (!repository) return

    set({ loading: true, error: null })

    try {
      const tasks = await repository.getTasks(filter, sort)
      set({ 
        tasks, 
        currentFilter: filter || null,
        currentSort: sort || null,
        loading: false 
      })
      get().applyFilterAndSort()
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  // Load smart list
  loadSmartList: async (type: SmartListType, userId?: string) => {
    const { repository } = get()
    if (!repository) return

    set({ loading: true, error: null })

    try {
      const tasks = await repository.getSmartList(type, userId)
      set({ 
        tasks, 
        currentFilter: null,
        currentSort: null,
        loading: false 
      })
      get().applyFilterAndSort()
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  // Create task
  createTask: async (taskData) => {
    const { repository } = get()
    if (!repository) return

    set({ loading: true, error: null })

    try {
      const newTask = await repository.createTask(taskData)
      set(state => ({
        tasks: [newTask, ...state.tasks],
        loading: false
      }))
      get().applyFilterAndSort()
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  // Update task
  updateTask: async (taskId: string, updates: Partial<Task>) => {
    const { repository } = get()
    if (!repository) return

    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      )
    }))

    try {
      await repository.updateTask(taskId, updates)
      get().applyFilterAndSort()
    } catch (error: any) {
      // Revert optimistic update on error
      set({ error: error.message })
      // Reload to get correct state
      get().loadTasks(get().currentFilter || undefined, get().currentSort || undefined)
    }
  },

  // Delete task
  deleteTask: async (taskId: string) => {
    const { repository } = get()
    if (!repository) return

    // Optimistic update
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== taskId)
    }))

    try {
      await repository.deleteTask(taskId)
      get().applyFilterAndSort()
    } catch (error: any) {
      set({ error: error.message })
      // Reload to get correct state
      get().loadTasks(get().currentFilter || undefined, get().currentSort || undefined)
    }
  },

  // Complete task
  completeTask: async (taskId: string, actualDuration?: number) => {
    const { repository } = get()
    if (!repository) return

    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: 'completed', 
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : task
      )
    }))

    try {
      await repository.completeTask(taskId, actualDuration)
      get().applyFilterAndSort()
    } catch (error: any) {
      set({ error: error.message })
      // Reload to get correct state
      get().loadTasks(get().currentFilter || undefined, get().currentSort || undefined)
    }
  },

  // Real-time sync
  startRealTimeSync: (filter?: TaskFilter, userId?: string) => {
    const { repository, unsubscribe } = get()
    if (!repository) return

    // Stop existing subscription
    if (unsubscribe) {
      unsubscribe()
    }

    const newUnsubscribe = repository.onTasksChange(
      (tasks) => {
        set({ tasks })
        get().applyFilterAndSort()
      },
      filter,
      userId
    )

    set({ unsubscribe: newUnsubscribe })
  },

  // Stop real-time sync
  stopRealTimeSync: () => {
    const { unsubscribe } = get()
    if (unsubscribe) {
      unsubscribe()
      set({ unsubscribe: null })
    }
  },

  // Set filter
  setFilter: (filter: TaskFilter) => {
    set({ currentFilter: filter })
    get().applyFilterAndSort()
  },

  // Set sort
  setSort: (sort: TaskSort) => {
    set({ currentSort: sort })
    get().applyFilterAndSort()
  },

  // Apply filter and sort
  applyFilterAndSort: () => {
    const { tasks, currentFilter, currentSort } = get()
    let filtered = [...tasks]

    // Apply filter
    if (currentFilter) {
      if (currentFilter.status && currentFilter.status.length > 0) {
        filtered = filtered.filter(task => currentFilter.status!.includes(task.status))
      }
      if (currentFilter.assignedTo && currentFilter.assignedTo.length > 0) {
        filtered = filtered.filter(task => 
          task.assigned_to.some(id => currentFilter.assignedTo!.includes(id))
        )
      }
      if (currentFilter.priority && currentFilter.priority.length > 0) {
        filtered = filtered.filter(task => currentFilter.priority!.includes(task.priority))
      }
      if (currentFilter.tags && currentFilter.tags.length > 0) {
        filtered = filtered.filter(task => 
          task.tags.some(tag => currentFilter.tags!.includes(tag))
        )
      }
      if (currentFilter.search) {
        const search = currentFilter.search.toLowerCase()
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search)
        )
      }
    }

    // Apply sort
    if (currentSort) {
      filtered.sort((a, b) => {
        const aVal = a[currentSort.field]
        const bVal = b[currentSort.field]
        
        if (aVal === bVal) return 0
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1
        
        const comparison = aVal < bVal ? -1 : 1
        return currentSort.direction === 'asc' ? comparison : -comparison
      })
    }

    set({ filteredTasks: filtered })
  },

  // Selection methods
  selectTask: (taskId: string) => {
    set(state => ({
      selectedTasks: [...state.selectedTasks, taskId]
    }))
  },

  deselectTask: (taskId: string) => {
    set(state => ({
      selectedTasks: state.selectedTasks.filter(id => id !== taskId)
    }))
  },

  selectAllTasks: () => {
    set(state => ({
      selectedTasks: state.filteredTasks.map(task => task.id)
    }))
  },

  clearSelection: () => {
    set({ selectedTasks: [] })
  },

  // Batch operations
  batchUpdate: async (updates) => {
    const { repository } = get()
    if (!repository) return

    try {
      await repository.batchUpdateTasks(updates)
      // Reload tasks to get updated state
      get().loadTasks(get().currentFilter || undefined, get().currentSort || undefined)
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  // Utils
  clearError: () => {
    set({ error: null })
  },

  reset: () => {
    const { unsubscribe } = get()
    if (unsubscribe) {
      unsubscribe()
    }
    
    set({
      tasks: [],
      filteredTasks: [],
      currentFilter: null,
      currentSort: null,
      loading: false,
      error: null,
      selectedTasks: [],
      repository: null,
      unsubscribe: null
    })
  }
}))