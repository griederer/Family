'use client'

import { useState, useEffect } from 'react'
import { TaskCard } from './TaskCard'
import { Task, TaskFilter, TaskSort, SmartListType } from '@/lib/types/task'
import { useTaskStore } from '@/lib/store/useTaskStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  Filter, 
  SortAsc, 
  List, 
  Grid3X3,
  MoreHorizontal,
  CheckSquare,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface TaskListProps {
  smartListType?: SmartListType
  initialFilter?: TaskFilter
  showHeader?: boolean
  showCreateButton?: boolean
}

const smartListConfig = {
  today: { 
    title: 'Today', 
    icon: Calendar, 
    description: 'Tasks due today',
    color: 'text-blue-500'
  },
  this_week: { 
    title: 'This Week', 
    icon: Calendar, 
    description: 'Tasks due this week',
    color: 'text-green-500'
  },
  overdue: { 
    title: 'Overdue', 
    icon: AlertCircle, 
    description: 'Tasks past due date',
    color: 'text-red-500'
  },
  assigned_to_me: { 
    title: 'My Tasks', 
    icon: User, 
    description: 'Tasks assigned to you',
    color: 'text-purple-500'
  },
  high_priority: { 
    title: 'High Priority', 
    icon: AlertCircle, 
    description: 'Urgent and high priority tasks',
    color: 'text-orange-500'
  },
  completed: { 
    title: 'Completed', 
    icon: CheckSquare, 
    description: 'Recently completed tasks',
    color: 'text-green-600'
  }
}

export function TaskList({ 
  smartListType, 
  initialFilter, 
  showHeader = true, 
  showCreateButton = true 
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  
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
    setFilter,
    clearError
  } = useTaskStore()

  // Mock family members - in real app, this would come from family store
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
    // TODO: Open edit modal
    console.log('Edit task:', task)
  }

  const handleDeleteTask = (taskId: string) => {
    // TODO: Implement delete with confirmation
    console.log('Delete task:', taskId)
  }

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const getListTitle = () => {
    if (smartListType) {
      return smartListConfig[smartListType].title
    }
    return 'Tasks'
  }

  const getListDescription = () => {
    if (smartListType) {
      return smartListConfig[smartListType].description
    }
    return 'Manage your family tasks'
  }

  const getListIcon = () => {
    if (smartListType) {
      const IconComponent = smartListConfig[smartListType].icon
      return <IconComponent className="w-6 h-6" />
    }
    return <CheckSquare className="w-6 h-6" />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={clearError}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'p-2 rounded-lg',
              smartListType ? smartListConfig[smartListType].color : 'text-primary'
            )}>
              {getListIcon()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{getListTitle()}</h1>
              <p className="text-muted-foreground">{getListDescription()}</p>
            </div>
          </div>
          
          {showCreateButton && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter and Sort */}
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <SortAsc className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task Count */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          {selectedTasks.length > 0 && ` • ${selectedTasks.length} selected`}
        </span>
        {selectedTasks.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Complete Selected
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading tasks...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No tasks match "${searchQuery}"`
                : 'Get started by creating your first task'
              }
            </p>
            {showCreateButton && !searchQuery && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Task Grid/List */}
      {!loading && filteredTasks.length > 0 && (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        )}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleCompleteTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onSelect={handleSelectTask}
              isSelected={selectedTasks.includes(task.id)}
              familyMembers={familyMembers}
            />
          ))}
        </div>
      )}
    </div>
  )
}