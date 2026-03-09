import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useYoVault } from './hooks/useYoVault'
import { useUSDCBalance } from './hooks/useUSDCBalance'
import { useAccount } from 'wagmi'
import { DepositModal } from './components/DepositModal'

function App() {
  const { apy, tvl, loading, error } = useYoVault()
  const { formatted: usdcBalance } = useUSDCBalance()
  const { isConnected } = useAccount()
  const [showDeposit, setShowDeposit] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-8 p-4">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">HoldFirm 🔒</h1>
        <p className="text-gray-400 mt-2">Save in dollars. Beat inflation.</p>
      </div>

      {/* Connect Wallet */}
      <ConnectButton />

      {/* USDC Balance */}
      {isConnected && (
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
          <p className="text-gray-400 text-sm">Your USDC Balance</p>
          <p className="text-white text-3xl font-bold">${usdcBalance} USDC</p>
          <button
            onClick={() => setShowDeposit(true)}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-lg"
          >
            Deposit into YO Vault
          </button>
        </div>
      )}

      {/* Vault Data */}
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-white font-bold text-xl mb-4">YO Vault — yoUSD</h2>

        {loading && (
          <p className="text-gray-400">Loading vault data...</p>
        )}

        {error && (
          <p className="text-red-400">{error}</p>
        )}

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

      {/* Deposit Modal */}
      {showDeposit && (
        <DepositModal onClose={() => setShowDeposit(false)} />
      )}

    </div>
  )
}

export default App