/*import Trie "mo:base/Trie";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Ledger "canister:icp_ledger_canister";

actor class LedgerDapp() = this {
    type AccountIdentifier = Ledger.AccountIdentifier;
    type Transaction = {
        from: AccountIdentifier;
        to: AccountIdentifier;
        amount: Nat64;
        fee: Nat64;
        memo: Nat64;
        timestamp: Time.Time;
        txType: Text; // "SEND", "RECEIVE", "TRANSFER"
    };

    // User state
    stable var userAccounts: Trie.Trie<Principal, AccountIdentifier> = Trie.empty();
    stable var transactions: Trie.Trie<AccountIdentifier, [Transaction]> = Trie.empty();

    // Register user account
    public shared(msg) func registerAccount(accountId: AccountIdentifier) : async Result.Result<(), Text> {
        switch (Trie.get(userAccounts, keyP(msg.caller), Principal.equal)) {
            case (null) {
                userAccounts := Trie.replace(userAccounts, keyP(msg.caller), Principal.equal, ?accountId).0;
                #ok();
            };
            case (_) { #err("Account already registered") };
        };
    };

    // Get user account ID
    public shared query(msg) func getAccount() : async ?AccountIdentifier {
        Trie.get(userAccounts, keyP(msg.caller), Principal.equal)
    };

    // Record transaction
    public shared(msg) func recordTransaction(
        to: AccountIdentifier,
        amount: Nat64,
        fee: Nat64,
        memo: Nat64,
        txType: Text
    ) : async Result.Result<(), Text> {
        switch (await getAccount()) {
            case (null) { #err("Account not registered") };
            case (?fromAccount) {
                let newTx = {
                    from = fromAccount;
                    to;
                    amount;
                    fee;
                    memo;
                    timestamp = Time.now();
                    txType;
                };

                // Update sender's transactions
                let senderTxs = Trie.get(transactions, keyHash(fromAccount),  Blob.equal).getOrElse([])//.getOrElse([]);
                transactions := Trie.replace(transactions, keyHash(fromAccount), Blob.equal, ?(newTx # senderTxs)).0;

                // Update receiver's transactions if different
                if (fromAccount != to) {
                    let receiverTxs = Trie.get(transactions, keyHash(to), Blob.equal).getOrElse([]);
                    let receiveTx = {
                        newTx with from = to; to = fromAccount; txType = "RECEIVE"
                    };
                    transactions := Trie.replace(transactions, keyHash(to), Blob.equal, ?(receiveTx # receiverTxs)).0;
                };

                #ok();
            };
        };
    };

    // Get user transactions
    public shared query(msg) func getTransactions() : async [Transaction] {
        switch (await getAccount()) {
            case (null) { [] };
            case (?account) {
                Trie.get(transactions, keyHash(account), Blob.equal).getOrElse([])
            };
        };
    };

    // Helper functions for Trie
    func keyP(p: Principal) : Trie.Key<Principal> = { key = p; hash = Principal.hash(p) };
    func keyHash(h: Blob) : Trie.Key<Blob> = { key = h; hash = Blob.hash(h) };

    // ICP Ledger interface
    //let ledger = actor "ryjl3-tyaaa-aaaaa-aaaba-cai" : Ledger.Self;

    // Transfer ICP
    public shared(msg) func transfer(
        to: AccountIdentifier,
        amount: Nat64,
        fee: Nat64,
        memo: Nat64
    ) : async Result.Result<Nat, Text> {
        switch (await getAccount()) {
            case (null) { #err("Account not registered") };
            case (?fromAccount) {
                let args : Ledger.TransferArgs = {
                    memo;
                    amount = { e8s = amount };
                    fee = { e8s = fee };
                    from_subaccount = null;
                    to;
                    created_at_time = null;
                };

                switch (await Ledger.transfer(args)) {
                    case (#Ok(blockHeight)) {
                        ignore await recordTransaction(to, amount, fee, memo, "SEND");
                        #ok(blockHeight);
                    };
                    case (#Err(e)) { #err(debug_show(e)) };
                };
            };
        };
    };
};*/

/*
module icp_ledger {
    public type AccountIdentifier = Blob;
    public type TransferArgs = {
        memo: Nat;
        amount: { e8s: Nat };
        fee: { e8s: Nat };
        from_subaccount: ?Blob;
        to: AccountIdentifier;
        created_at_time: ?Nat64;
    };
    public type TransferError = {
        #BadFee: { expected_fee: { e8s: Nat } };
        #InsufficientFunds: { balance: { e8s: Nat } };
        #TxTooOld: { allowed_window_nanos: Nat64 };
        #TxCreatedInFuture;
        #TxDuplicate: { duplicate_of: Nat };
    };
    public type TransferResult = {
        #Ok: Nat;
        #Err: TransferError;
    };
    public type Self = actor {
        transfer: TransferArgs -> async TransferResult;
    };
};*/