// app/components/ReferralShare.tsx
'use client'
import { 
  Copy, 
  Share2, 
  MessageCircle, 
  Send, 
  Mail, 
  QrCode,
  CheckCircle2,
  ExternalLink,
  Users,
  Gift,
  TrendingUp,
  Eye
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface ReferralLinkData {
  code: string
  link: string
  shortLink: string
  qrCode: string
}

interface ReferralStats {
  totalClicks: number
  uniqueClicks: number
  conversions: number
  conversionRate: number
  earnings: number
}

export default function ReferralShare() {
  const { user } = useAuth()
  const [referralData, setReferralData] = useState<ReferralLinkData | null>(null)
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadReferralData()
      loadReferralStats()
    }
  }, [user])

  const loadReferralData = async () => {
    try {
      const response = await fetch('/api/referral/data', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setReferralData(data)
      }
    } catch (error) {
      console.error('Error loading referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReferralStats = async () => {
    try {
      const response = await fetch('/api/referral/stats', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setReferralStats(data)
      }
    } catch (error) {
      console.error('Error loading referral stats:', error)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareViaWhatsApp = () => {
    if (!referralData) return
    
    const message = `Hey! 👋 I'm earning money with YBS - Young Billionaires Solutions! 💰

Join me and start earning KSH 300 for every person you refer. It's completely free to join!

Use my referral code: ${referralData.code}
Or click this link: ${referralData.link}

Let's make money together! 🚀`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const shareViaTelegram = () => {
    if (!referralData) return
    
    const message = `Join YBS with my referral code ${referralData.code} and start earning!`
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralData.link)}&text=${encodeURIComponent(message)}`
    window.open(telegramUrl, '_blank')
  }

  const shareViaEmail = () => {
    if (!referralData) return
    
    const subject = encodeURIComponent('Join YBS and Start Earning Money!')
    const body = encodeURIComponent(`Hey!

I'm earning money with YBS - Young Billionaires Solutions and thought you might be interested!

Here's what you get:
• KSH 50 welcome bonus
• Earn KSH 300 for every referral
• Multiple ways to earn money
• Instant withdrawals

Use my referral code: ${referralData.code}
Or click this link: ${referralData.link}

Let's make money together!

Best regards,
${user?.fullName}`)

    const emailUrl = `mailto:?subject=${subject}&body=${body}`
    window.open(emailUrl, '_blank')
  }

  const shareViaNative = async () => {
    if (!referralData) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join YBS - Young Billionaires Solutions',
          text: `Use my referral code ${referralData.code} to join YBS and start earning!`,
          url: referralData.link
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      copyToClipboard(referralData.link, 'link')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3 mb-6"></div>
          <div className="h-12 bg-slate-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-slate-200 rounded"></div>
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!referralData) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="text-center py-8">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Unable to Load Referral Data</h3>
          <p className="text-slate-600 text-sm">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Referral Stats */}
      {referralStats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Total Clicks</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{referralStats.totalClicks}</p>
            <p className="text-xs text-slate-600">{referralStats.uniqueClicks} unique</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-700">Conversions</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{referralStats.conversions}</p>
            <p className="text-xs text-slate-600">{referralStats.conversionRate.toFixed(1)}% rate</p>
          </div>
        </div>
      )}

      {/* Referral Code Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Your Referral Code</h3>
            <p className="text-sm text-slate-600">Share and earn KSH 300 per referral!</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Gift className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-2xl font-bold text-blue-800 tracking-wider">
              {referralData.code}
            </span>
            <button 
              onClick={() => copyToClipboard(referralData.code, 'code')}
              className={`p-3 rounded-lg transition-all duration-200 ${
                copySuccess === 'code'
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copySuccess === 'code' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {copySuccess === 'code' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-green-800 text-sm font-medium">✅ Referral code copied to clipboard!</p>
          </div>
        )}
      </div>

      {/* Referral Link Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Referral Link</h3>
            <p className="text-sm text-slate-600">Direct link to registration with your code</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <ExternalLink className="w-6 h-6 text-green-600" />
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700 font-mono truncate pr-2">
              {referralData.shortLink}
            </span>
            <button 
              onClick={() => copyToClipboard(referralData.link, 'link')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                copySuccess === 'link'
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-600 text-white hover:bg-slate-700'
              }`}
            >
              {copySuccess === 'link' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {copySuccess === 'link' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-green-800 text-sm font-medium">✅ Referral link copied to clipboard!</p>
          </div>
        )}
      </div>

      {/* Share Options */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Share Your Referral</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={shareViaWhatsApp}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp</span>
          </button>
          
          <button 
            onClick={shareViaTelegram}
            className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            <Send className="w-5 h-5" />
            <span>Telegram</span>
          </button>
          
          <button 
            onClick={shareViaEmail}
            className="flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Email</span>
          </button>
          
          <button 
            onClick={shareViaNative}
            className="flex items-center justify-center space-x-2 bg-slate-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-slate-700 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>More</span>
          </button>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">QR Code</h3>
            <p className="text-sm text-slate-600">Let others scan to join instantly</p>
          </div>
          <QrCode className="w-6 h-6 text-slate-600" />
        </div>
        
        <div className="text-center">
          <img 
            src={referralData.qrCode} 
            alt="Referral QR Code" 
            className="mx-auto mb-4 rounded-xl"
            width={200}
            height={200}
          />
          <p className="text-xs text-slate-500">Scan with any QR code reader</p>
        </div>
      </div>
    </div>
  )
}