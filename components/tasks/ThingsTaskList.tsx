'use client'

import { useState, useEffect } from 'react'
import { TaskItem } from './TaskItem'
import { TaskForm } from './TaskForm'
import { Task, TaskFilter, SmartListType } from '@/lib/types/task'
import { useTaskStore } from '@/lib/store/useTaskStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { Timestamp } from 'firebase/firestore'
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Star,
  Calendar,
  Inbox,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ThingsTaskListProps {
  smartListType?: SmartListType
  initialFilter?: TaskFilter
}

const listConfig = {
  today: { 
    title: 'Today', 
    icon: Star, 
    description: 'Focus on what matters today',
    color: 'text-yellow-500'
  },
  this_week: { 
    title: 'This Week', 
    icon: Calendar, 
    description: 'Plan your week ahead',
    color: 'text-blue-500'
  },
  overdue: { 
    title: 'Overdue', 
    icon: AlertCircle, 
    description: 'Tasks that need attention',
    color: 'text-red-500'
  },
  assigned_to_me: { 
    title: 'My Tasks', 
    icon: Inbox, 
    description: 'Everything assigned to you',
    color: 'text-gray-500'
  },
  high_priority: { 
    title: 'High Priority', 
    icon: AlertCircle, 
    description: 'Important tasks',
    color: 'text-orange-500'
  },
  completed: { 
    title: 'Completed', 
    icon: Star, 
    description: 'Finished tasks',
    color: 'text-green-500'
  }
}

export function ThingsTaskList({ smartListType, initialFilter }: ThingsTaskListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  const { user, familyMember } = useAuth()
  const {
    filteredTasks,
    loading,
    error,
    repository,
    initializeRepository,
    loadSmartList,
    loadTasks,
    startRealTimeSync,
    stopRealTimeSync,
    completeTask,
    createTask,
    updateTask,
    setFilter,
    clearError
  } = useTaskStore()

  // Mock family members
  const familyMembers = {
    [user?.uid || '']: { name: user?.displayName || 'You' },
    'mom': { name: 'Mom' },
    'dad': { name: 'Dad' },
    'sarah': { name: 'Sarah' }
  }

  // Initialize repository and load data
  useEffect(() => {
    if (familyMember?.familyId && !repository) {
      initializeRepository(familyMember.familyId)
    }
  }, [familyMember?.familyId, repository, initializeRepository])

  useEffect(() => {
    if (repository) {
      if (smartListType) {
        loadSmartList(smartListType, user?.uid)
        startRealTimeSync(undefined, user?.uid)
      } else {
        loadTasks(initialFilter)
        startRealTimeSync(initialFilter, user?.uid)
      }
    }

    return () => {
      stopRealTimeSync()
    }
  }, [repository, smartListType, initialFilter, user?.uid])

  // Handle search
  useEffect(() => {
    const searchFilter: TaskFilter = {
      ...initialFilter,
      search: searchQuery || undefined
    }
    setFilter(searchFilter)
  }, [searchQuery, initialFilter, setFilter])

  const handleCompleteTask = async (taskId: string) => {
    if (user?.uid) {
      await completeTask(taskId, user.uid)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setShowTaskForm(true)
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!user?.uid) return

    try {
      if (editingTask) {
        // Update existing task
        await updateTask(editingTask.id, taskData, user.uid)
      } else {
        // Create new task
        const newTaskData = {
          ...taskData,
          familyId: familyMember?.familyId || '',
          createdBy: user.uid,
          modifiedBy: user.uid,
          assignedTo: taskData.assignedTo || [user.uid],
          status: 'pending' as const,
          tags: taskData.tags || [],
          dueDate: taskData.dueDate as any,
        }
        await createTask(newTaskData as any)
      }
      setShowTaskForm(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const handleCancelTask = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const getListTitle = () => {
    if (smartListType && listConfig[smartListType]) {
      return listConfig[smartListType].title
    }
    return 'Inbox'
  }

  const getListIcon = () => {
    if (smartListType && listConfig[smartListType]) {
      const IconComponent = listConfig[smartListType].icon
      return <IconComponent className="w-6 h-6" />
    }
    return <Inbox className="w-6 h-6" />
  }

  // Filter tasks based on completion status
  const displayTasks = filteredTasks.filter(task => {
    if (smartListType === 'completed') return task.status === 'completed'
    if (showCompleted) return true
    return task.status !== 'completed'
  })

  const completedTasks = filteredTasks.filter(task => task.status === 'completed')

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button 
          onClick={clearError}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={cn(
                smartListType && listConfig[smartListType]?.color
              )}>
                {getListIcon()}
              </div>
              <h1 className="text-2xl font-semibold">{getListTitle()}</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : displayTasks.length === 0 && completedTasks.length === 0 ? (
          <div className="p-8 text-center">
            <Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No tasks match "${searchQuery}"`
                : 'All clear! Time to relax.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Active Tasks */}
            {displayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={handleCompleteTask}
                onEdit={handleEditTask}
                familyMembers={familyMembers}
              />
            ))}

            {/* Completed Tasks Section */}
            {completedTasks.length > 0 && smartListType !== 'completed' && (
              <div className="border-t border-border mt-4">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="w-full p-4 text-left text-sm text-muted-foreground hover:bg-muted transition-colors"
                >
                  {showCompleted ? 'Hide' : 'Show'} Completed ({completedTasks.length})
                </button>
                {showCompleted && completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                    onEdit={handleEditTask}
                    familyMembers={familyMembers}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Add Task Button */}
        <div className="p-4 border-t border-border">
          <button 
            onClick={handleCreateTask}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask || undefined}
          onSave={handleSaveTask}
          onCancel={handleCancelTask}
          familyMembers={familyMembers}
        />
      )}
    </div>
  )
}