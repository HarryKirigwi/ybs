// app/components/TasksPage.tsx
'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Target, Users, TrendingUp, Calendar, Share2, Play, UserPlus } from 'lucide-react'

interface Task {
  id: string
  name: string
  description: string
  completed: boolean
  points: number
}

interface TaskSummary {
  totalTasks: number
  completedTasks: number
  completionPercentage: number
  date: string
}

interface DailyTasksResponse {
  success: boolean
  message: string
  data: {
    tasks: Task[]
    summary: TaskSummary
  }
}

interface TasksPageProps {
  setActiveTab: (tab: string) => void
}

export default function TasksPage({ setActiveTab }: TasksPageProps) {
  const [dailyTasks, setDailyTasks] = useState<Task[]>([])
  const [summary, setSummary] = useState<TaskSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API utility function
  const apiUrl = (path: string) => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    if (path.startsWith('http')) return path
    return `${BACKEND_URL}${path}`
  }

  // Fetch daily tasks
  const fetchDailyTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(apiUrl('/tasks/daily'), {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: DailyTasksResponse = await response.json()

      if (result.success && result.data) {
        setDailyTasks(result.data.tasks)
        setSummary(result.data.summary)
      } else {
        setError(result.message || 'Failed to fetch daily tasks')
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred')
      console.error('Error fetching daily tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load tasks on component mount
  useEffect(() => {
    fetchDailyTasks()
  }, [])

  // Get icon for task
  const getTaskIcon = (taskId: string) => {
    switch (taskId) {
      case 'shareReferral':
        return Share2
      case 'dailyLogin':
        return CheckCircle
      case 'watchVideos':
        return Play
      case 'inviteMember':
        return UserPlus
      default:
        return Target
    }
  }

  // Handle task button click - navigate to dashboard
  const handleTaskClick = (taskId: string) => {
    // Navigate to dashboard where users can complete these tasks
    setActiveTab('home')
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const Icon = getTaskIcon(task.id)
    
    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              task.completed ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <Icon className={`w-5 h-5 ${
                task.completed ? 'text-green-600' : 'text-blue-600'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-800">{task.name}</h3>
              <p className="text-sm text-slate-600 mt-1">{task.description}</p>
            </div>
          </div>
          <div className="text-right">
            {task.completed ? (
              <span className="text-xs text-green-600 font-medium">Completed</span>
            ) : (
              <button 
                onClick={() => handleTaskClick(task.id)}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                Start Task
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading daily tasks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDailyTasks}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6" />
          <div>
            <h1 className="text-xl font-bold">Daily Tasks</h1>
            <p className="text-blue-100 text-sm">Complete tasks to earn rewards</p>
          </div>
        </div>
        {summary && (
          <div className="mt-4 bg-white/20 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Today's Progress</span>
              <span className="text-sm font-semibold">
                {summary.completedTasks}/{summary.totalTasks} Completed
              </span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2 mt-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300" 
                style={{ width: `${summary.completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Daily Tasks */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Daily Tasks</h2>
        {dailyTasks.length > 0 ? (
          dailyTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
            <p className="text-slate-600">No daily tasks available at the moment.</p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">How to Complete Tasks</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• <strong>Share Referral Code:</strong> Go to Dashboard and share your referral code on social media</p>
          <p>• <strong>Daily Login:</strong> Automatically completed when you log in</p>
          <p>• <strong>Watch Videos:</strong> Visit the Dashboard to watch promotional videos</p>
          <p>• <strong>Invite Members:</strong> Share your referral code to invite new members</p>
        </div>
      </div>
    </div>
  )
}