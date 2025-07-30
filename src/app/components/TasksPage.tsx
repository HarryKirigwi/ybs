// app/components/TasksPage.tsx
'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Target, Users, TrendingUp, Calendar, Share2, Play, UserPlus, Award } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

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

interface WeeklyChallenge {
  id: string
  name: string
  description: string
  target: number
  current: number
  completed: boolean
  reward: number
  rewardClaimed: boolean
  progressPercentage: number
}

interface WeeklyTasksResponse {
  success: boolean
  message: string
  data: {
    challenges: WeeklyChallenge[]
    weekPeriod: {
      start: string
      end: string
    }
    totalRewardEarned: number
  }
}

interface TasksPageProps {
  setActiveTab: (tab: string) => void
}

export default function TasksPage({ setActiveTab }: TasksPageProps) {
  const { isAuthenticated } = useAuth()
  const [dailyTasks, setDailyTasks] = useState<Task[]>([])
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([])
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
    if (!isAuthenticated) return

    try {
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
    }
  }

  // Fetch weekly challenges
  const fetchWeeklyChallenges = async () => {
    if (!isAuthenticated) return

    try {
      const response = await fetch(apiUrl('/tasks/weekly'), {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: WeeklyTasksResponse = await response.json()

      if (result.success && result.data) {
        setWeeklyChallenges(result.data.challenges)
      } else {
        setError(result.message || 'Failed to fetch weekly challenges')
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred')
      console.error('Error fetching weekly challenges:', err)
    }
  }

  // Load tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      setError(null)
      
      try {
        await Promise.all([fetchDailyTasks(), fetchWeeklyChallenges()])
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchTasks()
    }
  }, [isAuthenticated])

  // Get icon for daily task
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

  // Get icon for weekly challenge
  const getWeeklyChallengeIcon = (challengeId: string) => {
    switch (challengeId) {
      case 'refer5Members':
        return Users
      case 'complete10Tasks':
        return CheckCircle
      case 'promote3Products':
        return TrendingUp
      default:
        return Award
    }
  }

  // Handle task button click - navigate to dashboard
  const handleTaskClick = (taskId: string) => {
    // Navigate to dashboard where users can complete these tasks
    setActiveTab('home')
  }

  // Handle weekly challenge click - navigate to dashboard
  const handleWeeklyChallengeClick = (challengeId: string) => {
    // Navigate to dashboard where users can complete these challenges
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

  const WeeklyChallengeCard = ({ challenge }: { challenge: WeeklyChallenge }) => {
    const Icon = getWeeklyChallengeIcon(challenge.id)
    
    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              challenge.completed ? 'bg-green-100' : 'bg-purple-100'
            }`}>
              <Icon className={`w-5 h-5 ${
                challenge.completed ? 'text-green-600' : 'text-purple-600'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-800">{challenge.name}</h3>
              <p className="text-sm text-slate-600 mt-1">{challenge.description}</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                  <span>Progress</span>
                  <span>{challenge.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      challenge.completed ? 'bg-green-600' : 'bg-purple-600'
                    }`}
                    style={{ width: `${challenge.progressPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {challenge.current}/{challenge.target} completed
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            {challenge.completed ? (
              <span className="text-xs text-green-600 font-medium">Completed</span>
            ) : (
              <button 
                onClick={() => handleWeeklyChallengeClick(challenge.id)}
                className="text-xs text-purple-600 font-medium hover:underline"
              >
                Start Challenge
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
          <p className="text-slate-600">Loading tasks...</p>
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
            onClick={() => {
              setLoading(true)
              Promise.all([fetchDailyTasks(), fetchWeeklyChallenges()]).finally(() => setLoading(false))
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Separate completed and active challenges
  const activeChallenges = weeklyChallenges.filter(challenge => !challenge.completed)
  const completedChallenges = weeklyChallenges.filter(challenge => challenge.completed)

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

      {/* Weekly Challenges */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Weekly Challenges</h2>
        {activeChallenges.length > 0 ? (
          activeChallenges.map((challenge) => (
            <WeeklyChallengeCard key={challenge.id} challenge={challenge} />
          ))
        ) : (
          <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
            <p className="text-slate-600">No active weekly challenges at the moment.</p>
          </div>
        )}
      </div>

      {/* Completed Weekly Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Recently Completed</h2>
          {completedChallenges.map((challenge) => (
            <WeeklyChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">How to Complete Tasks</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• <strong>Share Referral Code:</strong> Go to Dashboard and share your referral code on social media</p>
          <p>• <strong>Daily Login:</strong> Automatically completed when you log in</p>
          <p>• <strong>Watch Videos:</strong> Visit the Dashboard to watch promotional videos</p>
          <p>• <strong>Invite Members:</strong> Share your referral code to invite new members</p>
          <p>• <strong>Weekly Challenges:</strong> Complete daily tasks and refer members to earn weekly rewards</p>
        </div>
      </div>
    </div>
  )
}