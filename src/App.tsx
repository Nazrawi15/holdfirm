import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useYoVault } from './hooks/useYoVault'
import { useUSDCBalance } from './hooks/useUSDCBalance'
import { useCurrencyRate, CURRENCIES } from './hooks/useCurrencyRate'
import { useAccount } from 'wagmi'
import { DepositModal } from './components/DepositModal'
import { RedeemModal } from './components/RedeemModal'
import { InflationCounter } from './components/InflationCounter'
import { CurrencySelector } from './components/CurrencySelector'
import { GoalStack } from './components/GoalStack'
import { LockBox } from './components/LockBox'

function App() {
  const { apy, tvl, loading, error } = useYoVault()
  const { formatted: usdcBalance } = useUSDCBalance()
  const { isConnected } = useAccount()
  const [showDeposit, setShowDeposit] = useState(false)
  const [showRedeem, setShowRedeem] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState('NGN')
  const [activeMode, setActiveMode] = useState<'nestsave' | 'goalstack' | 'lockbox'>('nestsave')

  const { rate } = useCurrencyRate(selectedCurrency)
  const usdcBalanceNumber = parseFloat(usdcBalance)
  const localBalance = (usdcBalanceNumber * rate).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const selectedCurrencyData = CURRENCIES.find(c => c.code === selectedCurrency)

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-6 p-4">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">HoldFirm 🔒</h1>
        <p className="text-gray-400 mt-2">Save in dollars. Beat inflation.</p>
      </div>

      {/* Connect Wallet */}
      <ConnectButton />

      {/* Currency Selector */}
      <CurrencySelector
        selected={selectedCurrency}
        onChange={setSelectedCurrency}
      />

      {/* Inflation Counter */}
      {selectedCurrencyData && (
        <InflationCounter
          usdcBalance={usdcBalanceNumber}
          inflationRate={selectedCurrencyData.inflation}
          currencyCode={selectedCurrency}
          currencyRate={rate}
        />
      )}

      {/* USDC Balance */}
      {isConnected && (
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
          <p className="text-gray-400 text-sm">Your Savings</p>
          <p className="text-white text-3xl font-bold">
            ${usdcBalance} USDC
          </p>
          <p className="text-green-400 text-lg mt-1">
            {selectedCurrencyData?.flag} {selectedCurrency} {localBalance}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Earning {apy}% APY — protected from inflation
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowDeposit(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl"
            >
              Deposit
            </button>
            <button
              onClick={() => setShowRedeem(true)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl"
            >
              Withdraw
            </button>
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      {isConnected && (
        <div className="flex gap-2 w-full max-w-md">
          <button
            onClick={() => setActiveMode('nestsave')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm ${
              activeMode === 'nestsave'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            NestSave
          </button>
          <button
            onClick={() => setActiveMode('goalstack')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm ${
              activeMode === 'goalstack'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            GoalStack
          </button>
          <button
            onClick={() => setActiveMode('lockbox')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm ${
              activeMode === 'lockbox'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            LockBox
          </button>
        </div>
      )}

      {/* NestSave Mode */}
      {isConnected && activeMode === 'nestsave' && (
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-white font-bold text-xl mb-2">NestSave</h2>
          <p className="text-gray-400 text-sm mb-4">
            Your savings in dollars, earning yield every day.
          </p>
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 text-sm">APY</p>
              <p className="text-green-400 text-2xl font-bold">{apy}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">TVL</p>
              <p className="text-white text-2xl font-bold">${tvl}</p>
            </div>
          </div>
        </div>
      )}

      {/* GoalStack Mode */}
      {isConnected && activeMode === 'goalstack' && (
        <GoalStack
          currentBalance={usdcBalanceNumber}
          apy={apy}
        />
      )}

      {/* LockBox Mode */}
      {isConnected && activeMode === 'lockbox' && (
        <LockBox currentBalance={usdcBalanceNumber} />
      )}

      {/* Vault Data — always visible */}
      {!isConnected && (
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-white font-bold text-xl mb-4">YO Vault — yoUSD</h2>
          {loading && <p className="text-gray-400">Loading vault data...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!loading && !error && (
            <div className="flex justify-between">
              <div>
                <p className="text-gray-400 text-sm">APY</p>
                <p className="text-green-400 text-2xl font-bold">{apy}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">TVL</p>
                <p className="text-white text-2xl font-bold">${tvl}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showDeposit && (
        <DepositModal onClose={() => setShowDeposit(false)} />
      )}
      {showRedeem && (
        <RedeemModal onClose={() => setShowRedeem(false)} />
      )}

    </div>
  )
}

export default App