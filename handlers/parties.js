var Dota2 = require("../index"),
    util = require("util");

// Methods
Dota2.Dota2Client.prototype.acceptPartyInvite = function(id) {
    id = id || null;
    if (id == null) {
        if (this.debug) util.log("Party ID required to respond to an invite.");
        return null;
    }

    if (this.debug) util.log("Responding to party invite " + id + ", accept");
    var payload = new Dota2.schema.CMsgPartyInviteResponse({
        "party_id": id,
        "accept": true,
        "client_version": "", //todo: client version
        "ping_data": ""  //todo: ping data
    });
    this.sendToGC(Dota2.schema.EGCBaseMsg.k_EMsgGCPartyInviteResponse, payload);
};

Dota2.Dota2Client.prototype.declinePartyInvite = function(id) {
    id = id || null;
    if (id == null) {
        if (this.debug) util.log("Party ID required to respond to an invite.");
        return null;
    }
    
    if (this.debug) util.log("Responding to party invite " + id + ", decline");
    var payload = new Dota2.schema.CMsgPartyInviteResponse({
        "party_id": id,
        "accept": false,
        "client_version": "", //todo: client version
        "ping_data": null
    });
    this.sendToGC(Dota2.schema.EGCBaseMsg.k_EMsgGCPartyInviteResponse, payload);
};

Dota2.Dota2Client.prototype.leaveParty = function() {
    if (this.debug) util.log("Leaving party.");

    var payload = new Dota2.schema.CMsgLeaveParty({});
    this.Party = null;
    this.sendToGC(Dota2.schema.EGCBaseMsg.k_EMsgGCLeaveParty, payload);
};

Dota2.Dota2Client.prototype.setPartyLeader = function(steam_id) {
    steam_id = steam_id || null;
    if (this.Party == null) {
        if (this.debug) util.log("setPartyLeader called when not in a party!");
        return null;
    }
    if (steam_id == null) {
        if (this.debug) util.log("Steam ID required to set party leader.");
        return null;
    }

    if (this.debug) util.log("Setting party leader: " + steam_id);

    var payload = new Dota2.schema.CMsgDOTASetGroupLeader({
        "new_leader_steamid": steam_id
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgClientToGCSetPartyLeader, payload);
}

Dota2.Dota2Client.prototype.setPartyCoach = function(coach) {
    coach = coach || false;
    if (this.Party == null) {
        if (this.debug) util.log("setPartyCoach called when not in a party!");
        return null;
    }

    if (this.debug) util.log("Setting coach slot: " + coach);

    var payload = new Dota2.schema.CMsgDOTAPartyMemberSetCoach({
        "wants_coach": coach
    });
    this.sendToGC(Dota2.schema.EDOTAGCMsg.k_EMsgGCPartyMemberSetCoach, payload);
};

Dota2.Dota2Client.prototype.inviteToParty = function(steam_id) {
    steam_id = steam_id || null;
    if (steam_id == null) {
        if (this.debug) util.log("Steam ID required to create a party invite.");
        return null;
    }

    if (this.debug) util.log("Inviting " + steam_id + " to a party.");
    // todo: set client version here?
    var payload = new Dota2.schema.CMsgInviteToParty({
        "steam_id": steam_id
    });
    this.sendToGC(Dota2.schema.EGCBaseMsg.k_EMsgGCInviteToParty, payload);
};

Dota2.Dota2Client.prototype.kickFromParty = function(steam_id) {
    steam_id = steam_id || null;
    if (steam_id == null) {
        if (this.debug) util.log("Steam ID required to kick from the party.");
        return null;
    }

    if (this.debug) util.log("Kicking " + steam_id + " from the party.");
    // todo: set client version here?
    var payload = new Dota2.schema.CMsgKickFromParty({
        "steam_id": steam_id
    });
    this.sendToGC(Dota2.schema.EGCBaseMsg.k_EMsgGCKickFromParty, payload);
};
