# 🔒 HoldFirm — Save in Dollars. Earn from the Impatient.

> *"In Argentina, Turkey, Nigeria — inflation doesn't ask permission. HoldFirm does."*

**Live App:** https://holdfirm.vercel.app  
**Contract:** https://basescan.org/address/0x85E535Af5663426D38461B2e74d34FafA8a7472a  
**Chain:** Base Mainnet  
**Built for:** YO Protocol "Hack with YO" Hackathon  

---

## The Problem

1.4 billion people live in countries where inflation runs above 10% per year.

In Turkey, inflation hit 65%. In Argentina, 211%. In Nigeria, 29%. In Egypt, 35%.

These people work hard. They save money. And then they watch it disappear — not because of bad decisions, but because of the currency they were born into.

They don't need another bank. They need a way to **opt out of inflation entirely.**

But there's a second problem nobody talks about: **savings discipline.**

Even when people find a good savings product, they withdraw early. An emergency happens. A temptation arrives. Discipline breaks. The savings plan fails.

**HoldFirm solves both problems at once.**

---

## The Solution

HoldFirm is a DeFi savings app for high-inflation economies, built on Base and powered by YO Protocol.

It does two things no other savings app does together:

1. **Save in USDC** — dollar-denominated, inflation-proof, earning real yield via YO Protocol
2. **Earn from impatient users** — our onchain DisciplineVault redistributes early withdrawal penalties to committed savers

When you lock for 30, 60, or 90 days, you don't just earn APY. You earn a share of every penalty paid by people who broke their commitment. **Patience is financially rewarded.**

---

## How It Works

### The Flow
```
User deposits USDC
       ↓
DisciplineVault (our smart contract)
       ↓
YO Protocol yoUSD Vault (earning 4.92% APY)
       ↓
yoUSD shares held by contract
       ↓
Early withdrawal? → 4.5% penalty → distributed to locked savers
On-time withdrawal? → full amount + yield + penalty rewards
```

### The Behavioral Economics
- Lock for 30/60/90 days → commit publicly onchain
- Early withdrawal = 4.5% penalty → redistributed to everyone who stayed
- The longer you lock, the more you benefit from others' impatience
- This creates a **self-reinforcing commitment mechanism** — every early withdrawal makes staying more valuable

---

## Features

### 🤖 AI Onboarding Wizard
4 questions. Personalized savings strategy powered by Groq (Llama 3.3 70B).
- Where are you from? (12 high-inflation countries)
- Have you lost money to inflation?
- What's your savings goal?
- How long can you commit?

The AI generates a warm, personal, actionable recommendation — telling you exactly which HoldFirm mode fits your situation and why.

### 💰 NestSave
Simple USDC savings earning 4.92% APY via YO Protocol. View your balance in your local currency in real time. Watch inflation lose its grip.

### 🎯 GoalStack
Goal-based savings with target amount, deadline, progress bar, and yield projection. Save for a house, education, or emergency fund — with a countdown that keeps you accountable.

### 🏦 DisciplineVault ⭐ Core Innovation
Our custom smart contract deployed on Base mainnet. The only savings vault that pays you for other people's impatience.

- Lock USDC for 30, 60, or 90 days
- Funds forwarded to YO Protocol vault, earning yield
- Early withdrawal: 4.5% penalty redistributed to all committed savers automatically
- On-time withdrawal: full principal + YO yield + share of all penalties collected
- Penalty pool visible in real time
- Claim rewards anytime with one click

### 🔥 Streak & Habits
Savings streak counter, recurring reminder system, and YO SDK transaction history display.

---

## YO Protocol SDK Integration

HoldFirm uses 5 YO Protocol SDK methods:

| Method | Where Used | Purpose |
|--------|-----------|---------|
| `YieldProvider` | `main.tsx` | Wraps entire app, provides context |
| `getVaultSnapshot()` | `useYoVault.ts` | Live APY + TVL displayed in navbar |
| `getUserPerformance()` | `useUserData.ts` | Yield earned by user |
| `getUserTransactionHistory()` | `useUserData.ts` | Recent saves in Streak & Habits tab |
| `getUserBalances()` | `useUserData.ts` | Wallet assets display |

**Vault:** `0x0000000f2eb9f69274678c76222b35eec7588a65` (yoUSD on Base)  
**Network:** Base Mainnet (chainId: 8453)

---

## Smart Contract: DisciplineVault

**Address:** `0x85E535Af5663426D38461B2e74d34FafA8a7472a`  
**Network:** Base Mainnet  
**Verified:** https://basescan.org/address/0x85E535Af5663426D38461B2e74d34FafA8a7472a

### Key Functions
```solidity
// Deposit USDC with chosen lock period (30, 60, or 90 days)
function deposit(uint256 usdcAmount, uint256 lockDays) external

// Withdraw — 4.5% penalty applied if before lock period ends
function withdraw(uint256 shareAmount) external

// Claim accumulated penalty rewards from early withdrawers
function claimRewards() external

// View functions
function getUserShares(address user) external view returns (uint256)
function getPendingReward(address user) external view returns (uint256)
function getTotalEarnedFromPenalties(address user) external view returns (uint256)
function isLocked(address user) external view returns (bool)
function getTimeRemaining(address user) external view returns (uint256)
function getDepositorCount() external view returns (uint256)
```

### Penalty Distribution: How `accRewardPerShare` Works

The contract uses a **reward-per-share accumulator** pattern — the same battle-tested algorithm used by Synthetix and SushiSwap.

Here is the exact flow when someone withdraws early:

