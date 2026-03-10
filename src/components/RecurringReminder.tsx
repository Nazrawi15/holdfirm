import { useEffect, useState } from 'react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function RecurringReminder() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const [showNudge, setShowNudge] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('hf_reminder_day')
    const lastSaved = localStorage.getItem('hf_last_saved')
    if (stored !== null) {
      setSelectedDay(parseInt(stored))
      setSaved(true)
      const today = new Date().getDay()
      const todayDate = new Date().toISOString().split('T')[0]
      if (parseInt(stored) === today && lastSaved !== todayDate) {
        setShowNudge(true)
      }
    }
  }, [])

  const handleSave = () => {
    if (selectedDay === null) return
    localStorage.setItem('hf_reminder_day', String(selectedDay))
    setSaved(true)
    setShowNudge(false)
  }

  const handleReset = () => {
    localStorage.removeItem('hf_reminder_day')
    setSelectedDay(null)
    setSaved(false)
    setShowNudge(false)
  }

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      border: '1px solid #f3f4f6',
      borderRadius: '16px',
      padding: '24px',
    }}>
      <h3 style={{ color: '#111827', fontWeight: 700, fontSize: '16px', margin: '0 0 4px 0' }}>
        ⏰ Recurring Save Reminder
      </h3>
      <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 16px 0' }}>
        Pick a day each week to save. Build the habit.
      </p>

      {showNudge && (
        <div style={{
          backgroundColor: '#fefce8',
          border: '1px solid #fde68a',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '14px',
          color: '#92400e',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          🔔 Today is your saving day! Don't break the habit — deposit now.
        </div>
      )}

      {!saved ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
          }}>
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedDay === i ? '2px solid #22c55e' : '1px solid #e5e7eb',
                  backgroundColor: selectedDay === i ? '#f0fdf4' : 'white',
                  color: selectedDay === i ? '#15803d' : '#6b7280',
                }}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={selectedDay === null}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              background: selectedDay === null
                ? '#e5e7eb'
                : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: selectedDay === null ? '#9ca3af' : 'white',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: selectedDay === null ? 'not-allowed' : 'pointer',
            }}
          >
            Set Reminder
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: '#15803d', fontSize: '14px', fontWeight: 600, margin: 0 }}>
            ✅ Reminder set for every <strong>{DAYS[selectedDay!]}</strong>
          </p>
          <button
            onClick={handleReset}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Change
          </button>
        </div>
      )}
    </div>
  )
}