// payment_handler.mo - Complete ICP payment integration
import Types "./types";
import Utils "./utils";
import ICPPaymentService "./icp_payment_service";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";

module PaymentHandler {

    // Get pool principal dynamically to avoid static expression error
    private func getPoolPrincipal() : Principal {
        Principal.fromText("2vxsx-fae"); // Placeholder - will be replaced with actual cansiter principal
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

        // Process real ICP transfer through payment service
        switch (await ICPPaymentService.processGroupContribution(
            contributor,
            groupId,
            amount,
            poolPrincipal
        )) {
            case (#ok(blockIndex)) { 
                // Convert block index to transaction ID
                let transactionId = blockIndex;

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

        // Process real ICP payout transfer
        switch (await ICPPaymentService.processRotationPayout(
            poolPrincipal,
            recipient,
            amount,
            groupId,
            roundNumber
        )) {
            case (#ok(blockIndex)) {
                let transactionId = blockIndex;                
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
        expectedAmount: Types.Amount
    ) : async Bool {
        await ICPPaymentService.verifyTransaction(transactionId, expectedAmount)
    };

    // Get pool account info
    public func getPoolAccountInfo() : async {principal: Principal; accountId: Blob} {
        let poolPrincipal = getPoolPrincipal();
        {
            principal = poolPrincipal;
            accountId = ICPPaymentService.getCanisterAccountId(poolPrincipal);
        }
    };
}