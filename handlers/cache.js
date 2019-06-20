'use strict';

var Dota2 = require("../index");


var cacheTypeIDs = {
    // Legacy values
    LOBBY: 2004,
    PARTY: 2003,
    PARTY_INVITE: 2006,
    LOBBY_INVITE: 2011,
    // Actual values
    CSOEconItem : 1,
    CSOItemRecipe : 5,
    CSOEconGameAccountClient : 7,
    CSOSelectedItemPreset : 35,      // no longer exists in game files
    CSOEconItemPresetInstance : 36,  // no longer exists in game files
    CSOEconItemDropRateBonus : 38,
    CSOEconItemLeagueViewPass : 39,
    CSOEconItemEventTicket : 40,
    CSOEconItemTournamentPassport : 42,
    CSODOTAGameAccountClient : 2002,
    CSODOTAParty : 2003,
    CSODOTALobby : 2004,
    CSODOTAPartyInvite : 2006,
    CSODOTAGameHeroFavorites : 2007,
    CSODOTAMapLocationState : 2008,
    CMsgDOTATournament : 2009,
    CSODOTAPlayerChallenge : 2010,
    CSODOTALobbyInvite : 2011
};

// Handlers
function handleCreateType(obj_type, object_data) {
    switch(obj_type) {
        case cacheTypeIDs.CSOEconItem:
            this.Logger.debug("Got an item traded");
            var item = Dota2.schema.CSOEconItem.decode(object_data);
            this.emit("gotItem", item);
            this.Inventory.push(item);
            break;
    }
}

function handleDestroyType(obj_type, object_data) {
    switch(obj_type) {
        case cacheTypeIDs.CSODOTAPartyInvite:
            this.Logger.debug("Party invite cleared");
            this.PartyInvite = null;
            this.emit("partyInviteCleared");
            break;
        case cacheTypeIDs.CSODOTALobbyInvite:
            this.Logger.debug("Lobby invite cleared");
            this.LobbyInvite = null;
            this.emit("lobbyInviteCleared");
            break;
        case cacheTypeIDs.CSOEconItem:
            this.Logger.debug("Traded item away");
            var item = Dota2.schema.CSOEconItem.decode(object_data);
            this.emit("gaveItem", item);
            this.Inventory = this.Inventory.filter(i => item.id.notEquals(i.id));
            break;
    }
}

function handleSubscribedType(obj_type, object_data, isDelete) {
    switch (obj_type) {
        
        // Inventory item
        case cacheTypeIDs.CSOEconItem:
            this.Logger.debug("Received inventory snapshot");
            // Parse items
            var items = object_data.map(obj => Dota2.schema.CSOEconItem.decode(obj));
            // Remove updated items from inventory
            var inv = this.Inventory.filter(item => items.reduce((acc, val) => acc && item.id.notEquals(val.id)), true);
            if (!isDelete) {
                // Put them back if it's not a delete
                inv = inv.concat(items);
            }
            this.emit("inventoryUpdate", inv);
            this.Inventory = inv;
            break;
        // Lobby snapshot.
        case cacheTypeIDs.CSODOTALobby:
            // object_data is an array when called from onCacheSubscribed
            // but an object when called from onUpdateMultiple
            var lobby = Dota2.schema.CSODOTALobby.decode([].concat(object_data)[0]);
            this.Logger.debug("Received lobby snapshot for lobby ID " + lobby.lobby_id);
            this.emit("practiceLobbyUpdate", lobby);
            this.Lobby = lobby;
            break;
        // Lobby invite snapshot.
        case cacheTypeIDs.CSODOTALobbyInvite:
            var lobbyInvite = Dota2.schema.CSODOTALobbyInvite.decode(object_data[0]);
            this.Logger.debug("Received lobby invite snapshot for group ID " + lobbyInvite.group_id);
            this.emit("lobbyInviteUpdate", lobbyInvite);
            this.LobbyInvite = lobbyInvite;
            break;
        // Party snapshot.
        case cacheTypeIDs.CSODOTAParty:
            var party = Dota2.schema.CSODOTAParty.decode([].concat(object_data)[0]);
            this.Logger.debug("Received party snapshot for party ID " + party.party_id);
            this.emit("partyUpdate", party);
            this.Party = party;
            break;
        // Party invite snapshot.
        case cacheTypeIDs.CSODOTAPartyInvite:
            var party = Dota2.schema.CSODOTAPartyInvite.decode(object_data[0]);
            this.Logger.debug("Received party invite snapshot for group ID " + party.group_id);
            this.emit("partyInviteUpdate", party);
            this.PartyInvite = party;
            break;
        default:
            this.Logger.warn("Unhandled cache ID: " + obj_type);
            break;
    }
};