**Step 1 — Early withdrawer triggers `withdraw()`:**
```solidity
uint256 penalty = (shareAmount * PENALTY_BPS) / 10000; // 4.5% of their shares
totalPenaltyCollected += penalty;
accRewardPerShare += (penalty * PRECISION) / totalShares;
```

The penalty stays inside the vault. `accRewardPerShare` is a running tally — it increases every time a penalty arrives, proportional to how many total shares exist.

**Step 2 — Patient saver checks their reward via `getPendingReward()`:**
```solidity
pending = (userShares * accRewardPerShare / PRECISION) - rewardDebt[user];
```

Each saver's pending reward = their shares × the accumulated reward per share, minus what they've already claimed.

**Step 3 — Patient saver calls `claimRewards()`:**
```solidity
uint256 pending = getPendingReward(msg.sender);
rewardDebt[msg.sender] = (userShares * accRewardPerShare) / PRECISION;
// transfer pending yoUSD shares to user
```

Their `rewardDebt` is updated so they can't claim the same reward twice.

**Why this design is powerful:**
- O(1) gas — distribution costs the same whether there are 5 or 5,000 savers
- Fully automatic — no admin, no cron job, no manual step
- Triggered instantly inside the same transaction as the early withdrawal
- Every early withdrawal makes the vault more valuable for those who stayed

---

## Real Transactions (Mainnet Proof)

| Type | TX Hash | Status |
|------|---------|--------|
| Contract Deploy | [View on Basescan](https://basescan.org/address/0x85E535Af5663426D38461B2e74d34FafA8a7472a) | ✅ Live |
| Real Deposit | [0xba6c88...](https://basescan.org/tx/0xba6c889a70eed58fe7c6440e77804f2ad2824503868745f19576261d36e52b9f) | ✅ Confirmed |
| Early Withdrawal (penalty fired) | [0xda489d...](https://basescan.org/tx/0xda489d902b14efc98ac202487cbcd85c0ed220a6e0295dc656284f652c3bcafb) | ✅ Confirmed |

### What the early withdrawal TX proves:
- `0.044599 yoUSD` shares burned from the vault
- `0.047753 USDC` returned to the user
- The difference (`0.0021 yoUSD`) remained in the penalty pool as rewards for committed savers
- `accRewardPerShare` updated automatically in the same transaction
- No admin involvement. Pure smart contract logic.

The full deposit → withdrawal → penalty redistribution cycle has been **proven on Base mainnet with real funds.**

---

## Trust & Transparency

**Where do funds go?**
```
Your Wallet → DisciplineVault → YO Protocol Vault → yoUSD Yield
```

**Security model:**
- Non-custodial — funds held by smart contract, not by HoldFirm
- No admin keys — contract is fully immutable, no owner functions
- No upgradeability — what you see is what runs forever
- Penalty enforcement is pure Solidity — cannot be bypassed or modified

**Risk Disclosure:**
DisciplineVault is unaudited — only deposit what you can afford to lose. YO Protocol vault risk applies. Early withdrawal incurs a 4.5% penalty redistributed to committed savers.

**Contracts:**
- DisciplineVault: `0x85E535Af5663426D38461B2e74d34FafA8a7472a`
- YO yoUSD Vault: `0x0000000f2eb9f69274678c76222b35eec7588a65`
- USDC on Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS v3 + Inline styles |
| Wallet | RainbowKit + wagmi + viem |
| Blockchain | Base Mainnet |
| Savings Protocol | YO Protocol (@yo-protocol/core + @yo-protocol/react) |
| Smart Contract | Solidity 0.8.28 + Hardhat |
| AI Wizard | Groq API (Llama 3.3 70B) |
| Exchange Rates | open.er-api.com |
| Deployment | Vercel |

---

## Supported Currencies

| Country | Currency | Inflation |
|---------|----------|-----------|
| 🇹🇷 Turkey | TRY | 65% |
| 🇦🇷 Argentina | ARS | 211% |
| 🇳🇬 Nigeria | NGN | 28.9% |
| 🇵🇰 Pakistan | PKR | 29% |
| 🇪🇬 Egypt | EGP | 35% |
| 🇬🇭 Ghana | GHS | 23% |
| 🇪🇹 Ethiopia | ETB | 30.2% |
| 🇺🇦 Ukraine | UAH | 26.6% |
| 🇮🇩 Indonesia | IDR | 2.8% |
| 🇷🇴 Romania | RON | 10.4% |
| 🇬🇪 Georgia | GEL | 9.5% |
| 🇦🇴 Angola | AOA | 20% |

---

## Why HoldFirm Wins

**UX Simplicity (30%):** Connect wallet → AI wizard → personalized strategy → one-click deposit. No KYC. No sign-up. Works in 60 seconds.

**Creativity & Growth Potential (30%):** First DeFi savings app that pays committed savers from impatient users' penalties. Behavioral finance meets DeFi. 1.4 billion addressable users.

**Integration Quality (20%):** 5 YO SDK methods used. Real deposits flowing through YO vault onchain. Live APY/TVL from SDK displayed in navbar.

**Risk & Trust (20%):** Full fund flow transparency. Two real TX proofs on mainnet — deposit AND early withdrawal with penalty redistribution. Contract on Basescan. Non-custodial. No admin keys.

---

## Local Development
```bash
git clone https://github.com/Nazrawi15/holdfirm
cd holdfirm
npm install --legacy-peer-deps
cp .env.example .env  # add your keys
npm run dev
```

**Required env variables:**
```
VITE_WALLETCONNECT_PROJECT_ID=
VITE_GROQ_API_KEY=
VITE_DISCIPLINE_VAULT_MAINNET=0x85E535Af5663426D38461B2e74d34FafA8a7472a
```

---

*Built with 🔒 by Nazrawi15 for the YO Protocol Hackathon 2026*