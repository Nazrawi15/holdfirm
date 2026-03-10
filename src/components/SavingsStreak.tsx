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
    <div style={{
      backgroundColor: '#f9fafb',
      border: '1px solid #f3f4f6',
      borderRadius: '16px',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔥</div>
      <div style={{ color: '#111827', fontSize: '48px', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>{streak}</div>
      <div style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Day Saving Streak</div>
      {streak === 0 && (
        <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Make your first deposit to start your streak</p>
      )}
      {streak > 0 && isActive && (
        <p style={{ color: '#15803d', fontSize: '12px', fontWeight: 600, margin: 0 }}>🟢 Streak alive — keep it going!</p>
      )}
      {streak > 0 && !isActive && (
        <p style={{ color: '#92400e', fontSize: '12px', fontWeight: 600, margin: 0 }}>⚠️ Save today to keep your streak!</p>
      )}
    </div>
  )
}

export function recordSavingToday() {
  const today = new Date().toISOString().split('T')[0]
  const lastSaved = localStorage.getItem('hf_last_saved')
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  let streak = parseInt(localStorage.getItem('hf_streak') || '0')

  if (lastSaved === today) return
  if (lastSaved === yesterday) streak += 1
  else streak = 1

  localStorage.setItem('hf_streak', String(streak))
  localStorage.setItem('hf_last_saved', today)
}