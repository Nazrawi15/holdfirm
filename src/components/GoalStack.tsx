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
    <div style={{
      backgroundColor: '#111827',
      borderRadius: '24px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'white', fontWeight: 800, fontSize: '20px' }}>GoalStack</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#9ca3af',
            fontSize: '13px',
            padding: '6px 14px',
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
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '6px' }}>Goal name</p>
            <input
              type="text"
              value={goalName}
              onChange={e => setGoalName(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#1f2937',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '6px' }}>Target amount (USD)</p>
            <input
              type="number"
              value={goalAmount}
              onChange={e => setGoalAmount(Number(e.target.value))}
              style={{
                width: '100%',
                backgroundColor: '#1f2937',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '6px' }}>Target date</p>
            <input
              type="date"
              value={goalDate}
              onChange={e => setGoalDate(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#1f2937',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: '12px',
                padding: '12px',
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
          <p style={{ color: '#6b7280', fontSize: '13px' }}>Saving for</p>
          <p style={{ color: 'white', fontSize: '22px', fontWeight: 700 }}>{goalName}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#6b7280', fontSize: '13px' }}>Progress</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{progress.toFixed(1)}%</span>
        </div>
        <div style={{
          width: '100%',
          backgroundColor: '#1f2937',
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
          <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '14px' }}>${currentBalance.toFixed(2)}</span>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>Goal: ${goalAmount}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          flex: 1,
          backgroundColor: '#1f2937',
          borderRadius: '16px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>{daysLeft}</p>
          <p style={{ color: '#6b7280', fontSize: '12px' }}>Days left</p>
        </div>
        <div style={{
          flex: 1,
          backgroundColor: '#1f2937',
          borderRadius: '16px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>${projectedBalance.toFixed(2)}</p>
          <p style={{ color: '#6b7280', fontSize: '12px' }}>Projected</p>
        </div>
      </div>

      {/* Status Message */}
      {willReachGoal ? (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '14px',
          padding: '14px',
        }}>
          <p style={{ color: '#22c55e', fontSize: '14px', fontWeight: 600 }}>
            On track to reach your goal by {new Date(goalDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'rgba(234, 179, 8, 0.08)',
          border: '1px solid rgba(234, 179, 8, 0.2)',
          borderRadius: '14px',
          padding: '14px',
        }}>
          <p style={{ color: '#eab308', fontSize: '14px', fontWeight: 600 }}>
            Deposit more to reach ${goalAmount} by your deadline
          </p>
        </div>
      )}

    </div>
  )
}