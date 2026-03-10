import { useState } from 'react'

interface GoalStackProps {
  currentBalance: number
  apy: string
}

export function GoalStack({ currentBalance, apy }: GoalStackProps) {
  const [goalAmount, setGoalAmount] = useState(250)
  const [goalName, setGoalName] = useState('School fees')
  const [goalDate, setGoalDate] = useState('2026-07-31')
  const [isEditing, setIsEditing] = useState(false)

  const progress = Math.min((currentBalance / goalAmount) * 100, 100)

  const today = new Date()
  const deadline = new Date(goalDate)
  const daysLeft = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  const apyNumber = parseFloat(apy) / 100
  const dailyRate = apyNumber / 365
  const projectedBalance = currentBalance * Math.pow(1 + dailyRate, daysLeft)
  const willReachGoal = projectedBalance >= goalAmount

  return (
    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-bold text-xl">GoalStack</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-gray-400 text-sm hover:text-white"
        >
          {isEditing ? 'Done' : 'Edit Goal'}
        </button>
      </div>

      {/* Edit Mode */}
      {isEditing && (
        <div className="mb-4 flex flex-col gap-3">
          <div>
            <p className="text-gray-400 text-sm mb-1">Goal name</p>
            <input
              type="text"
              value={goalName}
              onChange={e => setGoalName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-xl p-3 outline-none"
            />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Target amount (USD)</p>
            <input
              type="number"
              value={goalAmount}
              onChange={e => setGoalAmount(Number(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-xl p-3 outline-none"
            />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Target date</p>
            <input
              type="date"
              value={goalDate}
              onChange={e => setGoalDate(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-xl p-3 outline-none"
            />
          </div>
        </div>
      )}

      {/* Goal Display */}
      {!isEditing && (
        <div className="mb-4">
          <p className="text-gray-400 text-sm">Saving for</p>
          <p className="text-white text-xl font-bold">{goalName}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-white font-bold">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-green-400 font-bold">${currentBalance.toFixed(2)}</span>
          <span className="text-gray-400">Goal: ${goalAmount}</span>
        </div>
      </div>

      {/* Countdown */}
      <div className="flex justify-between mb-4">
        <div className="bg-gray-700 rounded-xl p-3 flex-1 mr-2 text-center">
          <p className="text-white text-2xl font-bold">{daysLeft}</p>
          <p className="text-gray-400 text-sm">Days left</p>
        </div>
        <div className="bg-gray-700 rounded-xl p-3 flex-1 ml-2 text-center">
          <p className="text-white text-2xl font-bold">
            ${projectedBalance.toFixed(2)}
          </p>
          <p className="text-gray-400 text-sm">Projected by deadline</p>
        </div>
      </div>

      {/* Projection Message */}
      {willReachGoal ? (
        <div className="bg-green-900 bg-opacity-40 border border-green-500 rounded-xl p-3">
          <p className="text-green-400 text-sm font-semibold">
            You are on track to reach your goal by {new Date(goalDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      ) : (
        <div className="bg-yellow-900 bg-opacity-40 border border-yellow-500 rounded-xl p-3">
          <p className="text-yellow-400 text-sm font-semibold">
            Deposit more to reach ${goalAmount} by your deadline
          </p>
        </div>
      )}

    </div>
  )
}