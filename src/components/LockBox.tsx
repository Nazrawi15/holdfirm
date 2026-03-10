import { useState } from 'react'

interface LockBoxProps {
  currentBalance: number
}

export function LockBox({ currentBalance }: LockBoxProps) {
  const [isLocked, setIsLocked] = useState(false)
  const [lockDays, setLockDays] = useState(30)
  const [lockDate, setLockDate] = useState<Date | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  function handleLock() {
    const unlock = new Date()
    unlock.setDate(unlock.getDate() + lockDays)
    setLockDate(unlock)
    setIsLocked(true)
    setShowWarning(false)
  }

  function handleUnlock() {
    setShowWarning(true)
  }

  function confirmUnlock() {
    setIsLocked(false)
    setLockDate(null)
    setShowWarning(false)
  }

  const daysRemaining = lockDate
    ? Math.ceil((lockDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const progressPercent = lockDate
    ? Math.max(0, ((lockDays - daysRemaining) / lockDays) * 100)
    : 0

  return (
    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-bold text-xl">LockBox</h2>
        <span className="text-2xl">{isLocked ? '🔒' : '🔓'}</span>
      </div>

      {/* Not Locked */}
      {!isLocked && (
        <div>
          <p className="text-gray-400 text-sm mb-4">
            Lock your savings for a set period. Commitment builds wealth.
          </p>

          <p className="text-gray-400 text-sm mb-2">Choose lock duration</p>
          <div className="flex gap-3 mb-6">
            {[30, 60, 90].map(days => (
              <button
                key={days}
                onClick={() => setLockDays(days)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm ${
                  lockDays === days
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          <div className="bg-gray-700 rounded-xl p-4 mb-6">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-400 text-sm">Locking</p>
                <p className="text-white font-bold text-lg">${currentBalance.toFixed(2)} USDC</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Unlock date</p>
                <p className="text-white font-bold text-lg">
                  {new Date(
                    new Date().setDate(new Date().getDate() + lockDays)
                  ).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLock}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-lg"
          >
            Lock My Savings
          </button>
        </div>
      )}

      {/* Locked State */}
      {isLocked && !showWarning && (
        <div>
          <div className="text-center mb-6">
            <p className="text-6xl mb-2">🔒</p>
            <p className="text-white text-2xl font-bold">{daysRemaining} days</p>
            <p className="text-gray-400 text-sm">until unlock</p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Lock progress</span>
              <span className="text-white">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-700 rounded-xl p-4 mb-6">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-400 text-sm">Locked amount</p>
                <p className="text-white font-bold">${currentBalance.toFixed(2)} USDC</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Unlock date</p>
                <p className="text-white font-bold">
                  {lockDate?.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-900 bg-opacity-40 border border-green-500 rounded-xl p-3 mb-4">
            <p className="text-green-400 text-sm font-semibold">
              Your savings are locked and earning yield every day
            </p>
          </div>

          <button
            onClick={handleUnlock}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-400 font-bold py-3 rounded-xl text-sm"
          >
            Unlock Early
          </button>
        </div>
      )}

      {/* Warning State */}
      {showWarning && (
        <div>
          <div className="text-center mb-6">
            <p className="text-4xl mb-2">⚠️</p>
            <p className="text-white text-xl font-bold">Unlock early?</p>
            <p className="text-gray-400 text-sm mt-2">
              You still have {daysRemaining} days remaining on your commitment.
              Breaking the lock early reduces your savings discipline.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowWarning(false)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl"
            >
              Keep Locked
            </button>
            <button
              onClick={confirmUnlock}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-400 font-bold py-3 rounded-xl"
            >
              Unlock
            </button>
          </div>
        </div>
      )}

    </div>
  )
}