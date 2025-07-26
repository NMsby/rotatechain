# RotateChain - Decentralized Rotational Savings & Crypto Lending Platform

![RotateChain](https://img.shields.io/badge/Built%20on-Internet%20Computer-blue)
![WCHL 2025](https://img.shields.io/badge/WCHL%202025-Bitcoin%20DeFi%20Track-orange)
![Team](https://img.shields.io/badge/Team-ICP%20Kenya-green)

**🏆 WCHL 2025 Submission - Bitcoin DeFi Track**  
**Team:** Nelson Masbayi ([@NMsby](https://github.com/NMsby)) & Ronny Ogeta ([@Rogetz](https://github.com/Rogetz))  
**Hub:** ICP Kenya Hub  
**Repository:** https://github.com/Rogetz/rotatechain_improvized

## 🌟 Executive Summary

RotateChain revolutionizes traditional rotational savings (chama/tanda) by combining it with DeFi liquidity pools on the Internet Computer. Our platform enables groups to pool crypto assets, rotate payouts automatically via smart contracts, while earning yield through IC Lighthouse integration.

**Problem:** 2.5B people lack access to formal financial services, relying on informal savings groups that lack transparency, automation, and yield generation.

**Solution:** Trustless, automated rotational savings with built-in DeFi yield farming and liquid token generation for risk-free trading.

## 🎯 Value Proposition

- **Financial Inclusion:** Democratize access to structured savings for the unbanked
- **Transparency:** All transactions recorded on-chain with group voting mechanisms  
- **Yield Generation:** Funds earn interest through IC Lighthouse liquidity pools
- **Liquid Assets:** Receive tradeable tokens during non-payout rounds
- **Global Access:** Participate from anywhere with crypto wallet

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Frontend UI    │    │  Core Backend   │    │  IC Lighthouse  │
│  (React/TS)     │───▶│  (Motoko)       │───▶│  Integration    │
│                 │    │                 │    │                 │
│  - Group Mgmt   │    │  - Groups       │    │  - Yield Farms  │
│  - Rotation UI  │    │  - Rotations    │    │  - LP Tokens    │
│  - Dashboard    │    │  - Scheduling   │    │  - Swaps        │
│  - Wallet Mgmt  │    │  - Payments     │    │  - Liquidity    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Authentication │    │  Event System   │    │  Bitcoin Layer  │
│  (Internet ID)  │    │  (Notifications)│    │  (Future)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Key Features

### 1. **User & Group Management**
- **Smart Group Creation:** Customizable group parameters (size, contribution, frequency)
- **Automated Vetting:** System validates member ability to contribute
- **Flexible Membership:** Join existing groups or create private ones
- **Role Management:** Group admin, member, and observer permissions

### 2. **Rotation Engine**
- **Smart Scheduling:** Automated round progression with configurable intervals
- **Fair Distribution:** Randomized or sequential payout ordering
- **Emergency Exits:** Early withdrawal with calculated penalties
- **Dispute Resolution:** On-chain voting for conflict resolution

### 3. **Liquidity Integration**
- **Auto-Deposit:** Incoming funds automatically enter yield-generating pools
- **Dynamic Rebalancing:** Smart allocation across multiple IC Lighthouse pools
- **Compound Interest:** Reinvest yields to maximize returns
- **Trade Mode:** Option to keep funds in pools during your payout round

### 4. **Liquid Token System**
- **rToken Generation:** Receive liquid tokens equivalent to your contribution
- **Risk-Free Trading:** Trade without affecting your rotation position
- **Yield Bearing:** Liquid tokens also generate returns
- **Redemption Rights:** Convert back to underlying assets anytime

### 5. **Transparency Layer**
- **Transaction Logs:** Complete audit trail of all group activities
- **Real-time Analytics:** Group performance, yield tracking, member statistics
- **Governance Dashboard:** Vote on group changes, dispute resolution
- **Notification System:** Real-time updates on rotations, yields, events

## 🛠️ Technical Stack

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Chart.js & Recharts for analytics visualization

**Backend:**
- Motoko smart contracts on Internet Computer
- ICP Ledger integration for payments
- IC Lighthouse for liquidity pools
- Event-driven architecture for notifications

**Authentication:**
- Internet Identity for seamless Web3 login
- Plug Wallet integration
- Principal-based access control

**Infrastructure:**
- Internet Computer Protocol (ICP)
- Asset canister for frontend hosting
- Multiple canister architecture for scalability

## 📊 Business Model

**Revenue Streams:**
1. **Transaction Fees:** 0.25% on all group contributions and payouts
2. **Yield Sharing:** 15% of DeFi yields generated through liquidity pools  
3. **Premium Features:** Advanced analytics, larger groups, custom scheduling
4. **Liquid Token Trading:** Small spread on rToken conversions
5. **API Access:** Third-party integrations and white-label solutions

**Market Opportunity:**
- $2.4T informal savings market globally
- 100M+ DeFi users seeking yield opportunities
- Growing crypto adoption in developing markets

## 🎮 How It Works

### For Savers:
1. **Create/Join Group:** Set contribution amount and frequency
2. **Regular Contributions:** Automated deposits from your wallet
3. **Earn Yields:** Funds generate returns in liquidity pools
4. **Receive Payouts:** Get your turn with accumulated interest
5. **Trade Liquid Tokens:** Access liquidity without breaking savings

### For Groups:
1. **Group Formation:** 3-12 members with shared savings goals
2. **Smart Contracts:** Automated rotation management
3. **Collective Yields:** Shared returns from DeFi pools
4. **Transparent Operations:** All activities recorded on-chain
5. **Governance:** Vote on changes and resolve disputes

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- npm >= 7.0.0
- DFX SDK >= 0.14.0
- Internet Computer wallet (Internet Identity or Plug)

### Installation

```bash
# Clone the repository
git clone https://github.com/Rogetz/rotatechain_improvized.git
cd rotatechain_improvized

# Install dependencies
npm install



# generate a new identity that will act as the minting account

dfx identity new minter
dfx identity use minter
echo $(dfx ledger account-id)

# switch back to your primary developer identity and record its ledger accountId for use as the developer identity\

dfx identity use MyIdentity
echo $(dfx ledger account-id)

# Open the dfx.json file in your project's directory. Replace or edit the existing content with the following, updating the values of MINTER_ACCOUNT_ID and DEVELOPER_ACCOUNT_ID with the values obtained in the previous steps.

# Start local IC replica
dfx start --clean --background

# Deploy canisters locally
dfx deploy

# Start frontend development server
npm start
```

### dfx.json configuration to replace
- replace the MINTER_ACCOUNT_ID with your minter identity you generated
- replace the DEVELOPER_ACCOUNT_ID with your default identity you're using

### Environment Setup

```bash
# The project includes environment configuration
# For local development, the .env.local is pre-configured but you can as well configure with .env whichever is prefferable
# Edit the VITE_REACT_APP_PAYMENT_CANISTER_ID environment variable to match your whitelisted canister for the plug wallet.

```

### Project Structure

```
rotatechain_improvized/
├── src/
│   ├── RotateChain_backend/
│   │   ├── main.mo                 # Main smart contract
│   │   ├── icp_integration.mo      # ICP payment processing
│   │   └── bitcoin_integration.mo  # Bitcoin functionality (planned)
│   └── RotateChain_frontend/
│       ├── src/
│       │   ├── components/         # React components
│       │   ├── services/          # API integrations
│       │   ├── pages/             # Main application pages
│       │   └── assets/            # Static assets
├── docs/                          # Documentation
├── dfx.json                       # IC canister configuration
└── package.json                   # Project dependencies
```

## 🎥 Demo & Presentation

**Repository:** [https://github.com/Rogetz/rotatechain_improvized](https://github.com/Rogetz/rotatechain_improvized)
**Demo Video:** [To be added after recording]
**Live Demo:** [Coming post-hackathon deployment]

## 🤝 Team

**Nelson Masbayi** - Co-Developer
- Email: nmsby.dev@gmail.com
- GitHub: [@NMsby](https://github.com/NMsby)

**Ronny Ogeta** - Co-Developer
- Email: ronnyogetaz@gmail.com
- GitHub: [@Rogetz](https://github.com/Rogetz)

## 🏆 WCHL 2025 Submission Details

**Track:** Bitcoin DeFi - Financial Innovation
**Innovation Focus:** Combining traditional African finance patterns with modern DeFi

## 📚 Documentation

- [Technical Architecture](./docs/architecture.md)
- [Smart Contract Documentation](./docs/smart-contracts.md)
- [API Reference](./docs/api.md)
- [User Guide](./docs/user-guide.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

**Primary Contact:** Nelson Masbayi (nmsby.dev@gmail.com)
**Secondary Contact:** Ronny Ogeta (ronnyogetaz@gmail.com)
**Project Repository:** https://github.com/Rogetz/rotatechain_improvized
**Issues & Discussion:** [GitHub Issues](https://github.com/Rogetz/rotatechain_improvized/issues)

---

*WCHL 2025 - Kenya Hub - Bitcoin DeFi Track*
