# RotateChain Deployment Guide

## Prerequisites

- dfx 0.28.0 or later
- Node.js 18+ (for frontend)
- Internet Identity integration
- ICP tokens for deployment

## Local Development Setup

### 1. Environment Setup
```bash
# Install dfx
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Verify installation
dfx --version

# Clone repository
git clone <repository-url>
cd rotatechain
```

### 2. Local Deployment
```bash
# Start local IC replica
dfx start --background

# Deploy identity and ledger canisters
dfx deploy icp_ledger_canister --specified-id uxrrr-q7777-77774-qaaaq-cai
dfx deploy internet_identity --specified-id rdmx6-jaaaa-aaaaa-aaadq-cai

# Deploy main backend
dfx deploy rotatechain_backend

# Deploy frontend (if applicable)
dfx deploy rotatechain_frontend
```

### 3. Verification
```bash
# Check canister status
dfx canister status rotatechain_backend

# Run system tests
dfx canister call rotatechain_backend runSystemTests

# Test health check
dfx canister call rotatechain_backend healthCheck
```

## Mainnet Deployment

### 1. Prepare for Production
```bash
# Ensure clean build
dfx build --network ic

# Check deployment configuration
dfx canister status rotatechain_backend --network ic
```

### 2. Deploy to Internet Computer
```bash
# Deploy with sufficient cycles
dfx deploy --network ic --with-cycles 1000000000000

# Verify deployment
dfx canister status rotatechain_backend --network ic

# Test production deployment
dfx canister call rotatechain_backend healthCheck --network ic
```

### 3. Post-Deployment Validation
```bash
# Run comprehensive tests on mainnet
dfx canister call rotatechain_backend runSystemTests --network ic

# Monitor canister metrics
dfx canister status rotatechain_backend --network ic
```

## Configuration Management

### Environment Variables
```bash
# Local development
export DFX_NETWORK=local
export CANISTER_CANDID_PATH=.dfx/local/canisters

# Production
export DFX_NETWORK=ic
export CANISTER_CANDID_PATH=.dfx/ic/canisters
```

### Canister Configuration
Update `dfx.json` for production settings:
```json
{
  "canisters": {
    "rotatechain_backend": {
      "type": "motoko",
      "main": "src/RotateChain_backend/main.mo",
      "memory_allocation": "4GB",
      "compute_allocation": 10
    }
  }
}
```

## Monitoring and Maintenance

### Health Monitoring
```bash
# Regular health checks
dfx canister call rotatechain_backend healthCheck --network ic

# Performance monitoring
dfx canister call rotatechain_backend benchmarkAnalytics --network ic

# Data integrity validation
dfx canister call rotatechain_backend validateDataIntegrity --network ic
```

### Upgrade Process
```bash
# Build new version
dfx build rotatechain_backend --network ic

# Deploy upgrade
dfx canister install rotatechain_backend --mode upgrade --network ic

# Verify upgrade success
dfx canister call rotatechain_backend healthCheck --network ic
```

## Troubleshooting

### Common Issues

**Compilation Warnings**
- M0194 warnings about unused identifiers are non-critical
- M0155 warnings indicate potential arithmetic traps

**Deployment Failures**
- Ensure sufficient cycles for deployment
- Verify network connectivity and dfx version compatibility
- Check canister memory and compute allocation limits

**Runtime Errors**
- Validate Internet Identity integration
- Confirm ICP Ledger canister deployment
- Check principal authentication and permissions

### Debug Commands
```bash
# Check canister logs
dfx canister logs rotatechain_backend

# Monitor canister status
dfx canister status rotatechain_backend --network ic

# Validate deployment
dfx canister call rotatechain_backend runSystemTests
```

## Verified Mainnet Deployment

**Successful Production Deployment**:
- Canister ID: trmuc-riaaa-aaaan-qz6dq-cai
- Deployment Cost: 7.000 TC consumed
- Operational Balance: 13.000 TC remaining
- System Status: All core functions operational

**Deployment Verification Commands**:
```bash
# Test live mainnet deployment
dfx canister --network ic status trmuc-riaaa-aaaan-qz6dq-cai
dfx canister --network ic call trmuc-riaaa-aaaan-qz6dq-cai healthCheck
dfx canister --network ic call trmuc-riaaa-aaanan-qz6dq-cai runSystemTests
```

**Production Monitoring**:
```bash
# Monitor cycles usage
dfx cycles --network ic balance

# Check canister performance
dfx canister --network ic call trmuc-riaaa-aaaan-qz6dq-cai getPlatformAnalytics
```

This deployment guide ensures reliable setup and maintenance of RotateChain across development and production environments.