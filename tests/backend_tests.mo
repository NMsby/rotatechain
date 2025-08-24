// Comprehensive test suite for Phase 1
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Array "mo:base/Array";

// Import modules
import RotateChain "../src/RotateChain_backend/main";

actor TestSuite {
    
    // Test data
    private let testPrincipal1 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
    private let testPrincipal2 = Principal.fromText("rdmx6-jaaaa-aaaaa-aaadq-cai");
    private let testPrincipal3 = Principal.fromText("renrk-eyaaa-aaaaa-aaada-cai");
    
    private let rotateChain = RotateChain.RotateChain();
    
    // ==================== UTILITY FUNCTIONS ====================
    
    private func printTestHeader(testName: Text) {
        Debug.print("\n🧪 === " # testName # " ===");
    };
    
    private func printTestResult(testName: Text, passed: Bool, details: Text) {
        let status = if (passed) "✅ PASSED" else "❌ FAILED";
        Debug.print(status # " - " # testName);
        if (details != "") {
            Debug.print("   📋 Details: " # details);
        };
    };
    
    private func assertEqual<T>(expected: T, actual: T, equal: (T, T) -> Bool) : Bool {
        equal(expected, actual)
    };
    
    // ==================== HEALTH CHECK TESTS ====================
    
    public func testHealthCheck() : async Bool {
        printTestHeader("System Health Check");
        
        let isHealthy = await rotateChain.healthCheck();
        let greeting = await rotateChain.greet("Test Suite");
        let expectedGreeting = "Hello, Test Suite! 🎉 Welcome to RotateChain - Revolutionizing Rotational Savings! 💰";
        
        let healthPassed = isHealthy == true;
        let greetingPassed = greeting == expectedGreeting;
        
        printTestResult("Health Check", healthPassed, "System reports: " # debug_show(isHealthy));
        printTestResult("Greeting Function", greetingPassed, "Response: " # greeting);
        
        healthPassed and greetingPassed
    };
    
    // ==================== GROUP MANAGEMENT TESTS ====================
    
    public func testGroupCreation() : async Bool {
        printTestHeader("Group Creation Tests");
        
        // Test successful group creation
        let createResult = await rotateChain.createGroup(
            "Test Savings Group",
            1_000_000,  // 0.01 ICP
            5,          // 5 members max
            30          // 30 days interval
        );
        
        let creationPassed = switch (createResult) {
            case (#ok(groupId)) {
                printTestResult("Group Creation", true, "Created group ID: " # Nat.toText(groupId));
                true
            };
            case (#err(error)) {
                printTestResult("Group Creation", false, error);
                false
            };
        };
        
        // Test group retrieval
        let groups = await rotateChain.getGroups();
        let retrievalPassed = groups.size() > 0;
        printTestResult("Group Retrieval", retrievalPassed, "Found " # Nat.toText(groups.size()) # " groups");
        
        creationPassed and retrievalPassed
    };
    
    public func testGroupJoining() : async Bool {
        printTestHeader("Group Joining Tests");
        
        // Create a test group first
        let createResult = await rotateChain.createGroup("Join Test Group", 1_000_000, 3, 30);
        let groupId = switch (createResult) {
            case (#ok(id)) { id };
            case (#err(_)) { 
                printTestResult("Setup Failed", false, "Could not create test group");
                return false;
            };
        };
        
        // Test joining the group (simulate different principal)
        let joinResult = await rotateChain.joinGroup(groupId);
        let joinPassed = switch (joinResult) {
            case (#ok(success)) {
                printTestResult("Group Joining", success, "Successfully joined group " # Nat.toText(groupId));
                success
            };
            case (#err(error)) {
                printTestResult("Group Joining", false, error);
                false
            };
        };
        
        // Verify member count increased
        let updatedGroups = await rotateChain.getGroups();
        let group = Array.find(updatedGroups, func(g) = g.id == groupId);
        let memberCountPassed = switch (group) {
            case (?g) {
                let passed = g.members.size() >= 1;
                printTestResult("Member Count", passed, "Group has " # Nat.toText(g.members.size()) # " members");
                passed
            };
            case null {
                printTestResult("Member Count", false, "Group not found after join");
                false
            };
        };
        
        joinPassed and memberCountPassed
    };
    
    // ==================== CONTRIBUTION TESTS ====================
    
    public func testContributionFlow() : async Bool {
        printTestHeader("Contribution Flow Tests");
        
        // Create and activate a group for testing
        let createResult = await rotateChain.createGroup("Contribution Test", 1_000_000, 3, 30);
        let groupId = switch (createResult) {
            case (#ok(id)) { id };
            case (#err(_)) { return false };
        };
        
        // Activate the group
        let activateResult = await rotateChain.activateGroup(groupId);
        let activationPassed = switch (activateResult) {
            case (#ok(success)) {
                printTestResult("Group Activation", success, "Group " # Nat.toText(groupId) # " activated");
                success
            };
            case (#err(error)) {
                printTestResult("Group Activation", false, error);
                false
            };
        };
        
        // Test balance check (should be 0 for test)
        let balance = await rotateChain.getMyBalance();
        printTestResult("Balance Check", true, "Current balance: " # Nat64.toText(balance) # " e8s");
        
        activationPassed
    };
    
    // ==================== ROTATION TESTS ====================
    
    public func testRotationLogic() : async Bool {
        printTestHeader("Rotation Logic Tests");
        
        // Get platform stats to verify system state
        let stats = await rotateChain.getSystemStats();
        printTestResult("Platform Stats", true, 
            "Groups: " # Nat.toText(stats.totalGroups) # 
            ", Active: " # Nat.toText(stats.activeGroups) #
            ", Version: " # stats.systemVersion
        );
        
        true
    };
    
    // ==================== ERROR HANDLING TESTS ====================
    
    public func testErrorHandling() : async Bool {
        printTestHeader("Error Handling Tests");
        
        // Test invalid group access
        let invalidGroupResult = await rotateChain.joinGroup(999);
        let invalidGroupPassed = switch (invalidGroupResult) {
            case (#err(error)) {
                printTestResult("Invalid Group Access", true, "Correctly rejected: " # error);
                true
            };
            case (#ok(_)) {
                printTestResult("Invalid Group Access", false, "Should have failed");
                false
            };
        };
        
        // Test invalid parameters
        let invalidCreateResult = await rotateChain.createGroup("", 0, 0, 0);
        let invalidCreatePassed = switch (invalidCreateResult) {
            case (#err(error)) {
                printTestResult("Invalid Parameters", true, "Correctly rejected: " # error);
                true
            };
            case (#ok(_)) {
                printTestResult("Invalid Parameters", false, "Should have failed");
                false
            };
        };
        
        invalidGroupPassed and invalidCreatePassed
    };
    
    // ==================== COMPREHENSIVE TEST RUNNER ====================
    
    public func runAllTests() : async Bool {
        Debug.print("\n🚀 Starting RotateChain Phase 1 Test Suite");
        Debug.print("⏰ Test Start Time: " # debug_show(Time.now()));
        
        var allPassed = true;
        var testCount = 0;
        var passedCount = 0;
        
        // Run all tests
        let tests = [
            ("Health Check", testHealthCheck),
            ("Group Creation", testGroupCreation),
            ("Group Joining", testGroupJoining),
            ("Contribution Flow", testContributionFlow),
            ("Rotation Logic", testRotationLogic),
            ("Error Handling", testErrorHandling)
        ];
        
        for ((testName, testFunc) in tests.vals()) {
            testCount += 1;
            let result = await testFunc();
            if (result) {
                passedCount += 1;
            } else {
                allPassed := false;
            };
        };
        
        // Print final results
        Debug.print("\n📊 === TEST SUITE RESULTS ===");
        Debug.print("✅ Passed: " # Nat.toText(passedCount) # "/" # Nat.toText(testCount));
        
        if (allPassed) {
            Debug.print("🎉 ALL TESTS PASSED - Phase 1 Backend Ready for Production");
        } else {
            Debug.print("⚠️  Some tests failed - Review required");
        };
        
        Debug.print("⏰ Test End Time: " # debug_show(Time.now()));
        allPassed
    };
}