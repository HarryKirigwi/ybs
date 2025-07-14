// app/components/ReferralCard.tsx
'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ReferralCardProps {
  referralCode: string
  onCopy: () => void
}

export default function ReferralCard({ referralCode, onCopy }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Your Referral Code</h3>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Copy className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      
      <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4 mb-4">
        <span className="text-xl font-mono font-bold text-slate-800 tracking-wider">
          {referralCode}
        </span>
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      
      <p className="text-sm text-slate-600">
        Share this code with friends and family to start earning commissions!
      </p>
    </div>
  )
}