Dota2.Dota2Client.prototype._handleWelcomeCaches = function handleWelcomeCaches(message) {
    var welcome = Dota2.schema.CMsgClientWelcome.decode(message);
    var _self = this;

    if (welcome.outofdate_subscribed_caches)
        this.Logger.debug("Handling out of date caches");
        welcome.outofdate_subscribed_caches.forEach(function(cache) {
            cache.objects.forEach(function(obj) {
                handleSubscribedType.call(_self, obj.type_id, obj.object_data);
            });
        });
};

// Events
/**
 * Emitted when the GC sends an inventory snapshot. The GC is incredibly
 * inefficient and will send the entire object even if it's a minor update.
 * You can use this to detect when a change was made to your inventory (e.g. drop)
 * Note that the {@link module:Dota2.Dota2Client#Inventory|Inventory} property will be the old value until after this event
 * completes to allow comparison between the two.
 * @event module:Dota2.Dota2Client#inventoryUpdate
 * @param {CSOEconItem[]} inventory - A list of `CSOEconItem` objects
 */
/**
 * Emitted when you receive an item through a trade. 
 * Note that the {@link module:Dota2.Dota2Client#Inventory|Inventory} property will be the old value until after this event
 * completes to allow comparison between the two.
 * @event module:Dota2.Dota2Client#gotItem
 * @param {CSOEconItem} item - `CSOEconItem` object describing the received item
 **/
/**
 * Emitted when you trade away an item. 
 * Note that the {@link module:Dota2.Dota2Client#Inventory|Inventory} property will be the old value until after this event
 * completes to allow comparison between the two.
 * @event module:Dota2.Dota2Client#gaveItem
 * @param {CSOEconItem} item - `CSOEconItem` object describing the traded item
 **/
 /**
 * Emitted when the GC sends a lobby snapshot. The GC is incredibly
 * inefficient and will send the entire object even if it's a minor update.
 * You can use this to detect when a lobby has been entered / created
 * successfully as well. Note that the {@link module:Dota2.Dota2Client#Lobby|Lobby} property will be the old
 * value until after this event completes to allow comparison between the
 * two.
 * @event module:Dota2.Dota2Client#practiceLobbyUpdate
 * @param {CSODOTALobby} lobby - The new state of the lobby.
 */
 /**
 * Emitted when leaving a lobby (aka, the lobby is cleared). This can
 * happen when kicked, upon leaving a lobby, etc. There are other events
 * to tell when the bot has been kicked.
 * @event module:Dota2.Dota2Client#practiceLobbyCleared
 */
 /**
 * Emitted when the bot received an invite to a lobby
 * @event module:Dota2.Dota2Client#lobbyInviteUpdate
 * @param {CSODOTALobbyInvite} lobbyInvite - The invitation to a lobby.
 */
 /**
 * Emitted when the Lobby Invite is cleared, for example when
 * accepting/rejecting it or when the lobby is closed.
 * @event module:Dota2.Dota2Client#lobbyInviteCleared
 */
 /**
 * Emitted when the GC sends a party snapshot. The GC is incredibly
 * inefficient and will send the entire object even if it's a minor update.
 * You can use this to detect when a party has been entered / created
 * successfully as well. Note that the {@link module:Dota2.Dota2Client#Party|Party} property will be the old
 * value until after this event completes to allow comparison between the
 * two.
 * @event module:Dota2.Dota2Client#partyUpdate
 * @param {CSODOTAParty} party - The new state of the party.
 */
 /**
 * Emitted when leaving a party (aka, the party is cleared). This can
 * happen when kicked, upon leaving a party, etc. There are other callbacks
 * to tell when the bot has been kicked.
 * @event module:Dota2.Dota2Client#partyCleared
 */
 /**
 * Emitted when the GC sends a party invite snapshot. The GC is incredibly
 * inefficient and will send the entire object even if it's a minor update.
 * You can use this to detect when an incoming party invite has been sent.
 * Note that the {@link module:Dota2.Dota2Client#PartyInvite|PartyInvite} property will be the old
 * value until after this event completes to allow comparison between the two.
 * @event module:Dota2.Dota2Client#partyInviteUpdate
 * @param {CSODOTAPartyInvite} partyInvite - The invitation to a party.
 */
 /**
 * Emitted when the Party Invite is cleared, for example when
 * accepting/rejecting it or when the party is closed
 * @event module:Dota2.Dota2Client#partyInviteCleared
 */

