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
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-1">⏰ Recurring Save Reminder</h3>
      <p className="text-gray-400 text-sm mb-4">Pick a day each week to save. Build the habit.</p>

      {showNudge && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4 text-yellow-400 text-sm">
          🔔 Today is your saving day! Don't break the habit — deposit now.
        </div>
      )}

      {!saved ? (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedDay === i
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={selectedDay === null}
            className="w-full py-2 rounded-lg bg-green-500 text-black font-semibold text-sm disabled:opacity-40"
          >
            Set Reminder
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-green-400 text-sm">
            ✅ Reminder set for every <span className="font-bold">{DAYS[selectedDay!]}</span>
          </p>
          <button onClick={handleReset} className="text-gray-500 text-xs hover:text-gray-300">
            Change
          </button>
        </div>
      )}
    </div>
  )
}