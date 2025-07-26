import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Ledger "canister:icp_ledger_canister";

actor PaymentProcessor {
  type Network = {
    #mainnet;
    #testnet;
  };

  type Payment = {
    id: Nat;
    sender: Principal;
    receiver: Text;
    amount: Nat64;
    timestamp: Int;
    network: Network;
    status: { #pending; #completed; #failed };
  };

  private stable var paymentId: Nat = 0;
  private var payments = HashMap.HashMap<Principal, [Payment]>(0, Principal.equal, Principal.hash);
  private var lastBalances = HashMap.HashMap<Principal, Nat64>(0, Principal.equal, Principal.hash);

  // Record a payment
  public shared (msg) func recordPayment(
    receiver: Text,
    amount: Nat64,
    network: Network
  ) : async Nat {
    paymentId += 1;
    let newPayment: Payment = {
      id = paymentId;
      sender = msg.caller;
      receiver;
      amount;
      timestamp = Time.now();
      network;
      status = #pending;
    };

    let userPayments = switch (payments.get(msg.caller)) {
      case (?p) Buffer.fromArray<Payment>(p);
      case null Buffer.Buffer<Payment>(0);
    };

    userPayments.add(newPayment);
    payments.put(msg.caller, Buffer.toArray(userPayments));
    paymentId
  };

  // Update payment status
  public shared (msg) func updatePaymentStatus(
    paymentId: Nat,
    status: { #pending; #completed; #failed }
  ) : async Bool {
    switch (payments.get(msg.caller)) {
      case (?userPayments) {
        for (payment in userPayments.vals()) {
          if (payment.id == paymentId) {
            let updatedPayment = {
              payment with status = status
            };
            let updatedPayments = Array.map(userPayments, func(p: Payment) : Payment {
              if (p.id == paymentId) updatedPayment else p
            });
            payments.put(msg.caller, updatedPayments);
            return true;
          }
        };
        false;
      };
      case null false;
    }
  };

  // Get user's payment history
  public query (msg) func getPayments() : async [Payment] {
    switch (payments.get(msg.caller)) {
      case (?p) p;
      case null [];
    }
  };

  // Store last known balance
  public shared (msg) func storeBalance(balance: Nat64) : async () {
    lastBalances.put(msg.caller, balance);
  };

  // Get last known balance
  public query (msg) func getLastBalance() : async Nat64 {
    switch (lastBalances.get(msg.caller)) {
      case (?b) b;
      case null 0;
    }
  };
};