var handlers = Dota2.Dota2Client.prototype._handlers;

var onCacheSubscribed = function onCacheSubscribed(message) {
    var subscribe = Dota2.schema.CMsgSOCacheSubscribed.decode(message);
    var _self = this;

    this.Logger.debug("Cache(s) subscribed, type(s): " + subscribe.objects.map(obj=>obj.type_id).toString());

    subscribe.objects.forEach(function(obj) {
        handleSubscribedType.call(_self, obj.type_id, obj.object_data);
    });
};
handlers[Dota2.schema.ESOMsg.k_ESOMsg_CacheSubscribed] = onCacheSubscribed;

var onUpdateMultiple = function onUpdateMultiple(message) {
    var multi = Dota2.schema.CMsgSOMultipleObjects.decode(message);
    var _self = this;

    let multi_types = ["objects_modified", "objects_added", "objects_removed"];
    multi_types.map((type, i) => {
        if (multi[type]) {
            let updates = {};
            multi[type].forEach(obj => {
                if (updates[obj.type_id]) updates[obj.type_id] = updates[obj.type_id].concat(obj.object_data);
                else updates[obj.type_id] = [obj.object_data];
            });
            for (let type in updates)
                handleSubscribedType.call(_self, parseInt(type), updates[type], i==2);
        }
    });

};
handlers[Dota2.schema.ESOMsg.k_ESOMsg_UpdateMultiple] = onUpdateMultiple;

var onCreate = function onCreate(message) {
    var single = Dota2.schema.CMsgSOSingleObject.decode(message);
    var _self = this;

    this.Logger.debug("Create, type " + single.type_id);

    handleCreateType.call(_self, single.type_id, single.object_data);
}
handlers[Dota2.schema.ESOMsg.k_ESOMsg_Create] = onCreate;

var onCacheUnsubscribed = function onCacheUnsubscribed(message) {
    var unsubscribe = Dota2.schema.CMsgSOCacheUnsubscribed.decode(message);

    this.Logger.debug("Cache unsubscribed, " + unsubscribe.owner_soid.id);

    if (this.Lobby && unsubscribe.owner_soid.id.equals(this.Lobby.lobby_id)) {
        this.Lobby = null;
        this.emit("practiceLobbyCleared");
    } else if (this.LobbyInvite && unsubscribe.owner_soid.id.equals(this.LobbyInvite.group_id)) {
        this.LobbyInvite = null;
        this.emit("lobbyInviteCleared");
    } else if (this.Party && unsubscribe.owner_soid.id.equals(this.Party.party_id)) {
        this.Party = null;
        this.emit("partyCleared");
    } else if (this.PartyInvite && unsubscribe.owner_soid.id.equals(this.PartyInvite.group_id)) {
        this.PartyInvite = null;
        this.emit("partyInviteCleared");
    }
};
handlers[Dota2.schema.ESOMsg.k_ESOMsg_CacheUnsubscribed] = onCacheUnsubscribed;

var onCacheDestroy = function onCacheDestroy(message) {
    var single = Dota2.schema.CMsgSOSingleObject.decode(message);
    var _self = this;

    this.Logger.debug("Cache destroy, " + single.type_id);
    
    handleDestroyType.call(_self, single.type_id, single.object_data);
};
handlers[Dota2.schema.ESOMsg.k_ESOMsg_Destroy] = onCacheDestroy;
