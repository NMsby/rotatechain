// r_token_manager.mo - Complete R Token management system
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Nat64 "mo:base/Nat64";

import Types "./types";
import Utils "./utils";

module RTokenManager {

    // ==================== TYPE ALIASES ====================
    public type RTokenId = Types.RTokenId;
    public type RToken = Types.RToken;
    public type RTokenTransfer = Types.RTokenTransfer;
    public type RTokenStatus = Types.RTokenStatus;
    public type Amount = Types.Amount;
    public type GroupId = Types.GroupId;
    public type Error = Types.Error;

    // ==================== R TOKEN MANAGER CLASS ====================
    public class RTokenManager() {
        
        // ==================== STABLE VARIABLES ====================
        private stable var tokenCounter: RTokenId = 0;
        private stable var transferCounter: Types.TransactionId = 0;
        
        // Stable storage for upgrades
        private stable var tokenEntries: [(RTokenId, RToken)] = [];
        private stable var transferEntries: [(Types.TransactionId, RTokenTransfer)] = [];
        private stable var holderBalanceEntries: [(Principal, [(GroupId, Amount)])] = [];

        // ==================== RUNTIME STATE ====================
        private var tokens = HashMap.HashMap<RTokenId, RToken>(100, Nat.equal, Nat.hash);
        private var transfers = HashMap.HashMap<Types.TransactionId, RTokenTransfer>(500, Nat.equal, Nat.hash);
        
        // Track balances: Principal -> (GroupId -> Amount)
        private var holderBalances = HashMap.HashMap<Principal, HashMap.HashMap<GroupId, Amount>>(
            50, Principal.equal, Principal.hash
        );
        
        // Token ownership index: GroupId -> [RTokenId]
        private var groupTokens = HashMap.HashMap<GroupId, Buffer.Buffer<RTokenId>>(
            20, Nat.equal, Nat.hash
        );
        
        // User token index: Principal -> [RTokenId]
        private var userTokens = HashMap.HashMap<Principal, Buffer.Buffer<RTokenId>>(
            50, Principal.equal, Principal.hash
        );

        // ==================== INITIALIZATION ====================
        
        // Initialize state from stable storage
        private func initializeState() {
            // Restore tokens
            tokens := HashMap.fromIter<RTokenId, RToken>(
                tokenEntries.vals(), 100, Nat.equal, Nat.hash
            );
            
            // Restore transfers
            transfers := HashMap.fromIter<Types.TransactionId, RTokenTransfer>(
                transferEntries.vals(), 500, Nat.equal, Nat.hash
            );
            
            // Restore holder balances
            for ((principal, balances) in holderBalanceEntries.vals()) {
                let balanceMap = HashMap.fromIter<GroupId, Amount>(
                    balances.vals(), 10, Nat.equal, Nat.hash
                );
                holderBalances.put(principal, balanceMap);
            };
            
            // Rebuild indexes
            rebuildIndexes();
        };

        // Rebuild token indexes after initialization
        private func rebuildIndexes() {
            for ((tokenId, token) in tokens.entries()) {
                // Group token index
                switch (groupTokens.get(token.groupId)) {
                    case (?tokenBuffer) {
                        tokenBuffer.add(tokenId);
                    };
                    case null {
                        let newBuffer = Buffer.Buffer<RTokenId>(10);
                        newBuffer.add(tokenId);
                        groupTokens.put(token.groupId, newBuffer);
                    };
                };
                
                // User token index
                switch (userTokens.get(token.holder)) {
                    case (?tokenBuffer) {
                        tokenBuffer.add(tokenId);
                    };
                    case null {
                        let newBuffer = Buffer.Buffer<RTokenId>(10);
                        newBuffer.add(tokenId);
                        userTokens.put(token.holder, newBuffer);
                    };
                };
            };
        };

        // Initialize on creation
        initializeState();

        // ==================== UPGRADE HOOKS ====================
        
        public func preUpgrade() : ([(RTokenId, RToken)], [(Types.TransactionId, RTokenTransfer)], [(Principal, [(GroupId, Amount)])]) {
            let tokenEntries = Array.fromIter(tokens.entries());
            let transferEntries = Array.fromIter(transfers.entries());
            
            let holderEntries = Buffer.Buffer<(Principal, [(GroupId, Amount)])>(holderBalances.size());
            for ((principal, balanceMap) in holderBalances.entries()) {
                let balances = Array.fromIter(balanceMap.entries());
                holderEntries.add((principal, balances));
            };
            
            (tokenEntries, transferEntries, Buffer.toArray(holderEntries))
        };

