import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useYoVault } from './hooks/useYoVault'

function App() {
  const { apy, tvl, loading, error } = useYoVault()

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-8 p-4">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">HoldFirm 🔒</h1>
        <p className="text-gray-400 mt-2">Save in dollars. Beat inflation.</p>
      </div>

      {/* Connect Wallet */}
      <ConnectButton />

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

    </div>
  )
}

export default App