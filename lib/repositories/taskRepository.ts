import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Task, TaskFilter, TaskSort, SmartListType } from '@/lib/types/task'

export class TaskRepository {
  private familyId: string

  constructor(familyId: string) {
    this.familyId = familyId
  }

  private getTasksCollection() {
    return collection(db, 'families', this.familyId, 'tasks')
  }

  private getTaskDoc(taskId: string) {
    return doc(db, 'families', this.familyId, 'tasks', taskId)
  }

  // Create task with conflict resolution metadata (DeepSeek pattern)
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'lastModified' | 'version'>): Promise<Task> {
    const tasksCollection = this.getTasksCollection()
    
    const newTask: Omit<Task, 'id'> = {
      ...taskData,
      familyId: this.familyId,
      createdAt: serverTimestamp() as Timestamp,
      lastModified: serverTimestamp() as Timestamp,
      version: 1
    }

    const docRef = await addDoc(tasksCollection, newTask)
    
    return {
      ...newTask,
      id: docRef.id,
      createdAt: new Date() as any,
      lastModified: new Date() as any
    }
  }

  // Update with version control for conflict resolution
  async updateTask(taskId: string, updates: Partial<Task>, userId: string): Promise<void> {
    const taskRef = this.getTaskDoc(taskId)
    
    // Get current version for optimistic locking
    const currentTask = await getDoc(taskRef)
    if (!currentTask.exists()) {
      throw new Error('Task not found')
    }

    const currentVersion = currentTask.data().version || 0
    
    await updateDoc(taskRef, {
      ...updates,
      lastModified: serverTimestamp(),
      modifiedBy: userId,
      version: currentVersion + 1
    })
  }

  // Soft delete to support sync and recovery
  async deleteTask(taskId: string, userId: string): Promise<void> {
    await this.updateTask(taskId, {
      status: 'cancelled',
      lastModified: serverTimestamp() as Timestamp,
      modifiedBy: userId
    }, userId)
  }

  // Hard delete (admin only)
  async permanentDeleteTask(taskId: string): Promise<void> {
    const taskRef = this.getTaskDoc(taskId)
    await deleteDoc(taskRef)
  }

  // Get single task
  async getTask(taskId: string): Promise<Task | null> {
    const taskRef = this.getTaskDoc(taskId)
    const taskSnap = await getDoc(taskRef)
    
    if (taskSnap.exists()) {
      return {
        id: taskSnap.id,
        ...taskSnap.data()
      } as Task
    }
    
    return null
  }

  // Get tasks with filtering and sorting
  async getTasks(filter?: TaskFilter, sort?: TaskSort): Promise<Task[]> {
    let q = query(this.getTasksCollection())

    // Apply filters
    if (filter) {
      if (filter.status && filter.status.length > 0) {
        q = query(q, where('status', 'in', filter.status))
      }
      if (filter.assignedTo && filter.assignedTo.length > 0) {
        q = query(q, where('assignedTo', 'array-contains-any', filter.assignedTo))
      }
      if (filter.priority && filter.priority.length > 0) {
        q = query(q, where('priority', 'in', filter.priority))
      }
      if (filter.tags && filter.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filter.tags))
      }
    }

    // Apply sorting
    if (sort) {
      q = query(q, orderBy(sort.field, sort.direction))
    } else {
      // Default sort by due date, then priority
      q = query(q, orderBy('dueDate', 'asc'), orderBy('priority', 'desc'))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Task[]
  }

  // Real-time listener with smart filtering (DeepSeek recommendation)
  onTasksChange(
    callback: (tasks: Task[]) => void,
    filter?: TaskFilter,
    userId?: string
  ): () => void {
    let q = query(this.getTasksCollection())

    // Optimize listener - only listen to user's tasks if specified
    if (userId) {
      q = query(q, where('assignedTo', 'array-contains', userId))
    }

    // Apply other filters
    if (filter?.status && filter.status.length > 0) {
      q = query(q, where('status', 'in', filter.status))
    }

    // Include metadata changes for offline sync
    return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const tasks: Task[] = []
      
      snapshot.forEach((doc) => {
        if (!doc.metadata.hasPendingWrites) {
          tasks.push({
            id: doc.id,
            ...doc.data()
          } as Task)
        }
      })
      
      callback(tasks)
    })
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
            start: Timestamp.fromDate(today),
            end: Timestamp.fromDate(new Date(today.getTime() + 24 * 60 * 60 * 1000))
          }
        }, { field: 'dueDate', direction: 'asc' })

      case 'this_week':
        return this.getTasks({
          status: ['pending', 'in_progress'],
          dueDate: {
            start: Timestamp.fromDate(today),
            end: Timestamp.fromDate(weekEnd)
          }
        }, { field: 'dueDate', direction: 'asc' })

      case 'overdue':
        return this.getTasks({
          status: ['pending', 'in_progress'],
          dueDate: {
            end: Timestamp.fromDate(today)
          }
        }, { field: 'dueDate', direction: 'asc' })

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
        }, { field: 'completedAt', direction: 'desc' })

      default:
        return []
    }
  }

  // Batch operations for performance
  async batchUpdateTasks(updates: Array<{ taskId: string; data: Partial<Task>; userId: string }>): Promise<void> {
    const batch = writeBatch(db)

    for (const update of updates) {
      const taskRef = this.getTaskDoc(update.taskId)
      batch.update(taskRef, {
        ...update.data,
        lastModified: serverTimestamp(),
        modifiedBy: update.userId,
        version: (await getDoc(taskRef)).data()?.version + 1 || 1
      })
    }

    await batch.commit()
  }

  // Complete task with time tracking
  async completeTask(taskId: string, userId: string, actualDuration?: number): Promise<void> {
    const updates: Partial<Task> = {
      status: 'completed',
      completedAt: serverTimestamp() as Timestamp
    }

    if (actualDuration) {
      updates.timeTracking = {
        estimatedDuration: updates.timeTracking?.estimatedDuration || 0,
        ...updates.timeTracking,
        actualDuration,
        completedAt: serverTimestamp() as Timestamp
      }
    }

    await this.updateTask(taskId, updates, userId)
  }

  // Offline support methods
  async enableOfflineMode(): Promise<void> {
    await disableNetwork(db)
  }

  async enableOnlineMode(): Promise<void> {
    await enableNetwork(db)
  }
}