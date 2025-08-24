#!/bin/bash
# Test execution automation script

set -e

echo "Starting RotateChain Phase 1 Test Suite..."

# Navigate to test directory
cd "$(dirname "$0")/../tests"

# Ensure dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "Starting local IC replica..."
    dfx start --background --clean
    sleep 10
fi

# Deploy test canister
echo "Deploying test suite environment..."
dfx deploy

# Run tests
echo "Running all tests..."
dfx canister call tests runAllTests

echo "Test execution complete"