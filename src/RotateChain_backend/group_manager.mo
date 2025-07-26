/*import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Hex "mo:base/Hex";
import Error "mo:base/Error";
import Debug "mo:base/Debug";
import JSON "mo:base/JSON";
import Random "mo:base/Random";
import Http "mo:base/Http";

actor GroupManager {
  // ========== TYPE DECLARATIONS ==========
  public type GroupId = Text;
  public type InviteToken = Text;
  public type UserId = Principal;
  public type Email = Text;

  public type Group = {
    name : Text;
    owner : UserId;
    members : [UserId];
    createdAt : Int;
  };

  public type Invite = {
    groupId : GroupId;
    creator : UserId;
    email : Email;
    expiresAt : Int;
    used : Bool;
  };

  // ========== CONFIGURATION ==========
  let EMAIL_SERVICE_URL = "https://api.sendgrid.com/v3/mail/send";
  let EMAIL_SERVICE_API_KEY = "your-sendgrid-api-key";
  let FROM_EMAIL = "noreply@yourdapp.ic0.app";

  // ========== STATE VARIABLES ==========
  stable var groupsStable : [(GroupId, Group)] = [];
  stable var invitesStable : [(InviteToken, Invite)] = [];
  stable var userGroupsStable : [(UserId, [GroupId])] = [];

  var groups = HashMap.fromIter<GroupId, Group>(groupsStable.vals(), 10, Text.equal, Text.hash);
  var invites = HashMap.fromIter<InviteToken, Invite>(invitesStable.vals(), 10, Text.equal, Text.hash);
  var userGroups = HashMap.fromIter<UserId, [GroupId]>(userGroupsStable.vals(), 10, Principal.equal, Principal.hash);

  // ========== SYSTEM METHODS ==========
  system func preupgrade() {
    groupsStable := Iter.toArray(groups.entries());
    invitesStable := Iter.toArray(invites.entries());
    userGroupsStable := Iter.toArray(userGroups.entries());
  };

  system func postupgrade() {
    groupsStable := [];
    invitesStable := [];
    userGroupsStable := [];
  };

  // ========== PRIVATE FUNCTIONS ==========
  func generateToken() : async InviteToken {
    let randomBytes = Blob.toArray(await Random.blob());
    Hex.encode(Blob.fromArray(randomBytes));
  };

  func isValidEmail(email : Text) : Bool {
    let parts = Text.split(email, #char '@');
    let partsArray = Iter.toArray(parts);
    if (partsArray.size() != 2) return false;
    let domainParts = Text.split(partsArray[1], #char '.');
    Iter.toArray(domainParts).size() >= 2
  };

  func updateUserGroups(user : UserId, groupId : GroupId) {
    let currentGroups = switch (userGroups.get(user)) {
      case null { [] };
      case (?groups) { groups };
    };
    if (Array.find<GroupId>(currentGroups, func (g : GroupId) : Bool { g == groupId }) == null) {
      userGroups.put(user, Array.append<GroupId>(currentGroups, [groupId]));
    };
  };

  // ========== PUBLIC INTERFACE ==========
  public shared(msg) func createGroup(name : Text) : async Result.Result<GroupId, Text> {
    let groupId = await generateToken();
    let group : Group = {
      name = name;
      owner = msg.caller;
      members = [msg.caller];
      createdAt = Time.now();
    };

    groups.put(groupId, group);
    updateUserGroups(msg.caller, groupId);
    #ok(groupId);
  };

  public shared(msg) func createEmailInvite(
    groupId : GroupId,
    email : Email,
    expiresInHours : Nat
  ) : async Result.Result<InviteToken, Text> {
    if (not isValidEmail(email)) {
      return #err("Invalid email address");
    };

    switch (groups.get(groupId)) {
      case null { #err("Group not found") };
      case (?group) {
        if (group.owner != msg.caller) {
          return #err("Only group owner can create invites");
        };

        let token = await generateToken();
        let invite : Invite = {
          groupId = groupId;
          creator = msg.caller;
          email = email;
          expiresAt = Time.now() + expiresInHours * 60 * 60 * 1_000_000_000;
          used = false;
        };

        invites.put(token, invite);

        let inviteLink = "https://" # Principal.toText(Principal.fromActor(GroupManager)) # ".ic0.app/join/" # token;
        let emailBody = {
          personalizations = [{
            to = [{ email = email }];
          }];
          from = { email = FROM_EMAIL };
          subject = "Invitation to join group";
          content = [
            {
              type = "text/plain";
              value = "Join link: " # inviteLink;
            },
            {
              type = "text/html";
              value = "<p>You've been invited to join a group. Click <a href=\"" # inviteLink # "\">here</a> to join.</p>";
            }
          ];
        };

        let emailBodyText = switch (JSON.encode(emailBody)) {
          case (#ok(json)) { json };
          case (#err(e)) { 
            Debug.print("Failed to encode email body: " # Error.message(e));
            return #err("Failed to prepare email");
          };
        };

        let request : Http.HttpRequest = {
          method = "POST";
          url = EMAIL_SERVICE_URL;
          headers = [
            ("Content-Type", "application/json"),
            ("Authorization", "Bearer " # EMAIL_SERVICE_API_KEY)
          ];
          body = Text.encodeUtf8(emailBodyText);
        };

        try {
          let response = await Http.http_request(request);
          
          if (response.status_code >= 200 and response.status_code < 300) {
            #ok(token);
          } else {
            Debug.print("Email service error: " # debug_show(response));
            #err("Failed to send email");
          };
        } catch (e) {
          Debug.print("HTTP outcall failed: " # Error.message(e));
          #err("Email service unavailable");
        };
      };
    };
  };

  public shared(msg) func joinGroupByEmail(
    token : InviteToken,
    userEmail : Email
  ) : async Result.Result<GroupId, Text> {
    switch (invites.get(token)) {
      case null { #err("Invalid invite token") };
      case (?invite) {
        if (invite.email != userEmail) {
          return #err("This invite is for a different email address");
        };

        if (Time.now() > invite.expiresAt) {
          invites.delete(token);
          return #err("Invite has expired");
        };

        if (invite.used) {
          return #err("Invite has already been used");
        };

        switch (groups.get(invite.groupId)) {
          case null { #err("Group no longer exists") };
          case (?group) {
            if (Array.find<Principal>(group.members, func (u : Principal) : Bool { u == msg.caller }) != null) {
              return #ok(invite.groupId);
            };

            let updatedGroup = {
              group with
              members = Array.append<Principal>(group.members, [msg.caller]);
            };
            groups.put(invite.groupId, updatedGroup);

            updateUserGroups(msg.caller, invite.groupId);

            let updatedInvite = {
              invite with
              used = true;
            };
            invites.put(token, updatedInvite);

            #ok(invite.groupId);
          };
        };
      };
    };
  };

  public query func getGroup(groupId : GroupId) : async Result.Result<Group, Text> {
    switch (groups.get(groupId)) {
      case null { #err("Group not found") };
      case (?group) { #ok(group) };
    };
  };

  public query func getUserGroups(user : UserId) : async [GroupId] {
    switch (userGroups.get(user)) {
      case null { [] };
      case (?groups) { groups };
    };
  };

  public query func getInvite(token : InviteToken) : async Result.Result<Invite, Text> {
    switch (invites.get(token)) {
      case null { #err("Invite not found") };
      case (?invite) { #ok(invite) };
    };
  };
};*/