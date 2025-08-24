#!/bin/bash
# scripts/run_tests.sh - Comprehensive test execution script

echo "🧪 RotateChain Phase 1 Test Suite"
echo "================================"

# Ensure dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "Starting dfx..."
    dfx start --background --clean
    sleep 5
fi

# Deploy test canister
echo "📦 Deploying test suite..."
dfx deploy tests

# Run comprehensive tests
echo "🚀 Running all tests..."
dfx canister call tests runAllTests

echo "✅ Test execution complete"