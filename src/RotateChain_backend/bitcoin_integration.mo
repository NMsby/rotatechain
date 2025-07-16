/*import BTC "canister:bitcoin";
import Blob "mo:base/Blob";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import SHA256 "mo:sha256";
import HashMap "mo:base/HashMap"; // Added HashMap import

actor class BitcoinWallet() = this {
  type Network = {
    #mainnet;
    #testnet;
    #regtest; // Add regtest support
  };

  type Satoshi = Nat64;

  private var userAddresses = HashMap.HashMap<Principal, Text>(0, Principal.equal, Principal.hash);
  
  private let btc : actor {
    get_balance : (address : Text, network : Network) -> async Satoshi;
    get_p2pkh_address : (key : [Nat8], network : Network) -> async Text;
    get_utxos : (address : Text, network : Network) -> async [Utxo];
  } = actor(Principal.toText(Principal.fromActor(BTC)));

  public type Utxo = {
    outpoint : { txid : [Nat8]; vout : Nat32 };
    value : Satoshi;
    height : Nat32;
  };

  // Generate new Bitcoin address
  public shared (msg) func generate_address(network : Network) : async Text {
    let principal = msg.caller;
    let pubkey = derivePublicKey(principal);
    let address = await btc.get_p2pkh_address(pubkey, network);
    userAddresses.put(principal, address);
    address
  };

  // Get Bitcoin balance
  public shared (msg) func get_balance(network : Network) : async Satoshi {
    let principal = msg.caller;
    switch (userAddresses.get(principal)) {
      case (?address) { await btc.get_balance(address, network) };
      case null { throw Error.reject("Generate an address first") };
    }
  };

  // Get UTXOs
  public shared (msg) func get_utxos(network : Network) : async [Utxo] {
    let principal = msg.caller;
    switch (userAddresses.get(principal)) {
      case (?address) { await btc.get_utxos(address, network) };
      case null { throw Error.reject("Generate an address first") };
    }
  };

  // Derive public key from Principal
  private func derivePublicKey(principal : Principal) : [Nat8] {
    let bytes = Blob.toArray(Principal.toBlob(principal));
    SHA256.sha256(bytes); // Using SHA256 for demo (not secure for real wallets!)
  };
};*/