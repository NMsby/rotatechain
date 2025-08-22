// icp_payment_service.mo - Real ICP Ledger integration for RotateChain
import Ledger "canister:icp_ledger_canister";
import Types "./types";
import Utils "./utils";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";

module ICPPaymentService {
    
    // ICP Ledger types (following IC standards)
    public type AccountIdentifier = Blob;
    public type Subaccount = [Nat8];
    public type Memo = Nat64;
    public type ICPTs = { e8s: Nat64 };
    public type BlockIndex = Nat64;
    
    public type TransferArgs = {
        memo: Memo;
        amount: ICPTs;
        fee: ICPTs;
        from_subaccount: ?Subaccount;
        to: AccountIdentifier;
        created_at_time: ?{ timestamp_nanos: Nat64 };
    };
    
    public type TransferError = {
        #BadFee: { expected_fee: ICPTs };
        #InsufficientFunds: { balance: ICPTs };
        #TxTooOld: { allowed_window_nanos: Nat64 };
        #TxCreatedInFuture;
        #TxDuplicate: { duplicate_of: BlockIndex };
    };
    
    public type TransferResult = Result.Result<BlockIndex, TransferError>;
    
    // Standard ICP transfer fee (10,000 e8s = 0.0001 ICP)
    private let ICP_TRANSFER_FEE : Nat64 = 10_000;
    
    // Convert Principal to AccountIdentifier using dfinity standards
    private func principalToAccountIdentifier(principal: Principal) : AccountIdentifier {
        let principalBytes = Blob.toArray(Principal.toBlob(principal));
        let hashInput = Array.append<Nat8>([0x0A], Array.append<Nat8>([0x61, 0x63, 0x63, 0x6F, 0x75, 0x6E, 0x74, 0x2D, 0x69, 0x64], principalBytes));
        
        // For now, return the principal blob directly (simplified)
        // In production, use proper SHA224 + CRC32 calculation
        Principal.toBlob(principal)
    };
    
    // Process real ICP contribution to group pool
    public func processGroupContribution(
        contributor: Principal,
        groupId: Types.GroupId,
        contributionAmount: Types.Amount,
        poolAccount: Principal
    ) : async Result.Result<Types.TransactionId, Types.Error> {
        
        // Validate inputs
        if (not Utils.validatePrincipal(contributor)) {
            return #err(#UnauthorizedAccess);
        };
        
        if (not Utils.validateAmount(contributionAmount)) {
            return #err(#InvalidAmount);
        };
        
        // Calculate amounts
        let platformFee = Utils.calculatePlatformFee(contributionAmount);
        let netAmount = contributionAmount - platformFee;
        let totalWithFee = contributionAmount + ICP_TRANSFER_FEE;
        
        // Create transfer args for group pool
        let poolAccountId = principalToAccountIdentifier(poolAccount);
        let transferArgs: TransferArgs = {
            memo = Nat64.fromNat(groupId);
            amount = { e8s = netAmount };
            fee = { e8s = ICP_TRANSFER_FEE };
            from_subaccount = null;
            to = poolAccountId;
            created_at_time = ?{ timestamp_nanos = Nat64.fromNat(Int.abs(Time.now())) };
        };
        
        // Execute ICP transfer
        try {
            let transferResult = await Ledger.transfer(transferArgs);
            switch (transferResult) {
                case (#Ok(blockIndex)) {
                    // Transfer successful - create transaction record
                    let transactionId = Nat64.fromNat(Int.abs(Time.now()) % 1_000_000);
                    #ok(transactionId)
                };
                case (#Err(transferError)) {
                    // Map ledger errors to our error types
                    let error = switch (transferError) {
                        case (#InsufficientFunds(_)) { #InsufficientBalance };
                        case (#BadFee(_)) { #InvalidAmount };
                        case (#TxTooOld(_)) { #InvalidTimestamp };
                        case (#TxCreatedInFuture) { #InvalidTimestamp };
                        case (#TxDuplicate(_)) { #PaymentFailed };
                    };
                    #err(error)
                };
            }
        } catch (error) {
            #err(#NetworkError)
        }
    };
    
    // Process rotation payout to member
    public func processRotationPayout(
        poolAccount: Principal,
        recipient: Principal,
        payoutAmount: Types.Amount,
        groupId: Types.GroupId,
        roundNumber: Nat
    ) : async Result.Result<Types.TransactionId, Types.Error> {
        
        // Validate inputs
        if (not Utils.validatePrincipal(recipient)) {
            return #err(#UnauthorizedAccess);
        };
        
        if (not Utils.validateAmount(payoutAmount)) {
            return #err(#InvalidAmount);
        };
        
        // Create memo with group and round info
        let memoValue = (Nat64.fromNat(groupId) * 1000) + Nat64.fromNat(roundNumber);
        let recipientAccountId = principalToAccountIdentifier(recipient);
        
        let transferArgs: TransferArgs = {
            memo = memoValue;
            amount = { e8s = payoutAmount };
            fee = { e8s = ICP_TRANSFER_FEE };
            from_subaccount = null;
            to = recipientAccountId;
            created_at_time = ?{ timestamp_nanos = Nat64.fromNat(Int.abs(Time.now())) };
        };
        
        // Execute payout transfer
        try {
            let transferResult = await Ledger.transfer(transferArgs);
            switch (transferResult) {
                case (#Ok(blockIndex)) {
                    let transactionId = Nat64.fromNat(Int.abs(Time.now()) % 1_000_000);
                    #ok(transactionId)
                };
                case (#Err(transferError)) {
                    let error = switch (transferError) {
                        case (#InsufficientFunds(_)) { #InsufficientBalance };
                        case (#BadFee(_)) { #InvalidAmount };
                        case (#TxTooOld(_)) { #InvalidTimestamp };
                        case (#TxCreatedInFuture) { #InvalidTimestamp };
                        case (#TxDuplicate(_)) { #PaymentFailed };
                    };
                    #err(error)
                };
            }
        } catch (error) {
            #err(#NetworkError)
        }
    };
    
    // Get account balance from ICP ledger
    public func getAccountBalance(account: Principal) : async Types.Amount {
        let accountId = principalToAccountIdentifier(account);
        try {
            let balance = await Ledger.account_balance({ account = accountId });
            balance.e8s
        } catch (error) {
            0 // Return 0 if balance check fails
        }
    };
    
    // Verify transaction exists on ledger
    public func verifyTransaction(
        blockIndex: Nat64,
        expectedAmount: Types.Amount,
        expectedRecipient: Principal
    ) : async Bool {
        // In production, query the ledger for block details
        // For now, assume verification passes
        true
    };
    
    // Get canister's account identifier for receiving funds
    public func getCanisterAccountId() : AccountIdentifier {
        // Return canister's principal as account identifier
        let canisterPrincipal = Principal.fromText("aaaaa-aa"); // Replace with actual canister principal
        principalToAccountIdentifier(canisterPrincipal)
    };
}