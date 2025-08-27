// r_token_manager.mo - Complete R Token management system
import RBTree "mo:base/RBTree";
import Buffer "mo:base/Buffer";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Nat64 "mo:base/Nat64";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

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
        
        // ==================== NON-STABLE VARIABLES ====================
        private var tokenCounter: RTokenId = 0;
        private var transferCounter: Types.TransactionId = 0;

        // ==================== RUNTIME STATE ====================
        private var tokens = RBTree.RBTree<RTokenId, RToken>(Nat.compare);
        private var transfers = RBTree.RBTree<Types.TransactionId, RTokenTransfer>(Nat64.compare);
        
        // Track balances: Principal -> (GroupId -> Amount)
        private var holderBalances = RBTree.RBTree<Principal, RBTree.RBTree<GroupId, Amount>>(
            Principal.compare
        );
        
        // Token ownership index: GroupId -> [RTokenId]
        private var groupTokens = RBTree.RBTree<GroupId, Buffer.Buffer<RTokenId>>(
            Nat.compare
        );
        
        // User token index: Principal -> [RTokenId]
        private var userTokens = RBTree.RBTree<Principal, Buffer.Buffer<RTokenId>>(
            Principal.compare
        );


        // ==================== INITIALIZATION ====================
        
        // Initialize with provided state (called from actor's post upgrade)
        public func initializeFromState(
            tokenEntries: [(RTokenId, RToken)],
            transferEntries: [(Types.TransactionId, RTokenTransfer)], 
            holderEntries: [(Principal, [(GroupId, Amount)])]
        ) {
             // Create new trees and batch-load them
            let newTokens = RBTree.RBTree<RTokenId, RToken>(Nat.compare);
            let newTransfers = RBTree.RBTree<Types.TransactionId, RTokenTransfer>(Nat64.compare);
            
            // Batch load with counter tracking
            for ((id, token) in tokenEntries.vals()) {
                newTokens.put(id, token);
                if (id >= tokenCounter) {
                    tokenCounter := id + 1;
                };
            };
            
            for ((id, transfer) in transferEntries.vals()) {
                newTransfers.put(id, transfer);
                if (id >= transferCounter) {
                    transferCounter := id + 1;
                };
            };
            
            // Replace the trees atomically
            tokens := newTokens;
            transfers := newTransfers;
            
            // Rebuild holder balances
            let newHolderBalances = RBTree.RBTree<Principal, RBTree.RBTree<GroupId, Amount>>(Principal.compare);
            for ((principal, balances) in holderEntries.vals()) {
                let balanceTree = RBTree.RBTree<GroupId, Amount>(Nat.compare);
                for ((groupId, amount) in balances.vals()) {
                    balanceTree.put(groupId, amount);
                };
                newHolderBalances.put(principal, balanceTree);
            };
            holderBalances := newHolderBalances;
            
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

        // ==================== STATE EXPORT FOR UPGRADES ====================
        
        public func exportState() : ([(RTokenId, RToken)], [(Types.TransactionId, RTokenTransfer)], [(Principal, [(GroupId, Amount)])]) {
            let tokenEntries = Iter.toArray(tokens.entries());
            let transferEntries = Iter.toArray(transfers.entries());
            
            let holderEntries = Buffer.Buffer<(Principal, [(GroupId, Amount)])>(RBTree.size(holderBalances.share()));
            for ((principal, balanceTree) in holderBalances.entries()) {
                let balances = Iter.toArray(balanceTree.entries());
                holderEntries.add((principal, balances));
            };
            
            (tokenEntries, transferEntries, Buffer.toArray(holderEntries))
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
            memo: ?Text,
            groupMembers: [Principal] // Add group membership validation
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

            // Validate both parties are group members
            let fromIsMember = Array.find<Principal>(groupMembers, func(p) = Principal.equal(p, from)) != null;
            let toIsMember = Array.find<Principal>(groupMembers, func(p) = Principal.equal(p, to)) != null;
            
            if (not fromIsMember or not toIsMember) {
                return #err(#NotMember);
            };

            // Get token and validate
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

                    // Record transfer with enhanced metadata
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

                    // Add comprehensive logging
                    Debug.print("R Token transfer completed");
                    Debug.print("Transfer ID: " # Nat64.toText(transferId));
                    Debug.print("Token ID: " # Nat.toText(tokenId));
                    Debug.print("From: " # Principal.toText(from));
                    Debug.print("To: " # Principal.toText(to));
                    Debug.print("Amount: " # Nat64.toText(amount) # " e8s");
                    
                    #ok(transferId)
                };
                case null {
                    #err(#GroupNotFound) // Token not found
                };
            }
        };

        // Get transfer history for a user
        public func getUserTransferHistory(user: Principal) : [Types.RTokenTransfer] {
            let userTransfers = Buffer.Buffer<Types.RTokenTransfer>(100);
            for ((_, transfer) in transfers.entries()) {
                if (Principal.equal(transfer.from, user) or Principal.equal(transfer.to, user)) {
                    userTransfers.add(transfer);
                };
            };
            Buffer.toArray(userTransfers)
        };

        // Get specific transfer details
        public func getTransferDetails(transferId: Types.TransactionId) : ?Types.RTokenTransfer {
            transfers.get(transferId)
        };

        // Get all transfers for a specific token
        public func getTokenTransferHistory(tokenId: Types.RTokenId) : [Types.RTokenTransfer] {
            let tokenTransfers = Buffer.Buffer<Types.RTokenTransfer>(50);
            for ((_, transfer) in transfers.entries()) {
                if (transfer.tokenId == tokenId) {
                    tokenTransfers.add(transfer);
                };
            };
            Buffer.toArray(tokenTransfers)
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

        // ==================== YIELD FUNCTIONS ====================

        // Update R Token with accumulated yield
        public func updateTokenYield(tokenId: RTokenId, yieldAmount: Amount) : Result.Result<Bool, Error> {
            switch (tokens.get(tokenId)) {
                case (?token) {
                    if (token.status != #active) {
                        return #err(#InvalidAmount); // Cannot update inactive tokens
                    };

                    let updatedToken: RToken = {
                        id = token.id;
                        groupId = token.groupId;
                        holder = token.holder;
                        originalAmount = token.originalAmount;
                        currentAmount = token.currentAmount + yieldAmount;
                        issuedAt = token.issuedAt;
                        lastYieldUpdate = Time.now();
                        accumulatedYield = token.accumulatedYield + yieldAmount;
                        status = token.status;
                        memo = token.memo;
                    };

                    // Update token in storage
                    tokens.put(tokenId, updatedToken);
                    
                    // Update holder balance
                    updateHolderBalance(token.holder, token.groupId, yieldAmount, true);

                    Debug.print("R Token yield updated - ID: " # Nat.toText(tokenId) # 
                            ", Yield: " # Nat64.toText(yieldAmount) # " e8s" #
                            ", New Total: " # Nat64.toText(updatedToken.currentAmount) # " e8s");
                    
                    #ok(true)
                };
                case null { #err(#InvalidAmount) }; // Token not found
            }
        };

        // ==================== BALANCE & QUERY FUNCTIONS ====================

        // Get R Token balance for user in specific group
        public func getRTokenBalance(holder: Principal, groupId: GroupId) : Amount {
            switch (holderBalances.get(holder)) {
                case (?balanceTree) {
                    switch (balanceTree.get(groupId)) {
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
                case (?balanceTree) {
                    Iter.toArray(balanceTree.entries())
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
            let balanceTree = switch (holderBalances.get(holder)) {
                case (?tree) { tree };
                case null {
                    let newTree = RBTree.RBTree<GroupId, Amount>(Nat.compare);
                    holderBalances.put(holder, newTree);
                    newTree
                };
            };
            
            let currentBalance: Amount = switch (balanceTree.get(groupId)) {
                case (?balance) { balance };
                case null { 0 };
            };
            
            let newBalance: Amount = if (isAdd) {
                currentBalance + amount
            } else {
                if (currentBalance >= amount) { currentBalance - amount } else { 0 }
            };
            
            if (newBalance == 0) {
                balanceTree.delete(groupId);
            } else {
                balanceTree.put(groupId, newBalance);
            };
        };

        // Update token indexes
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
            let totalTokens = RBTree.size(tokens.share());
            var totalValue: Amount = 0;
            let totalHolders = RBTree.size(holderBalances.share());

            for ((_, token) in tokens.entries()) {
                totalValue += token.currentAmount;
            };

            {totalTokens = totalTokens; totalValue = totalValue; totalHolders = totalHolders}
        };
    }
}