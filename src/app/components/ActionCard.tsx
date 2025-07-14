// app/components/ActionCard.tsx
import { ReactNode } from 'react'

interface ActionCardProps {
  title: string
  description: string
  icon: ReactNode
  buttonText: string
  buttonColor: string
  onClick: () => void
}

export default function ActionCard({ 
  title, 
  description, 
  icon, 
  buttonText, 
  buttonColor,
  onClick 
}: ActionCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      
      <button
        onClick={onClick}
        className={`w-full ${buttonColor} text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105`}
      >
        {buttonText}
      </button>
    </div>
  )
}