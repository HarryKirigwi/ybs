// app/components/EarningsCard.tsx
interface EarningsCardProps {
  title: string
  count: number
  earnings: number
  rate: string
  bgColor: string
}

export default function EarningsCard({ title, count, earnings, rate, bgColor }: EarningsCardProps) {
  return (
    <div className={`${bgColor} rounded-xl shadow-lg p-4 text-white`}>
      <h4 className="text-sm font-medium mb-2 opacity-90">{title}</h4>
      <div className="space-y-1">
        <p className="text-2xl font-bold">{count}</p>
        <p className="text-sm opacity-90">Ksh {earnings.toLocaleString()}</p>
        <p className="text-xs opacity-75">{rate} per referral</p>
      </div>
    </div>
  )
}