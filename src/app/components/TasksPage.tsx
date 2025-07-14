// app/components/TasksPage.tsx
'use client'
import { CheckCircle, Clock, Gift, Target, Users, TrendingUp, Calendar } from 'lucide-react'

export default function TasksPage() {
  const dailyTasks = [
    { id: 1, title: 'Share referral code on social media', reward: 50, completed: true, icon: Users },
    { id: 2, title: 'Complete daily login', reward: 20, completed: true, icon: CheckCircle },
    { id: 3, title: 'Watch 3 promotional videos', reward: 30, completed: false, icon: Clock },
    { id: 4, title: 'Invite 1 new member', reward: 100, completed: false, icon: Gift },
  ]

  const weeklyTasks = [
    { id: 1, title: 'Refer 5 new members', reward: 500, progress: 60, icon: Target },
    { id: 2, title: 'Complete 10 daily tasks', reward: 200, progress: 80, icon: TrendingUp },
    { id: 3, title: 'Promote 3 products', reward: 300, progress: 33, icon: Users },
  ]

  const completedTasks = [
    { id: 1, title: 'First referral bonus', reward: 300, date: '2024-01-15', icon: Gift },
    { id: 2, title: 'Social media share', reward: 50, date: '2024-01-15', icon: Users },
    { id: 3, title: 'Profile completion', reward: 100, date: '2024-01-14', icon: CheckCircle },
  ]

  const TaskCard = ({ task, type = 'daily' }: { task: any, type?: string }) => {
    const Icon = task.icon
    
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
              <h3 className="font-medium text-slate-800">{task.title}</h3>
              {type === 'weekly' && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              )}
              {type === 'completed' && (
                <p className="text-sm text-slate-500 mt-1">
                  Completed on {new Date(task.date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-green-600">
              +KSH {task.reward}
            </span>
            {type === 'daily' && (
              <div className="mt-1">
                {task.completed ? (
                  <span className="text-xs text-green-600 font-medium">Completed</span>
                ) : (
                  <button className="text-xs text-blue-600 font-medium hover:underline">
                    Start Task
                  </button>
                )}
              </div>
            )}
          </div>
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
        <div className="mt-4 bg-white/20 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Today's Progress</span>
            <span className="text-sm font-semibold">2/4 Completed</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2 mt-2">
            <div className="bg-white h-2 rounded-full w-1/2" />
          </div>
        </div>
      </div>

      {/* Daily Tasks */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Daily Tasks</h2>
        {dailyTasks.map((task) => (
          <TaskCard key={task.id} task={task} type="daily" />
        ))}
      </div>

      {/* Weekly Tasks */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Weekly Challenges</h2>
        {weeklyTasks.map((task) => (
          <TaskCard key={task.id} task={task} type="weekly" />
        ))}
      </div>

      {/* Completed Tasks */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Recently Completed</h2>
        {completedTasks.map((task) => (
          <TaskCard key={task.id} task={task} type="completed" />
        ))}
      </div>
    </div>
  )
}