        public func postUpgrade(
            _tokenEntries: [(RTokenId, RToken)],
            _transferEntries: [(Types.TransactionId, RTokenTransfer)], 
            _holderEntries: [(Principal, [(GroupId, Amount)])]
        ) {
            tokenEntries := _tokenEntries;
            transferEntries := _transferEntries;
            holderBalanceEntries := _holderEntries;
            initializeState();
        };

        // ==================== CORE R TOKEN FUNCTIONS ====================

        // Issue new R Tokens when user makes contribution
        public func issueRTokens(
            groupId: GroupId,
            recipient: Principal,
            contributionAmount: Amount,
            memo: ?Text
        ) : Result.Result<RTokenId, Error> {
            
            // Validate inputs
            if (not Utils.validatePrincipal(recipient)) {
                return #err(#UnauthorizedAccess);
            };
            
            if (not Utils.validateAmount(contributionAmount)) {
                return #err(#InvalidAmount);
            };

            let now = Time.now();
            let tokenId = tokenCounter;
            tokenCounter += 1;

            // Create new R Token
            let rToken: RToken = {
                id = tokenId;
                groupId = groupId;
                holder = recipient;
                originalAmount = contributionAmount;
                currentAmount = contributionAmount;
                issuedAt = now;
                lastYieldUpdate = now;
                accumulatedYield = 0;
                status = #active;
                memo = memo;
            };

            // Store token
            tokens.put(tokenId, rToken);
            
            // Update holder balance
            updateHolderBalance(recipient, groupId, contributionAmount, true);
            
            // Update indexes
            updateTokenIndexes(tokenId, rToken, null);

            Debug.print("R Token issued - ID: " # Nat.toText(tokenId) # 
                      ", Amount: " # Nat64.toText(contributionAmount) # " e8s");
            
            #ok(tokenId)
        };

        // Transfer R Tokens between group members
        public func transferRTokens(
            tokenId: RTokenId,
            from: Principal,
            to: Principal,
            amount: Amount,
            memo: ?Text
        ) : Result.Result<Types.TransactionId, Error> {
            
            // Validate inputs
            if (not Utils.validatePrincipal(from) or not Utils.validatePrincipal(to)) {
                return #err(#UnauthorizedAccess);
            };
            
            if (Principal.equal(from, to)) {
                return #err(#InvalidAmount);
            };
            
            if (not Utils.validateAmount(amount)) {
                return #err(#InvalidAmount);
            };

            // Get token
            switch (tokens.get(tokenId)) {
                case (?token) {
                    // Verify ownership and status
                    if (not Principal.equal(token.holder, from)) {
                        return #err(#UnauthorizedAccess);
                    };
                    
                    if (token.status != #active) {
                        return #err(#InvalidAmount); // Token not transferable
                    };
                    
                    if (token.currentAmount < amount) {
                        return #err(#InsufficientBalance);
                    };

                    let now = Time.now();
                    let transferId = transferCounter;
                    transferCounter += 1;

                    // Handle full vs partial transfer
                    if (token.currentAmount == amount) {
                        // Full token transfer - change ownership
                        let updatedToken = { token with 
                            holder = to;
                            lastYieldUpdate = now;
                        };
                        tokens.put(tokenId, updatedToken);
                        
                        // Update balances
                        updateHolderBalance(from, token.groupId, amount, false);
                        updateHolderBalance(to, token.groupId, amount, true);
                        
                        // Update user token indexes
                        updateTokenIndexes(tokenId, updatedToken, ?token);
                    } else {
                        // Partial transfer - create new token for recipient
                        let remainingToken = { token with 
                            currentAmount = token.currentAmount - amount;
                            lastYieldUpdate = now;
                        };
                        tokens.put(tokenId, remainingToken);

                        // Create new token for recipient
                        let newTokenId = tokenCounter;
                        tokenCounter += 1;
                        
                        let newToken: RToken = {
                            id = newTokenId;
                            groupId = token.groupId;
                            holder = to;
                            originalAmount = amount;
                            currentAmount = amount;
                            issuedAt = now;
                            lastYieldUpdate = now;
                            accumulatedYield = 0;
                            status = #active;
                            memo = ?("Transferred from token " # Nat.toText(tokenId));
                        };
                        tokens.put(newTokenId, newToken);
                        
                        // Update balances
                        updateHolderBalance(from, token.groupId, amount, false);
                        updateHolderBalance(to, token.groupId, amount, true);
                        
                        // Update indexes
                        updateTokenIndexes(newTokenId, newToken, null);
                    };

                    // Record transfer
                    let transfer: RTokenTransfer = {
                        id = transferId;
                        tokenId = tokenId;
                        from = from;
                        to = to;
                        amount = amount;
                        timestamp = now;
                        memo = memo;
                    };
                    transfers.put(transferId, transfer);

                    Debug.print("R Token transfer completed - Amount: " # Nat64.toText(amount) # " e8s");
                    #ok(transferId)
                };
                case null {
                    #err(#GroupNotFound) // Token not found
                };
            }
        };

        // Redeem R Tokens for ICP
        public func redeemRTokens(
            tokenId: RTokenId,
            holder: Principal,
            amount: Amount
        ) : Result.Result<Amount, Error> {
            
            switch (tokens.get(tokenId)) {
                case (?token) {
                    // Verify ownership and status
                    if (not Principal.equal(token.holder, holder)) {
                        return #err(#UnauthorizedAccess);
                    };
                    
                    if (token.status != #active) {
                        return #err(#InvalidAmount);
                    };
                    
                    if (token.currentAmount < amount) {
                        return #err(#InsufficientBalance);
                    };

                    let now = Time.now();

                    if (token.currentAmount == amount) {
                        // Full redemption - mark token as redeemed
                        let redeemedToken = { token with 
                            status = #redeemed;
                            lastYieldUpdate = now;
                        };
                        tokens.put(tokenId, redeemedToken);
                    } else {
                        // Partial redemption
                        let remainingToken = { token with 
                            currentAmount = token.currentAmount - amount;
                            lastYieldUpdate = now;
                        };
                        tokens.put(tokenId, remainingToken);
                    };

                    // Update holder balance
                    updateHolderBalance(holder, token.groupId, amount, false);

                    Debug.print("R Token redeemed - Amount: " # Nat64.toText(amount) # " e8s");
                    #ok(amount)
                };
                case null {
                    #err(#GroupNotFound)
                };
            }
        };

        // ==================== BALANCE & QUERY FUNCTIONS ====================

        // Get R Token balance for user in specific group
        public func getRTokenBalance(holder: Principal, groupId: GroupId) : Amount {
            switch (holderBalances.get(holder)) {
                case (?balanceMap) {
                    switch (balanceMap.get(groupId)) {
                        case (?balance) { balance };
                        case null { 0 };
                    };
                };
                case null { 0 };
            }
        };

        // Get all R Token balances for a user
        public func getAllRTokenBalances(holder: Principal) : [(GroupId, Amount)] {
            switch (holderBalances.get(holder)) {
                case (?balanceMap) {
                    Array.fromIter(balanceMap.entries())
                };
                case null { [] };
            }
        };

        // Get specific R Token details
        public func getRToken(tokenId: RTokenId) : ?RToken {
            tokens.get(tokenId)
        };

        // Get all R Tokens for a holder
        public func getHolderTokens(holder: Principal) : [RToken] {
            switch (userTokens.get(holder)) {
                case (?tokenIds) {
                    let tokenBuffer = Buffer.Buffer<RToken>(tokenIds.size());
                    for (tokenId in tokenIds.vals()) {
                        switch (tokens.get(tokenId)) {
                            case (?token) { tokenBuffer.add(token) };
                            case null { };
                        };
                    };
                    Buffer.toArray(tokenBuffer)
                };
                case null { [] };
            }
        };

        // Get all R Tokens in a group
        public func getGroupTokens(groupId: GroupId) : [RToken] {
            switch (groupTokens.get(groupId)) {
                case (?tokenIds) {
                    let tokenBuffer = Buffer.Buffer<RToken>(tokenIds.size());
                    for (tokenId in tokenIds.vals()) {
                        switch (tokens.get(tokenId)) {
                            case (?token) { tokenBuffer.add(token) };
                            case null { };
                        };
                    };
                    Buffer.toArray(tokenBuffer)
                };
                case null { [] };
            }
        };

        // ==================== HELPER FUNCTIONS ====================

        // Update holder balance tracking
        private func updateHolderBalance(holder: Principal, groupId: GroupId, amount: Amount, isAdd: Bool) {
            switch (holderBalances.get(holder)) {
                case (?balanceMap) {
                    let currentBalance = switch (balanceMap.get(groupId)) {
                        case (?balance) { balance };
                        case null { 0 };
                    };
                    
                    let newBalance = if (isAdd) {
                        currentBalance + amount
                    } else {
                        if (currentBalance >= amount) { currentBalance - amount } else { 0 }
                    };
                    
                    if (newBalance == 0) {
                        balanceMap.delete(groupId);
                    } else {
                        balanceMap.put(groupId, newBalance);
                    };
                };
                case null {
                    if (isAdd) {
                        let newBalanceMap = HashMap.HashMap<GroupId, Amount>(5, Nat.equal, Nat.hash);
                        newBalanceMap.put(groupId, amount);
                        holderBalances.put(holder, newBalanceMap);
                    };
                };
            }
        };

        // Update token ownership indexes
        private func updateTokenIndexes(tokenId: RTokenId, newToken: RToken, oldToken: ?RToken) {
            // Update group token index
            switch (groupTokens.get(newToken.groupId)) {
                case (?tokenBuffer) {
                    tokenBuffer.add(tokenId);
                };
                case null {
                    let newBuffer = Buffer.Buffer<RTokenId>(10);
                    newBuffer.add(tokenId);
                    groupTokens.put(newToken.groupId, newBuffer);
                };
            };

            // Update user token indexes
            switch (oldToken) {
                case (?old) {
                    if (not Principal.equal(old.holder, newToken.holder)) {
                        // Owner changed - update both old and new owner indexes
                        removeFromUserIndex(old.holder, tokenId);
                        addToUserIndex(newToken.holder, tokenId);
                    };
                };
                case null {
                    // New token
                    addToUserIndex(newToken.holder, tokenId);
                };
            }
        };

        // Add token to user index
        private func addToUserIndex(holder: Principal, tokenId: RTokenId) {
            switch (userTokens.get(holder)) {
                case (?tokenBuffer) {
                    tokenBuffer.add(tokenId);
                };
                case null {
                    let newBuffer = Buffer.Buffer<RTokenId>(10);
                    newBuffer.add(tokenId);
                    userTokens.put(holder, newBuffer);
                };
            };
        };

        // Remove token from user index
        private func removeFromUserIndex(holder: Principal, tokenId: RTokenId) {
            switch (userTokens.get(holder)) {
                case (?tokenBuffer) {
                    let newBuffer = Buffer.Buffer<RTokenId>(tokenBuffer.size());
                    for (id in tokenBuffer.vals()) {
                        if (id != tokenId) {
                            newBuffer.add(id);
                        };
                    };
                    userTokens.put(holder, newBuffer);
                };
                case null { };
            };
        };

        // ==================== STATISTICS & ANALYTICS ====================

        // Get total R Tokens issued for a group
        public func getGroupTokenStats(groupId: GroupId) : {totalTokens: Nat; totalValue: Amount; activeTokens: Nat} {
            var totalTokens = 0;
            var totalValue: Amount = 0;
            var activeTokens = 0;

            switch (groupTokens.get(groupId)) {
                case (?tokenIds) {
                    for (tokenId in tokenIds.vals()) {
                        switch (tokens.get(tokenId)) {
                            case (?token) {
                                totalTokens += 1;
                                totalValue += token.currentAmount;
                                if (token.status == #active) {
                                    activeTokens += 1;
                                };
                            };
                            case null { };
                        };
                    };
                };
                case null { };
            };

            {totalTokens = totalTokens; totalValue = totalValue; activeTokens = activeTokens}
        };

        // Get platform-wide R Token statistics
        public func getPlatformTokenStats() : {totalTokens: Nat; totalValue: Amount; totalHolders: Nat} {
            let totalTokens = tokens.size();
            var totalValue: Amount = 0;
            let totalHolders = holderBalances.size();

            for ((_, token) in tokens.entries()) {
                totalValue += token.currentAmount;
            };

            {totalTokens = totalTokens; totalValue = totalValue; totalHolders = totalHolders}
        };
    }
}