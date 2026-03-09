import { ConnectButton } from '@rainbow-me/rainbowkit'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold text-white">HoldFirm 🔒</h1>
      <p className="text-gray-400 text-lg">Save in dollars. Beat inflation.</p>
      <ConnectButton />
    </div>
  )
}

export default App