# RotateChain - Decentralized Rotational Savings & Crypto Lending Platform (Social DeFi)

![RotateChain](https://img.shields.io/badge/Built%20on-Internet%20Computer-blue)
![WCHL 2025](https://img.shields.io/badge/WCHL%202025-Bitcoin%20DeFi%20Track-orange)
![Team](https://img.shields.io/badge/Team-ICP%20Kenya-green)

A revolutionary platform combining existing rotational savings groups with modern DeFi capabilities, featuring liquid contribution tokens (R Tokens) and cross-group lending.

## 🏗️ Architecture Overview

RotateChain transforms existing rotating savings and credit associations (ROSCAs) through blockchain innovation:

- **Social Trust Foundation**: Groups based on existing social relationships
- **Liquid Contribution Tokens**: R Tokens representing member contributions
- **Cross-Group Lending**: Borrow against R Token collateral across groups
- **Automated Yield Generation**: Enhanced returns through DeFi integration
- **Comprehensive Analytics**: Risk assessment and performance tracking

## ⚙️ Technical Implementation

### Backend System (Internet Computer - Motoko) 💻

**Core Modules:**
- `main.mo`: Primary actor with all public endpoints
- `state_manager.mo`: Centralized state management with upgrade safety
- `types.mo`: Comprehensive type system for all platform operations

**Financial Systems:**
- `r_token_manager.mo`: Liquid contribution token management
- `lending_engine.mo`: Cross-group lending with R Token collateral
- `yield_manager.mo`: Multi-strategy yield calculation engine
- `yield_distributor.mo`: Fair yield distribution algorithms
- `payment_handler.mo`: ICP payment processing integration

**Business Logic:**
- `group_management.mo`: Group lifecycle and member management
- `rotation_engine.mo`: Automated rotation and payout processing
- `analytics_engine.mo`: Comprehensive platform analytics

**Infrastructure:**
- `utils.mo`: Utility functions and validation
- `icp_payment_service.mo`: Ledger integration for real ICP payments

### Key Features ✨

**R Token System:**
- Automatic issuance on contribution payments
- Secure peer-to-peer transfers within groups
- Yield accumulation and redemption capabilities
- Collateral functionality for lending

**Advanced Analytics:**
- Group performance metrics and health scoring
- Individual credit assessment based on participation
- Platform-wide risk analytics and stress testing
- Real-time yield tracking and distribution analysis

**Cross-Group Lending:**
- R Token collateral-based loan system
- Dynamic interest rate calculation
- Automated default detection and liquidation
- Comprehensive loan lifecycle management

## 🚀 Deployment

### Local Development 🛠️

```bash
# Start IC replica
dfx start --background

# Deploy canisters
dfx deploy

# Test system health
dfx canister call rotatechain_backend healthCheck
dfx canister call rotatechain_backend runSystemTests
```

### Mainnet Deployment 🌐

```bash
# Deploy to IC mainnet
dfx deploy --network ic --with-cycles 1000000000000

# Verify deployment
dfx canister status rotatechain_backend --network ic
```

## 📖 API Reference

### Group Management 👥

```motoko
// Create new group
createGroup(name: Text, contributionAmount: Nat, maxMembers: Nat, roundDurationDays: Nat) : async Result<Nat, Text>

// Join existing group  
joinGroup(groupId: Nat) : async Result<Bool, Text>

// Make contribution with automatic R Token issuance
recordContribution(groupId: Nat) : async Result<Bool, Text>
```

### R Token Operations 🔗 

```motoko
// Transfer R Tokens to group members
transferRTokens(tokenId: RTokenId, to: Principal, amount: Amount, memo: ?Text) : async Result<TransactionId, Error>

// Redeem R Tokens for ICP
redeemRTokens(tokenId: RTokenId, amount: Amount) : async Result<Amount, Error>

// Query R Token balance
getRTokenBalance(groupId: Nat) : async Amount
```

### Lending System 💳

```motoko
// Request loan using R Token collateral
requestLoan(borrowerGroupId: Nat, principalAmount: Amount, termDays: Nat, collateralTokenIds: [RTokenId], memo: ?Text) : async Result<LoanId, Error>

// Make loan payment
makeLoanPayment(loanId: LoanId, amount: Amount) : async Result<TransactionId, Error>
```

### Analytics Dashboard 📊

```motoko
// Get group performance metrics
getGroupAnalytics(groupId: Nat) : async ?GroupPerformanceMetrics

// Get personal analytics
getMyAnalytics() : async UserAnalytics

// Get platform-wide statistics
getPlatformAnalytics() : async PlatformAnalytics
```

## 🧪 Testing

The platform includes comprehensive testing capabilities:

```bash
# Run complete system tests
dfx canister call rotatechain_backend runSystemTests

# Benchmark analytics performance
dfx canister call rotatechain_backend benchmarkAnalytics

# Validate data integrity across systems
dfx canister call rotatechain_backend validateDataIntegrity
```

## 🌟 Innovation Highlights

**Social Credit Assessment**: Credit scoring based on group participation history rather than traditional financial metrics.

**Liquid Savings Tokens**: R Tokens provide liquidity to traditionally illiquid savings commitments while maintaining social accountability.

**Network Effects**: Cross-group lending creates interconnected financial networks that strengthen with platform growth.

**Risk-Aware Yield**: Sophisticated yield strategies adapt to group characteristics and risk profiles.

## 📐 Technical Specifications

- **Blockchain**: Internet Computer Protocol (ICP)
- **Language**: Motoko with dfx 0.28.0
- **Architecture**: Modular canister design with upgrade-safe state management
- **Storage**: RBTree-based efficient data structures
- **Security**: Principal-based authentication with comprehensive input validation

## 📌 Development Status

**Phase 1 Complete**: Core rotational savings with ICP integration  
**Phase 2 Complete**: R Token system, lending engine, advanced analytics  
**Production Ready**: Comprehensive testing and validation frameworks implemented

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact & Support

| Role              | Name           | Email                   | Link |
|-------------------|----------------|-------------------------|------|
| **Software Engineer**   | Nelson Masbayi | nmsby.dev@gmail.com     | - |
| **Software Developer** | Ronny Ogeta   | ronnyogetaz@gmail.com   | - |
| **Repository**        | RotateChain   | -                       | [GitHub Repo](https://github.com/Rogetz/rotatechain) |
| **Issues & Discussion** | -          | -                       | [GitHub Issues](https://github.com/Rogetz/rotatechain/issues) |


---

*WCHL 2025 - Kenya Hub - Bitcoin DeFi Track*
