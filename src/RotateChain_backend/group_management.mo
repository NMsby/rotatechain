import Array "mo:base/Array";

// group_management.mo - Enhanced group operations module
import Types "./types";
import Utils "./utils";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Nat64 "mo:base/Nat64";

module GroupManagement {
    
    // Enhanced group creation with comprehensive validation
    public func createGroupWithValidation(
        name: Text,
        description: Text,
        maxMembers: Nat,
        contributionAmount: Nat64,
        rotationIntervalDays: Nat,
        admin: Types.Member
    ) : Result.Result<Types.GroupConfig, Types.Error> {
        
        // Use our comprehensive validation
        let params: Types.CreateGroupParams = {
            name = name;
            description = description;
            maxMembers = maxMembers;
            contributionAmount = contributionAmount;
            rotationIntervalDays = rotationIntervalDays;
            startDate = null;
        };
        
        switch (Utils.validateCreateGroupParams(params)) {
            case (?error) { #err(error) };
            case null {
                let now = Time.now();
                let groupConfig: Types.GroupConfig = {
                    id = 0; // Will be set by state manager
                    name = Utils.sanitizeText(name);
                    description = Utils.sanitizeText(description);
                    admin = admin.principal;
                    members = [admin];
                    maxMembers = maxMembers;
                    minMembers = Types.MIN_GROUP_SIZE;
                    contributionAmount = contributionAmount;
                    rotationIntervalDays = rotationIntervalDays;
                    startDate = now;
                    lastDisbursedAt=0;
                    endDate = null;
                    status = #forming;
                    createdAt = now;
                    totalPoolSize = contributionAmount * Nat64.fromNat(maxMembers);
                    platformFeeRate = Types.PLATFORM_FEE_RATE;
                    yieldRate = Types.DEFAULT_YIELD_RATE;
                    yieldStrategy = Types.DEFAULT_YIELD_STRATEGY;
                };
                #ok(groupConfig)
            };
        }
    };
    
    // Enhanced member validation
    public func validateMemberJoin(
        group: Types.GroupConfig,
        newMember: Principal
    ) : Result.Result<Bool, Types.Error> {
        
        if (not Utils.canModifyMembers(group.status)) {
            return #err(#InvalidGroupStatus);
        };
        
        if (Utils.principalInArray(newMember, Array.map<Types.Member, Principal>(group.members, func (member : Types.Member) : Principal {
                    return member.principal;
                }))) {
            return #err(#AlreadyMember);
        };
        
        if (group.members.size() >= group.maxMembers) {
            return #err(#GroupFull);
        };
        
        if (not Utils.validatePrincipal(newMember)) {
            return #err(#UnauthorizedAccess);
        };
        
        #ok(true)
    };

    
    // Calculate if group should become active
    public func shouldActivateGroup(group: Types.GroupConfig) : Bool {
        group.members.size() >= group.maxMembers and group.status == #forming
    };
}