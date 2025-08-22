// payment_handler.mo - Complete ICP payment integration
import Types "./types";
import Utils "./utils";
import ICPPaymentService "./icp_payment_service";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";

module PaymentHandler {

    // Pool account for holding group funds (in production, this would be the canister's account)
    private func getPoolPrincipal() : Principal {
        Principal.fromText("2vxsx-fae"); // Replace with actual pool account
    };
    
    // Process real group contribution with ICP transfer
    public func processContribution(
        groupId: Types.GroupId,
        contributor: Principal,
        amount: Types.Amount,
        groupContributionAmount: Types.Amount
    ) : async Result.Result<Types.TransactionId, Types.Error> {
        
        // Validate contribution amount matches requirement
        if (amount != groupContributionAmount) {
            return #err(#InvalidAmount);
        };
        
        // Validate amount is within bounds
        if (not Utils.validateAmount(amount)) {
            return #err(#InvalidAmount);
        };

        // Get pool principal dynamically
        let poolPrincipal = getPoolPrincipal();

        // Check contributor has sufficient balance
        let contributorBalance = await ICPPaymentService.getAccountBalance(contributor);
        let requiredAmount = amount + 10_000; // Amount + transfer fee
        
        if (contributorBalance < requiredAmount) {
            return #err(#InsufficientBalance);
        };

        // Process real ICP transfer
        switch (await ICPPaymentService.processGroupContribution(
            contributor,
            groupId,
            amount,
            poolPrincipal
        )) {
            case (#ok(transactionId)) {
                // Create transaction record
                let transaction: Types.Transaction = {
                    id = transactionId;
                    groupId = groupId;
                    from = contributor;
                    to = null; // Pool contribution
                    amount = amount;
                    timestamp = Time.now();
                    transactionType = #contribution;
                    memo = ?Utils.createTransactionMemo(#contribution, groupId, null);
                    blockHeight = ?transactionId; // Using transaction ID as block reference
                };
                
                #ok(transactionId)
            };
            case (#err(error)) {
                #err(error)
            };
        }
    };
    
    // Process real rotation payout with ICP transfer
    public func processRotationPayout(
        groupId: Types.GroupId,
        recipient: Principal,
        amount: Types.Amount,
        roundNumber: Nat
    ) : async Result.Result<Types.TransactionId, Types.Error> {
        
        // Validate recipient
        if (not Utils.validatePrincipal(recipient)) {
            return #err(#UnauthorizedAccess);
        };
        
        // Validate amount
        if (not Utils.validateAmount(amount)) {
            return #err(#InvalidAmount);
        };

        // Get pool principal dynamically
        let poolPrincipal = getPoolPrincipal();

        // Check pool has sufficient balance
        let poolBalance = await ICPPaymentService.getAccountBalance(poolPrincipal);
        let requiredAmount = amount + 10_000; // Amount + transfer fee
        
        if (poolBalance < requiredAmount) {
            return #err(#InsufficientBalance);
        };

        // Process real ICP payout transfer
        switch (await ICPPaymentService.processRotationPayout(
            POOL_PRINCIPAL,
            recipient,
            amount,
            groupId,
            roundNumber
        )) {
            case (#ok(transactionId)) {
                // Create payout transaction record
                let transaction: Types.Transaction = {
                    id = transactionId;
                    groupId = groupId;
                    from = POOL_PRINCIPAL;
                    to = ?recipient;
                    amount = amount;
                    timestamp = Time.now();
                    transactionType = #payout;
                    memo = ?Utils.createTransactionMemo(#payout, groupId, ?"Round " # Nat.toText(roundNumber));
                    blockHeight = ?transactionId;
                };
                
                #ok(transactionId)
            };
            case (#err(error)) {
                #err(error)
            };
        }
    };
    
    // Get real account balance from ICP ledger
    public func getAccountBalance(principal: Principal) : async Types.Amount {
        await ICPPaymentService.getAccountBalance(principal)
    };
    
    // Verify real payment was processed
    public func verifyPayment(
        transactionId: Types.TransactionId,
        expectedAmount: Types.Amount,
        expectedRecipient: Principal
    ) : async Bool {
        await ICPPaymentService.verifyTransaction(transactionId, expectedAmount, expectedRecipient)
    };

    // Get pool account info
    public func getPoolAccountInfo() : {principal: Principal; accountId: Blob} {
        let poolPrincipal = getPoolPrincipal();
        {
            principal = poolPrincipal;
            accountId = ICPPaymentService.getCanisterAccountId();
        }
    };
}