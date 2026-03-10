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
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#111827', fontWeight: 800, fontSize: '20px', margin: 0 }}>GoalStack</h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0 0' }}>Track your savings toward a target.</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            color: '#374151',
            fontSize: '13px',
            fontWeight: 600,
            padding: '7px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {isEditing ? 'Done' : 'Edit Goal'}
        </button>
      </div>

      {/* Edit Mode */}
      {isEditing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div>
            <p style={{ color: '#374151', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Goal name</p>
            <input
              type="text"
              value={goalName}
              onChange={e => setGoalName(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                color: '#111827',
                borderRadius: '10px',
                padding: '11px 14px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <p style={{ color: '#374151', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Target amount (USD)</p>
            <input
              type="number"
              value={goalAmount}
              onChange={e => setGoalAmount(Number(e.target.value))}
              style={{
                width: '100%',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                color: '#111827',
                borderRadius: '10px',
                padding: '11px 14px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <p style={{ color: '#374151', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Target date</p>
            <input
              type="date"
              value={goalDate}
              onChange={e => setGoalDate(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                color: '#111827',
                borderRadius: '10px',
                padding: '11px 14px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      )}

      {/* Goal Name */}
      {!isEditing && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', margin: '0 0 4px 0' }}>SAVING FOR</p>
          <p style={{ color: '#111827', fontSize: '22px', fontWeight: 700, margin: 0 }}>{goalName}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#6b7280', fontSize: '13px' }}>Progress</span>
          <span style={{ color: '#111827', fontWeight: 700, fontSize: '13px' }}>{progress.toFixed(1)}%</span>
        </div>
        <div style={{
          width: '100%',
          backgroundColor: '#e5e7eb',
          borderRadius: '100px',
          height: '10px',
        }}>
          <div style={{
            height: '10px',
            borderRadius: '100px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            width: `${progress}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '14px' }}>${currentBalance.toFixed(2)}</span>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>Goal: ${goalAmount}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          flex: 1,
          backgroundColor: '#f9fafb',
          border: '1px solid #f3f4f6',
          borderRadius: '14px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#111827', fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0' }}>{daysLeft}</p>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Days left</p>
        </div>
        <div style={{
          flex: 1,
          backgroundColor: '#f9fafb',
          border: '1px solid #f3f4f6',
          borderRadius: '14px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#111827', fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0' }}>${projectedBalance.toFixed(2)}</p>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Projected</p>
        </div>
      </div>

      {/* Status Message */}
      {willReachGoal ? (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '14px',
        }}>
          <p style={{ color: '#15803d', fontSize: '14px', fontWeight: 600, margin: 0 }}>
            ✅ On track to reach your goal by {new Date(goalDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#fefce8',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '14px',
        }}>
          <p style={{ color: '#92400e', fontSize: '14px', fontWeight: 600, margin: 0 }}>
            ⚠️ Deposit more to reach ${goalAmount} by your deadline
          </p>
        </div>
      )}
    </div>
  )
}