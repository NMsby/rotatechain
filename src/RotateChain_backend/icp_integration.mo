import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
//SHA256 is outdated
//import SHA256 "mo:base/Sha256";
import Nat8 "mo:base/Nat8";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat64 "mo:base/Nat64";
//import Text "mo:base/Text";
import Char "mo:base/Char";
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



  /*these are the functions for generating the subaccounts*/

      /* // Type alias for SubAccount (32 bytes)
      // the size of subaccount should be 32 bytes
      public type SubAccount = [Nat8];


      //for the nonce
      // timestamp generator
      
      // Returns current timestamp in nanoseconds since UNIX epoch (1970-01-01)
      public func currentTimestamp() : Nat64 {
          Nat64.fromNat(Int.abs(Time.now()))
      };


      // Simple conversion to decimal text representation to be used by my nonce generator
      public func toText(timestamp : Nat64) : Text {
          Nat64.toText(timestamp)
      };

      // Returns current timestamp in seconds since UNIX epoch
      public func currentTimestampSeconds() : Nat64 {
          Nat64.fromNat(Int.abs(Time.now()) / 1_000_000_000)
      };

      // Converts nanoseconds timestamp to seconds
      public func nanosToSeconds(nanos : Nat64) : Nat64 {
          nanos / 1_000_000_000
      };

      // Converts seconds timestamp to nanoseconds
      public func secondsToNanos(seconds : Nat64) : Nat64 {
          seconds * 1_000_000_000
      };

      // Generates a timestamp Blob (8 bytes) suitable for nonce generation
      public func timestampBlob() : Blob {
          let timestamp = currentTimestamp();
          Blob.fromArray([
              Nat8.fromNat(Nat64.toNat(timestamp >> 56)),
              Nat8.fromNat(Nat64.toNat(timestamp >> 48 & 0xFF)),
              Nat8.fromNat(Nat64.toNat(timestamp >> 40 & 0xFF)),
              Nat8.fromNat(Nat64.toNat(timestamp >> 32 & 0xFF)),
              Nat8.fromNat(Nat64.toNat(timestamp >> 24 & 0xFF)),
              Nat8.fromNat(Nat64.toNat(timestamp >> 16 & 0xFF)),
              Nat8.fromNat(Nat64.toNat(timestamp >> 8 & 0xFF)),
              Nat8.fromNat(Nat64.toNat(timestamp & 0xFF)),
          ])
      };


      // ----end of nonce generator----- 

      // Generates a deterministic Blob nonce from two Text parameters
      //when calling it call it pass it the chainName and then the Timestamp through the method
      // toText(currentTimestamp())
      public func generateNonce(chainName : Text, timestamp : Text) : Blob {
          // Convert both text parameters to Blobs
          let blob1 = Text.encodeUtf8(param1);
          let blob2 = Text.encodeUtf8(param2);
          
          // Combine the two blobs into a single array
          let array1 = Blob.toArray(blob1);
          let array2 = Blob.toArray(blob2);
          let combined = Array.append(array1, array2);
          
          // Hash the combined array to get a fixed-size nonce
          let hashed = SHA256.sha256(combined);
          
          // Convert back to Blob
          Blob.fromArray(hashed)
      };

      // Helper function to convert Blob to Hex string (for debugging)
      public func blobToHex(blob : Blob) : Text {
          let bytes = Blob.toArray(blob);
          var hex = "";
          for (byte in bytes.vals()) {
              let nibble1 = byte >> 4;
              let nibble2 = byte & 0x0F;
              hex #= Nat8.toText(nibble1) # Nat8.toText(nibble2);
          };
          hex
      };



      // Generates a subaccount from a principal and a unique identifier (nonce)
      //for the nonce parameter use the method generateNonce("watendakazi",toText(currentTimestamp()))
      public func generateSubaccount(canisterPrincipal : Principal, nonce : Blob) : SubAccount {
          // Convert the nonce to a hash to ensure it's 32 bytes
          let hashedNonce = SHA256.sha256(Blob.toArray(nonce));
          
          // Convert principal to bytes
          let principalBytes = Blob.toArray(Principal.toBlob(canisterPrincipal));
          
          // Create a buffer to combine principal and nonce
          let combined = Array.tabulate<Nat8>(
              principalBytes.size() + hashedNonce.size(),
              func(i : Nat) : Nat8 {
                  if (i < principalBytes.size()) {
                    return principalBytes[i]
                  }
                  else{
                    return hashedNonce[i - principalBytes.size()]
                  }
              }
          );
          
          // Hash the combined bytes to get the final subaccount
          let subaccountBytes = SHA256.sha256(combined);
          
          // Ensure the subaccount is exactly 32 bytes
          Array.tabulate<Nat8>(
              32,
              func(i : Nat) : Nat8 {
                  if (i < subaccountBytes.size()){
                    return subaccountBytes[i]
                  }else{
                    return 0
                  }
              }
          )
      };

      // Helper function to convert SubAccount to Blob
      public func subaccountToBlob(subaccount : SubAccount) : Blob {
          Blob.fromArray(subaccount)
      };

      // Helper function to convert SubAccount to Hex string (for debugging)
      public func subaccountToHex(subaccount : SubAccount) : Text {
          var hex = "";
          for (byte in subaccount.vals()) {
              let nibble1 = byte >> 4;
              let nibble2 = byte & 0x0F;
              hex #= Nat8.toText(nibble1) # Nat8.toText(nibble2);
          };
          hex
      };
  */
  /*----end of functions to generate the subaccounts------*/



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

