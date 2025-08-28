# RotateChain - Decentralized Rotational Savings & Crypto Lending Platform (Social DeFi)

![RotateChain](https://img.shields.io/badge/Built%20on-Internet%20Computer-blue)
![WCHL 2025](https://img.shields.io/badge/WCHL%202025-Bitcoin%20DeFi%20Track-orange)
![Team](https://img.shields.io/badge/Team-ICP%20Kenya-green)

A revolutionary platform combining existing rotational savings groups with modern DeFi capabilities, featuring liquid contribution tokens (R Tokens) and cross-group lending.

## Innovation Overview

**Problem**: Traditional rotating savings associations (ROSCAs) handle $250 billion annually but lack liquidity and cross-group lending capabilities.   

**Solution**: R Tokens provide liquidity to savings commitments while enabling cross-group lending through blockchain-based social credit assessment.   

**Market Impact**: Targeting 50 million users across emerging markets with projected $45 million annual revenue.   

## Technical Architecture

RotateChain transforms existing rotating savings and credit associations (ROSCAs) through blockchain innovation:

- **Social Trust Foundation**: Groups based on existing social relationships
- **Liquid Contribution Tokens**: R Tokens representing member contributions
- **Cross-Group Lending**: Borrow against R Token collateral across groups
- **Automated Yield Generation**: Enhanced returns through DeFi integration
- **Comprehensive Analytics**: Risk assessment and performance tracking

### Backend Implementation (Internet Computer - Motoko)

**13-Module Architecture:**
- **Core:** `main.mo`, `state_manager.mo`, `types.mo`  
- **Financial:** `r_token_manager.mo`, `lending_engine.mo`, `yield_manager.mo`  
- **Business Logic:** `group_management.mo`, `rotation_engine.mo`, `analytics_engine.mo`  
- **Infrastructure:** `payment_handler.mo`, `icp_payment_service.mo`, `utils.mo`  

## Quick Start

```bash
# Deploy locally
dfx start --background && dfx deploy

# Run system tests
dfx canister call rotatechain_backend runSystemTests

# Check platform health  
dfx canister call rotatechain_backend healthCheck
```

## Key Features

**R Token System**: Liquid contribution tokens with automatic issuance and yield accumulation   
**Cross-Group Lending**: Borrow against R Token collateral with dynamic interest rates   
**Social Credit Scoring**: Credit assessment based on group participation history   
**Advanced Analytics**: Real-time risk assessment and performance optimization   
**Production Ready**: Comprehensive error handling and upgrade-safe state management  

## Documentation

- **[Technical Architecture](docs/architecture.md)** - Complete system design and data flows
- **[API Reference](docs/api.md)** - All endpoints with examples and usage
- **[Business Model](docs/business_model.md)** - Revenue projections and market analysis  
- **[Deployment Guide](docs/deployment.md)** - Local and mainnet deployment instructions
- **[Hackathon Submission](docs/hackathon_submission.md)** - WCHL 2025 competition details

## Testing Framework

The platform includes comprehensive testing capabilities with 100% system test pass rate:

```bash
# Complete system validation
dfx canister call rotatechain_backend runSystemTests

# Performance benchmarking
dfx canister call rotatechain_backend benchmarkAnalytics

# Data integrity validation
dfx canister call rotatechain_backend validateDataIntegrity
```

## Deployment Status

**Local Development**: Fully functional with comprehensive test suite   
**Mainnet Deployment**: Successfully deployed and operational     
**Canister ID**: [Backend](https://trmuc-riaaa-aaaan-qz6dq-cai.icp0.io) | [Frontend](https://cv2zh-syaaa-aaaah-arixa-cai.icp0.io/)     
**Demo Video**: https://www.youtube.com/watch?v=0rv1k8vrt3I

## Technical Specifications

- **Blockchain**: Internet Computer Protocol (ICP)
- **Language**: Motoko with dfx 0.28.0
- **Architecture**: Modular canister design with upgrade-safe state management
- **Storage**: RBTree-based efficient data structures
- **Security**: Principal-based authentication with comprehensive input validation

## Innovation Highlights

**Social Credit Assessment**: Credit scoring based on group participation history rather than traditional financial metrics.

**Liquid Savings Tokens**: R Tokens provide liquidity to traditionally illiquid savings commitments while maintaining social accountability.

**Network Effects**: Cross-group lending creates interconnected financial networks that strengthen with platform growth.

**Risk-Aware Yield**: Sophisticated yield strategies adapt to group characteristics and risk profiles.

## Development Status

**Phase 1 Complete**: Core rotational savings with ICP integration   
**Phase 2 Complete**: R Token system, lending engine, advanced analytics   
**Production Ready**: Comprehensive testing and validation frameworks implemented   

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact & Support

| Role              | Name           | Email                   | Link |
|-------------------|----------------|-------------------------|------|
| **Software Engineer**   | Nelson Masbayi | nmsby.dev@gmail.com     | - |
| **Software Developer** | Ronny Ogeta   | ronnyogetaz@gmail.com   | - |
| **Repository**        | RotateChain   | -                       | [GitHub Repo](https://github.com/Rogetz/rotatechain) |
| **Issues & Discussion** | -          | -                       | [GitHub Issues](https://github.com/Rogetz/rotatechain/issues) |


---

*WCHL 2025 - Kenya Hub - Bitcoin DeFi Track*
