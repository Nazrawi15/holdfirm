import { useEffect, useState } from 'react'

export default function SavingsStreak() {
  const [streak, setStreak] = useState(0)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  useEffect(() => {
    const storedStreak = parseInt(localStorage.getItem('hf_streak') || '0')
    const storedDate = localStorage.getItem('hf_last_saved')
    setStreak(storedStreak)
    setLastSaved(storedDate)
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const isActive = lastSaved === today || lastSaved === yesterday

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
      <div className="text-4xl mb-2">🔥</div>
      <div className="text-5xl font-bold text-green-400 mb-1">{streak}</div>
      <div className="text-gray-400 text-sm mb-3">Day Saving Streak</div>
      {streak === 0 && (
        <p className="text-gray-500 text-xs">Make your first deposit to start your streak</p>
      )}
      {streak > 0 && isActive && (
        <p className="text-green-400 text-xs">🟢 Streak alive — keep it going!</p>
      )}
      {streak > 0 && !isActive && (
        <p className="text-yellow-400 text-xs">⚠️ Save today to keep your streak!</p>
      )}
    </div>
  )
}

export function recordSavingToday() {
  const today = new Date().toISOString().split('T')[0]
  const lastSaved = localStorage.getItem('hf_last_saved')
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  let streak = parseInt(localStorage.getItem('hf_streak') || '0')

  if (lastSaved === today) return // already recorded today
  if (lastSaved === yesterday) streak += 1 // continued streak
  else streak = 1 // reset streak

  localStorage.setItem('hf_streak', String(streak))
  localStorage.setItem('hf_last_saved', today)
}